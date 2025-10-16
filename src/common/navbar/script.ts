import gsap from "gsap";
import ResourceLoader from "@/utils/resources";
import { WrapCharacters } from "@/utils/wrap-characters";
import { MagneticEffect } from "@/utils/magnetic";

export default class NavbarAnimation {
  private navbar: HTMLElement | null = null;
  private lines: NodeListOf<HTMLElement> | null = null;
  private logo: HTMLElement | null = null;
  private links: NodeListOf<HTMLElement> | null = null;
  private letsTalk: HTMLElement | null = null;
  private timeline: gsap.core.Timeline;
  private resourceLoader: ResourceLoader | null = null;
  private clickSound: HTMLAudioElement | null = null;

  constructor() {
    this.timeline = gsap.timeline({ paused: true });
    this.navbar = document.querySelector(".navbar");
    if (this.navbar) {
      this.lines = this.navbar.querySelectorAll(".navbar-line");
      this.logo = this.navbar.querySelector(".navbar-logo");
      this.links = this.navbar.querySelectorAll(".navbar-links li");
      this.letsTalk = this.navbar.querySelector(".navbar-letstalk");
      this.clickSound = this.navbar.querySelector("#clickSound");
    }

    this.init();
  }

  private init(): void {
    this.setup();

    this.resourceLoader = new ResourceLoader(() => this.onLoadComplete());
    this.resourceLoader.start();
  }

  private setup(): void {
    this.animateLogo();
    this.animateLinks();
    this.animateletsTalk();
  }

  private animateLogo(): void {
    if (!this.logo) return;

    this.logo.addEventListener("click", (e) => {
      e.preventDefault();

      if (!this.clickSound) return;

      this.clickSound.currentTime = 0;
      this.clickSound.play();
    });
  }

  private animateLinks(): void {
    if (!this.links) return;

    this.links.forEach((link) => {
      const text = link.querySelector("p");
      const subText = link.querySelector("strong");

      if (!text || !subText) return;

      WrapCharacters(text);
      WrapCharacters(subText);

      link.addEventListener("mouseenter", () => {
        const spans = text.querySelectorAll("span");
        const subSpans = subText.querySelectorAll("span");

        if (spans.length === 0 || subSpans.length === 0) return;

        gsap.to(spans, {
          top: "-3rem",
          duration: 0.5,
          ease: "power2.inOut",
          delay: (index) => index * 0.05,
        });
        gsap.to(subSpans, {
          top: "-3rem",
          duration: 0.5,
          ease: "power2.inOut",
          delay: (index) => index * 0.05,
        });
      });

      link.addEventListener("mouseleave", () => {
        const spans = text.querySelectorAll("span");
        const subSpans = subText.querySelectorAll("span");

        if (spans.length === 0 || subSpans.length === 0) return;

        gsap.to(spans, {
          top: "0rem",
          duration: 0.3,
          ease: "power2.inOut",
          delay: (index) => index * 0.05,
        });
        gsap.to(subSpans, {
          top: "0rem",
          duration: 0.3,
          ease: "power2.inOut",
          delay: (index) => index * 0.05,
        });
      });
    });
  }

  private animateletsTalk(): void {
    if (!this.letsTalk) return;

    new MagneticEffect(this.letsTalk, 60, 200);
  }

  private onLoadComplete(): void {
    this.timeline.play();
  }
}

new NavbarAnimation();
