import Link from "./link";
import { EventCard } from "./event-card";
import {
  filterAdventures,
  type AdventureFilters,
} from "@/lib/adventure-discovery";
import type { Adventure } from "@/lib/types";

export function AdventureListing({
  events,
  filters,
  past = false,
}: {
  events: Adventure[];
  filters: AdventureFilters;
  past?: boolean;
}) {
  const categories = [
    ...new Set(
      events.flatMap((event) => (event.category ? [event.category] : [])),
    ),
  ].sort();
  const destinations = [
    ...new Map(
      events
        .filter((event) => event.destinationSlug && event.destinationName)
        .map((event) => [event.destinationSlug!, event.destinationName!]),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1]));
  const result = filterAdventures(events, filters);
  const action = past ? "/adventures" : "/events";
  return (
    <>
      {events.length > 0 && (
        <form
          className="s-event-filters"
          method="get"
          action={action}
          aria-label="Filtrer les aventures"
        >
          {categories.length > 0 && (
            <div className="s-event-filter-control">
              <label htmlFor="event-category">Activité</label>
              <select
                id="event-category"
                name="category"
                defaultValue={filters.category ?? ""}
              >
                <option value="">Toutes les activités</option>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {destinations.length > 0 && (
            <div className="s-event-filter-control">
              <label htmlFor="event-destination">Destination</label>
              <select
                id="event-destination"
                name="destination"
                defaultValue={filters.destination ?? ""}
              >
                <option value="">Toutes les destinations</option>
                {destinations.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!past && events.some((event) => event.canRegister) && (
            <label className="s-filter-checkbox">
              <input
                type="checkbox"
                name="open"
                value="1"
                defaultChecked={filters.open}
              />{" "}
              Inscriptions ouvertes ou liste d’attente
            </label>
          )}
          <button className="button" type="submit">
            Filtrer
          </button>
          <Link href={action} className="text-link">
            Réinitialiser
          </Link>
        </form>
      )}
      {events.length > 0 && (
        <p className="s-event-result-count">
          {result.length} aventure{result.length !== 1 ? "s" : ""}
        </p>
      )}
      {result.length ? (
        <div className="event-grid">
          {result.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {events.length
            ? "Aucune aventure ne correspond à ces filtres."
            : past
              ? "Les prochaines histoires Sakado arrivent bientôt."
              : "Aucune sortie programmée pour le moment."}
        </p>
      )}
    </>
  );
}

export function readAdventureFilters(
  params: Record<string, string | string[] | undefined>,
): AdventureFilters {
  const value = (name: string) =>
    typeof params[name] === "string" ? params[name].slice(0, 200) : undefined;
  return {
    category: value("category"),
    destination: value("destination"),
    open: value("open") === "1",
  };
}
