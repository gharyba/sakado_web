import type { EventStatus } from "./types";
export const statusLabels: Record<EventStatus, string> = {
  OPEN: "Inscriptions ouvertes",
  FEW_PLACES: "Dernières places",
  FULL: "Complet",
  FINISHED: "Terminé",
  COMING_SOON: "À venir",
};
export const environmentLabels: Record<string, string> = {
  FOREST: "Forêt",
  MOUNTAIN: "Montagne",
  BEACH: "Littoral",
  DESERT: "Désert",
  COUNTRYSIDE: "Campagne",
};
export function dateLabel(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("fr-TN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Tunis",
      }).format(new Date(date))
    : "Date à confirmer";
}
export function priceLabel(price: number | null, currency: string) {
  return price === null
    ? "Tarif à confirmer"
    : new Intl.NumberFormat("fr-TN", { style: "currency", currency }).format(
        price,
      );
}
export function dateRangeLabel(start: string | null, end: string | null) {
  if (!start) return dateLabel(null);
  return end && dateLabel(start) !== dateLabel(end)
    ? `${dateLabel(start)} → ${dateLabel(end)}`
    : dateLabel(start);
}
export function dateTimeLabel(date: string | null | undefined) {
  return date
    ? new Intl.DateTimeFormat("fr-TN", {
        dateStyle: "long",
        timeStyle: "short",
        hourCycle: "h23",
        timeZone: "Africa/Tunis",
      }).format(new Date(date))
    : "À confirmer";
}
