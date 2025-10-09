import gsap from "gsap";
import ResourceLoader from "@/utils/resources";

export default class NavbarAnimation {
  private navbar: HTMLElement | null = null;
  private lines: NodeListOf<HTMLElement> | null = null;
  private logo: HTMLElement | null = null;
  private links: NodeListOf<HTMLElement> | null = null;
  private letsTalk: HTMLElement | null = null;
  private timeline: gsap.core.Timeline;
  private resourceLoader: ResourceLoader | null = null;

  constructor() {
    this.timeline = gsap.timeline({ paused: true });
    this.navbar = document.querySelector(".navbar");
    if (this.navbar) {
      this.lines = this.navbar.querySelectorAll(".navbar-line");
      this.logo = this.navbar.querySelector(".navbar-logo svg");
      this.links = this.navbar.querySelectorAll(".navbar-links");
      this.letsTalk = this.navbar.querySelector(".navbar-letstalk");
    }

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
        duration: 0.3,
        ease: "power2.out",
      },
      "<"
    );

    this.timeline.to(
      this.navbar,
      {
        width: "90%",
        height: "9.7rem",
        position: "fixed",
        margin: "0 5%",
        top: "0",
        left: "0",
        duration: 0.1,
      },
      "<"
    );

    this.timeline.to(
      this.logo,
      {
        position: "unset",
        delay: 0.2,
      },
      "<"
    );

    this.timeline.to(
      this.links,
      {
        display: "flex",
        opacity: 1,
        visibility: "visible",
        duration: 0.3,
      },
      "<"
    );

    this.timeline.to(
      this.letsTalk,
      {
        display: "flex",
        opacity: 1,
        visibility: "visible",
        duration: 0.3,
      },
      "<"
    );
    this.timeline.to(this.letsTalk, {}, "<");
  }

  private onLoadComplete(): void {
    console.log("[Loading] Iniciando animação navbar...");
    this.timeline.play();
  }
}

new NavbarAnimation();
