import { defineConfig, Plugin } from "vite";
import dotenv from "dotenv";
dotenv.config();
import { resolve } from "node:path";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const jsonVars = JSON.parse(
  readFileSync(resolve(__dirname, "src/constants/index.json"), "utf-8")
);

function resolveJsonVar(path: string): string {
  const parts = path.split(".");
  let val = jsonVars;
  for (const p of parts) {
    if (val && typeof val === "object" && p in val) {
      val = val[p];
    } else {
      return "";
    }
  }
  return typeof val === "object" ? JSON.stringify(val) : String(val);
}

function processJsonVars(html: string): string {
  return html.replace(
    /\{\{([A-Z]+(?:\.[a-zA-Z0-9_]+)+)\}\}/g,
    (_: string, path: string) => resolveJsonVar(path)
  );
}

function processPageWithLayout(pageHtml: string, pageName: string): string {
  let processedHtml = pageHtml;
  try {
    // expand simple repeat directives in the page before layout processing
    processedHtml = processRepeats(processedHtml);
    const layoutPath = resolve(__dirname, "src/app/layout.html");
    let layoutHtml = readFileSync(layoutPath, "utf-8");
    const headMatch = pageHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const pageHead = headMatch ? headMatch[1].trim() : "";
    const contentWithoutHead = pageHtml
      .replace(/<head[^>]*>[\s\S]*?<\/head>/i, "")
      .trim();
    let correctedPageHead = pageHead;
    if (pageHead) {
      correctedPageHead = pageHead.replace(
        /src="\.\/([^"]+)"/g,
        `src="/src/app/${pageName}/$1"`
      );
      correctedPageHead = correctedPageHead.replace(
        /href="\.\/([^"]+)"/g,
        `href="/src/app/${pageName}/$1"`
      );
    }
    if (correctedPageHead) {
      layoutHtml = layoutHtml.replace(
        /<\/head>/i,
        `    ${correctedPageHead}\n</head>`
      );
    }
    layoutHtml = layoutHtml.replace(
      /<main[^>]*>[\s\S]*?<\/main>/i,
      `<main>\n        ${contentWithoutHead}\n    </main>`
    );
    processedHtml = layoutHtml;
  } catch (error) {}
  processedHtml = processComponents(processedHtml);
  // expand repeats in components-injected html as well
  processedHtml = processRepeats(processedHtml);
  processedHtml = processJsonVars(processedHtml);
  return processedHtml;
}

function processComponents(html: string): string {
  // expand repeats before component injection so repeated templates get processed too
  let processedHtml = processRepeats(html);
  const templateRegex = /\{\{(common\/[^}]+)\}\}/g;
  const matches = processedHtml.match(templateRegex);

  if (matches) {
    matches.forEach((match) => {
      const componentPath = match.replace(/[{}]/g, "");
      const componentHtmlPath = resolve(
        __dirname,
        `src/${componentPath}/index.html`
      );

      try {
        let componentHtml = readFileSync(componentHtmlPath, "utf-8");

        componentHtml = processJsonVars(componentHtml);
        processedHtml = processedHtml.replace(match, componentHtml.trim());
        const componentDir = resolve(__dirname, `src/${componentPath}`);
        if (existsSync(resolve(componentDir, "style.scss"))) {
          const cssPath = `/src/${componentPath}/style.scss`;
          const cssLink = `<link rel="stylesheet" href="${cssPath}">`;
          if (!processedHtml.includes(cssLink)) {
            processedHtml = processedHtml.replace(
              "</head>",
              `    ${cssLink}\n</head>`
            );
          }
        }
        if (existsSync(resolve(componentDir, "script.ts"))) {
          const jsPath = `/src/${componentPath}/script.ts`;
          const jsScript = `<script type="module" src="${jsPath}"></script>`;
          if (!processedHtml.includes(jsScript)) {
            processedHtml = processedHtml.replace(
              "</head>",
              `    ${jsScript}\n</head>`
            );
          }
        }
      } catch (error) {}
    });
  }

  return processedHtml;
}

// Process a simple repeat directive: {{repeat 6}}...{{/repeat}}
function processRepeats(html: string): string {
  return html.replace(
    /\{\{repeat\s+(\d+)\}\}([\s\S]*?)\{\{\/repeat\}\}/g,
    (_m, count, content) => {
      const n = Math.max(0, Number(count) || 0);
      return Array.from({ length: n })
        .map(() => content)
        .join("");
    }
  );
}
function getPageMap(): Record<string, string> {
  const pages: Record<string, string> = {};
  const root = resolve(__dirname, "src/app");
  if (!existsSync(root)) return pages;
  const dirs = readdirSync(root);
  dirs.forEach((d) => {
    const pageFile = resolve(root, d, "page.html");
    if (existsSync(pageFile)) {
      const key = d === "home" ? "index" : d;
      pages[key] = pageFile;
    }
  });
  return pages;
}
function templateProcessor(): Plugin {
  return {
    name: "template-processor",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, "http://dev");
        const path = url.pathname;
        if (path === "/" || path === "/index.html") {
          req.url = "/src/app/home/page.html";
          return next();
        }
        const m = path.match(/^\/(.+)\.html$/);
        if (m) {
          const name = m[1];
          const target = `/src/app/${name}/page.html`;
          req.url = target;
          return next();
        }
        return next();
      });

      // Watch for filesystem changes and trigger a full reload in the browser
      try {
        const reloadExts = /\.(html|scss|ts)$/i;
        const watcher = (server as any).watcher || (server as any).chokidar;
        if (watcher && typeof watcher.on === "function") {
          const trigger = (file: string) => {
            if (!file) return;
            if (reloadExts.test(file)) {
              try {
                server.ws.send({ type: "full-reload", path: "*" });
              } catch (e) {}
            }
          };
          watcher.on("change", trigger);
          watcher.on("add", trigger);
          watcher.on("unlink", trigger);
        }
      } catch (e) {
        // noop - don't break dev server if watcher hooks can't be attached
      }
    },
    transformIndexHtml(html, ctx) {
      const file = ctx?.filename || "";
      const m = file.match(/\/src\/app\/([^/]+)\/page\.html$/);
      if (!m) return html;
      const pageName = m[1] === "home" ? "home" : m[1];
      return processPageWithLayout(html, pageName);
    },
  };
}
function generateTmpBuildPages(tmpDir = "pages"): Record<string, string> {
  const inputs: Record<string, string> = {};
  const map = getPageMap();
  if (!Object.keys(map).length) return inputs;
  const tmpAbs = resolve(__dirname, tmpDir);
  if (!fs.existsSync(tmpAbs)) fs.mkdirSync(tmpAbs, { recursive: true });
  for (const [key, srcPath] of Object.entries(map)) {
    let html = readFileSync(srcPath, "utf-8");
    const pageName = key === "index" ? "home" : key;
    const componentRegex = /\{\{(common\/[^}]+)\}\}/g;
    const componentMatches = Array.from(html.matchAll(componentRegex));
    let scriptsConcat = "";
    componentMatches.forEach((m) => {
      const compPath = m[1];
      const scriptPath = resolve(__dirname, `src/${compPath}/script.ts`);
      if (existsSync(scriptPath)) {
        let scriptContent = readFileSync(scriptPath, "utf-8");
        scriptContent = scriptContent.replace(
          /document\.addEventListener\(["']DOMContentLoaded["'],\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\);?/gm,
          "$1"
        );
        scriptsConcat += `\n${scriptContent.trim()}\n`;
      }
    });
    const mainPath = resolve(__dirname, `src/app/${pageName}/main.ts`);
    if (existsSync(mainPath)) {
      const finalScript = `document.addEventListener("DOMContentLoaded", () => {\n${scriptsConcat.trim()}\n});\n`;
      writeFileSync(mainPath, finalScript, "utf-8");
    }
    const processed = processPageWithLayout(html, pageName);
    const outFile = resolve(tmpAbs, `${key}.html`);
    writeFileSync(outFile, processed, "utf-8");
    inputs[key] = outFile;
  }
  return inputs;
}

export default defineConfig(({ command }) => {
  const pageInputs = command === "build" ? generateTmpBuildPages() : undefined;

  const input = {
    "global-style": resolve(__dirname, "src/styles/global.scss"),
    ...(pageInputs || {}),
  };

  const prodUrl = process.env.PROD_URL || "";
  const baseUrl = command === "build" && prodUrl ? prodUrl : "./";

  return {
    plugins: [
      templateProcessor(),
      (function cleanupTmpPages(): Plugin {
        return {
          name: "cleanup-tmp-pages",
          apply: "build",
          writeBundle: {
            sequential: true,
            handler() {
              const distDir = resolve(__dirname, "dist");
              const fromDir = resolve(distDir, "pages");
              if (!fs.existsSync(fromDir)) return;
              const prodUrl = process.env.PROD_URL || "";
              const files = fs
                .readdirSync(fromDir)
                .filter((f) => f.endsWith(".html"));
              for (const f of files) {
                const src = resolve(fromDir, f);
                const dst = resolve(distDir, f);
                let html = fs.readFileSync(src, "utf-8");

                const prodBase = prodUrl.endsWith("/")
                  ? prodUrl.slice(0, -1)
                  : prodUrl;
                html = html
                  .replace(
                    /(href|src)\s*=\s*(["'])\.\/assets\//g,
                    `$1=$2${prodBase}/assets/`
                  )
                  .replace(
                    /(href|src)\s*=\s*(["'])assets\//g,
                    `$1=$2${prodBase}/assets/`
                  )
                  .replace(
                    /(href|src)\s*=\s*(["'])\.\/imgs\//g,
                    `$1=$2${prodBase}/imgs/`
                  )
                  .replace(
                    /(href|src)\s*=\s*(["'])imgs\//g,
                    `$1=$2${prodBase}/imgs/`
                  )
                  .replace(
                    /(href|src)\s*=\s*(["'])\.\/fonts\//g,
                    `$1=$2${prodBase}/fonts/`
                  )
                  .replace(
                    /(href|src)\s*=\s*(["'])fonts\//g,
                    `$1=$2${prodBase}/fonts/`
                  );

                if (!html.includes("global-style.css")) {
                  html = html.replace(
                    "</head>",
                    `  <link rel="stylesheet" crossorigin href="${prodBase}/assets/global-style.css">\n</head>`
                  );
                }

                fs.writeFileSync(dst, html, "utf-8");
              }
              fs.rmSync(fromDir, { recursive: true, force: true });
              const rootTmp = resolve(__dirname, "pages");
              if (fs.existsSync(rootTmp)) {
                fs.rmSync(rootTmp, { recursive: true, force: true });
              }
            },
          },
        };
      })(),
    ],
    root: ".",
    base: baseUrl,
    publicDir: "public",
    build: {
      outDir: "dist",
      rollupOptions: {
        input,
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === "global-style.css") {
              return "assets/global-style.css";
            }
            return "assets/[name]-[hash].[ext]";
          },
        },
      },
    },
    server: {
      port: 3000,
      open: "/",
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  };
});
