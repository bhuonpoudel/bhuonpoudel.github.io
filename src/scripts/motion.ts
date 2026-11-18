/**
 * Site-wide motion runtime: Lenis smooth scrolling driven by the GSAP ticker,
 * ScrollTrigger kept in sync, plus declarative `data-reveal` animations that
 * any page or component can use without writing JS:
 *
 *   <div data-reveal>…</div>                 fade + slide up
 *   <div data-reveal="left|right|fade|scale">
 *   <ul data-reveal-stagger>…children…</ul>  children animate in sequence
 *   data-reveal-delay="0.2"                   optional delay (seconds)
 */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// mobile URL bar show/hide resizes the viewport mid-scroll; recalculating every
// trigger then causes visible jumps
ScrollTrigger.config({ ignoreMobileResize: true });

declare global {
  interface Window {
    __lenis?: Lenis;
    __motionReady?: boolean;
  }
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | undefined;

export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({
    lerp: 0.1,
    anchors: { offset: -96 },
    autoRaf: false,
    // let nested scroll areas (dialogs, code blocks, TOC) scroll natively
    allowNestedScroll: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  return lenis;
}

const fromVars: Record<string, gsap.TweenVars> = {
  up: { y: 32, opacity: 0 },
  down: { y: -32, opacity: 0 },
  left: { x: -40, opacity: 0 },
  right: { x: 40, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.94, opacity: 0 },
};

export function initReveals(root: ParentNode = document) {
  if (prefersReducedMotion()) return;

  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const from = fromVars[el.dataset.reveal || "up"] ?? fromVars.up;
    gsap.fromTo(
      el,
      from,
      {
        x: 0, y: 0, scale: 1, opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: Number(el.dataset.revealDelay ?? 0),
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  });

  root.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[];
    gsap.set(items, { opacity: 0, y: 28 });
    ScrollTrigger.batch(items, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }),
    });
  });
}

export function initMotion() {
  initSmoothScroll();
  initReveals();
  window.__motionReady = true;
  // images/fonts can shift layout after first paint
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };
