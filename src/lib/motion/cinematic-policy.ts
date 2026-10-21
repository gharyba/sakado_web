import {
  motionDistance,
  motionScale,
  type MotionEffect,
  type MotionTier,
} from "./policy";

export const cinematicRecipes = [
  "opening",
  "scene",
  "portrait",
  "copy",
  "partner",
] as const;
export type CinematicRecipe = (typeof cinematicRecipes)[number];

/** Opt-in presentation profile. Ordinary scenes keep their original policy. */
export function cinematicTravel(
  effect: MotionEffect,
  tier: MotionTier,
  requested?: number,
) {
  return (
    motionDistance(effect, tier, requested) *
    (tier === "tablet" ? 0.55 / 0.4 : 1)
  );
}
export function cinematicScale(tier: MotionTier, requested: number) {
  return (
    1 +
    (motionScale(tier, requested) - 1) * (tier === "tablet" ? 0.55 / 0.4 : 1)
  );
}
export function cinematicEntrance(
  recipe: string | undefined,
  tier: MotionTier,
  rawDelay = 0,
) {
  const name = cinematicRecipes.includes(recipe as CinematicRecipe)
    ? (recipe as CinematicRecipe)
    : "scene";
  const mobile = tier === "mobile";
  const staticMode = tier === "static";
  const durations = {
    opening: 1.1,
    scene: 0.85,
    portrait: 0.72,
    copy: 0.6,
    partner: 0.38,
  };
  return {
    duration: staticMode ? 0 : mobile ? 0.28 : durations[name],
    delay: staticMode
      ? 0
      : Number.isFinite(rawDelay)
        ? Math.max(0, Math.min(mobile ? 0.12 : 0.24, rawDelay))
        : 0,
    scale: staticMode
      ? 1
      : mobile
        ? 1.01
        : cinematicScale(tier, name === "opening" ? 1.025 : 1.04),
    mask: staticMode ? 0 : mobile ? 2 : tier === "tablet" ? 6 : 12,
    // Blur is entrance-only on the small headline, never a full scenic image or scrub.
    blur:
      name === "opening" && !mobile && !staticMode
        ? tier === "tablet"
          ? 1
          : 2
        : 0,
  };
}

/** A fast scroll never starts a wall of simultaneous gallery entrances. */
export function admitCinematicReveal(active: number, visible: boolean) {
  return visible && Number.isInteger(active) && active >= 0 && active < 3;
}
