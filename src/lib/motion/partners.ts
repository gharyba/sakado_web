import { gsap } from "gsap";
import type { MotionTier } from "./policy";

/** The scene context owns these decorative logo targets; headings use the existing recipe. */
export function cinematicPartners(
  root: HTMLElement,
  tier: MotionTier,
  remember: (target: HTMLElement) => void,
) {
  if (tier === "static") return;
  root
    .querySelectorAll<HTMLElement>("[data-partner-mark]")
    .forEach((mark, index) => {
      if (mark.querySelector("a,button,input,select,textarea,[tabindex]"))
        return;
      remember(mark);
      if (tier === "mobile") {
        gsap.fromTo(
          mark,
          { opacity: 0.86 },
          {
            opacity: 1,
            duration: 0.25,
            immediateRender: false,
            scrollTrigger: { trigger: mark, start: "top 95%", once: true },
          },
        );
      } else {
        gsap.fromTo(
          mark,
          { opacity: 0.82, y: tier === "tablet" ? 3 : 6 },
          {
            opacity: 1,
            y: 0,
            duration: 0.36,
            delay: Math.min(index, 4) * 0.05,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: root,
              start: "top 82%",
              once: true,
            },
          },
        );
      }
    });
}
