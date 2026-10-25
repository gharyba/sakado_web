import Image from "next/image";
import Link from "@/components/link";
import { Icon } from "@/components/icon";
import { MotionScene } from "@/components/motion/scene";
import { company } from "@/data/confirmed/company";
import type { GalleryPhoto } from "@/lib/types";
import styles from "./company-story.module.css";

type StoryIntro = {
  about: string;
  story: string | null;
  mission: string | null;
  sinceYear: number | null;
};

/** Server-only composition: callers supply already eligible public or session-gated DTOs. */
export function CompanyStory({
  photos = [],
  intro,
}: {
  photos?: readonly GalleryPhoto[];
  intro?: StoryIntro;
}) {
  const illustrations = ["trail", "camp", "coast"];
  const notes = [intro?.story, intro?.mission].filter(
    (text, index, all): text is string =>
      !!text && text !== intro?.about && all.indexOf(text) === index,
  );
  return (
    <section
      id="histoire"
      className={styles.section}
      aria-labelledby="company-history-heading"
    >
      <MotionScene
        cinematic
        data-story-timeline
        data-company-story
        className={`s-about-story container ${styles.scene}`}
      >
        <header className={styles.header}>
          <p className="eyebrow">SAKADO SFAX · TUNISIE</p>
          <h2 id="company-history-heading">Notre histoire</h2>
          <p className={styles.lead}>{intro?.about ?? company.about}</p>
          <p className={styles.kicker}>
            Une envie. Un chemin. L’aventure, ensemble.
          </p>
        </header>
        <div className={styles.progressTrack} aria-hidden="true">
          <span data-story-progress />
        </div>
        <ol
          className={styles.chapters}
          role="list"
          data-story-list
          aria-label="Les étapes de Sakado"
        >
          {company.chapters.map((chapter, index) => {
            const photo = photos[index];
            return (
              <li
                key={chapter.year}
                className={styles.chapter}
                role="listitem"
                data-story-chapter={index}
              >
                <span className={styles.year}>{chapter.year}</span>
                <figure className={styles.frame} data-story-frame>
                  <div className={styles.camera} data-story-camera>
                    <picture>
                      {photo?.fullSrc && photo.fullSrc !== photo.src && (
                        <source media="(max-width: 699px)" srcSet={photo.src} />
                      )}
                      <Image
                        unoptimized
                        src={
                          photo?.fullSrc ??
                          photo?.src ??
                          `/images/${illustrations[index]}.svg`
                        }
                        alt={
                          photo?.alt ?? "Illustration temporaire de plein air"
                        }
                        fill
                        sizes="(max-width: 699px) 92vw, 50vw"
                        loading="lazy"
                      />
                    </picture>
                  </div>
                  <figcaption>
                    <span aria-hidden="true">0{index + 1} / 03</span>
                    <small>
                      {photo
                        ? "Visuel d’ambiance · sans datation historique"
                        : "Illustration temporaire"}
                    </small>
                  </figcaption>
                </figure>
                <div className={styles.copy} data-story-phase>
                  <p className={styles.chapterLabel}>CHAPITRE 0{index + 1}</p>
                  <h3 aria-label={chapter.title}>
                    {chapter.title.split(" ").map((word, i) => (
                      <span
                        className={styles.wordMask}
                        aria-hidden="true"
                        key={i}
                      >
                        <span data-story-word>{word}</span>{" "}
                      </span>
                    ))}
                  </h3>
                  <p className={styles.emphasis} data-story-emphasis>
                    {chapter.text}
                  </p>
                  {index === 2 && (
                    <p className={styles.values}>
                      {company.values.join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {photos.some(
          (photo) =>
            photo.src.startsWith("/dev/presentation-media/") ||
            photo.src.startsWith("/_client-review/media/"),
        ) && (
          <p className={styles.mediaNote}>
            Photographies réservées à cette présentation privée. Elles
            illustrent le récit et ne documentent pas les années des chapitres.
          </p>
        )}
        {intro && (
          <div className={styles.notes}>
            <div>
              {notes.map((text, index) => (
                <p className="s-story-passage" key={index}>
                  {text}
                </p>
              ))}
            </div>
            <div className={styles.handoff}>
              {intro.sinceYear && <p>Depuis {intro.sinceYear}</p>}
              <Link className="text-link" href="/about">
                Rencontrer l’esprit Sakado <Icon />
              </Link>
              <span>Dehors, tout commence.</span>
            </div>
          </div>
        )}
      </MotionScene>
    </section>
  );
}
