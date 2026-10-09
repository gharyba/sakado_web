import Image from "next/image";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { getDestinations, getEvents } from "@/lib/content";
import { environmentLabels } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Gallery } from "@/components/gallery";
import { EventCard } from "@/components/event-card";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const place = (await getDestinations()).find((item) => item.slug === slug);
  return place
    ? pageMetadata(
        place.name,
        place.description,
        `/destinations/${slug}`,
        place.demo,
      )
    : { title: "Destination introuvable", robots: { index: false } };
}
export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const [destinations, events] = await Promise.all([
    getDestinations(),
    getEvents(),
  ]);
  const place = destinations.find((item) => item.slug === slug);
  if (!place) notFound();
  const related = events.filter(
    (event) => event.destinationSlug === place.slug,
  );
  return (
    <>
      <div className="container breadcrumb">
        <Link href="/destinations">Destinations</Link>
        <span>/</span>
        <span>{place.name}</span>
      </div>
      <section className="detail-hero">
        <Image
          unoptimized
          src={place.coverImage ?? "/images/trail.svg"}
          alt={
            place.demo
              ? "Illustration de démonstration sans destination réelle"
              : place.coverImage
                ? place.name
                : "Illustration temporaire"
          }
          fill
          priority
          sizes="100vw"
        />
        <div className="detail-hero-shade" />
        <div className="container">
          <p className="eyebrow">
            {place.demo
              ? "UNIVERS DE DÉMONSTRATION"
              : (place.region ?? "DESTINATION SAKADO")}
          </p>
          <h1>{place.name}</h1>
        </div>
      </section>
      <div className="container page-section">
        <div className="prose">
          {place.demo && (
            <p className="notice">
              Ce lieu est un exemple de fiche, pas une destination annoncée par
              Sakado.
            </p>
          )}
          <h2>Un peu plus près de la nature.</h2>
          <p>{place.description}</p>
          <dl className="place-facts">
            <div>
              <dt>Région</dt>
              <dd>{place.region ?? "À confirmer"}</dd>
            </div>
            <div>
              <dt>Environnement</dt>
              <dd>
                {place.environment
                  ? environmentLabels[place.environment]
                  : "À confirmer"}
              </dd>
            </div>
            <div>
              <dt>Difficulté</dt>
              <dd>{place.difficulty ?? "À confirmer"}</dd>
            </div>
            {place.latitude !== null && place.longitude !== null && (
              <div>
                <dt>Coordonnées</dt>
                <dd>
                  {place.latitude}, {place.longitude}
                </dd>
              </div>
            )}
          </dl>
        </div>
        {place.gallery.length > 0 && (
          <section className="section">
            <h2>En images</h2>
            <Gallery photos={place.gallery} />
          </section>
        )}
        <section className="section">
          <h2>Les expériences ici</h2>
          {related.length ? (
            <div className="event-grid">
              {related.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
          ) : (
            <p>Aucune expérience publiée pour cette destination.</p>
          )}
        </section>
      </div>
    </>
  );
}
