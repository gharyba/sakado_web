import type { Adventure } from "./types";
import { lifecycleLabels } from "./event-policy";

export function upcomingAdventures(events: Adventure[], now = new Date()) {
  return events
    .filter(
      (event) =>
        event.demo ||
        (event.lifecycle === "UPCOMING" &&
          !!event.startsAt &&
          new Date(event.startsAt) > now),
    )
    .sort(
      (a, b) =>
        (a.startsAt ?? "9999").localeCompare(b.startsAt ?? "9999") ||
        a.slug.localeCompare(b.slug),
    );
}
export function pastAdventures(events: Adventure[]) {
  return events
    .filter((event) => !event.demo && event.lifecycle === "COMPLETED")
    .sort(
      (a, b) =>
        (b.startsAt ?? "").localeCompare(a.startsAt ?? "") ||
        a.slug.localeCompare(b.slug),
    );
}
export type AdventureFilters = {
  category?: string;
  destination?: string;
  open?: boolean;
};
export function filterAdventures(
  events: Adventure[],
  filters: AdventureFilters,
) {
  return events.filter(
    (event) =>
      (!filters.category || event.category === filters.category) &&
      (!filters.destination || event.destinationSlug === filters.destination) &&
      (!filters.open || (!event.demo && event.canRegister === true)),
  );
}
export function relatedAdventures(
  event: Adventure,
  events: Adventure[],
  limit = 3,
) {
  const rank = (item: Adventure) =>
    (event.destinationSlug && item.destinationSlug === event.destinationSlug
      ? 2
      : 0) + (event.category && item.category === event.category ? 1 : 0);
  return events
    .filter(
      (item) =>
        item.id !== event.id && item.demo === event.demo && rank(item) > 0,
    )
    .sort(
      (a, b) =>
        rank(b) - rank(a) ||
        Number(b.canRegister === true) - Number(a.canRegister === true) ||
        (a.startsAt ?? "9999").localeCompare(b.startsAt ?? "9999") ||
        a.slug.localeCompare(b.slug),
    )
    .slice(0, limit);
}
export function adventureStateLabel(event: Adventure) {
  if (event.demo) return "DÉMO · À CONFIRMER";
  return (
    lifecycleLabels[event.lifecycle as keyof typeof lifecycleLabels] ??
    "À confirmer"
  );
}
export function registrationMessage(event: Adventure) {
  if (event.demo) return "Inscriptions désactivées en démonstration.";
  const labels = {
    DEMO: "Inscriptions désactivées en démonstration.",
    NOT_UPCOMING: "Inscriptions indisponibles pour cette sortie.",
    CLOSED: "Inscriptions fermées.",
    NOT_YET_OPEN: "Les inscriptions ne sont pas encore ouvertes.",
    DEADLINE: "La date limite d’inscription est passée.",
    UNCONFIRMED: "Les modalités d’inscription sont à confirmer par Sakado.",
    FULL: "Complet. Les inscriptions sont fermées.",
    OPEN:
      event.registrationStatus === "FEW_PLACES"
        ? "Dernières places disponibles."
        : "Inscriptions ouvertes.",
    WAITLIST: "Liste d’attente uniquement. Aucune place n’est garantie.",
  };
  return event.registrationReason
    ? labels[event.registrationReason]
    : "Inscriptions indisponibles pour cette sortie.";
}
export function registrationCta(event: Adventure) {
  return event.registrationStatus === "WAITLIST_ONLY"
    ? "Rejoindre la liste d’attente"
    : "S’inscrire";
}
