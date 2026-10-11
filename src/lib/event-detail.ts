import type {
  Event,
  EventCategory,
  Destination,
  EventScheduleItem,
  Booking,
  Prisma,
} from "@prisma/client";
import type { Adventure, GalleryPhoto } from "./types";
import { lifecycle, registrationAvailability, confirmed } from "./event-policy";

export type PublicEventRow = Event & {
  category: EventCategory | null;
  destination: Destination | null;
  schedule: EventScheduleItem[];
  bookings: Pick<Booking, "status" | "participantCount">[];
};
/** Media arguments MUST come through the server media-readiness gate before mapping. */
export function mapEventDetails(
  row: PublicEventRow,
  media: { coverImage: string | null; gallery: GalleryPhoto[] },
  now = new Date(),
): Adventure {
  const state = lifecycle(row, now);
  const availability = registrationAvailability(row, row.bookings, now);
  const destination =
    row.destination?.published &&
    !row.destination.archived &&
    row.destination.source === "CONFIRMED"
      ? row.destination
      : null;
  const strings = (value: Prisma.JsonValue | null) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description,
    coverImage: media.coverImage,
    gallery: media.gallery,
    location: row.location,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    duration: row.duration,
    difficulty: row.difficulty,
    price: row.price === null ? null : Number(row.price),
    currency: row.currency,
    availablePlaces: row.showAvailability ? availability.remaining : null,
    maximumParticipants: row.showAvailability ? row.capacity : null,
    confirmedCount: row.showAvailability ? confirmed(row.bookings) : null,
    showAvailability: row.showAvailability,
    canRegister: availability.canRegister,
    registrationReason: availability.reason,
    registrationStatus: row.registrationStatus,
    registrationOpenAt: row.registrationOpenAt?.toISOString() ?? null,
    registrationDeadline: row.registrationDeadline?.toISOString() ?? null,
    lifecycle: state,
    status:
      state === "COMPLETED"
        ? "FINISHED"
        : state !== "UPCOMING" || row.registrationStatus === "CLOSED"
          ? "COMING_SOON"
          : row.registrationStatus === "WAITLIST_ONLY"
            ? "FULL"
            : row.registrationStatus,
    category:
      row.category?.enabled && row.category.source === "CONFIRMED"
        ? row.category.name
        : null,
    destinationSlug: destination?.slug ?? null,
    destinationName: destination?.name ?? null,
    demo: false,
    included: strings(row.included),
    excluded: strings(row.excluded),
    equipment: strings(row.equipment),
    meetingPoint: row.meetingPoint,
    meetingTime: row.meetingTime,
    importantInfo: row.importantInfo,
    cancellationInfo: row.cancellationInfo,
    recommendations: row.recommendations,
    conditions: row.conditions,
    recap: row.recap,
    featured: row.featured,
    schedule: row.schedule.map(
      ({ id, day, time, title, description, order }) => ({
        id,
        day,
        time,
        title,
        description,
        order,
      }),
    ),
  };
}

/** Only factual fields; no demo offers, availability claims, invented addresses or ratings. */
export function eventStructuredData(
  event: Adventure,
  origin: string | null,
  organizer: string,
) {
  if (event.demo || !origin || !event.startsAt || !event.location) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    ...(event.coverImage ? { image: [`${origin}${event.coverImage}`] } : {}),
    location: { "@type": "Place", name: event.location },
    organizer: { "@type": "Organization", name: organizer, url: origin },
    url: `${origin}/events/${event.slug}`,
    ...(event.lifecycle === "CANCELLED"
      ? { eventStatus: "https://schema.org/EventCancelled" }
      : {}),
  };
}
