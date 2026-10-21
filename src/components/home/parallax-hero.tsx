import Image from "next/image";
import Link from "@/components/link";
import { Icon } from "@/components/icon";
import { ButtonLink } from "@/components/ui/foundation";
import { Motion } from "@/components/motion/motion";
import { MotionScene } from "@/components/motion/scene";
import { MotionToggle } from "@/components/motion/preference";
import type { HeroMedia } from "@/lib/hero";
import styles from "./parallax-hero.module.css";

function HeroBackground({
  media,
  privatePreview,
}: {
  media: HeroMedia;
  privatePreview: boolean;
}) {
  if (!media.src) return null;
  return (
    <Motion
      effect="background"
      distance={64}
      scale={1.035}
      aria-hidden="true"
      className={styles.background}
    >
      {privatePreview ? (
        <Motion
          effect="image"
          choreography="opening"
          distance={0}
          initialOpacity={0.8}
          className={styles.opening}
        >
          <HeroPicture media={media} />
        </Motion>
      ) : (
        <HeroPicture media={media} />
      )}
    </Motion>
  );
}

function HeroPicture({ media }: { media: HeroMedia }) {
  if (!media.src) return null;
  return (
    <picture>
      {media.mobileSrc && (
        <source media="(max-width: 699px)" srcSet={media.mobileSrc} />
      )}
      <Image
        src={media.src}
        alt=""
        fill
        preload={!media.mobileSrc}
        loading={media.mobileSrc ? "eager" : undefined}
        fetchPriority={media.mobileSrc ? "high" : undefined}
        sizes="100vw"
        // Preserve authorization on /media; the optimizer does not forward cookies.
        unoptimized={
          media.src.startsWith("/media/") ||
          media.src.startsWith("/dev/client-media/") ||
          media.src.endsWith(".svg")
        }
        className={styles.image}
        data-hero-image=""
      />
    </picture>
  );
}

function HeroActions({ privatePreview }: { privatePreview: boolean }) {
  return (
    <div className={styles.actions}>
      <ButtonLink
        href={privatePreview ? "#histoire" : "/events"}
        className={styles.primary}
      >
        <span>
          {privatePreview
            ? "Découvrir Sakado"
            : "Découvrir les prochaines aventures"}
        </span>
        <Icon size={18} />
      </ButtonLink>
      <Link
        href={privatePreview ? "#experiences" : "/experiences"}
        className={styles.secondary}
      >
        Voir nos expériences <Icon size={18} />
      </Link>
    </div>
  );
}

function HeroContent({
  title,
  description,
  privatePreview,
}: {
  title: string;
  description: string;
  privatePreview: boolean;
}) {
  return (
    <div className={styles.content}>
      <Motion effect="text" distance={10}>
        <Motion
          effect="reveal"
          choreography={privatePreview ? "opening" : undefined}
          distance={10}
          initialOpacity={0.65}
        >
          <h1 id="hero-heading" className={styles.title}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
        </Motion>
      </Motion>
      {/* Essential controls stay outside translated/revealed wrappers. */}
      <HeroActions privatePreview={privatePreview} />
    </div>
  );
}

/** Server content remains readable and linked before the optional scene initializes. */
export function ParallaxHero({
  title,
  description,
  media,
  privatePreview = false,
}: {
  title: string;
  description: string;
  media: HeroMedia;
  privatePreview?: boolean;
}) {
  return (
    <section
      className={`${styles.hero}${privatePreview ? ` ${styles.privatePreview}` : ""}`}
      data-parallax-hero=""
      data-navigation-hero="dark"
      aria-labelledby="hero-heading"
    >
      <MotionScene
        enabled={Boolean(media.src)}
        cinematic={privatePreview}
        className={styles.scene}
      >
        {/* One scenic source, one moving image plane: no fabricated depth layers. */}
        <HeroBackground media={media} privatePreview={privatePreview} />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.stage}>
          <div className={styles.frame} data-hero-frame="">
            <HeroContent
              title={title}
              description={description}
              privatePreview={privatePreview}
            />
            {privatePreview && media.src && (
              <a
                href={media.src}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.privatePhoto}
              >
                Voir la photo complète ↗
              </a>
            )}
            {media.placeholder && (
              <p className={styles.assetNotice} data-hero-placeholder="">
                Illustration de développement · Photo Sakado : TO BE CONFIRMED
              </p>
            )}
          </div>
          <nav className={styles.explore} aria-label="Explorer Sakado">
            <Link href="/experiences">
              <span className={styles.exploreIcon}>
                <Icon name="trail" size={22} />
              </span>
              Expériences
            </Link>
            <Link href="/events">
              <span className={styles.exploreIcon}>
                <Icon name="calendar" size={22} />
              </span>
              Événements
            </Link>
            <Link href="/contact">
              <span className={styles.exploreIcon}>
                <Icon size={22} />
              </span>
              Contact
            </Link>
          </nav>
        </div>
        <div className={styles.controls}>
          <MotionToggle />
        </div>
      </MotionScene>
    </section>
  );
}
