import { gsap } from "gsap";
import type { MotionTier } from "./policy";

/** Scoped visual recipe. No asset selection, data access, pinning or control targets. */
export function cinematicHero(
  root: HTMLElement,
  tier: MotionTier,
  remember: (element: HTMLElement) => void,
) {
  const camera = root.querySelector<HTMLElement>("[data-hero-camera]");
  const window = root.querySelector<HTMLElement>("[data-hero-window]");
  const copy = root.querySelector<HTMLElement>("[data-hero-copy]");
  const words = Array.from(
    root.querySelectorAll<HTMLElement>("[data-hero-word]"),
  );
  if (!camera || !window || !copy || tier === "static") return;
  const controls = "a,button,input,select,textarea,[tabindex]";
  if (copy.querySelector(controls) || camera.querySelector(controls)) return;
  [camera, window, copy, ...words].forEach(remember);

  // SSR is visible. Only enhance an opening still on screen; never hide restored scroll.
  if (root.getBoundingClientRect().top >= -80) {
    gsap.fromTo(
      words,
      { yPercent: tier === "mobile" ? 15 : 90, opacity: 0.3 },
      {
        yPercent: 0,
        opacity: 1,
        duration: tier === "mobile" ? 0.3 : 0.65,
        stagger:
          words.length > 1 ? Math.min(0.06, 0.24 / (words.length - 1)) : 0,
        ease: "power3.out",
      },
    );
  }
  // Coarse pointers/mobile keep a short entrance and a stationary photographic plane.
  if (tier === "mobile") return;
  const tablet = tier === "tablet";
  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  timeline.fromTo(
    camera,
    { y: tablet ? -12 : -30, scale: 1.01 },
    { y: tablet ? 24 : 60, scale: tablet ? 1.025 : 1.07, duration: 1 },
    0,
  );
  timeline.fromTo(
    window,
    { scaleX: 1, scaleY: 1, borderRadius: tablet ? 32 : 40 },
    {
      scaleX: () =>
        Math.min(tablet ? 1.08 : 1.22, innerWidth / window.offsetWidth),
      scaleY: tablet ? 1.06 : 1.18,
      borderRadius: 8,
      duration: 0.7,
    },
    0,
  );
  timeline.fromTo(
    copy,
    { y: 0, opacity: 1 },
    {
      y: tablet ? -24 : -64,
      opacity: 0.35,
      duration: 0.72,
    },
    0.08,
  );
  timeline.fromTo(
    window,
    { opacity: 1 },
    { opacity: 0.45, duration: 0.3 },
    0.7,
  );
}
