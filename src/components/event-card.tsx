import Image from "next/image";
import Link from "@/components/link";
import type { Adventure } from "@/lib/types";
import { dateRangeLabel, priceLabel } from "@/lib/format";
import {
  adventureStateLabel,
  registrationMessage,
} from "@/lib/adventure-discovery";
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
          <span className="image-badge">{adventureStateLabel(event)}</span>
          {event.category && (
            <span className="image-category">{event.category}</span>
          )}
        </div>
        <div className="event-info">
          <div className="event-date">
            <Icon name="calendar" size={15} />
            {dateRangeLabel(event.startsAt, event.endsAt)}
          </div>
          <h3>{event.title}</h3>
          <p>{event.shortDescription}</p>
          <div className="event-meta">
            <span>
              <Icon name="pin" size={15} />
              {event.destinationName ?? event.location ?? "Lieu à confirmer"}
            </span>
            {event.duration && <span>{event.duration}</span>}
            {event.difficulty && <span>Difficulté : {event.difficulty}</span>}
          </div>
          <p className="s-event-availability">{registrationMessage(event)}</p>
          {!event.demo &&
            event.lifecycle === "UPCOMING" &&
            event.registrationStatus !== "WAITLIST_ONLY" &&
            event.showAvailability !== false &&
            event.availablePlaces !== null && (
              <p className="s-event-capacity">
                {event.availablePlaces} place
                {event.availablePlaces !== 1 ? "s" : ""} disponible
                {event.availablePlaces !== 1 ? "s" : ""}
                {event.maximumParticipants !== null && (
                  <> · Capacité : {event.maximumParticipants}</>
                )}
              </p>
            )}
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
