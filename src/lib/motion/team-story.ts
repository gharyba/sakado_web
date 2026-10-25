import { gsap } from "gsap";
import type { MotionTier } from "./policy";

/** Two server-rendered portraits; the parent MotionScene owns lifecycle and cleanup. */
export function cinematicTeamStory(
  root: HTMLElement,
  tier: MotionTier,
  remember: (element: HTMLElement) => void,
) {
  if (tier === "static") return;
  const members = [...root.querySelectorAll<HTMLElement>("[data-team-member]")];
  if (members.length !== 2) return;
  const targets = members.map((member) => ({
    member,
    frame: member.querySelector<HTMLElement>("[data-team-frame]"),
    camera: member.querySelector<HTMLElement>("[data-team-camera]"),
    name: member.querySelector<HTMLElement>("[data-team-name]"),
    role: member.querySelector<HTMLElement>("[data-team-role]"),
  }));
  if (
    targets.some(
      ({ frame, camera, name, role }) => !frame || !camera || !name || !role,
    )
  )
    return;

  targets.forEach(({ member, frame, camera, name, role }, index) => {
    const parts = [frame!, camera!, name!, role!];
    parts.forEach(remember);
    if (tier === "mobile") {
      gsap.fromTo(
        frame!,
        { opacity: 0.82 },
        {
          opacity: 1,
          duration: 0.32,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: member, start: "top 88%", once: true },
        },
      );
      return;
    }

    const tablet = tier === "tablet";
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: member,
        start: "top 88%",
        end: tablet ? "center 50%" : "center 44%",
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    });
    timeline.fromTo(
      frame!,
      {
        clipPath: index === 0 ? "inset(14% 0 0 0)" : "inset(0 14% 0 0)",
        opacity: 0.86,
      },
      { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1 },
      0,
    );
    timeline.fromTo(
      camera!,
      {
        scale: tablet ? 1.015 : 1.035,
        x: (index === 0 ? 1 : -1) * (tablet ? 4 : 9),
      },
      { scale: 1, x: 0, duration: 1 },
      0,
    );
    timeline.fromTo(
      name!,
      { y: tablet ? 5 : 10, opacity: 0.78 },
      { y: 0, opacity: 1, duration: 0.6 },
      0.24,
    );
    timeline.fromTo(
      role!,
      { y: tablet ? 2 : 5, opacity: 0.8 },
      { y: 0, opacity: 1, duration: 0.48 },
      0.42,
    );
  });
}
