import Image from "next/image";
import Link from "@/components/link";
import type { Adventure } from "@/lib/types";
import { dateLabel, priceLabel, statusLabels } from "@/lib/format";
import { Icon } from "./icon";
export function EventCard({ event }: { event: Adventure }) {
  return (
    <article className="event-card">
      <Link href={`/events/${event.slug}`} className="event-card-link">
        <div className="card-image">
          <Image
            unoptimized
            src={event.coverImage ?? "/images/camp.svg"}
            alt={
              event.demo
                ? "Illustration de démonstration, sans destination réelle"
                : event.coverImage
                  ? event.title
                  : "Illustration en attente d’une photographie autorisée"
            }
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <span className="image-badge">
            {event.demo ? "DÉMO · À CONFIRMER" : statusLabels[event.status]}
          </span>
          {event.category && (
            <span className="image-category">{event.category}</span>
          )}
        </div>
        <div className="event-info">
          <div className="event-date">
            <Icon name="calendar" size={15} />
            {dateLabel(event.startsAt)}
          </div>
          <h3>{event.title}</h3>
          <p>{event.shortDescription}</p>
          <div className="event-meta">
            <span>
              <Icon name="pin" size={15} />
              {event.location ?? "Lieu à confirmer"}
            </span>
            {event.duration && <span>{event.duration}</span>}
          </div>
          <div className="event-card-bottom">
            <span>{priceLabel(event.price, event.currency)}</span>
            <span className="text-link">
              Voir l’aventure <Icon size={18} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
