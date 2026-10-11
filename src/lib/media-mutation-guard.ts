import "server-only";
import { db } from "./db";
import { mediaSelectionAllowed } from "./media-readiness";
import { RequestError } from "./http-security";

/** Every role uses this gate; ordinary CMS flags cannot grant MEDIA-04 rights. */
export async function guardMediaSelection(
  resource: string,
  input: Record<string, unknown>,
) {
  if (input.intent === "delete") return;
  const field =
    resource === "events" || resource === "destinations"
      ? "coverImage"
      : resource === "site"
        ? "heroImage"
        : resource === "settings"
          ? "logoPath"
          : null;
  if (field && !(await mediaSelectionAllowed(input[field])))
    throw new RequestError(
      "Image indisponible : autorisation de publication requise.",
      409,
    );
  if (
    resource === "gallery" &&
    (input.published || input.authorized) &&
    typeof input.id === "string"
  ) {
    const row = await db.galleryImage.findUnique({
      where: { id: input.id },
      select: { src: true },
    });
    // Authorization is being granted here, so inspect bytes without relying on the old flag.
    if (row && !(await storedMediaAllowed(row.src)))
      throw new RequestError(
        "Photo bloquée : la revue des droits ne peut pas être remplacée par une case à cocher.",
        409,
      );
  }
}

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { approvedImagePath } from "./content-policy";
import { canUseMediaBytes } from "./media-readiness";
import { storage } from "./storage";
export async function storedMediaAllowed(value: string) {
  const src = approvedImagePath(value);
  if (!src) return false;
  try {
    const bytes = src.startsWith("/media/")
      ? await storage().read(src.slice(7))
      : await readFile(resolve(process.cwd(), "public", src.slice(1)));
    return await canUseMediaBytes(bytes, src);
  } catch {
    return false;
  }
}

/** Selector eligibility is checked again by the mutation boundary; flags alone are not rights. */
export async function selectableMedia<T extends { src: string }>(
  rows: T[],
): Promise<T[]> {
  const decisions = await Promise.all(
    rows.map(async (row) => ({
      row,
      allowed: await storedMediaAllowed(row.src),
    })),
  );
  return decisions.filter((item) => item.allowed).map((item) => item.row);
}
