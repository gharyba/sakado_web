import { gsap } from "gsap";
import type { MotionTier } from "./policy";

/** One photographic plane per chapter; all effects belong to the parent scene context. */
export function cinematicCompanyStory(
  root: HTMLElement,
  tier: MotionTier,
  remember: (element: HTMLElement) => void,
) {
  const list = root.querySelector<HTMLElement>("[data-story-list]");
  const frames = [...root.querySelectorAll<HTMLElement>("[data-story-frame]")];
  const cameras = [
    ...root.querySelectorAll<HTMLElement>("[data-story-camera]"),
  ];
  const phases = [...root.querySelectorAll<HTMLElement>("[data-story-phase]")];
  const words = [...root.querySelectorAll<HTMLElement>("[data-story-word]")];
  const emphasis = [
    ...root.querySelectorAll<HTMLElement>("[data-story-emphasis]"),
  ];
  const progress = root.querySelector<HTMLElement>("[data-story-progress]");
  if (
    !list ||
    !progress ||
    frames.length !== 3 ||
    cameras.length !== 3 ||
    phases.length !== 3 ||
    tier === "static"
  )
    return;
  if (
    [...frames, ...phases].some((target) =>
      target.querySelector("a,button,input,select,textarea,[tabindex]"),
    )
  )
    return;
  const originals = new Map<HTMLElement, string | null>();
  [...frames, ...cameras, ...phases, ...words, ...emphasis, progress].forEach(
    (target) => {
      originals.set(target, target.getAttribute("style"));
      remember(target);
    },
  );
  const originalLayout = root.getAttribute("data-story-layout");
  const restore = () => {
    for (const [target, style] of originals) {
      if (style === null) target.removeAttribute("style");
      else target.setAttribute("style", style);
    }
    if (originalLayout === null) root.removeAttribute("data-story-layout");
    else root.setAttribute("data-story-layout", originalLayout);
  };
  const media = gsap.matchMedia();
  media.add({ tall: "(min-height: 800px)", all: "all" }, (match) => {
    const frameHeight = Math.min(innerHeight * 0.52, 560);
    const travel = list.getBoundingClientRect().height - frameHeight;
    const sticky =
      tier === "desktop" &&
      match.conditions?.tall &&
      travel <= Math.min(innerHeight * 0.6, 600) + 2;
    if (sticky) root.dataset.storyLayout = "sticky";
    else root.dataset.storyLayout = "flow";
    if (tier === "mobile") {
      // Touch/coarse pointers: native flow, opacity only, and no image camera scrub.
      for (const frame of frames)
        gsap.fromTo(
          frame,
          { opacity: 0.72 },
          {
            opacity: 1,
            duration: 0.28,
            immediateRender: false,
            scrollTrigger: { trigger: frame, start: "top 90%", once: true },
          },
        );
      return restore;
    }
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: list,
        start: "top 70%",
        end: "bottom 38%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    timeline.fromTo(
      progress,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 3 },
      0,
    );
    frames.forEach((frame, index) => {
      const start = index * 0.9;
      const copyWords = [
        ...phases[index].querySelectorAll<HTMLElement>("[data-story-word]"),
      ];
      timeline.fromTo(
        copyWords,
        { yPercent: 76, opacity: 0.6 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.32,
          stagger:
            copyWords.length > 1
              ? Math.min(0.05, 0.2 / (copyWords.length - 1))
              : 0,
        },
        start,
      );
      timeline.fromTo(
        phases[index],
        { y: tier === "tablet" ? 3 : 6 },
        { y: 0, duration: 0.6 },
        start,
      );
      timeline.fromTo(
        emphasis[index],
        { opacity: 0.74 },
        { opacity: 1, duration: 0.6 },
        start + 0.16,
      );
      timeline.fromTo(
        frame,
        { clipPath: "inset(10% 0 0 0 round 22px)" },
        { clipPath: "inset(0% 0 0 0 round 22px)", duration: 0.65 },
        start,
      );
      timeline.fromTo(
        cameras[index],
        {
          scale: tier === "tablet" ? 1.025 : 1.045,
          x: (index % 2 ? 1 : -1) * (tier === "tablet" ? 4 : 10),
          y: tier === "tablet" ? 4 : 12,
        },
        { scale: 1, x: 0, y: tier === "tablet" ? -4 : -10, duration: 1.05 },
        start,
      );
      if (sticky) {
        gsap.set(frame, { opacity: index ? 0 : 1 });
        if (index) {
          timeline.to(frame, { opacity: 1, duration: 0.32 }, start - 0.16);
          timeline.to(
            frames[index - 1],
            { opacity: 0, duration: 0.32 },
            start - 0.16,
          );
        }
      } else {
        timeline.fromTo(
          frame,
          { opacity: 0.72 },
          { opacity: 1, duration: 0.5 },
          start,
        );
      }
    });
    return restore;
  });
  return () => {
    media.revert();
    restore();
  };
}
