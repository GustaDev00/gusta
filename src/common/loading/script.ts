import gsap from "gsap";

export default class Loading {
  private loadingSection: HTMLElement | null;
  private logo: HTMLElement | null = null;
  private percentageElement: HTMLElement | null = null;
  private bars: NodeListOf<SVGElement> | null = null;
  private resources: HTMLElement[] = [];
  private loadedCount: number = 0;
  private totalResources: number = 0;

  private animationTimeline: gsap.core.Timeline | null = null;

  constructor() {
    this.loadingSection = document.querySelector(".loading-section");
    if (this.loadingSection) {
      this.logo = this.loadingSection.querySelector(".logo");
      this.percentageElement = this.loadingSection.querySelector(
        ".loading-percentage"
      );
      this.bars = this.loadingSection.querySelectorAll(".logo-bar svg");
    }

    this.init();
  }

  private init(): void {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.collectResources();
        this.setupAnimation();
      });
    } else {
      this.collectResources();
      this.setupAnimation();
    }
  }

  private setupAnimation(): void {
    this.animationTimeline = gsap.timeline({ paused: true });

    if (!this.bars || this.bars.length === 0 || this.bars.length < 6) return;
    if (!this.animationTimeline) return;
    if (!this.percentageElement) return;
    if (!this.logo) return;

    const timeline = this.animationTimeline;
    const bars = this.bars;
    const barCount = bars.length;
    const barHeight = bars[0].getBoundingClientRect().height;
    const percentage = this.percentageElement;
    const logo = this.logo;

    timeline.to(bars[0], {
      delay: 0.1,
      top: `${barHeight}px`,
      duration: 0.4,
      ease: "power1.in",
    });

    for (let i = 1; i < Math.min(barCount, 6); i++) {
      const duration = i === 1 ? 0.3 : 0.2;

      timeline.to(bars[i], {
        delay: 0,
        top: `${barHeight}px`,
        duration,
        ease: "power1.in",
      });

      for (let j = 0; j < i; j++) {
        timeline.to(
          bars[j],
          {
            delay: j === 0 && i === 1 ? 0 : undefined,
            top: `${barHeight * (i - j + 1)}px`,
            duration: j === 0 ? 0.3 : duration,
            ease: "power1.in",
          },
          "<"
        );
      }
    }

    for (let i = 0; i < 6; i++) {
      timeline.to(
        bars[5 - i],
        {
          delay: i === 4 ? 0 : undefined,
          top: `${barHeight * i + 8}px`,
          duration: 0.8,
          ease: "bounce.out",
        },
        "<"
      );
    }

    timeline.to({}, { duration: 0.1 });

    for (let i = 0; i < 6; i++) {
      timeline.to(
        bars[5 - i],
        {
          top: `${barHeight * i}px`,
          duration: 0.2,
          ease: "power1",
        },
        "<"
      );
    }

    const percentageProxy = { value: 0 };
    const timelineDuration = timeline.duration();

    percentage.textContent = "0%";

    if (timelineDuration > 0) {
      timeline.to(
        percentageProxy,
        {
          value: 100,
          duration: timelineDuration - 0.7,
          ease: "power2.inOut",

          onUpdate: () => {
            if (!this.percentageElement) return;
            const currentValue = Math.round(percentageProxy.value);
            this.percentageElement.textContent = `${currentValue}%`;
          },
        },
        0
      );
    } else {
      this.percentageElement.textContent = "100%";
    }

    timeline.to(this.percentageElement, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
    });

    timeline.to(
      logo,
      {
        rotate: 90,
        duration: 0.5,
      },
      "<"
    );
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

    console.log(
      `[Loading] Total de recursos encontrados: ${this.totalResources}`
    );
    console.log(`- Imagens: ${images.length}`);
    console.log(`- Vídeos: ${videos.length}`);
    console.log(`- Áudios: ${audios.length}`);
    console.log(`- Backgrounds: ${elementsWithBg.length}`);

    if (this.totalResources === 0) {
      console.log(
        "[Loading] Nenhum recurso encontrado, iniciando animação imediatamente"
      );
      this.onAllResourcesLoaded();
      return;
    }

    this.monitorResources();
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
      `[Loading] Carregado (${this.loadedCount}/${this.totalResources}): ${resourceName}`
    );

    if (this.loadedCount >= this.totalResources) {
      this.onAllResourcesLoaded();
    }
  }

  private onResourceError(resourceName: string): void {
    console.warn(`[Loading] Erro ao carregar: ${resourceName}`);
    this.onResourceLoaded(resourceName);
  }

  private onAllResourcesLoaded(): void {
    console.log(
      "[Loading] Todos os recursos carregados! Pronto para iniciar animação."
    );

    this.animationTimeline?.play();
  }
}

new Loading();
