import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db, databaseConfigured } from "./db";
import { publicImagePath } from "./media-readiness";
import { demoEnabled, safeSocialUrl } from "./content-policy";
import {
  demoEvents,
  demoDestinations,
  demoExperiences,
  demoGallery,
} from "@/data/demo/content";
import type { Adventure, Place, Experience, GalleryPhoto } from "./types";
import {
  lifecycle,
  occupied,
  confirmed,
  registrationAllowed,
} from "./event-policy";
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
const galleryWhere: Prisma.GalleryImageWhereInput = {
  published: true,
  authorized: true,
  source: "CONFIRMED",
  AND: [
    { OR: [{ eventId: null }, { event: eventWhere }] },
    { OR: [{ destinationId: null }, { destination: destinationWhere }] },
  ],
};
const eventInclude = {
  category: true,
  destination: true,
  schedule: { orderBy: [{ day: "asc" as const }, { order: "asc" as const }] },
  gallery: { where: galleryWhere, orderBy: { order: "asc" as const } },
  bookings: { select: { status: true, participantCount: true } },
} satisfies Prisma.EventInclude;
function strings(v: Prisma.JsonValue | null) {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}
function photo(row: {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  category: string | null;
}): GalleryPhoto {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    caption: row.caption,
    category: row.category,
    demo: false,
  };
}
async function event(
  row: Prisma.EventGetPayload<{ include: typeof eventInclude }>,
): Promise<Adventure> {
  const state = lifecycle(row);
  const remaining =
    row.capacity === null
      ? null
      : Math.max(0, row.capacity - occupied(row.bookings));
  const status =
    state === "COMPLETED"
      ? "FINISHED"
      : state !== "UPCOMING"
        ? "COMING_SOON"
        : row.registrationStatus === "WAITLIST_ONLY"
          ? "FULL"
          : row.registrationStatus === "CLOSED"
            ? "COMING_SOON"
            : row.registrationStatus;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description,
    coverImage: await publicImagePath(row.coverImage),
    location: row.location,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    duration: row.duration,
    difficulty: row.difficulty,
    price: row.price === null ? null : Number(row.price),
    currency: row.currency,
    availablePlaces: row.showAvailability ? remaining : null,
    maximumParticipants: row.showAvailability ? row.capacity : null,
    status,
    category:
      row.category?.enabled && row.category.source === "CONFIRMED"
        ? row.category.name
        : null,
    destinationSlug:
      row.destination?.published &&
      !row.destination.archived &&
      row.destination.source === "CONFIRMED"
        ? row.destination.slug
        : null,
    demo: false,
    included: strings(row.included),
    excluded: strings(row.excluded),
    equipment: strings(row.equipment),
    meetingPoint: row.meetingPoint,
    meetingTime: row.meetingTime,
    importantInfo: row.importantInfo,
    cancellationInfo: row.cancellationInfo,
    schedule: row.schedule,
    gallery: await publicPhotos(row.gallery),
    lifecycle: state,
    registrationStatus: row.registrationStatus,
    canRegister:
      registrationAllowed(row) &&
      (row.registrationStatus === "WAITLIST_ONLY" || (remaining ?? 0) > 0),
    showAvailability: row.showAvailability,
    confirmedCount: row.showAvailability ? confirmed(row.bookings) : null,
    featured: row.featured,
    recommendations: row.recommendations,
    conditions: row.conditions,
    recap: row.recap,
  };
}
async function publicPhotos<T extends Parameters<typeof photo>[0]>(rows: T[]) {
  const allowed = await Promise.all(
    rows.map(async (row) =>
      (await publicImagePath(row.src)) ? photo(row) : null,
    ),
  );
  return allowed.filter((row): row is GalleryPhoto => row !== null);
}
export const getEvents = cache(async (): Promise<Adventure[]> =>
  demoEnabled()
    ? demoEvents
    : !databaseConfigured()
      ? []
      : Promise.all(
          (
            await db.event.findMany({
              where: eventWhere,
              include: eventInclude,
              orderBy: { startsAt: "asc" },
            })
          ).map(event),
        ),
);
export const getDestinations = cache(async (): Promise<Place[]> => {
  if (demoEnabled()) return demoDestinations;
  if (!databaseConfigured()) return [];
  const rows = await db.destination.findMany({
    where: destinationWhere,
    include: { gallery: { where: galleryWhere, orderBy: { order: "asc" } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      coverImage: await publicImagePath(row.coverImage),
      demo: false,
      gallery: await publicPhotos(row.gallery),
    })),
  );
});
export const getExperiences = cache(async (): Promise<Experience[]> =>
  demoEnabled()
    ? demoExperiences.filter((c) => c.enabled)
    : !databaseConfigured()
      ? []
      : (
          await db.eventCategory.findMany({
            where: { enabled: true, source: "CONFIRMED" },
            orderBy: { order: "asc" },
          })
        ).map((c) => ({ ...c, demo: false })),
);
export const getGallery = cache(async (): Promise<GalleryPhoto[]> =>
  demoEnabled()
    ? demoGallery
    : !databaseConfigured()
      ? []
      : publicPhotos(
          await db.galleryImage.findMany({
            where: galleryWhere,
            orderBy: [{ featured: "desc" }, { order: "asc" }],
          }),
        ),
);
export const getSocialLinks = cache(async () =>
  !demoEnabled() && databaseConfigured()
    ? (
        await db.socialLink.findMany({
          where: { enabled: true },
          orderBy: { order: "asc" },
        })
      ).filter((row) => safeSocialUrl(row.url))
    : [],
);
