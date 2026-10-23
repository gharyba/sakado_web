import { gsap } from "gsap";
import type { MotionTier } from "./policy";

/** One scroll timeline and event-driven pointer tweens; no custom frame loop. */
export function ambientBackground(
  root: HTMLElement,
  tier: MotionTier,
  remember: (element: HTMLElement) => void,
  refresh: () => void,
) {
  if (tier === "static" || root.getAttribute("aria-hidden") !== "true") return;
  const sapphire = root.querySelector<HTMLElement>(
    '[data-ambient-plane="sapphire"]',
  );
  const indigo = root.querySelector<HTMLElement>(
    '[data-ambient-plane="indigo"]',
  );
  const dusk = root.querySelector<HTMLElement>('[data-ambient-plane="dusk"]');
  const halo = root.querySelector<HTMLElement>('[data-ambient-pointer="halo"]');
  const spark = root.querySelector<HTMLElement>(
    '[data-ambient-pointer="spark"]',
  );
  if (!sapphire || !indigo || !dusk || !halo || !spark) return;
  [sapphire, indigo, dusk, halo, spark].forEach(remember);

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: document.documentElement,
      start: 0,
      end: "max",
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  timeline.fromTo(
    sapphire,
    { opacity: 0.9, y: tier === "mobile" ? 0 : -24 },
    { opacity: 0.15, y: tier === "mobile" ? 0 : 24, duration: 1 },
    0,
  );
  timeline.fromTo(
    indigo,
    { opacity: 0 },
    { opacity: 0.85, duration: 0.45 },
    0.1,
  );
  timeline.to(indigo, { opacity: 0.2, duration: 0.4 }, 0.6);
  timeline.fromTo(
    dusk,
    { opacity: 0 },
    { opacity: 0.85, duration: 0.45 },
    0.55,
  );

  const site = root.closest(".s-company-site");
  const resize =
    site && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(refresh)
      : undefined;
  if (site) resize?.observe(site);
  if (tier === "mobile") return () => resize?.disconnect();

  gsap.set([halo, spark], { xPercent: -50, yPercent: -50 });
  const haloX = gsap.quickTo(halo, "x", { duration: 0.5, ease: "power3.out" });
  const haloY = gsap.quickTo(halo, "y", { duration: 0.5, ease: "power3.out" });
  const sparkX = gsap.quickTo(spark, "x", {
    duration: 0.85,
    ease: "power3.out",
  });
  const sparkY = gsap.quickTo(spark, "y", {
    duration: 0.85,
    ease: "power3.out",
  });
  const fade = gsap
    .timeline({ paused: true })
    .to(halo, { opacity: 0.6, duration: 0.3 }, 0)
    .to(spark, { opacity: 0.45, duration: 0.4 }, 0);
  let visible = false;
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const first = !visible;
    haloX(event.clientX, first ? event.clientX : undefined);
    haloY(event.clientY, first ? event.clientY : undefined);
    sparkX(event.clientX, first ? event.clientX : undefined);
    sparkY(event.clientY, first ? event.clientY : undefined);
    if (first) {
      visible = true;
      fade.play();
    }
  };
  const hide = () => {
    visible = false;
    fade.reverse();
  };
  const leave = (event: PointerEvent) => {
    if (event.relatedTarget === null) hide();
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerout", leave, { passive: true });
  window.addEventListener("blur", hide);
  return () => {
    resize?.disconnect();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerout", leave);
    window.removeEventListener("blur", hide);
  };
}
