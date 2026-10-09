import { getDestinations } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { DestinationCard } from "@/components/destination-card";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Destinations",
  "Découvrez le futur catalogue de destinations nature de Sakado Sfax en Tunisie.",
  "/destinations",
);
export default async function DestinationsPage() {
  const destinations = await getDestinations();
  return (
    <div className="container page-section">
      <PageIntro eyebrow="LA NATURE DONNE LE CAP" title="De nouveaux horizons.">
        <p>Les lieux qui accueilleront vos prochaines aventures.</p>
      </PageIntro>
      {destinations.length ? (
        <div className="destination-grid">
          {destinations.map((destination) => (
            <DestinationCard destination={destination} key={destination.id} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          Sakado prépare son catalogue de destinations. Aucun lieu n’est annoncé
          pour le moment.
        </p>
      )}
    </div>
  );
}
