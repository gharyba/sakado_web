import Image from "next/image";
import Link from "@/components/link";
import { ParallaxHero } from "@/components/home/parallax-hero";
import { Gallery } from "@/components/gallery";
import { MotionScene } from "@/components/motion/scene";
import { Motion } from "@/components/motion/motion";
import { MotionToggle } from "@/components/motion/preference";
import { Icon } from "@/components/icon";
import { ShapeGrid } from "./shape-grid";
import { ClientGalleryCarousel } from "./gallery-carousel";
import { clientAsset, type ClientDemoAssets } from "@/lib/client-demo";
import styles from "./client-preview.module.css";
import { companyTeam } from "@/data/confirmed/company";
import {
  CompanyHeading as Heading,
  CompanyTimeline,
  CompanyTeam,
} from "@/components/company/sections";

const experiences = [
  "Randonnées",
  "Séjours en camping",
  "Expéditions sahariennes",
  "Team building",
  "Événements d’entreprise",
];
// Reuse curated preview photographs as category illustrations, without outing claims.
const experiencePhotos = [
  "gallery-4",
  "gallery-3",
  "gallery-1",
  "gallery-6",
  "gallery-8",
];

export function ClientStory({ assets }: { assets?: ClientDemoAssets }) {
  const photo = assets ? clientAsset(assets, "gallery-2") : null;
  return (
    <section
      className={`${styles.section} container`}
      id="histoire"
      aria-label="Notre histoire"
    >
      <MotionScene cinematic className={styles.story}>
        <div className={styles.storyArt}>
          <Motion
            effect="image"
            choreography="scene"
            distance={8}
            className={styles.storyImage}
          >
            <Image
              unoptimized
              src={photo?.src ?? "/images/trail.svg"}
              alt={
                photo?.alt ??
                "Illustration temporaire : un sentier en pleine nature"
              }
              width={photo?.width ?? 1200}
              height={photo?.height ?? 900}
              sizes="(max-width: 699px) 100vw, 45vw"
            />
          </Motion>
          {!photo && (
            <p className={styles.mediaNote}>
              Illustration · Photo Sakado à venir
            </p>
          )}
        </div>
        <div className={styles.storyCopy}>
          <Motion effect="text" distance={8}>
            <Motion
              effect="reveal"
              choreography="copy"
              delay={0.12}
              distance={8}
            >
              <Heading
                eyebrow="L’ESPRIT SAKADO"
                title="Une passion devenue une entreprise"
              >
                Depuis 2017, Sakado Sfax imagine une autre manière de découvrir
                la Tunisie, entre nature, aventure et expériences humaines
                authentiques.
              </Heading>
              <p>
                Née de la passion de Mohamed Ben Beya pour la nature, l’aventure
                et la découverte, Sakado invite à explorer les richesses
                naturelles et les paysages de la Tunisie.
              </p>
            </Motion>
          </Motion>
          <Link href="#equipe" className={styles.textLink}>
            Rencontrer l’équipe <Icon size={18} />
          </Link>
        </div>
      </MotionScene>
      <CompanyTimeline />
    </section>
  );
}

export function ClientExperiences({
  decorativeGrid = false,
  assets,
}: {
  decorativeGrid?: boolean;
  assets?: ClientDemoAssets;
}) {
  const photographic = decorativeGrid && Boolean(assets);
  return (
    <section
      className={`${styles.section} ${styles.experience} ${decorativeGrid ? styles.griddedExperience : ""} ${photographic ? styles.photographicExperiences : ""}`}
      id="experiences"
    >
      {decorativeGrid && <ShapeGrid />}
      <MotionScene cinematic className="container">
        <Motion
          effect="reveal"
          choreography="scene"
          distance={10}
          initialOpacity={0.8}
        >
          <Heading eyebrow="PRENDRE L’AIR" title="À chacun son aventure." />
        </Motion>
        <div className={styles.experiences}>
          {experiences.map((label, index) => {
            const photo =
              photographic && assets
                ? clientAsset(assets, experiencePhotos[index])
                : null;
            return (
              <Link href="/contact" key={label}>
                {photo && (
                  <span
                    className={styles.experiencePhoto}
                    aria-hidden="true"
                    data-client-activity-photo
                  >
                    <Image
                      unoptimized
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(max-width: 699px) 80px, (max-width: 1199px) 28vw, 220px"
                    />
                  </span>
                )}
                <span className={styles.number}>0{index + 1}</span>
                <h3>{label}</h3>
                <Icon size={22} />
              </Link>
            );
          })}
        </div>
      </MotionScene>
    </section>
  );
}

export function ClientGallery({
  assets,
  carousel = false,
}: {
  assets: ClientDemoAssets;
  carousel?: boolean;
}) {
  const photos = assets
    .filter((asset) => asset.slot.startsWith("gallery-"))
    .map((asset) => {
      const image = clientAsset(assets, asset.slot);
      return {
        id: asset.slot,
        src: image.src,
        fullSrc: image.fullSrc,
        width: asset.width,
        height: asset.height,
        alt: asset.alt,
        caption: null,
        category: null,
        demo: false,
      };
    });
  const heading = (
    <Motion
      effect="reveal"
      choreography="copy"
      distance={8}
      initialOpacity={0.8}
    >
      <Heading
        eyebrow="LES INSTANTS QUI RESTENT"
        title="L’aventure se vit. Et se partage."
      />
    </Motion>
  );
  return (
    <section
      className={`${styles.section} ${carousel ? styles.editorialGallery : "container"} ${styles.gallery}`}
      id="photos"
    >
      <MotionScene cinematic>
        {carousel ? (
          <div className={`${styles.galleryHeader} container`}>
            {heading}
            <Link href="/gallery" className={styles.textLink}>
              Ouvrir la galerie <Icon size={18} />
            </Link>
          </div>
        ) : (
          heading
        )}
        {carousel ? (
          <ClientGalleryCarousel photos={photos} />
        ) : (
          <Gallery photos={photos} cinematic revealPreview />
        )}
      </MotionScene>
    </section>
  );
}

export function ClientTeam({ assets }: { assets?: ClientDemoAssets }) {
  return (
    <CompanyTeam
      portraits={
        assets
          ? companyTeam.map((_, index) => clientAsset(assets, `team-${index}`))
          : undefined
      }
    />
  );
}

export function ClientPartners({ assets }: { assets: ClientDemoAssets }) {
  return (
    <section
      className={`${styles.section} container ${styles.partnerSection}`}
      id="partenaires"
    >
      <MotionScene cinematic>
        <Heading eyebrow="L’AVENTURE, ENSEMBLE" title="Nos partenaires" />
        <div className={styles.partners}>
          {assets
            .filter((asset) => asset.slot.startsWith("partner-"))
            .map((asset) => (
              <figure key={asset.slot}>
                <Motion
                  effect="reveal"
                  choreography="partner"
                  delay={(Number(asset.slot.split("-")[1]) % 4) * 0.04}
                  distance={3}
                  initialOpacity={0.85}
                >
                  <Image
                    unoptimized
                    src={clientAsset(assets, asset.slot).src}
                    alt={asset.alt}
                    width={asset.width}
                    height={asset.height}
                    sizes="(max-width: 699px) 40vw, 16vw"
                  />
                </Motion>
                {asset.label.includes("confirmer") && (
                  <figcaption>Identité à confirmer</figcaption>
                )}
              </figure>
            ))}
        </div>
      </MotionScene>
    </section>
  );
}

export function ClientComingSoon({
  title = "Les prochaines aventures",
  standalone = false,
}: {
  title?: string;
  standalone?: boolean;
}) {
  return (
    <section
      className={`${styles.section} container ${styles.comingSoon}`}
      id={standalone ? undefined : "prochainement"}
    >
      <p className="eyebrow">LE PROCHAIN CHAPITRE</p>
      {standalone ? <h1>{title}</h1> : <h2>{title}</h2>}
      <span className={styles.soon}>Bientôt</span>
      <p>Les prochaines aventures et les événements seront annoncés ici.</p>
      <Link href="/contact" className={styles.textLink}>
        Échanger avec Sakado <Icon size={18} />
      </Link>
    </section>
  );
}

export function ClientHome({ assets }: { assets: ClientDemoAssets }) {
  const hero = clientAsset(assets, "hero");
  return (
    <>
      <ParallaxHero
        title="Vivre la nature autrement."
        description="Découvrir la Tunisie, entre nature, aventure et expériences humaines authentiques."
        media={{ src: hero.fullSrc, mobileSrc: hero.src, placeholder: false }}
        privatePreview
      />
      <div className={styles.home}>
        <ClientStory assets={assets} />
        <ClientExperiences decorativeGrid assets={assets} />
        <ClientGallery assets={assets} carousel />
        <ClientTeam assets={assets} />
        <ClientPartners assets={assets} />
        <section
          className={`${styles.section} ${styles.vision}`}
          aria-label="Notre vision"
        >
          <MotionScene cinematic className="container">
            <Motion
              effect="reveal"
              choreography="scene"
              distance={10}
              initialOpacity={0.8}
            >
              <p className="eyebrow">NOTRE VISION</p>
              <h2>
                Vivre la nature
                <br />
                <em>autrement.</em>
              </h2>
              <ul>
                {["Partage", "Convivialité", "Découverte", "Aventure"].map(
                  (value) => (
                    <li key={value}>{value}</li>
                  ),
                )}
              </ul>
            </Motion>
            <Link href="/contact" className="button">
              Parlons de votre prochaine aventure <Icon size={18} />
            </Link>
          </MotionScene>
        </section>
        <ClientComingSoon />
      </div>
    </>
  );
}

export function ClientDemoDetail({
  assets,
  section,
}: {
  assets: ClientDemoAssets;
  section: "about" | "gallery" | "experiences";
}) {
  return (
    <div className={`${styles.home} page-section`}>
      <div className="container">
        <h1 className={styles.pageTitle}>
          {section === "about"
            ? "L’esprit Sakado"
            : section === "gallery"
              ? "Le grand air, en images."
              : "Nos expériences"}
        </h1>
        <MotionToggle />
      </div>
      {section === "about" ? (
        <>
          <ClientStory assets={assets} />
          <ClientTeam assets={assets} />
        </>
      ) : section === "gallery" ? (
        <ClientGallery assets={assets} />
      ) : (
        <ClientExperiences />
      )}
    </div>
  );
}
