import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  canPin,
  motionDistance,
  motionEffects,
  motionQueries,
  motionTier,
  type MotionEffect,
} from "./policy";

// Imported only from a client effect. No business services and no custom scroll loop.
gsap.registerPlugin(ScrollTrigger);
let refreshFrame = 0;
let activeScenes = 0;
let engineDisabled = false;
export function releaseUnusedEngine() {
  if (!activeScenes && !ScrollTrigger.getAll().length && !engineDisabled) {
    ScrollTrigger.disable();
    engineDisabled = true;
  }
}
function requestRefresh() {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh();
  });
}
const focusable =
  "a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]";

export function mountScene(root: HTMLElement): () => void {
  activeScenes++;
  if (engineDisabled) {
    ScrollTrigger.enable();
    engineDisabled = false;
  }
  const media = gsap.matchMedia();
  let live = true;
  const revealed = new WeakSet<HTMLElement>();
  const context = gsap.context(() => {}, root);
  try {
    context.add(() => {
      media.add(
        motionQueries,
        (match) => {
          const conditions = match.conditions!;
          const tier = motionTier({
            width: window.innerWidth,
            coarse: conditions.coarse,
            reduced: conditions.reduced,
          });
          if (tier === "static") return;
          // Nested scenes own their descendants. One transform owner per element.
          const elements = Array.from(
            root.querySelectorAll<HTMLElement>("[data-motion]"),
          ).filter(
            (element) => element.closest("[data-motion-scene]") === root,
          );
          for (const element of elements) {
            const effect = element.dataset.motion as MotionEffect;
            if (!motionEffects.includes(effect)) continue;
            const raw = element.dataset.motionDistance;
            const distance = motionDistance(
              effect,
              tier,
              raw === undefined ? undefined : Number(raw),
            );
            const interactive =
              element.matches(focusable) || !!element.querySelector(focusable);
            if (effect === "pin") {
              if (
                canPin({
                  tier,
                  viewportHeight: innerHeight,
                  elementHeight: element.offsetHeight,
                  interactive,
                  short: conditions.short,
                })
              ) {
                ScrollTrigger.create({
                  trigger: element,
                  start: "top 20%",
                  end: () => `+=${Math.min(innerHeight * 0.6, 600)}`,
                  pin: element,
                  pinSpacing: true,
                  invalidateOnRefresh: true,
                });
              }
              continue;
            }
            if (
              effect === "background" ||
              effect === "foreground" ||
              effect === "transition"
            ) {
              // Keep controls and readable content stable: layer effects are decoration-only.
              if (
                !distance ||
                interactive ||
                element.getAttribute("aria-hidden") !== "true"
              )
                continue;
              gsap.fromTo(
                element,
                { y: -distance / 2 },
                {
                  y: distance / 2,
                  ease: "none",
                  scrollTrigger: {
                    trigger: root,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                },
              );
              continue;
            }
            // Reveals play once on entry, never hide future content while waiting for scroll.
            if (interactive || revealed.has(element)) continue;
            const tween = gsap.fromTo(
              element,
              {
                opacity: 0,
                y: distance,
                ...(effect === "image" && tier === "desktop"
                  ? { clipPath: "inset(6% 0 0 0)" }
                  : {}),
              },
              {
                opacity: 1,
                y: 0,
                ...(effect === "image" && tier === "desktop"
                  ? { clipPath: "inset(0% 0 0 0)" }
                  : {}),
                duration: tier === "mobile" ? 0.24 : 0.4,
                ease: "power2.out",
                paused: true,
                immediateRender: false,
              },
            );
            ScrollTrigger.create({
              trigger: element,
              start: "top 90%",
              once: true,
              onEnter: () => {
                revealed.add(element);
                tween.play();
              },
            });
          }
        },
        root,
      );
    });
  } catch (error) {
    media.revert();
    context.revert();
    activeScenes--;
    releaseUnusedEngine();
    throw error;
  }
  // Refresh only after layout changes, never read geometry on each scroll frame.
  const sizes = new WeakMap<Element, string>();
  const resize =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver((entries) => {
          let changed = false;
          for (const entry of entries) {
            const size = `${entry.contentRect.width}:${entry.contentRect.height}`;
            if (sizes.get(entry.target) !== size) {
              sizes.set(entry.target, size);
              changed = true;
            }
          }
          if (changed) requestRefresh();
        });
  resize?.observe(root);
  root
    .querySelectorAll("[data-motion],img")
    .forEach((element) => resize?.observe(element));
  const loaded = () => requestRefresh();
  root.addEventListener("load", loaded, true);
  root.addEventListener("error", loaded, true);
  void document.fonts?.ready.then(() => {
    if (live) requestRefresh();
  });
  requestRefresh();
  return () => {
    live = false;
    resize?.disconnect();
    root.removeEventListener("load", loaded, true);
    root.removeEventListener("error", loaded, true);
    media.revert();
    context.revert();
    activeScenes--;
    if (!activeScenes && refreshFrame) {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = 0;
    }
    releaseUnusedEngine();
    // Never kill triggers belonging to another scene or existing integration.
  };
}
