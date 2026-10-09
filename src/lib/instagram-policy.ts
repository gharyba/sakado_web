import { z } from "zod";
import { approvedImagePath } from "./content-policy";
export const HOMEPAGE_MEDIA_LIMIT = 16;
export const MEDIA_PAGE_SIZE = 24;
export function normalizeInstagramUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    const match = /^\/(p|reel|tv)\/([A-Za-z0-9_-]{1,64})\/?$/.exec(
      url.pathname,
    );
    return match
      ? "https://www.instagram.com/" + match[1] + "/" + match[2] + "/"
      : null;
  } catch {
    return null;
  }
}
export function normalizeInstagramImport(values: string[]) {
  if (!values.length || values.length > 100)
    throw Error("Importez entre 1 et 100 liens à la fois.");
  const result = values.map((value, i) => {
    const url = normalizeInstagramUrl(value);
    if (!url)
      throw Error("Lien Instagram invalide à la ligne " + (i + 1) + ".");
    return url;
  });
  return [...new Set(result)];
}
const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null);
const bool = z.preprocess(
  (v) => v === true || v === "on" || v === "true",
  z.boolean(),
);
export const instagramMediaSchema = z.object({
  instagramUrl: z
    .string()
    .max(500)
    .refine((v) => !!normalizeInstagramUrl(v), "Lien Instagram non autorisé.")
    .transform((v) => normalizeInstagramUrl(v)!),
  title: nullableText(200),
  mediaType: z
    .enum(["INSTAGRAM_MEDIA", "PHOTO", "VIDEO", "REEL", "CAROUSEL"])
    .default("INSTAGRAM_MEDIA"),
  previewImage: nullableText(500).refine(
    (v) => !v || !!approvedImagePath(v),
    "Image locale non autorisée.",
  ),
  eventId: nullableText(100),
  destinationId: nullableText(100),
  featured: bool,
  showOnHomepage: bool,
  published: bool,
  displayOrder: z.coerce.number().int().min(0).max(100000).default(0),
});
export function mediaPage(value: string | undefined) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 10000) : 1;
}
export const mediaTypeLabels = {
  INSTAGRAM_MEDIA: "Instagram",
  PHOTO: "Photo",
  VIDEO: "Vidéo",
  REEL: "Reel",
  CAROUSEL: "Carrousel",
};
export type InstagramMediaItem = {
  id: string;
  instagramUrl: string;
  title: string | null;
  mediaType: keyof typeof mediaTypeLabels;
  previewImage: string | null;
  event: { title: string; slug: string } | null;
  destination: { name: string; slug: string } | null;
};
