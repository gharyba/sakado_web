import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { cache } from "react";
import { approvedImagePath } from "./content-policy";
import { db, databaseConfigured } from "./db";
import { storage } from "./storage";
import { illustrationIdentityAllowed } from "./illustration-policy";
import {
  bytesEligible,
  mediaRegistry,
  invalidRegistry,
} from "./media-readiness-policy";

export const sha256 = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
export const getMediaRegistry = cache(async () => {
  try {
    const [manifest, readiness] = await Promise.all([
      readFile(resolve(process.cwd(), "docs/media/asset-manifest.json")),
      readFile(
        resolve(
          process.cwd(),
          "docs/media/media-04-publication-readiness.json",
        ),
      ),
    ]);
    return mediaRegistry(
      JSON.parse(readiness.toString("utf8")),
      JSON.parse(manifest.toString("utf8")),
      sha256(manifest),
    );
  } catch {
    return invalidRegistry();
  }
});
export async function canUseMediaBytes(bytes: Uint8Array, filename?: string) {
  const hash = sha256(bytes);
  return (
    illustrationIdentityAllowed(filename, hash) &&
    bytesEligible(await getMediaRegistry(), hash, filename)
  );
}
/** A format-safe URL is not authorization. Filter before DTOs/preloads reach clients. */
export const publicImagePath = cache(
  async (value: string | null | undefined): Promise<string | null> => {
    const src = approvedImagePath(value);
    if (!src) return null;
    try {
      let bytes: Buffer;
      if (src.startsWith("/media/")) {
        if (!databaseConfigured()) return null;
        const row = await db.galleryImage.findFirst({
          where: { src, authorized: true, source: "CONFIRMED" },
          include: { event: true, destination: true },
        });
        if (
          !row ||
          (row.event &&
            (!row.event.published ||
              row.event.source !== "CONFIRMED" ||
              ["DRAFT", "CANCELLED", "ARCHIVED"].includes(row.event.status))) ||
          (row.destination &&
            (!row.destination.published ||
              row.destination.archived ||
              row.destination.source !== "CONFIRMED"))
        )
          return null;
        bytes = await storage().read(src.slice(7));
      } else {
        bytes = await readFile(resolve(process.cwd(), "public", src.slice(1)));
      }
      return (await canUseMediaBytes(bytes, src)) ? src : null;
    } catch {
      return null;
    }
  },
);
export async function mediaSelectionAllowed(src: unknown) {
  return (
    src === null ||
    src === undefined ||
    src === "" ||
    (typeof src === "string" && !!(await publicImagePath(src)))
  );
}
