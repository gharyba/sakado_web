import { approvedImagePath } from "./content-policy";

const illustrations = new Set([
  "/images/camp.svg",
  "/images/coast.svg",
  "/images/trail.svg",
]);
export type HeroMedia = {
  src: string | null;
  placeholder: boolean;
  mobileSrc?: string;
  /** Read-only local presentation DTO; never supplied by public media resolution. */
  privatePresentation?: boolean;
};

/** Settings select media explicitly; never derive hero imagery from gallery records. */
export function resolveHeroMedia(
  selected: string | null,
  nodeEnv: string | undefined,
): HeroMedia {
  const src = approvedImagePath(selected);
  if (src && !illustrations.has(src)) return { src, placeholder: false };
  if (nodeEnv === "development")
    return { src: "/images/camp.svg", placeholder: true };
  return { src: null, placeholder: false };
}
