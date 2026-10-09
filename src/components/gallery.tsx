"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/types";
import { Icon } from "./icon";
export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  const [category, setCategory] = useState("Tout");
  const dialog = useRef<HTMLDialogElement>(null);
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
      <div className="gallery-grid">
        {photos
          .filter((photo) => category === "Tout" || photo.category === category)
          .map((photo) => (
            <button
              key={photo.id}
              className="gallery-photo"
              onClick={() => {
                setSelected(photo);
                dialog.current?.showModal();
              }}
              aria-label={`${photo.caption ?? photo.alt}${photo.demo ? " Illustration · Démo" : ""} — Agrandir : ${photo.alt}`}
            >
              <Image
                unoptimized
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
              />
              <span>
                {photo.caption ?? photo.alt}
                {photo.demo && <small>Illustration · Démo</small>}
              </span>
              <span className="gallery-plus" aria-hidden="true">
                +
              </span>
            </button>
          ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onClose={() => setSelected(null)}
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
                src={selected.src}
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
