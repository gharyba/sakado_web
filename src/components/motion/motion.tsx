import type { HTMLAttributes } from "react";
import type { MotionEffect } from "@/lib/motion/policy";

/** Server-compatible markup. Distance is engineering configuration, never CMS input. */
export function Motion({
  effect,
  distance,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  effect: MotionEffect;
  distance?: number;
}) {
  return (
    <div
      {...props}
      className={className}
      data-motion={effect}
      data-motion-distance={distance}
    />
  );
}
