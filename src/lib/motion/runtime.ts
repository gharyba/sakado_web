import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinematicReveal, cinematicStory } from "./cinematic";
import { cinematicTravel, cinematicScale } from "./cinematic-policy";
import { cinematicHero } from "./hero";
import { cinematicCompanyStory } from "./company-story";
import { ambientBackground } from "./ambient";
import {
  canPin,
  motionDistance,
  motionEffects,
  motionQueries,
  motionTier,
  motionScale,
  revealOpacity,
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
  const originalStyles = new Map<HTMLElement, string | null>();
  const rememberStyles = (element: HTMLElement) => {
    if (!originalStyles.has(element))
      originalStyles.set(element, element.getAttribute("style"));
  };
  const restoreStyles = (
    elements: Iterable<HTMLElement> = originalStyles.keys(),
  ) => {
    for (const element of elements) {
      const style = originalStyles.get(element);
      if (style === undefined) continue;
      if (style === null) element.removeAttribute("style");
      else element.setAttribute("style", style);
    }
  };
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
          const cinematic = root.dataset.motionProfile === "cinematic";
          const revealBudget = { active: 0 };
          const cinematicCleanups: Array<() => void> = [];
          if (root.hasAttribute("data-ambient-background")) {
            const cleanup = ambientBackground(
              root,
              tier,
              rememberStyles,
              requestRefresh,
            );
            if (cleanup) cinematicCleanups.push(cleanup);
          }
          if (root.hasAttribute("data-hero-cinematic")) {
            cinematicHero(root, tier, rememberStyles);
          }
          if (root.hasAttribute("data-company-story")) {
            const cleanup = cinematicCompanyStory(root, tier, rememberStyles);
            if (cleanup) cinematicCleanups.push(cleanup);
          }
          // Homepage headings keep visible server text until their own viewport entry.
          for (const heading of root.querySelectorAll<HTMLElement>(
            "[data-home-words]",
          )) {
            if (heading.closest("[data-motion-scene]") !== root) continue;
            const words = Array.from(
              heading.querySelectorAll<HTMLElement>("[data-home-word]"),
            );
            if (!words.length) continue;
            words.forEach(rememberStyles);
            const tween = gsap.fromTo(
              words,
              { yPercent: tier === "mobile" ? 12 : 70, opacity: 0.45 },
              {
                yPercent: 0,
                opacity: 1,
                duration: tier === "mobile" ? 0.28 : 0.58,
                stagger:
                  words.length > 1
                    ? Math.min(0.06, 0.24 / (words.length - 1))
                    : 0,
                ease: "power3.out",
                paused: true,
                immediateRender: false,
              },
            );
            ScrollTrigger.create({
              trigger: heading,
              start: "top 90%",
              once: true,
              onEnter: () => tween.play(),
            });
          }
          // Nested scenes own their descendants. One transform owner per element.
          const elements = Array.from(
            root.querySelectorAll<HTMLElement>("[data-motion]"),
          ).filter(
            (element) => element.closest("[data-motion-scene]") === root,
          );
          for (const element of elements) {
            // The coordinated hero timeline exclusively owns its camera target.
            if (element.hasAttribute("data-hero-camera")) continue;
            const effect = element.dataset.motion as MotionEffect;
            if (!motionEffects.includes(effect)) continue;
            const raw = element.dataset.motionDistance;
            const distance = (cinematic ? cinematicTravel : motionDistance)(
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
                rememberStyles(element);
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
            if (effect === "text") {
              // Semantic text only; essential controls never move or fade on scroll.
              if (interactive || !distance) continue;
              rememberStyles(element);
              gsap.fromTo(
                element,
                { y: 0, opacity: 1 },
                {
                  y: -distance,
                  opacity: 0.94,
                  ease: "none",
                  scrollTrigger: {
                    trigger: root,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                },
              );
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
              rememberStyles(element);
              gsap.fromTo(
                element,
                {
                  y: -distance / 2,
                  ...(element.dataset.motionScale ? { scale: 1 } : {}),
                },
                {
                  y: distance / 2,
                  ...(element.dataset.motionScale
                    ? {
                        scale: (cinematic ? cinematicScale : motionScale)(
                          tier,
                          Number(element.dataset.motionScale),
                        ),
                      }
                    : {}),
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
            rememberStyles(element);
            if (cinematic) {
              cinematicCleanups.push(
                cinematicReveal(
                  element,
                  effect,
                  tier,
                  distance,
                  revealed,
                  revealBudget,
                ),
              );
              continue;
            }
            const tween = gsap.fromTo(
              element,
              {
                opacity: revealOpacity(
                  element.dataset.motionInitialOpacity === undefined
                    ? undefined
                    : Number(element.dataset.motionInitialOpacity),
                ),
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
          // Delayed fromTo start states must never survive a media-context revert.
          // Targets have one animation owner; preserve their exact pre-scene inline styles.
          if (cinematic && !root.hasAttribute("data-company-story"))
            cinematicStory(root, tier, rememberStyles);
          return () => {
            cinematicCleanups.forEach((cleanup) => cleanup());
            restoreStyles();
            elements.forEach((element) => {
              delete element.dataset.cinematicRevealing;
            });
          };
        },
        root,
      );
    });
  } catch (error) {
    media.revert();
    context.revert();
    restoreStyles();
    originalStyles.clear();
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
    restoreStyles();
    originalStyles.clear();
    activeScenes--;
    if (!activeScenes && refreshFrame) {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = 0;
    }
    releaseUnusedEngine();
    // Never kill triggers belonging to another scene or existing integration.
  };
}
