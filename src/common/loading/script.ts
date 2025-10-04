export default class Loading {
  private loadingSection: HTMLElement | null;
  private percentageElement: HTMLElement | null;
  private resources: HTMLElement[] = [];
  private loadedCount: number = 0;
  private totalResources: number = 0;

  constructor() {
    this.loadingSection = document.querySelector(".loading-section");
    this.percentageElement = document.querySelector(".loading-percentage");
    this.init();
  }

  private init(): void {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.collectResources();
      });
    } else {
      this.collectResources();
    }
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

    this.updatePercentage(percentage);

    if (this.loadedCount >= this.totalResources) {
      this.onAllResourcesLoaded();
    }
  }

  private onResourceError(resourceName: string): void {
    console.warn(`[Loading] Erro ao carregar: ${resourceName}`);
    this.onResourceLoaded(resourceName);
  }

  private updatePercentage(percentage: number): void {
    if (this.percentageElement) {
      this.percentageElement.textContent = `${percentage}%`;
    }
  }

  private onAllResourcesLoaded(): void {
    console.log(
      "[Loading] Todos os recursos carregados! Pronto para iniciar animação."
    );
    this.updatePercentage(100);
  }
}

new Loading();
