import { Fragment } from "react";
import Image from "next/image";
import { MotionScene } from "@/components/motion/scene";
import type { GalleryPhoto } from "@/lib/types";
import styles from "./final-journey.module.css";

export type JourneyPhoto = Pick<
  GalleryPhoto,
  "src" | "alt" | "width" | "height"
>;

/** Visible server text; its heading supplies the accessible name. */
export function JourneyWords({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className={styles.wordMask} aria-hidden="true">
            <span data-journey-word>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

export function JourneyImage({ photo }: { photo?: JourneyPhoto }) {
  return (
    <div
      className={styles.frame}
      data-journey-frame
      aria-hidden={!photo || undefined}
    >
      {photo ? (
        <div className={styles.camera} data-journey-camera>
          <Image
            unoptimized
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 699px) 92vw, 48vw"
          />
        </div>
      ) : (
        <div className={styles.atmosphere}>
          <span>
            PRENDRE
            <br />
            L’AIR.
          </span>
        </div>
      )}
      <span className={styles.imageNote} aria-hidden="true">
        SAKADO SFAX · TUNISIE
      </span>
    </div>
  );
}

export function ContactIntroduction({ photo }: { photo?: JourneyPhoto }) {
  const title = "L’aventure commence par un bonjour.";
  return (
    <MotionScene
      cinematic
      data-final-journey="contact"
      className={styles.introScene}
    >
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <p className={styles.eyebrow}>ON EN PARLE ?</p>
          <h1 aria-label={title}>
            <JourneyWords text={title} />
          </h1>
          <p className={styles.lead} data-journey-copy>
            Une sortie, un groupe privé, une idée ? Échangeons.
          </p>
          <a className={styles.introLink} href="#votre-message">
            Écrivez-nous <span aria-hidden="true">↓</span>
          </a>
        </div>
        <JourneyImage photo={photo} />
      </header>
      <p className={styles.handoff}>
        <span aria-hidden="true">01 —</span> Votre prochain départ commence ici.
      </p>
    </MotionScene>
  );
}
