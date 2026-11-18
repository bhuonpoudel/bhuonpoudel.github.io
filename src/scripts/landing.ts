/**
 * Landing page choreography (GSAP + ScrollTrigger + SplitText + DrawSVG).
 * Every effect is opt-in through data attributes in the landing components,
 * and everything is skipped under prefers-reduced-motion.
 */
import { gsap, ScrollTrigger, prefersReducedMotion } from "./motion";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(SplitText, DrawSVGPlugin);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

function hero() {
  const section = $("[data-hero]");
  if (!section) return;
  const title = $("[data-hero-title]", section)!;
  const fades = $$("[data-hero-fade]", section);
  const paths = $$<SVGPathElement>("[data-topography] path", section);

  gsap.set([title, ...fades], { autoAlpha: 1 });

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(paths, { drawSVG: "0%", duration: 2.6, ease: "power2.inOut", stagger: { each: 0.04, from: "random" } }, 0);

  SplitText.create(title, {
    type: "lines,words",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.words, { yPercent: 110, rotate: 4, duration: 1.3, stagger: 0.045, ease: "expo.out", delay: 0.15 });
    },
  });
  tl.from(fades, { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.1 }, 0.6);

  // cursor-following glow
  const glow = $("[data-hero-glow]", section);
  if (glow && matchMedia("(pointer: fine)").matches) {
    const xTo = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3" });
    const yTo = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3" });
    gsap.set(glow, { xPercent: -50, yPercent: -50, x: innerWidth * 0.7, y: innerHeight * 0.3, force3D: true });
    // measure the section's page offset once per hover, not on every pointer
    // move (getBoundingClientRect per move forces layout mid-scroll)
    let left = 0;
    let top = 0;
    section.addEventListener("pointerenter", () => {
      const r = section.getBoundingClientRect();
      left = r.left;
      top = r.top + window.scrollY;
    });
    section.addEventListener("pointermove", (e) => {
      xTo(e.clientX - left);
      yTo(e.clientY + window.scrollY - top);
    }, { passive: true });
  }

  // parallax-out on scroll
  const scrub = { trigger: section, start: "top top", end: "bottom top", scrub: true };
  gsap.to("[data-hero-content]", { yPercent: 25, autoAlpha: 0.1, ease: "none", scrollTrigger: scrub });
  gsap.to("[data-hero-bg]", { yPercent: 15, scale: 1.08, ease: "none", scrollTrigger: scrub });
}

function marquee() {
  $$("[data-marquee]").forEach((el) => {
    const track = $("[data-marquee-track]", el)!;
    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    // Scroll velocity speeds the marquee up and flips its direction. Scroll
    // updates only record the target; one ticker callback eases toward it, so
    // no tweens are created per scroll frame.
    let direction = 1;
    let boost = 0;
    let speed = 1;
    const tick = () => {
      const r = gsap.ticker.deltaRatio();
      boost *= Math.pow(0.93, r);
      speed += (direction * (1 + boost) - speed) * Math.min(1, 0.1 * r);
      loop.timeScale(speed);
    };
    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        direction = self.direction;
        boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) / 200, 6));
      },
      // only animate while on screen
      onToggle(self) {
        if (self.isActive) {
          loop.resume();
          gsap.ticker.add(tick);
        } else {
          loop.pause();
          gsap.ticker.remove(tick);
        }
      },
    });
  });
}

function scrubText() {
  $$("[data-scrub-text]").forEach((el) => {
    const split = SplitText.create(el, { type: "words" });
    gsap.fromTo(
      split.words,
      { opacity: 0.15 },
      { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } },
    );
  });
}

function counters() {
  $$("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => (el.textContent = String(Math.round(obj.v))),
    });
  });
}

function horizontalProjects() {
  const section = $("[data-hscroll]");
  const inner = section && $("[data-hscroll-inner]", section);
  if (!section || !inner) return;

  gsap.matchMedia().add("(min-width: 1024px)", () => {
    const distance = () => inner.scrollWidth - window.innerWidth;
    const tween = gsap.to(inner, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        // Lenis already smooths the scroll; extra scrub lag here made the
        // pinned track drift after the pin released
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    // inner image parallax, driven by the horizontal tween
    $$("[data-hscroll-img]", section).forEach((img) =>
      gsap.fromTo(
        img,
        { xPercent: 0 },
        {
          xPercent: -16,
          ease: "none",
          scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        },
      ),
    );
  });
}

function magnetic() {
  if (!matchMedia("(pointer: fine)").matches) return;
  $$("[data-magnetic]").forEach((el) => {
    const inner = $("[data-magnetic-inner]", el) ?? el;
    const strength = 0.35;
    const opts = { duration: 0.6, ease: "power3.out" };
    const elX = gsap.quickTo(el, "x", opts);
    const elY = gsap.quickTo(el, "y", opts);
    const inX = gsap.quickTo(inner, "x", opts);
    const inY = gsap.quickTo(inner, "y", opts);
    // measure once on enter instead of on every move (el moves itself, so the
    // live rect would also feed back into the offset)
    let cx = 0;
    let cy = 0;
    el.addEventListener("pointerenter", () => {
      const r = el.getBoundingClientRect();
      const t = gsap.getProperty(el, "x") as number;
      const u = gsap.getProperty(el, "y") as number;
      cx = r.left - t + r.width / 2;
      cy = r.top - u + r.height / 2;
    });
    el.addEventListener("pointermove", (e) => {
      const x = e.clientX - cx;
      const y = e.clientY - cy;
      elX(x * strength);
      elY(y * strength);
      inX(x * strength * 0.5);
      inY(y * strength * 0.5);
    });
    el.addEventListener("pointerleave", () => {
      gsap.to([el, inner], { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
    });
  });
}

function init() {
  if (prefersReducedMotion()) return;
  hero();
  marquee();
  scrubText();
  counters();
  horizontalProjects();
  magnetic();
  ScrollTrigger.refresh();
}

// wait for fonts so SplitText measures lines correctly
document.fonts.ready.then(init);
