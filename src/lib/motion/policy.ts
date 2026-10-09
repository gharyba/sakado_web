/** Presentation-only policy. No content, auth, database or browser imports. */
export const motionEffects = [
  "background",
  "foreground",
  "reveal",
  "image",
  "transition",
  "pin",
  "text",
] as const;
export type MotionEffect = (typeof motionEffects)[number];
export type MotionTier = "static" | "mobile" | "tablet" | "desktop";
export const motionQueries = {
  desktop: "(min-width: 1200px)",
  tablet: "(min-width: 700px) and (max-width: 1199px)",
  mobile: "(max-width: 699px)",
  coarse: "(pointer: coarse)",
  short: "(max-height: 699px)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export function motionTier(input: {
  width: number;
  coarse?: boolean;
  reduced?: boolean;
  disabled?: boolean;
  saveData?: boolean;
}): MotionTier {
  if (
    input.reduced ||
    input.disabled ||
    input.saveData ||
    !Number.isFinite(input.width) ||
    input.width <= 0
  )
    return "static";
  if (input.coarse || input.width < 700) return "mobile";
  return input.width < 1200 ? "tablet" : "desktop";
}

const caps: Record<MotionEffect, number> = {
  background: 80,
  foreground: 120,
  reveal: 12,
  image: 12,
  transition: 24,
  pin: 0,
  text: 12,
};
export function motionDistance(
  effect: MotionEffect,
  tier: MotionTier,
  requested?: number,
): number {
  if (tier === "static" || tier === "mobile") return 0;
  const value =
    requested === undefined || !Number.isFinite(requested)
      ? caps[effect]
      : requested;
  return (
    Math.max(-caps[effect], Math.min(caps[effect], value)) *
    (tier === "tablet" ? 0.4 : 1)
  );
}

export function canPin(input: {
  tier: MotionTier;
  viewportHeight: number;
  elementHeight: number;
  interactive: boolean;
  short?: boolean;
}): boolean {
  return (
    input.tier === "desktop" &&
    !input.short &&
    !input.interactive &&
    Number.isFinite(input.elementHeight) &&
    input.elementHeight > 0 &&
    input.viewportHeight >= 700 &&
    input.elementHeight <= input.viewportHeight * 0.65
  );
}

export function motionDemoEnabled(nodeEnv: string | undefined): boolean {
  return nodeEnv === "development";
}

export function motionScale(tier: MotionTier, requested = 1): number {
  if (tier === "static" || tier === "mobile" || !Number.isFinite(requested))
    return 1;
  return (
    1 +
    (Math.max(1, Math.min(1.05, requested)) - 1) * (tier === "tablet" ? 0.4 : 1)
  );
}

export function revealOpacity(requested = 0): number {
  return Number.isFinite(requested) ? Math.max(0, Math.min(1, requested)) : 0;
}
