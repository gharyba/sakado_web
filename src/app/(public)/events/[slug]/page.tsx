import Image from "next/image";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { getEvents, getDestinations } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { publicOrigin, whatsappLink } from "@/lib/content-policy";
import { dateLabel, priceLabel, statusLabels } from "@/lib/format";
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
  return event
    ? pageMetadata(
        event.title,
        event.shortDescription,
        `/events/${slug}`,
        event.demo,
      )
    : { title: "Aventure introuvable", robots: { index: false } };
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
  const schema =
    !event.demo && event.startsAt && event.location && origin
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.shortDescription,
          startDate: event.startsAt,
          ...(event.endsAt ? { endDate: event.endsAt } : {}),
          location: { "@type": "Place", name: event.location },
          organizer: {
            "@type": "Organization",
            name: settings.name,
            url: origin,
          },
          url: `${origin}/events/${event.slug}`,
        }
      : null;
  return (
    <>
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
          priority
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
            {event.location ?? "Lieu à confirmer"} · {dateLabel(event.startsAt)}
          </p>
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
                Découvrir la destination <Icon />
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
              <RegistrationForm
                eventId={event.id}
                waitlist={event.registrationStatus === "WAITLIST_ONLY"}
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
        <aside className="adventure-sidebar">
          <span className="status-badge">{statusLabels[event.status]}</span>
          <h2>Votre aventure</h2>
          <dl>
            {[
              ["Date", dateLabel(event.startsAt)],
              ["Fin", event.endsAt ? dateLabel(event.endsAt) : "À confirmer"],
              ["Durée", event.duration ?? "À confirmer"],
              ["Difficulté", event.difficulty ?? "À confirmer"],
              ["Tarif", priceLabel(event.price, event.currency)],
              [
                "Places disponibles",
                event.availablePlaces === null
                  ? "À confirmer"
                  : String(event.availablePlaces),
              ],
              [
                "Participants maximum",
                event.maximumParticipants === null
                  ? "À confirmer"
                  : String(event.maximumParticipants),
              ],
            ]
              .filter(
                ([label]) =>
                  event.showAvailability !== false ||
                  !["Places disponibles", "Participants maximum"].includes(
                    label,
                  ),
              )
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          {event.canRegister && (
            <a href="#inscription" className="button">
              {event.registrationStatus === "WAITLIST_ONLY"
                ? "Rejoindre la liste d’attente"
                : "S’inscrire"}{" "}
              <Icon />
            </a>
          )}
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
        </aside>
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
      <div className="mobile-contact-bar">
        <Link
          href={
            event.canRegister
              ? "#inscription"
              : `/contact?subject=event&event=${encodeURIComponent(event.title)}`
          }
          className="button"
        >
          {event.canRegister
            ? "S’inscrire à cette aventure"
            : "Une question sur cette aventure ?"}{" "}
          <Icon />
        </Link>
      </div>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </>
  );
}
