import type { Adventure } from "@/lib/types";
import { dateRangeLabel, dateTimeLabel, priceLabel } from "@/lib/format";
import {
  adventureStateLabel,
  registrationMessage,
  registrationCta,
} from "@/lib/adventure-discovery";

export function EventSummary({
  event,
  children,
}: {
  event: Adventure;
  children?: React.ReactNode;
}) {
  const facts = [
    ["Date", dateRangeLabel(event.startsAt, event.endsAt)],
    ["Durée", event.duration ?? "À confirmer"],
    ["Destination", event.destinationName ?? event.location ?? "À confirmer"],
    ["Rendez-vous", event.meetingPoint ?? "À confirmer"],
    ["Heure du rendez-vous", event.meetingTime ?? "À confirmer"],
    ["Difficulté", event.difficulty ?? "À confirmer"],
    ["Tarif par personne", priceLabel(event.price, event.currency)],
    ...(!event.demo && event.showAvailability !== false
      ? [
          [
            "Capacité",
            event.maximumParticipants === null
              ? "À confirmer"
              : String(event.maximumParticipants),
          ],
          ...(event.registrationStatus === "WAITLIST_ONLY"
            ? []
            : [
                [
                  "Places disponibles",
                  event.availablePlaces === null
                    ? "À confirmer"
                    : String(event.availablePlaces),
                ],
              ]),
        ]
      : []),
    ...(event.registrationOpenAt
      ? [
          [
            "Ouverture des inscriptions",
            dateTimeLabel(event.registrationOpenAt),
          ],
        ]
      : []),
    ["Date limite d’inscription", dateTimeLabel(event.registrationDeadline)],
  ];
  return (
    <aside
      className="adventure-sidebar s-event-summary"
      aria-label="Informations pratiques"
    >
      <span className="status-badge">{adventureStateLabel(event)}</span>
      <h2>Votre aventure</h2>
      <p className="s-event-availability">{registrationMessage(event)}</p>
      <dl>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {!event.demo &&
        event.showAvailability !== false &&
        event.lifecycle === "UPCOMING" &&
        event.availablePlaces !== null && (
          <p className="muted">
            Les demandes en attente de confirmation réservent également des
            places. Les disponibilités sont revérifiées à l’envoi.
          </p>
        )}
      {event.canRegister && (
        <a href="#inscription" className="button">
          {registrationCta(event)}
        </a>
      )}
      {children}
    </aside>
  );
}
