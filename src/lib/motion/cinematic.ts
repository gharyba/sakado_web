import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { admitCinematicReveal, cinematicEntrance } from "./cinematic-policy";
import { revealOpacity, type MotionEffect, type MotionTier } from "./policy";

type RevealBudget = { active: number };
/** Called inside the existing scene/media context; it owns all timelines and cleanup. */
export function cinematicReveal(
  element: HTMLElement,
  effect: MotionEffect,
  tier: MotionTier,
  distance: number,
  revealed: WeakSet<HTMLElement>,
  budget: RevealBudget,
) {
  const settings = cinematicEntrance(
    element.dataset.motionChoreography,
    tier,
    Number(element.dataset.motionDelay ?? 0),
  );
  const image = effect === "image";
  const gallery = element.dataset.motionGroup === "gallery";
  const imageScope =
    element.closest<HTMLElement>("[data-cinematic-sequence]") ?? element;
  const images = [...imageScope.querySelectorAll<HTMLImageElement>("img")];
  let live = true;
  let counted = false;
  const finish = () => {
    delete element.dataset.cinematicRevealing;
    if (counted) {
      budget.active--;
      counted = false;
    }
  };
  const tween = gsap.fromTo(
    element,
    {
      opacity: revealOpacity(
        Number(element.dataset.motionInitialOpacity ?? 0.72),
      ),
      y: distance,
      ...(image
        ? { scale: settings.scale, clipPath: `inset(${settings.mask}% 0 0 0)` }
        : {}),
      ...(!image && settings.blur
        ? { filter: `blur(${settings.blur}px)` }
        : {}),
    },
    {
      opacity: 1,
      y: 0,
      ...(image ? { scale: 1, clipPath: "inset(0% 0 0 0)" } : {}),
      ...(!image && settings.blur ? { filter: "blur(0px)" } : {}),
      duration: settings.duration,
      delay: settings.delay,
      ease: "power3.out",
      paused: true,
      immediateRender: false,
      onStart: () => {
        element.dataset.cinematicRevealing = "true";
      },
      onComplete: finish,
      onInterrupt: finish,
    },
  );
  const detach = () => {
    imageScope.removeEventListener("load", afterLoad, true);
    imageScope.removeEventListener("error", afterLoad, true);
  };
  const play = () => {
    if (!live || images.some((image) => !image.naturalWidth)) return;
    if (
      gallery &&
      !admitCinematicReveal(budget.active, ScrollTrigger.isInViewport(element))
    )
      return;
    if (gallery) {
      budget.active++;
      counted = true;
    }
    tween.play();
  };
  function afterLoad() {
    if (!images.every((image) => image.complete)) return;
    detach();
    if (ScrollTrigger.isInViewport(element)) play();
  }
  ScrollTrigger.create({
    trigger: element,
    start: "top 92%",
    once: true,
    onEnter: () => {
      revealed.add(element);
      if (images.some((image) => !image.complete)) {
        imageScope.addEventListener("load", afterLoad, true);
        imageScope.addEventListener("error", afterLoad, true);
      } else {
        play();
      }
    },
  });
  return () => {
    live = false;
    detach();
    finish();
  };
}

export function cinematicStory(
  root: HTMLElement,
  tier: MotionTier,
  remember: (element: HTMLElement) => void,
) {
  if (
    tier === "mobile" ||
    tier === "static" ||
    !root.hasAttribute("data-story-timeline")
  )
    return;
  const phases = [...root.querySelectorAll<HTMLElement>("[data-story-phase]")];
  const progress = root.querySelector<HTMLElement>("[data-story-progress]");
  if (
    phases.length !== 3 ||
    !progress ||
    progress.getAttribute("aria-hidden") !== "true"
  )
    return;
  // Year labels stay anchored outside these noninteractive text wrappers.
  if (phases.some((phase) => phase.querySelector("a,button,input,[tabindex]")))
    return;
  [...phases, progress].forEach(remember);
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: "top 72%",
      end: "bottom 32%",
      scrub: 0.35,
      invalidateOnRefresh: true,
    },
  });
  timeline.fromTo(
    progress,
    { scaleX: 0, transformOrigin: "left center" },
    { scaleX: 1, duration: 3, ease: "none" },
    0,
  );
  phases.forEach((phase, index) => {
    timeline.fromTo(
      phase,
      {
        opacity: 0.82,
        y: tier === "tablet" ? 2 : 4,
        ...(index === 2 ? { scale: 1 } : {}),
      },
      {
        opacity: 1,
        y: 0,
        ...(index === 2 ? { scale: tier === "tablet" ? 1.0055 : 1.01 } : {}),
        duration: index === 2 ? 0.8 : 0.45,
        ease: "sine.inOut",
      },
      index,
    );
    if (index < 2)
      timeline.to(
        phase,
        { opacity: 0.82, duration: 0.45, ease: "sine.inOut" },
        index + 0.7,
      );
  });
}
