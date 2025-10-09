import gsap from "gsap";
import ResourceLoader from "@/utils/resources";

export default class NavbarAnimation {
  private timeline: gsap.core.Timeline;
  private logo: HTMLElement | null = null;
  private resourceLoader: ResourceLoader | null = null;

  constructor() {
    this.timeline = gsap.timeline({ paused: true });
    this.logo = document.querySelector(".logo-nav");

    this.init();
  }

  private init(): void {
    if (!this.isValid()) return;

    this.setup();

    this.resourceLoader = new ResourceLoader(() => this.onLoadComplete());
    this.resourceLoader.start();
  }

  private isValid(): boolean {
    return !!this.logo;
  }

  private setup(): void {
    this.animateLogo();
  }

  private animateLogo(): void {
    this.timeline.to(this.logo, {
      opacity: 1,
      delay: 2.7 + 0.34,
      duration: 0.5,
    });

    this.timeline.to(this.logo, {
      width: "4.3011rem",
      height: "4.2rem",
      duration: 0.3,
    });

    this.timeline.to(
      this.logo,
      {
        top: "2.8rem",
        left: "10.9rem",
        transform: "translate(0, 0) rotate(90deg)",
        duration: 0.5,
        ease: "power2.out",
      },
      "<"
    );
  }

  private onLoadComplete(): void {
    console.log("[Loading] Iniciando animação navbar...");
    this.timeline.play();
  }
}

new NavbarAnimation();
