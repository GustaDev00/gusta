import gsap from "gsap";

export class MagneticEffect {
  private target: HTMLElement;
  private movement: number;
  private proximity: number;
  private isNear: boolean = false;

  constructor(
    target: HTMLElement,
    movement: number = 30,
    proximity: number = 100
  ) {
    this.target = target;
    this.movement = movement;
    this.proximity = proximity;
    this.init();
  }

  private init(): void {
    this.target.addEventListener("mouseenter", () => {
      gsap.to(this.target, {
        duration: 0.3,
        scale: 1.1,
        ease: "power2.easeOut",
      });
    });

    this.target.addEventListener("mouseleave", () => {
      gsap.to(this.target, {
        duration: 0.3,
        scale: 1,
        ease: "power2.easeOut",
      });
    });

    document.addEventListener("mousemove", (e) => {
      this.updatePosition(e);
    });
  }

  private updatePosition(e: MouseEvent): void {
    const rect = this.target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );

    if (distance < this.proximity) {
      this.isNear = true;
      const relX = e.clientX - centerX;
      const relY = e.clientY - centerY;
      const force = 1 - distance / this.proximity;
      const moveX = (relX / this.proximity) * this.movement * force;
      const moveY = (relY / this.proximity) * this.movement * force;

      gsap.to(this.target, {
        duration: 0.3,
        x: moveX,
        y: moveY,
        ease: "power2.easeOut",
      });
    } else {
      if (this.isNear) {
        this.isNear = false;
        gsap.to(this.target, {
          duration: 0.3,
          x: 0,
          y: 0,
          ease: "power2.easeOut",
        });
      }
    }
  }
}
