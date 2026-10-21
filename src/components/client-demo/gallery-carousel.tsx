"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import type { GalleryPhoto } from "@/lib/types";
import { Icon } from "@/components/icon";
import { useMotionPreference } from "@/components/motion/preference";
import styles from "./gallery-carousel.module.css";

function slotFor(index: number, active: number, length: number) {
  const forward = (index - active + length) % length;
  return forward > length / 2 ? forward - length : forward;
}

export function ClientGalleryCarousel({ photos }: { photos: GalleryPhoto[] }) {
  const [{ active, previousActive }, setPosition] = useState({
    active: 0,
    previousActive: 0,
  });
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement>(null);
  const preference = useMotionPreference();
  const animate = preference === "on";
  const queue = useRef<(-1 | 1)[]>([]);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(
    function advanceQueue() {
      const direction = queue.current.shift();
      if (!direction) {
        busy.current = false;
        timer.current = null;
        return;
      }
      busy.current = true;
      setPosition((current) => ({
        active: (current.active + direction + photos.length) % photos.length,
        previousActive: current.active,
      }));
      // One bounded timer serializes repeated input. CSS owns every animated property.
      timer.current = setTimeout(advanceQueue, 580);
    },
    [photos.length],
  );

  useEffect(() => {
    if (!animate) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      const remaining = queue.current.reduce(
        (sum, direction) => sum + direction,
        0,
      );
      queue.current = [];
      busy.current = false;
      if (remaining)
        setPosition((current) => ({
          active:
            (((current.active + remaining) % photos.length) + photos.length) %
            photos.length,
          previousActive: current.active,
        }));
    }
  }, [animate, photos.length]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      queue.current = [];
    },
    [],
  );

  if (!photos.length) return null;

  function move(direction: -1 | 1) {
    if (!animate) {
      setPosition((current) => ({
        active: (current.active + direction + photos.length) % photos.length,
        previousActive: current.active,
      }));
      return;
    }
    queue.current.push(direction);
    if (!busy.current) advance();
  }

  function openImage(
    event: MouseEvent<HTMLAnchorElement>,
    photo: GalleryPhoto,
  ) {
    if (
      !dialog.current?.showModal ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    // Opening a photograph supersedes queued navigation and keeps its opener stable.
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    queue.current = [];
    busy.current = false;
    opener.current = event.currentTarget;
    setSelected(photo);
    dialog.current.showModal();
  }

  return (
    <div
      className={styles.carousel}
      data-gallery-carousel
      data-carousel-motion={animate ? "on" : "static"}
      role="region"
      aria-roledescription="carrousel"
      aria-label="Les photographies Sakado"
      onKeyDown={(event) => {
        if (
          dialog.current?.open ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className={styles.rail} aria-label="Photographies Sakado">
        {photos.map((photo, index) => {
          const slot = slotFor(index, active, photos.length);
          const distance = Math.abs(slot);
          const reassigned =
            Math.abs(slot - slotFor(index, previousActive, photos.length)) > 1;
          const position = {
            "--direction": Math.sign(slot),
            "--distance": distance,
          } as CSSProperties;
          return (
            <a
              key={photo.id}
              className={styles.card}
              data-gallery-card={photo.id}
              data-slot={slot}
              data-active={slot === 0 ? "true" : "false"}
              data-distance={distance}
              data-reassigned={reassigned}
              style={position}
              href={photo.fullSrc ?? photo.src}
              tabIndex={slot === 0 ? 0 : -1}
              aria-hidden={distance < 5 ? undefined : true}
              aria-label={`Agrandir : ${photo.alt}`}
              onClick={(event) => openImage(event, photo)}
            >
              <span className={styles.visual}>
                <Image
                  unoptimized
                  loading={distance <= 4 ? "eager" : "lazy"}
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(max-width: 699px) 84vw, (max-width: 1199px) 62vw, 600px"
                />
              </span>
            </a>
          );
        })}
      </div>
      <div className={styles.captions}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={styles.caption}
            data-gallery-caption={photo.id}
            data-active={index === active}
            aria-hidden={index !== active}
          >
            <span className={styles.captionIndex}>
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
            <span>{photo.alt}</span>
            <a
              href={photo.fullSrc ?? photo.src}
              className={styles.captionHint}
              // The photograph is the primary keyboard link; this repeats its pointer affordance.
              tabIndex={-1}
              onClick={(event) => openImage(event, photo)}
            >
              Voir l’image entière <span aria-hidden="true">↗</span>
            </a>
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          hidden={preference === "pending"}
          onClick={() => move(-1)}
          aria-label="Photo précédente"
          className={styles.arrow}
        >
          <span aria-hidden="true">←</span>
        </button>
        <span className={styles.counter} aria-live="polite">
          {String(active + 1).padStart(2, "0")}{" "}
          <span aria-hidden="true">/</span>{" "}
          {String(photos.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          hidden={preference === "pending"}
          onClick={() => move(1)}
          aria-label="Photo suivante"
          className={styles.arrow}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <noscript>
        <p className={styles.fallback}>
          <a href="/gallery">Voir les douze photos de la galerie</a>
        </p>
      </noscript>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Visionneuse d’images"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onClose={() => {
          setSelected(null);
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <button
          autoFocus
          className="lightbox-close"
          aria-label="Fermer l’image"
          onClick={() => dialog.current?.close()}
        >
          <Icon name="close" />
        </button>
        {selected && (
          <>
            <div className="lightbox-image">
              <Image
                unoptimized
                src={selected.fullSrc ?? selected.src}
                alt={selected.alt}
                fill
                sizes="90vw"
                style={{ objectFit: "contain" }}
              />
            </div>
            <p>{selected.alt}</p>
          </>
        )}
      </dialog>
    </div>
  );
}
