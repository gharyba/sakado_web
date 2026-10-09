import { getEvents } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { EventCard } from "@/components/event-card";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Nos aventures",
  "Découvrez les prochaines aventures camping et randonnée de Sakado Sfax.",
  "/events",
);
export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter(
    (event) =>
      event.demo ||
      (event.lifecycle === "UPCOMING" &&
        event.startsAt &&
        new Date(event.startsAt) > new Date()),
  );
  const past = events.filter((event) => event.status === "FINISHED");
  return (
    <div className="container page-section">
      <PageIntro eyebrow="LE PROCHAIN DÉPART" title="Place à l’aventure.">
        <p>
          Découvrez les prochaines expériences et envoyez votre demande lorsque
          les inscriptions sont ouvertes.
        </p>
      </PageIntro>
      {upcoming.length ? (
        <div className="event-grid">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          Aucun événement annoncé pour le moment. Suivez Sakado sur Instagram
          pour les prochaines nouvelles.
        </p>
      )}
      {past.length > 0 && (
        <section className="section">
          <h2>Les aventures passées</h2>
          <div className="event-grid">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
