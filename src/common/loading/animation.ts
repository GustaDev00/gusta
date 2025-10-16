import gsap from "gsap";

interface AnimationElements {
  bars: NodeListOf<SVGElement>;
  logo: HTMLElement;
  percentageElement: HTMLElement;
}

export default class LoadingAnimator {
  private timeline: gsap.core.Timeline;
  private elements: AnimationElements;

  constructor(elements: AnimationElements) {
    this.elements = elements;
    this.timeline = gsap.timeline({ paused: true });
    this.setup();
  }

  private setup(): void {
    const { bars, logo, percentageElement } = this.elements;
    const barHeight = bars[0].getBoundingClientRect().height;

    this.animateFirstBar(bars, barHeight);
    this.animateStackingBars(bars, barHeight);
    this.animateBounceEffect(bars, barHeight);
    this.animatePercentage(percentageElement);
    this.animateLogo(logo);
  }

  private animateFirstBar(
    bars: NodeListOf<SVGElement>,
    barHeight: number
  ): void {
    this.timeline.to(bars[0], {
      delay: 0.1,
      top: `${barHeight}px`,
      duration: 0.4,
      ease: "power1.in",
    });
  }

  private animateStackingBars(
    bars: NodeListOf<SVGElement>,
    barHeight: number
  ): void {
    const barCount = bars.length;

    for (let i = 1; i < Math.min(barCount, 6); i++) {
      const duration = i === 1 ? 0.3 : 0.2;

      this.timeline.to(bars[i], {
        top: `${barHeight}px`,
        duration,
        ease: "power1.in",
      });

      for (let j = 0; j < i; j++) {
        this.timeline.to(
          bars[j],
          {
            top: `${barHeight * (i - j + 1)}px`,
            duration: j === 0 ? 0.3 : duration,
            ease: "power1.in",
          },
          "<"
        );
      }
    }
  }

  private animateBounceEffect(
    bars: NodeListOf<SVGElement>,
    barHeight: number
  ): void {
    for (let i = 0; i < 6; i++) {
      this.timeline.to(
        bars[5 - i],
        {
          top: `${barHeight * i + 8}px`,
          duration: 0.8,
          ease: "bounce.out",
        },
        "<"
      );
    }

    this.timeline.to({}, { duration: 0.1 });

    for (let i = 0; i < 6; i++) {
      this.timeline.to(
        bars[5 - i],
        {
          top: `${barHeight * i}px`,
          duration: 0.2,
          ease: "power1",
        },
        "<"
      );
    }
  }

  private animatePercentage(percentageElement: HTMLElement): void {
    const percentageProxy = { value: 0 };
    const timelineDuration = this.timeline.duration();

    percentageElement.textContent = "0%";

    if (timelineDuration > 0) {
      this.timeline.to(
        percentageProxy,
        {
          value: 100,
          duration: timelineDuration - 0.7,
          ease: "power2.inOut",
          onUpdate: () => {
            percentageElement.textContent = `${Math.round(
              percentageProxy.value
            )}%`;
          },
        },
        0
      );
    } else {
      percentageElement.textContent = "100%";
    }

    this.timeline.to(percentageElement, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
    });
  }

  private animateLogo(logo: HTMLElement): void {
    this.timeline.to(
      logo,
      {
        rotate: 90,
        duration: 0.5,
      },
      "<"
    );

    this.timeline.to(".loading-section", {
      opacity: 0,
      visibility: "hidden",
      duration: 0.5,
    });
  }

  public play(): void {
    this.timeline.play();
  }

  public pause(): void {
    this.timeline.pause();
  }

  public restart(): void {
    this.timeline.restart();
  }
}
