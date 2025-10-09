type ResourceType = "image" | "video" | "audio" | "background";

interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export default class ResourceLoader {
  private resources: HTMLElement[] = [];
  private loadedCount: number = 0;
  private totalResources: number = 0;
  private onCompleteCallback?: () => void;

  constructor(onComplete?: () => void) {
    this.onCompleteCallback = onComplete;
  }

  public start(): void {
    this.collectResources();

    if (this.totalResources === 0) {
      console.log(
        "[ResourceLoader] Nenhum recurso encontrado, completando imediatamente"
      );
      this.complete();
      return;
    }

    this.monitorResources();
  }

  private collectResources(): void {
    const images = Array.from(
      document.querySelectorAll("img")
    ) as HTMLImageElement[];
    const videos = Array.from(
      document.querySelectorAll("video")
    ) as HTMLVideoElement[];
    const audios = Array.from(
      document.querySelectorAll("audio")
    ) as HTMLAudioElement[];
    const elementsWithBg = this.getElementsWithBackgroundImages();

    this.resources = [...images, ...videos, ...audios, ...elementsWithBg];
    this.totalResources = this.resources.length;

    this.logResourcesSummary(
      images.length,
      videos.length,
      audios.length,
      elementsWithBg.length
    );
  }

  private logResourcesSummary(
    images: number,
    videos: number,
    audios: number,
    backgrounds: number
  ): void {
    console.log(`[ResourceLoader] Total de recursos: ${this.totalResources}`);
    console.log(`- Imagens: ${images}`);
    console.log(`- Vídeos: ${videos}`);
    console.log(`- Áudios: ${audios}`);
    console.log(`- Backgrounds: ${backgrounds}`);
  }

  private getElementsWithBackgroundImages(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage && bgImage !== "none" && bgImage.includes("url(")) {
        elements.push(element as HTMLElement);
      }
    });

    return elements;
  }

  private monitorResources(): void {
    this.resources.forEach((resource) => {
      if (resource instanceof HTMLImageElement) {
        this.monitorImage(resource);
      } else if (resource instanceof HTMLVideoElement) {
        this.monitorVideo(resource);
      } else if (resource instanceof HTMLAudioElement) {
        this.monitorAudio(resource);
      } else {
        this.monitorBackgroundImage(resource);
      }
    });
  }

  private monitorImage(img: HTMLImageElement): void {
    if (img.complete && img.naturalHeight !== 0) {
      this.onResourceLoaded(img.src || "imagem");
    } else {
      img.addEventListener("load", () =>
        this.onResourceLoaded(img.src || "imagem")
      );
      img.addEventListener("error", () =>
        this.onResourceError(img.src || "imagem")
      );
    }
  }

  private monitorVideo(video: HTMLVideoElement): void {
    if (video.readyState >= 3) {
      this.onResourceLoaded(video.src || video.currentSrc || "vídeo");
    } else {
      video.addEventListener("canplaythrough", () =>
        this.onResourceLoaded(video.src || video.currentSrc || "vídeo")
      );
      video.addEventListener("error", () =>
        this.onResourceError(video.src || video.currentSrc || "vídeo")
      );
    }
  }

  private monitorAudio(audio: HTMLAudioElement): void {
    if (audio.readyState >= 3) {
      this.onResourceLoaded(audio.src || audio.currentSrc || "áudio");
    } else {
      audio.addEventListener("canplaythrough", () =>
        this.onResourceLoaded(audio.src || audio.currentSrc || "áudio")
      );
      audio.addEventListener("error", () =>
        this.onResourceError(audio.src || audio.currentSrc || "áudio")
      );
    }
  }

  private monitorBackgroundImage(element: HTMLElement): void {
    const bgImage = window.getComputedStyle(element).backgroundImage;
    const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);

    if (!urlMatch) {
      this.onResourceLoaded("background");
      return;
    }

    const imageUrl = urlMatch[1];
    const img = new Image();

    img.onload = () => this.onResourceLoaded(imageUrl);
    img.onerror = () => this.onResourceError(imageUrl);
    img.src = imageUrl;
  }

  private onResourceLoaded(resourceName: string): void {
    this.loadedCount++;
    const percentage = Math.floor(
      (this.loadedCount / this.totalResources) * 100
    );

    console.log(
      `[ResourceLoader] Carregado (${this.loadedCount}/${this.totalResources}): ${resourceName}`
    );

    const progress: LoadProgress = {
      loaded: this.loadedCount,
      total: this.totalResources,
      percentage,
    };

    if (this.loadedCount >= this.totalResources) {
      this.complete();
    }
  }

  private onResourceError(resourceName: string): void {
    console.warn(`[ResourceLoader] Erro ao carregar: ${resourceName}`);
    this.onResourceLoaded(resourceName);
  }

  private complete(): void {
    console.log("[ResourceLoader] Todos os recursos carregados!");
    this.onCompleteCallback?.();
  }
}
