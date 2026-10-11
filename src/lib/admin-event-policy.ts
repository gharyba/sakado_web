import type { Event } from "@prisma/client";
import { lifecycle } from "./event-policy";

type State = Pick<
  Event,
  "status" | "startsAt" | "endsAt" | "published" | "registrationStatus"
>;

/** Administrative writes share one policy; no implicit reopening of terminal history. */
export function eventWriteIssue(
  next: State,
  prior?: State,
  now = new Date(),
): string | null {
  const state = lifecycle(next, now);
  if (
    next.published &&
    ["DRAFT", "CANCELLED", "ARCHIVED"].includes(next.status)
  )
    return "Un brouillon ou une sortie annulée/archivée ne peut pas être publié.";
  if (next.registrationStatus !== "CLOSED" && state !== "UPCOMING")
    return "Fermez les inscriptions pour une sortie qui n’est pas à venir.";
  if (
    prior &&
    ["CANCELLED", "ARCHIVED", "COMPLETED"].includes(lifecycle(prior, now)) &&
    next.status !== prior.status &&
    next.status !== lifecycle(prior, now) &&
    next.status !== "ARCHIVED"
  )
    return "Cette sortie est terminée, annulée ou archivée. Dupliquez-la en brouillon pour préparer une nouvelle sortie.";
  if (
    prior &&
    ["CANCELLED", "ARCHIVED", "COMPLETED"].includes(lifecycle(prior, now)) &&
    !["CANCELLED", "ARCHIVED", "COMPLETED"].includes(state)
  )
    return "Une sortie terminée ne peut pas être réouverte implicitement. Dupliquez-la en brouillon.";
  return null;
}
