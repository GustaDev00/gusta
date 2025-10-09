import ResourceLoader from "@/utils/resources";
import LoadingAnimator from "./animation";

export default class Loading {
  private loadingSection: HTMLElement | null;
  private logo: HTMLElement | null = null;
  private percentageElement: HTMLElement | null = null;
  private bars: NodeListOf<SVGElement> | null = null;
  private resourceLoader: ResourceLoader | null = null;
  private animator: LoadingAnimator | null = null;

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
      document.addEventListener("DOMContentLoaded", () => this.start());
    } else {
      this.start();
    }
  }

  private start(): void {
    if (!this.isValid()) return;

    this.animator = new LoadingAnimator({
      bars: this.bars!,
      logo: this.logo!,
      percentageElement: this.percentageElement!,
    });

    this.resourceLoader = new ResourceLoader(() => this.onLoadComplete());
    this.resourceLoader.start();
  }

  private isValid(): boolean {
    return !!(
      this.bars &&
      this.bars.length === 6 &&
      this.logo &&
      this.percentageElement
    );
  }

  private onLoadComplete(): void {
    console.log("[Loading] Iniciando animação...");
    this.animator?.play();
  }
}

new Loading();
