import type { HTMLAttributes } from "react";
import type { MotionEffect } from "@/lib/motion/policy";

/** Server-compatible markup. Distance is engineering configuration, never CMS input. */
export function Motion({
  effect,
  distance,
  scale,
  initialOpacity,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  effect: MotionEffect;
  distance?: number;
  scale?: number;
  initialOpacity?: number;
}) {
  return (
    <div
      {...props}
      className={className}
      data-motion={effect}
      data-motion-distance={distance}
      data-motion-scale={scale}
      data-motion-initial-opacity={initialOpacity}
    />
  );
}
