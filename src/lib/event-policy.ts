import type { Event, Booking } from "@prisma/client";
export const lifecycleLabels = {
  DRAFT: "Brouillon",
  UPCOMING: "À venir",
  ONGOING: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  ARCHIVED: "Archivée",
};
export const registrationLabels = {
  CLOSED: "Fermées",
  OPEN: "Ouvertes",
  FEW_PLACES: "Dernières places",
  FULL: "Complet",
  WAITLIST_ONLY: "Liste d’attente",
};
export const bookingLabels = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  WAITLIST: "Liste d’attente",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};
export const paymentLabels = {
  UNPAID: "Non payé",
  PENDING: "En attente",
  PAID: "Payé",
  REFUNDED: "Remboursé",
};
export function lifecycle(
  event: Pick<Event, "status" | "startsAt" | "endsAt">,
  now = new Date(),
) {
  if (["CANCELLED", "ARCHIVED", "DRAFT", "COMPLETED"].includes(event.status))
    return event.status;
  if (event.endsAt && event.endsAt <= now) return "COMPLETED";
  if (event.startsAt && event.startsAt <= now)
    return event.endsAt ? "ONGOING" : "COMPLETED";
  return event.status;
}
export type RegistrationReason =
  | "DEMO"
  | "NOT_UPCOMING"
  | "CLOSED"
  | "NOT_YET_OPEN"
  | "DEADLINE"
  | "UNCONFIRMED"
  | "FULL"
  | "OPEN"
  | "WAITLIST";

/** Same decision for the public DTO and the transaction; bookings never leave the server. */
export function registrationAvailability(
  event: Parameters<typeof registrationAllowed>[0] &
    Pick<Event, "capacity" | "price">,
  bookings: Parameters<typeof occupied>[0],
  now = new Date(),
): {
  canRegister: boolean;
  reason: RegistrationReason;
  remaining: number | null;
} {
  const remaining =
    event.capacity === null
      ? null
      : Math.max(0, event.capacity - occupied(bookings));
  let reason: RegistrationReason;
  if (
    !event.published ||
    event.source !== "CONFIRMED" ||
    lifecycle(event, now) !== "UPCOMING" ||
    !event.startsAt ||
    event.startsAt <= now
  )
    reason = "NOT_UPCOMING";
  else if (
    !["OPEN", "FEW_PLACES", "WAITLIST_ONLY"].includes(event.registrationStatus)
  )
    reason = event.registrationStatus === "FULL" ? "FULL" : "CLOSED";
  else if (event.registrationOpenAt && event.registrationOpenAt > now)
    reason = "NOT_YET_OPEN";
  else if (event.registrationDeadline && event.registrationDeadline <= now)
    reason = "DEADLINE";
  else if (event.capacity === null || event.price === null)
    reason = "UNCONFIRMED";
  else if (event.registrationStatus === "WAITLIST_ONLY") reason = "WAITLIST";
  else reason = remaining !== null && remaining > 0 ? "OPEN" : "FULL";
  return {
    canRegister: reason === "OPEN" || reason === "WAITLIST",
    reason,
    remaining,
  };
}
export function occupied(
  bookings: Pick<Booking, "status" | "participantCount">[],
) {
  return bookings
    .filter((b) => ["PENDING", "CONFIRMED", "COMPLETED"].includes(b.status))
    .reduce((sum, b) => sum + b.participantCount, 0);
}
export function confirmed(
  bookings: Pick<Booking, "status" | "participantCount">[],
) {
  return bookings
    .filter((b) => ["CONFIRMED", "COMPLETED"].includes(b.status))
    .reduce((sum, b) => sum + b.participantCount, 0);
}
export function registrationAllowed(
  event: Pick<
    Event,
    | "status"
    | "startsAt"
    | "endsAt"
    | "registrationStatus"
    | "registrationOpenAt"
    | "registrationDeadline"
    | "published"
    | "source"
  >,
  now = new Date(),
) {
  return (
    event.published &&
    event.source === "CONFIRMED" &&
    lifecycle(event, now) === "UPCOMING" &&
    !!event.startsAt &&
    event.startsAt > now &&
    ["OPEN", "FEW_PLACES", "WAITLIST_ONLY"].includes(
      event.registrationStatus,
    ) &&
    (!event.registrationOpenAt || event.registrationOpenAt <= now) &&
    (!event.registrationDeadline || event.registrationDeadline > now)
  );
}
