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
import { ParallaxHero } from "@/components/home/parallax-hero";
import { resolveHeroMedia } from "@/lib/hero";
import { AboutStory } from "@/components/home/about-story";
import { MotionSurface } from "@/components/motion/surface";
import { MotionScene } from "@/components/motion/scene";
import { HomeWords } from "@/components/home/home-words";
import { AmbientBackground } from "@/components/home/ambient-background";
import { getClientDemoAssets } from "@/lib/client-demo";
import { ClientHome } from "@/components/client-demo/client-home";
import { CompanyTeam } from "@/components/company/sections";
import { getOfficialPresentation } from "@/lib/official-presentation";
import { PresentationGallery } from "@/components/company/presentation-gallery";
export const metadata = pageMetadata(
  "Camping & randonnée en Tunisie",
  "Explorez la Tunisie avec Sakado Sfax. Découvrez les aventures, les expériences en pleine nature et les prochains événements.",
  "/",
);
export default async function Home() {
  const clientAssets = await getClientDemoAssets();
  if (clientAssets) return <ClientHome assets={clientAssets} />;
  const presentation = await getOfficialPresentation();
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
      <AmbientBackground />
      <ParallaxHero
        title={settings.heroTitle}
        description={settings.tagline}
        media={
          presentation?.hero ??
          resolveHeroMedia(settings.heroImage, process.env.NODE_ENV)
        }
      />
      <MotionScene cinematic data-home-sections>
        <div className="manifesto">
          <div className="container manifesto-inner">
            <span
              data-motion="reveal"
              data-motion-distance="6"
              data-motion-choreography="copy"
            >
              <Icon name="tent" /> Dormir sous les étoiles
            </span>
            <span
              data-motion="reveal"
              data-motion-distance="6"
              data-motion-choreography="copy"
              data-motion-delay="0.06"
            >
              <Icon name="trail" /> Suivre de nouveaux sentiers
            </span>
            <span
              data-motion="reveal"
              data-motion-distance="6"
              data-motion-choreography="copy"
              data-motion-delay="0.12"
            >
              <Icon name="sun" /> Partager le grand air
            </span>
          </div>
        </div>
        <section className="section container" id="adventures">
          <SectionHeading
            animated
            eyebrow="ON PART OÙ, ENSUITE ?"
            title="Les prochaines aventures"
            description="Un peu moins de quotidien. Un peu plus d’horizon."
            href="/events"
            linkText="Toutes les aventures"
          />
          {settings.demo && (
            <p className="demo-note">
              Aperçus de démonstration : lieux, dates, tarifs et disponibilités
              à confirmer.
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
              animated
              eyebrow="À CHACUN SON ÉVASION"
              title="Quelle aventure vous ressemble ?"
            />
            {categories.length ? (
              <MotionSurface className="experience-grid s-activity-surface">
                {categories.map((category, index) => (
                  <ExperienceCategory
                    key={category.id}
                    category={category}
                    index={index}
                  />
                ))}
              </MotionSurface>
            ) : (
              <p>
                Les expériences seront publiées après confirmation par Sakado.
              </p>
            )}
          </div>
        </section>
        <AboutStory
          about={settings.about}
          story={settings.story}
          mission={settings.mission}
          sinceYear={settings.sinceYear}
          photos={presentation?.gallery ?? photos}
        />
        <section className="section section-sand">
          <div className="container">
            <SectionHeading
              animated
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
        <CompanyTeam portraits={presentation?.portraits} />
        <section className="section container">
          <SectionHeading
            animated
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
          {settings.galleryPreview && (
            <Gallery photos={photos.slice(0, 6)} cinematic revealPreview />
          )}
          {presentation && (
            <PresentationGallery
              photos={presentation.gallery.slice(0, 6)}
              revealPreview
            />
          )}
        </section>
        {why.length > 0 && (
          <section className="why-section">
            <div className="container">
              <SectionHeading
                animated
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
                    <h3 aria-label={item.title}>
                      <HomeWords text={item.title} />
                    </h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="community container">
          <p className="eyebrow">L’AVENTURE, ENSEMBLE</p>
          <h2 aria-label="Une communauté qui partage la même passion.">
            <HomeWords text="Une communauté qui partage" />
            <br />
            <HomeWords text="la même passion." />
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
          animatedTitle
          items={instagram.items}
          title={settings.instagramMediaTitle}
          subtitle={settings.instagramMediaSubtitle}
        />
        <ContactCTA
          animated
          whatsappNumber={settings.whatsappNumber}
          title={settings.contactCtaTitle}
          text={settings.contactCtaText}
        />
      </MotionScene>
    </>
  );
}
