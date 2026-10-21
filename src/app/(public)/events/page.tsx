import Link from "@/components/link";
import { getEvents } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { EventCard } from "@/components/event-card";
import {
  AdventureListing,
  readAdventureFilters,
} from "@/components/adventure-listing";
import { upcomingAdventures } from "@/lib/adventure-discovery";
import { pageMetadata } from "@/lib/metadata";
import { clientDemoActive } from "@/lib/client-demo";
import { ClientComingSoon } from "@/components/client-demo/client-home";
export const metadata = pageMetadata(
  "Prochaines aventures",
  "Découvrez les prochaines sorties Sakado et leurs modalités d’inscription.",
  "/events",
);
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await clientDemoActive())
    return (
      <div className="page-section">
        <ClientComingSoon title="Nos événements" standalone />
      </div>
    );
  const [events, params] = await Promise.all([getEvents(), searchParams]);
  const ongoing = events.filter((event) => event.lifecycle === "ONGOING");
  return (
    <div className="container page-section">
      <PageIntro eyebrow="LE PROCHAIN DÉPART" title="Prochaines aventures">
        <p>
          Découvrez les prochaines sorties Sakado. Retrouvez le programme et les
          informations pratiques avant d’envoyer votre demande.
        </p>
        <Link className="text-link" href="/adventures">
          Les aventures passées →
        </Link>
      </PageIntro>
      <AdventureListing
        events={upcomingAdventures(events)}
        filters={readAdventureFilters(params)}
      />
      {ongoing.length > 0 && (
        <section className="section">
          <h2>Aventures en cours</h2>
          <div className="event-grid">
            {ongoing.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
