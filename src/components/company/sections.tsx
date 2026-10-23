import Image from "next/image";
import { MotionScene } from "@/components/motion/scene";
import { Motion } from "@/components/motion/motion";
import { MotionSurface } from "@/components/motion/surface";
import { company, companyTeam } from "@/data/confirmed/company";
import { HomeWords } from "@/components/home/home-words";
// Retain the established shared CSS geometry while moving server presentation out of the private adapter.
import styles from "../client-demo/client-preview.module.css";

export type CompanyPortrait = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function CompanyHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.heading}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

/** Shared confirmed chapters; no database or permission decisions inside motion. */
export function CompanyTimeline({
  standalone = false,
  animateHeading = false,
}: {
  standalone?: boolean;
  animateHeading?: boolean;
}) {
  const timeline = (
    <MotionScene cinematic data-story-timeline className={styles.timelineScene}>
      <span
        className={styles.timelineProgress}
        data-story-progress
        aria-hidden="true"
      />
      <ol className={styles.timeline} aria-label="Les étapes de Sakado">
        {company.chapters.map((chapter, index) => (
          <li key={chapter.year}>
            <span>{chapter.year}</span>
            <div data-story-phase>
              <Motion
                effect="reveal"
                choreography={index === 2 ? "scene" : "copy"}
                delay={index * 0.06}
                distance={6}
                initialOpacity={0.85}
              >
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
              </Motion>
            </div>
          </li>
        ))}
      </ol>
    </MotionScene>
  );
  return standalone ? (
    <section
      className={styles.section + " container"}
      aria-labelledby="company-history-heading"
    >
      <h2
        id="company-history-heading"
        className={styles.pageTitle}
        aria-label={animateHeading ? "Notre histoire" : undefined}
      >
        {animateHeading ? (
          <HomeWords text="Notre histoire" />
        ) : (
          "Notre histoire"
        )}
      </h2>
      {timeline}
    </section>
  ) : (
    timeline
  );
}

export function CompanyTeam({
  portraits = [],
}: {
  portraits?: readonly (CompanyPortrait | undefined)[];
}) {
  return (
    <section className={`${styles.section} ${styles.teamSection}`} id="equipe">
      <MotionScene cinematic className="container">
        <Motion
          effect="reveal"
          choreography="copy"
          distance={6}
          initialOpacity={0.85}
        >
          <CompanyHeading eyebrow="LES VISAGES DE SAKADO" title="Notre équipe">
            Une équipe réunie par la même envie : créer des expériences
            authentiques et faire vivre la Tunisie autrement.
          </CompanyHeading>
        </Motion>
        <MotionSurface className={styles.team}>
          {companyTeam.map(({ name, role, initials }, index) => {
            const photo = portraits[index];
            return (
              <article
                key={name}
                className={styles.member}
                data-cinematic-sequence
              >
                <Motion
                  effect="image"
                  choreography="portrait"
                  delay={(index % 3) * 0.06}
                  distance={6}
                  initialOpacity={0.8}
                  className={styles.portrait}
                >
                  {photo ? (
                    <Image
                      unoptimized
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(max-width: 699px) 85vw, (max-width: 1199px) 40vw, 20vw"
                    />
                  ) : (
                    <div className={styles.portraitPlaceholder}>
                      <span aria-hidden="true">{initials}</span>
                      <small>Photo à venir</small>
                    </div>
                  )}
                </Motion>
                <Motion
                  effect="reveal"
                  choreography="copy"
                  delay={0.16}
                  distance={3}
                  initialOpacity={0.85}
                >
                  <h3>{name}</h3>
                </Motion>
                <Motion
                  effect="reveal"
                  choreography="copy"
                  delay={0.22}
                  distance={2}
                  initialOpacity={0.9}
                >
                  <p>{role}</p>
                </Motion>
              </article>
            );
          })}
        </MotionSurface>
      </MotionScene>
    </section>
  );
}
