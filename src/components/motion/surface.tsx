"use client";
import type { HTMLAttributes } from "react";
import { useMotionPreference } from "./preference";

/** CSS-only interactions share the same preference store as scroll motion. */
export function MotionSurface(props: HTMLAttributes<HTMLDivElement>) {
  const preference = useMotionPreference();
  return (
    <div
      {...props}
      data-cinematic-motion={preference === "on" ? "on" : "static"}
    />
  );
}
