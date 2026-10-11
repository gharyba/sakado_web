import Image from "next/image";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { getEvents, getDestinations } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { publicOrigin, whatsappLink } from "@/lib/content-policy";
import { dateRangeLabel, priceLabel } from "@/lib/format";
import {
  adventureStateLabel,
  registrationMessage,
  registrationCta,
  relatedAdventures,
} from "@/lib/adventure-discovery";
import { eventStructuredData } from "@/lib/event-detail";
import { EventSummary } from "@/components/event-summary";
import { EventCard } from "@/components/event-card";
import { EventProgram } from "@/components/event-program";
import { Gallery } from "@/components/gallery";
import { getInstagramMedia } from "@/lib/instagram-content";
import { InstagramMediaGallery } from "@/components/instagram-media-gallery";
import { Icon } from "@/components/icon";
import { RegistrationForm } from "@/components/registration-form";
type Props = { params: Promise<{ slug: string }> };
async function getEvent(slug: string) {
  return (await getEvents()).find((event) => event.slug === slug);
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  const metadata = event
    ? pageMetadata(
        event.title,
        event.shortDescription,
        `/events/${slug}`,
        event.demo,
      )
    : { title: "Aventure introuvable", robots: { index: false } };
  const origin = publicOrigin();
  if (event?.coverImage && origin && !event.demo) {
    const image = { url: `${origin}${event.coverImage}`, alt: event.title };
    return {
      ...metadata,
      openGraph: { ...metadata.openGraph, images: [image] },
      twitter: { ...metadata.twitter, images: [image.url] },
    };
  }
  return metadata;
}
export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const [settings, destinations] = await Promise.all([
    getSettings(),
    getDestinations(),
  ]);
  const instagram = event.demo
    ? { items: [], hasMore: false }
    : await getInstagramMedia({ eventId: event.id });
  const origin = publicOrigin();
  const whatsapp = whatsappLink(settings.whatsappNumber);
  const destination = destinations.find(
    (item) => item.slug === event.destinationSlug,
  );
  const related = relatedAdventures(event, await getEvents());
  const schema = eventStructuredData(event, origin, settings.name);
  return (
    <div
      className={`s-event-page${event.canRegister ? " s-event-page-registerable" : ""}`}
    >
      <div className="container breadcrumb">
        <Link href="/events">Aventures</Link>
        <span>/</span>
        <span>{event.title}</span>
      </div>
      <section className="detail-hero">
        <Image
          unoptimized
          src={event.coverImage ?? "/images/camp.svg"}
          alt={
            event.demo
              ? "Illustration de démonstration"
              : event.coverImage
                ? event.title
                : "Illustration temporaire"
          }
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="detail-hero-shade" />
        <div className="container">
          <p className="eyebrow">
            {event.demo
              ? "FICHE DE DÉMONSTRATION"
              : (event.category ?? "AVENTURE SAKADO")}
          </p>
          <h1>{event.title}</h1>
          <p>
            {event.destinationName ?? event.location ?? "Lieu à confirmer"} ·{" "}
            {dateRangeLabel(event.startsAt, event.endsAt)}
          </p>
          <p className="s-event-hero-facts">
            {adventureStateLabel(event)} ·{" "}
            {priceLabel(event.price, event.currency)}
            {event.difficulty && <> · Difficulté : {event.difficulty}</>}
          </p>
          <p>{registrationMessage(event)}</p>
          {event.canRegister && (
            <a href="#inscription" className="button s-event-hero-cta">
              {registrationCta(event)} <Icon />
            </a>
          )}
        </div>
      </section>
      <div className="container detail-layout">
        <div className="detail-copy">
          {event.demo && (
            <p className="notice">
              Exemple de présentation. Cette aventure n’est pas une sortie
              officielle Sakado. Aucun lieu, horaire, tarif ou disponibilité
              n’est confirmé.
            </p>
          )}
          <section>
            <p className="eyebrow">L’EXPÉRIENCE</p>
            <h2>Prendre le temps de découvrir.</h2>
            <p className="preserve-lines">{event.description}</p>
            {destination && (
              <Link
                className="text-link"
                href={`/destinations/${destination.slug}`}
              >
                Découvrir {destination.name} <Icon />
              </Link>
            )}
          </section>
          <section>
            <h2>Le programme</h2>
            <EventProgram items={event.schedule} demo={event.demo} />
          </section>
          <div className="details-columns">
            {[
              ["Ce qui est inclus", event.included],
              ["Ce qui n’est pas inclus", event.excluded],
              ["L’équipement à prévoir", event.equipment],
            ].map(([title, items]) => (
              <section key={title as string}>
                <h3>{title as string}</h3>
                {(items as string[]).length ? (
                  <ul>
                    {(items as string[]).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>À confirmer par Sakado.</p>
                )}
              </section>
            ))}
          </div>
          <section>
            <h3>Point de rendez-vous</h3>
            {event.meetingTime && <p>Heure : {event.meetingTime}</p>}
            <p>
              {event.meetingPoint ??
                "Le point de rendez-vous sera communiqué par Sakado."}
            </p>
          </section>
          <section>
            <h3>Informations importantes</h3>
            <p className="preserve-lines">
              {event.importantInfo ??
                "Les consignes seront précisées pour chaque aventure."}
            </p>
          </section>
          <section>
            <h3>Annulation</h3>
            <p className="preserve-lines">
              {event.cancellationInfo ??
                "Les modalités d’annulation ne sont pas encore communiquées. Contactez Sakado avant toute inscription."}
            </p>
          </section>
          {event.recommendations && (
            <section>
              <h3>Recommandations</h3>
              <p className="preserve-lines">{event.recommendations}</p>
            </section>
          )}
          {event.conditions && (
            <section>
              <h3>Conditions</h3>
              <p className="preserve-lines">{event.conditions}</p>
            </section>
          )}
          {event.recap && (
            <section>
              <h2>Le récit de l’aventure</h2>
              <p className="preserve-lines">{event.recap}</p>
            </section>
          )}
          {event.canRegister && (
            <section id="inscription">
              <h2>
                {event.registrationStatus === "WAITLIST_ONLY"
                  ? "Liste d’attente"
                  : "S’inscrire à cette aventure"}
              </h2>
              <p>
                Une demande d’inscription est soumise à la confirmation de
                Sakado.
              </p>
              <p className="s-registration-fallback">
                Si vous ne pouvez pas utiliser le formulaire, vous pouvez aussi{" "}
                <Link className="text-link" href="/contact">
                  contacter Sakado
                </Link>
                .
              </p>
              <RegistrationForm
                eventId={event.id}
                waitlist={event.registrationStatus === "WAITLIST_ONLY"}
                price={event.price!}
                currency={event.currency}
                availablePlaces={event.availablePlaces}
              />
            </section>
          )}
          {event.gallery.length > 0 && (
            <section>
              <h2>En images</h2>
              <Gallery photos={event.gallery} />
            </section>
          )}
        </div>
        <EventSummary event={event}>
          <Link
            className="button"
            href={`/contact?subject=event&event=${encodeURIComponent(event.title)}`}
          >
            Contacter Sakado <Icon />
          </Link>
          {whatsapp && (
            <a
              className="text-link"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Poser une question sur WhatsApp <Icon />
            </a>
          )}
          <p className="muted">
            {event.demo
              ? "Inscriptions désactivées en démonstration."
              : event.canRegister
                ? "Confirmation par l’équipe Sakado. Aucun paiement en ligne."
                : "Les inscriptions ne sont pas ouvertes pour cette sortie."}
          </p>
        </EventSummary>
      </div>
      {instagram.items.length > 0 && (
        <section className="container section">
          <h2>Moments de cette aventure</h2>
          <InstagramMediaGallery items={instagram.items} />
          {instagram.hasMore && (
            <Link className="text-link" href="/gallery?view=instagram">
              Tous les moments →
            </Link>
          )}
        </section>
      )}
      {related.length > 0 && (
        <section
          className="container section"
          aria-labelledby="related-adventures"
        >
          <h2 id="related-adventures">D’autres aventures à découvrir</h2>
          <div className="event-grid">
            {related.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>
      )}
      {event.canRegister && (
        <div className="s-event-mobile-cta">
          <span>
            {priceLabel(event.price, event.currency)}
            {event.showAvailability !== false &&
              event.availablePlaces !== null &&
              event.registrationStatus !== "WAITLIST_ONLY" && (
                <small>{event.availablePlaces} places disponibles</small>
              )}
          </span>
          <a href="#inscription" className="button">
            {registrationCta(event)}
          </a>
        </div>
      )}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </div>
  );
}
