import Image from "next/image";
import Link from "@/components/link";
import {
  getEvents,
  getDestinations,
  getExperiences,
  getGallery,
} from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { demoWhy } from "@/data/demo/content";
import { EventCard } from "@/components/event-card";
import { ExperienceCategory } from "@/components/experience-category";
import { DestinationCard } from "@/components/destination-card";
import { SectionHeading } from "@/components/section-heading";
import { Gallery } from "@/components/gallery";
import { InstagramMediaMarquee } from "@/components/instagram-media-marquee";
import { getInstagramMedia } from "@/lib/instagram-content";
import { ContactCTA } from "@/components/contact-cta";
import { Icon } from "@/components/icon";
export const metadata = pageMetadata(
  "Camping & randonnée en Tunisie",
  "Explorez la Tunisie avec Sakado Sfax. Découvrez les aventures, les expériences en pleine nature et les prochains événements.",
  "/",
);
export default async function Home() {
  const [settings, events, destinations, categories, photos, instagram] =
    await Promise.all([
      getSettings(),
      getEvents(),
      getDestinations(),
      getExperiences(),
      getGallery(),
      getInstagramMedia({ homepage: true }),
    ]);
  const upcoming = events
    .filter(
      (event) =>
        event.demo ||
        (event.lifecycle === "UPCOMING" &&
          event.startsAt &&
          new Date(event.startsAt) > new Date()),
    )
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  const why = settings.demo ? demoWhy : settings.whySakado;
  return (
    <>
      <section className="hero">
        <Image
          unoptimized
          src={settings.heroImage ?? "/images/camp.svg"}
          alt={
            settings.heroImage
              ? "Une aventure en pleine nature avec Sakado Sfax"
              : "Illustration temporaire d’un campement dans les montagnes, sans destination réelle"
          }
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> LE GRAND AIR VOUS ATTEND
            </p>
            <h1>
              {settings.heroTitle.split(". ").map((part, index, arr) => (
                <span key={part}>
                  {part}
                  {index < arr.length - 1 ? "." : ""}
                </span>
              ))}
            </h1>
            <p className="hero-description">{settings.tagline}</p>
            <div className="hero-actions">
              <Link className="button button-amber" href="/events">
                Découvrir les prochaines aventures <Icon />
              </Link>
              <Link className="hero-secondary" href="/experiences">
                Voir nos expériences <Icon size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <Icon name="compass" size={22} />
              <span>
                La nature comme destination.
                <br />
                L’aventure comme état d’esprit.
              </span>
            </div>
          </div>
        </div>
        <div className="hero-caption">
          {settings.heroImage
            ? "SAKADO SFAX · TUNISIE"
            : "ILLUSTRATION TEMPORAIRE · PHOTO SAKADO À FOURNIR"}
        </div>
        <span className="hero-index" aria-hidden="true">
          01 / L’APPEL DE LA NATURE
        </span>
      </section>
      <div className="manifesto">
        <div className="container manifesto-inner">
          <span>
            <Icon name="tent" /> Dormir sous les étoiles
          </span>
          <span>
            <Icon name="trail" /> Suivre de nouveaux sentiers
          </span>
          <span>
            <Icon name="sun" /> Partager le grand air
          </span>
        </div>
      </div>
      <section className="section container" id="adventures">
        <SectionHeading
          eyebrow="ON PART OÙ, ENSUITE ?"
          title="Les prochaines aventures"
          description="Un peu moins de quotidien. Un peu plus d’horizon."
          href="/events"
          linkText="Toutes les aventures"
        />
        {settings.demo && (
          <p className="demo-note">
            Aperçus de démonstration : lieux, dates, tarifs et disponibilités à
            confirmer.
          </p>
        )}
        {upcoming.length ? (
          <div className="event-grid">
            {upcoming.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Les prochaines aventures seront annoncées ici.{" "}
            <Link href="/contact">Contactez Sakado pour en savoir plus.</Link>
          </div>
        )}
      </section>
      <section className="experience-section">
        <div className="container">
          <SectionHeading
            eyebrow="À CHACUN SON ÉVASION"
            title="Quelle aventure vous ressemble ?"
          />
          {categories.length ? (
            <div className="experience-grid">
              {categories.map((category, index) => (
                <ExperienceCategory
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p>
              Les expériences seront publiées après confirmation par Sakado.
            </p>
          )}
        </div>
      </section>
      <section className="section container about-section">
        <div className="about-art">
          <Image
            unoptimized
            src="/images/trail.svg"
            alt="Illustration temporaire d’un sentier en pleine nature"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <span className="about-stamp">
            <Icon name="compass" size={32} />
            <strong>
              PRENDRE
              <br />
              LE LARGE.
            </strong>
          </span>
          <small>Illustration temporaire</small>
        </div>
        <div className="about-copy">
          <p className="eyebrow">SAKADO SFAX · TUNISIE</p>
          <h2>
            L’aventure commence
            <br />
            avec Sakado.
          </h2>
          <p>{settings.about}</p>
          {settings.sinceYear && <p>Depuis {settings.sinceYear}</p>}
          <Link className="text-link" href="/about">
            Rencontrer l’esprit Sakado <Icon />
          </Link>
          <div className="about-signature">Dehors, tout commence.</div>
        </div>
      </section>
      <section className="section section-sand">
        <div className="container">
          <SectionHeading
            eyebrow="DES HORIZONS À DÉCOUVRIR"
            title="La nature donne le cap."
            description={
              settings.demo
                ? "Des univers visuels pour préparer le futur catalogue de destinations."
                : "Découvrez les destinations sélectionnées par Sakado."
            }
            href="/destinations"
            linkText="Explorer les destinations"
          />
          {destinations.length ? (
            <div className="destination-grid">
              {destinations.slice(0, 2).map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Le catalogue de destinations se prépare.
            </p>
          )}
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="DES INSTANTS QUI RESTENT"
          title="L’aventure se vit. Et se partage."
          description={
            settings.demo
              ? "Illustrations de démonstration en attendant les photographies autorisées de Sakado."
              : "Les images des aventures Sakado."
          }
          href="/gallery"
          linkText="Ouvrir la galerie"
        />
        {settings.galleryPreview && <Gallery photos={photos.slice(0, 6)} />}
      </section>
      {why.length > 0 && (
        <section className="why-section">
          <div className="container">
            <SectionHeading
              eyebrow="L’ESPRIT SAKADO"
              title="Pourquoi partir avec Sakado ?"
              description={
                settings.demo
                  ? "Propositions de contenu à valider avec le client."
                  : undefined
              }
            />
            <div className="why-grid">
              {why.map((item, index) => (
                <div key={item.title}>
                  <span className="why-number">0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="community container">
        <p className="eyebrow">L’AVENTURE, ENSEMBLE</p>
        <h2>
          Une communauté qui partage
          <br />
          la même passion.
        </h2>
        <p>
          Retrouvez l’univers Sakado et échangez avec la communauté sur
          Instagram.
        </p>
        {(settings.communityMetrics.length > 0 ||
          settings.communityMembersLabel) && (
          <div className="community-metrics">
            {settings.communityMetrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
            {settings.communityMembersLabel && (
              <div>
                <strong>{settings.communityMembersLabel}</strong>
                <span>Communauté</span>
              </div>
            )}
          </div>
        )}
      </section>
      <InstagramMediaMarquee
        items={instagram.items}
        title={settings.instagramMediaTitle}
        subtitle={settings.instagramMediaSubtitle}
      />
      <ContactCTA
        whatsappNumber={settings.whatsappNumber}
        title={settings.contactCtaTitle}
        text={settings.contactCtaText}
      />
    </>
  );
}
