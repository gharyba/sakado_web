import type { HTMLAttributes } from "react";
import type { MotionEffect } from "@/lib/motion/policy";
import type { CinematicRecipe } from "@/lib/motion/cinematic-policy";

/** Server-compatible markup. Distance is engineering configuration, never CMS input. */
export function Motion({
  effect,
  distance,
  scale,
  initialOpacity,
  choreography,
  delay,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  effect: MotionEffect;
  distance?: number;
  scale?: number;
  initialOpacity?: number;
  choreography?: CinematicRecipe;
  /** Seconds; cinematic entrances clamp this to 0–0.24. */
  delay?: number;
}) {
  return (
    <div
      {...props}
      className={className}
      data-motion={effect}
      data-motion-distance={distance}
      data-motion-scale={scale}
      data-motion-initial-opacity={initialOpacity}
      data-motion-choreography={choreography}
      data-motion-delay={delay}
    />
  );
}
