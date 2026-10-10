import "server-only";
import type { Prisma } from "@prisma/client";
import { db, databaseConfigured } from "./db";
import { publicImagePath } from "./media-readiness";
import { demoEnabled } from "./content-policy";
import {
  normalizeInstagramUrl,
  HOMEPAGE_MEDIA_LIMIT,
  MEDIA_PAGE_SIZE,
  type InstagramMediaItem,
} from "./instagram-policy";
const eventWhere: Prisma.EventWhereInput = {
  published: true,
  source: "CONFIRMED",
  status: { notIn: ["DRAFT", "CANCELLED", "ARCHIVED"] },
};
const destinationWhere = {
  published: true,
  archived: false,
  source: "CONFIRMED" as const,
};
export const instagramPublicWhere: Prisma.InstagramMediaWhereInput = {
  published: true,
  AND: [
    { OR: [{ eventId: null }, { event: eventWhere }] },
    { OR: [{ destinationId: null }, { destination: destinationWhere }] },
  ],
};
export async function getInstagramMedia({
  homepage = false,
  page = 1,
  eventId,
  destinationId,
}: {
  homepage?: boolean;
  page?: number;
  eventId?: string;
  destinationId?: string;
} = {}) {
  if (demoEnabled() || !databaseConfigured())
    return { items: [] as InstagramMediaItem[], hasMore: false };
  const take = homepage ? HOMEPAGE_MEDIA_LIMIT : MEDIA_PAGE_SIZE;
  const rows = await db.instagramMedia.findMany({
    where: {
      ...instagramPublicWhere,
      ...(homepage ? { showOnHomepage: true } : {}),
      ...(eventId ? { eventId } : {}),
      ...(destinationId ? { destinationId } : {}),
    },
    select: {
      id: true,
      instagramUrl: true,
      title: true,
      mediaType: true,
      previewImage: true,
      event: { select: { title: true, slug: true } },
      destination: { select: { name: true, slug: true } },
    },
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { id: "asc" }],
    take: take + (homepage ? 0 : 1),
    skip: homepage ? 0 : (page - 1) * take,
  });
  // Private uploads must never leak through preview metadata.
  const previews = rows
    .map((row) => row.previewImage)
    .filter((src): src is string => !!src);
  const allowed = new Set(
    (
      await db.galleryImage.findMany({
        where: {
          src: { in: previews },
          authorized: true,
          published: true,
          source: "CONFIRMED",
          AND: [
            { OR: [{ eventId: null }, { event: eventWhere }] },
            {
              OR: [{ destinationId: null }, { destination: destinationWhere }],
            },
          ],
        },
        select: { src: true },
      })
    ).map((p) => p.src),
  );
  const items = (
    await Promise.all(
      rows.slice(0, take).map(async (row) => {
        const instagramUrl = normalizeInstagramUrl(row.instagramUrl);
        return instagramUrl
          ? {
              ...row,
              instagramUrl,
              previewImage: allowed.has(row.previewImage ?? "")
                ? await publicImagePath(row.previewImage)
                : null,
            }
          : null;
      }),
    )
  ).filter((item): item is NonNullable<typeof item> => item !== null);
  return { items, hasMore: rows.length > take };
}
