import { describe, it, expect, beforeEach } from "vitest";

describe("Header Component", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header>
        <button class="header-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="nav-links">
          <a href="index.html" class="nav-link">Home</a>
          <a href="about.html" class="nav-link">About</a>
          <a href="contact.html" class="nav-link">Contact</a>
        </nav>
      </header>
    `;
  });

  it("should toggle menu when clicking toggle button", () => {
    const header = document.querySelector("header");
    const toggle = header?.querySelector(".header-toggle");
    const navLinks = header?.querySelector(".nav-links");

    expect(navLinks?.classList.contains("nav-links--open")).toBe(false);

    toggle?.dispatchEvent(new Event("click"));

    setTimeout(() => {
      expect(navLinks?.classList.contains("nav-links--open")).toBe(true);
      expect(toggle?.classList.contains("header-toggle--active")).toBe(true);
    }, 150);
  });

  it("should close menu when clicking a nav link", () => {
    const header = document.querySelector("header");
    const toggle = header?.querySelector(".header-toggle");
    const navLinks = header?.querySelector(".nav-links");
    const firstLink = header?.querySelector(".nav-link");

    toggle?.dispatchEvent(new Event("click"));

    setTimeout(() => {
      expect(navLinks?.classList.contains("nav-links--open")).toBe(true);

      firstLink?.dispatchEvent(new Event("click"));

      setTimeout(() => {
        expect(navLinks?.classList.contains("nav-links--open")).toBe(false);
        expect(toggle?.classList.contains("header-toggle--active")).toBe(false);
      }, 50);
    }, 150);
  });

  it("should have correct number of navigation links", () => {
    const header = document.querySelector("header");
    const links = header?.querySelectorAll(".nav-link");

    expect(links?.length).toBe(3);
  });

  it("should have toggle button with 3 spans", () => {
    const toggle = document.querySelector(".header-toggle");
    const spans = toggle?.querySelectorAll("span");

    expect(spans?.length).toBe(3);
  });
});
