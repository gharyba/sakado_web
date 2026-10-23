import Link from "@/components/link";
import type { Adventure } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { Icon } from "@/components/icon";
import styles from "./experience-discovery.module.css";

/** Existing homepage selection is passed in unchanged; no business policy here. */
export function UpcomingAdventures({
  events,
  demo,
}: {
  events: readonly Adventure[];
  demo: boolean;
}) {
  return (
    <section
      className={`section container ${styles.upcoming}`}
      id="adventures"
      data-home-adventures
    >
      <SectionHeading
        animated
        eyebrow="ON PART OÙ, ENSUITE ?"
        title="Les prochaines aventures"
        description="Un peu moins de quotidien. Un peu plus d’horizon."
        href="/events"
        linkText="Toutes les aventures"
      />
      {demo && (
        <p className="demo-note">
          Aperçus de démonstration : lieux, dates, tarifs et disponibilités à
          confirmer.
        </p>
      )}
      {events.length ? (
        <div className="event-grid">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className={`empty-state ${styles.empty}`} data-upcoming-empty>
          <span className={styles.emptyIcon} aria-hidden="true">
            <Icon name="compass" size={32} />
          </span>
          <div>
            <p>Les prochaines aventures seront annoncées ici.</p>
            <Link className="text-link" href="/contact">
              Contactez Sakado pour en savoir plus. <Icon size={18} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
