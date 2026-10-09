"use client";
import { useState } from "react";
import type { InstagramMediaItem } from "@/lib/instagram-policy";
import { InstagramMediaCard } from "./instagram-media-card";
import { InstagramMediaDialog } from "./instagram-media-dialog";
export function InstagramMediaGallery({
  items,
}: {
  items: InstagramMediaItem[];
}) {
  const [selected, setSelected] = useState<InstagramMediaItem | null>(null);
  const [filter, setFilter] = useState("Tout");
  const visible = items.filter(
    (item) =>
      filter === "Tout" ||
      (filter === "Photos"
        ? item.mediaType === "PHOTO"
        : ["VIDEO", "REEL"].includes(item.mediaType)),
  );
  return (
    <>
      <div
        className="gallery-filters"
        role="group"
        aria-label="Filtrer les publications Instagram"
      >
        {["Tout", "Photos", "Vidéos / Reels"].map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={filter === label}
            className={filter === label ? "active" : ""}
            onClick={() => setFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="instagram-grid">
        {visible.map((item) => (
          <InstagramMediaCard
            key={item.id}
            item={item}
            onOpen={() => setSelected(item)}
          />
        ))}
      </div>
      {!visible.length && (
        <p className="empty-state">Aucune publication dans cette sélection.</p>
      )}
      <InstagramMediaDialog item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
