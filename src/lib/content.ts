import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db, databaseConfigured } from "./db";
import {
  demoEnabled,
  approvedImagePath,
  safeSocialUrl,
} from "./content-policy";
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
function event(
  row: Prisma.EventGetPayload<{ include: typeof eventInclude }>,
): Adventure {
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
    coverImage: approvedImagePath(row.coverImage),
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
    gallery: row.gallery.filter((i) => approvedImagePath(i.src)).map(photo),
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
export const getEvents = cache(async (): Promise<Adventure[]> =>
  demoEnabled()
    ? demoEvents
    : !databaseConfigured()
      ? []
      : (
          await db.event.findMany({
            where: eventWhere,
            include: eventInclude,
            orderBy: { startsAt: "asc" },
          })
        ).map(event),
);
export const getDestinations = cache(async (): Promise<Place[]> => {
  if (demoEnabled()) return demoDestinations;
  if (!databaseConfigured()) return [];
  const rows = await db.destination.findMany({
    where: destinationWhere,
    include: { gallery: { where: galleryWhere, orderBy: { order: "asc" } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return rows.map((row) => ({
    ...row,
    coverImage: approvedImagePath(row.coverImage),
    demo: false,
    gallery: row.gallery.filter((i) => approvedImagePath(i.src)).map(photo),
  }));
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
      : (
          await db.galleryImage.findMany({
            where: galleryWhere,
            orderBy: [{ featured: "desc" }, { order: "asc" }],
          })
        )
          .filter((i) => approvedImagePath(i.src))
          .map(photo),
);
export const getSocialLinks = cache(async () =>
  databaseConfigured()
    ? (
        await db.socialLink.findMany({
          where: { enabled: true },
          orderBy: { order: "asc" },
        })
      ).filter((row) => safeSocialUrl(row.url))
    : [],
);
