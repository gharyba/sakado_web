import Image from "next/image";
import { MotionScene } from "@/components/motion/scene";
import { Motion } from "@/components/motion/motion";
import { company, companyTeam } from "@/data/confirmed/company";
import { HomeWords } from "@/components/home/home-words";
// Retain the established shared CSS geometry while moving server presentation out of the private adapter.
import styles from "../client-demo/client-preview.module.css";
import teamStyles from "./team-story.module.css";

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
    <section
      className={teamStyles.section}
      id="equipe"
      aria-labelledby="team-heading"
    >
      <MotionScene cinematic data-team-story className={teamStyles.scene}>
        <div className={`container ${teamStyles.inner}`}>
          <header className={teamStyles.intro}>
            <p className={teamStyles.eyebrow}>LES VISAGES DE SAKADO</p>
            <h2 id="team-heading">Les visages derrière l’aventure.</h2>
            <p>{company.about}</p>
          </header>
          <ol className={teamStyles.people} aria-label="L’équipe permanente">
            {companyTeam.map(({ name, role, initials }, index) => {
              const photo = portraits[index];
              return (
                <li key={name} className={teamStyles.person}>
                  <article data-team-member>
                    <div className={teamStyles.frame} data-team-frame>
                      <div className={teamStyles.camera} data-team-camera>
                        {photo ? (
                          <Image
                            unoptimized
                            src={photo.src}
                            alt={photo.alt}
                            width={photo.width}
                            height={photo.height}
                            sizes="(max-width: 699px) 92vw, (max-width: 1099px) 44vw, 39vw"
                          />
                        ) : (
                          <div className={teamStyles.fallback}>
                            <span aria-hidden="true">{initials}</span>
                            <small>Portrait à venir</small>
                          </div>
                        )}
                      </div>
                      <span
                        className={teamStyles.frameIndex}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className={teamStyles.caption}>
                      <span className={teamStyles.rule} aria-hidden="true" />
                      <div>
                        <h3 data-team-name>{name}</h3>
                        <p data-team-role>{role}</p>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
          <p className={teamStyles.closing}>{company.philosophy}</p>
        </div>
      </MotionScene>
    </section>
  );
}
