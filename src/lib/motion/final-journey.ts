import { gsap } from "gsap";
import type { MotionTier } from "./policy";

/** Text/decorative targets only. Forms, controls and footer links never move. */
export function cinematicFinalJourney(
  root: HTMLElement,
  tier: MotionTier,
  remember: (target: HTMLElement) => void,
) {
  if (tier === "static") return;
  const mobile = tier === "mobile";
  const tablet = tier === "tablet";
  const words = [...root.querySelectorAll<HTMLElement>("[data-journey-word]")];
  const copy = [
    ...root.querySelectorAll<HTMLElement>(
      "[data-journey-copy], [data-journey-form-intro], [data-journey-footer-copy]",
    ),
  ];
  const frame = root.querySelector<HTMLElement>("[data-journey-frame]");
  const camera = root.querySelector<HTMLElement>("[data-journey-camera]");
  const safe = (target: HTMLElement) =>
    !target.querySelector("a,button,input,select,textarea,[tabindex]");
  [...words, ...copy, ...(frame ? [frame] : []), ...(camera ? [camera] : [])]
    .filter(safe)
    .forEach(remember);
  if (words.length)
    gsap.fromTo(
      words,
      { yPercent: mobile ? 8 : tablet ? 40 : 72, opacity: 0.62 },
      {
        yPercent: 0,
        opacity: 1,
        duration: mobile ? 0.28 : 0.65,
        stagger: Math.min(0.035, 0.21 / words.length),
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: words[0].parentElement,
          start: "top 93%",
          once: true,
        },
      },
    );
  for (const target of copy.filter(safe)) {
    if (
      !mobile &&
      root.dataset.finalJourney === "contact" &&
      target.hasAttribute("data-journey-copy")
    ) {
      gsap.fromTo(
        target,
        { opacity: 0.88, y: 0 },
        {
          opacity: 1,
          y: tablet ? -3 : -8,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 65%",
            end: "bottom top",
            scrub: 0.3,
          },
        },
      );
      continue;
    }
    gsap.fromTo(
      target,
      { opacity: 0.78 },
      {
        opacity: 1,
        duration: mobile ? 0.25 : 0.5,
        immediateRender: false,
        scrollTrigger: { trigger: target, start: "top 94%", once: true },
      },
    );
  }
  if (frame && safe(frame))
    gsap.fromTo(
      frame,
      {
        clipPath: mobile
          ? "inset(0% 0% 0% 0%)"
          : tablet
            ? "inset(4% 0% 0% 0%)"
            : "inset(7% 0% 0% 0%)",
        opacity: 0.82,
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: mobile ? 0.28 : 0.85,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: frame, start: "top 92%", once: true },
      },
    );
  if (camera && !mobile && safe(camera))
    gsap.fromTo(
      camera,
      { scale: tablet ? 1.018 : 1.035, yPercent: tablet ? -0.4 : -1 },
      {
        scale: 1,
        yPercent: tablet ? 0.4 : 1,
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      },
    );
}
