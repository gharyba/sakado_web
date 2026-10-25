"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/types";
import { Icon } from "./icon";
import { useMotionPreference } from "./motion/preference";
import { Motion } from "./motion/motion";
import { FloatingMemories } from "./floating-memories";
export function Gallery({
  photos,
  cinematic = false,
  revealPreview = false,
}: {
  photos: GalleryPhoto[];
  cinematic?: boolean;
  revealPreview?: boolean;
}) {
  // The legacy demo illustrations retain their established Phase 04 readiness checks.
  if (cinematic && !photos.some((photo) => photo.demo))
    return <FloatingMemories photos={photos} compact={revealPreview} />;
  return (
    <LegacyGallery
      photos={photos}
      cinematic={cinematic}
      revealPreview={revealPreview}
    />
  );
}
function LegacyGallery({
  photos,
  cinematic = false,
  revealPreview = false,
}: {
  photos: GalleryPhoto[];
  cinematic?: boolean;
  /** Private preview only: viewport entrances limited to three concurrent images. */
  revealPreview?: boolean;
}) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  const [category, setCategory] = useState("Tout");
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement>(null);
  const preference = useMotionPreference();
  const categories = [
    "Tout",
    ...new Set(
      photos
        .map((photo) => photo.category)
        .filter((v): v is string => Boolean(v)),
    ),
  ];
  if (!photos.length)
    return (
      <p className="empty-state">
        Les photos des aventures seront partagées ici après validation par
        Sakado.
      </p>
    );
  return (
    <>
      <div
        className="gallery-filters"
        role="group"
        aria-label="Filtrer la galerie"
      >
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        className={`gallery-grid${cinematic ? " s-cinematic-gallery" : ""}`}
        data-cinematic-motion={preference === "on" ? "on" : "static"}
      >
        {photos
          .filter((photo) => category === "Tout" || photo.category === category)
          .map((photo, index) => (
            <a
              key={photo.id}
              className="gallery-photo"
              href={photo.fullSrc ?? photo.src}
              style={
                photo.width && photo.height
                  ? { aspectRatio: `${photo.width} / ${photo.height}` }
                  : undefined
              }
              onClick={(event) => {
                if (
                  !dialog.current?.showModal ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                opener.current = event.currentTarget;
                setSelected(photo);
                dialog.current?.showModal();
              }}
              aria-label={`${photo.caption ?? photo.alt}${photo.demo ? " Illustration · Démo" : ""} — Agrandir : ${photo.alt}`}
            >
              <div className="s-gallery-visual" aria-hidden="true">
                {revealPreview ? (
                  // CSS owns card depth; the separate inner target owns its entrance.
                  <Motion
                    effect="foreground"
                    distance={
                      index === 0
                        ? 12
                        : index === 4
                          ? -10
                          : index === 8
                            ? 8
                            : index === 10
                              ? -6
                              : 0
                    }
                    aria-hidden="true"
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <Motion
                      effect="image"
                      choreography="scene"
                      data-motion-group="gallery"
                      delay={(index % 3) * 0.06}
                      distance={8}
                      initialOpacity={0.75}
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <Image
                        unoptimized
                        src={photo.src}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 100vw, 33vw"
                      />
                    </Motion>
                  </Motion>
                ) : (
                  <Image
                    unoptimized
                    src={photo.src}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 100vw, 33vw"
                  />
                )}
              </div>
              <span>
                {photo.caption ?? photo.alt}
                {photo.demo && <small>Illustration · Démo</small>}
              </span>
              <span className="gallery-plus" aria-hidden="true">
                +
              </span>
            </a>
          ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onClose={() => {
          setSelected(null);
          opener.current?.focus();
        }}
        aria-label="Visionneuse d’images"
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
            <p>
              {selected.caption ?? selected.alt}
              {selected.demo ? " · Illustration de démonstration" : ""}
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
