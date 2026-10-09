"use client";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "./icon";
import type { InstagramMediaItem } from "@/lib/instagram-policy";
export function InstagramMediaCard({
  item,
  onOpen,
  duplicate = false,
}: {
  item: InstagramMediaItem;
  onOpen: () => void;
  duplicate?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const title = item.title || item.event?.title || "Un moment Sakado";
  return (
    <button
      className="instagram-card"
      type="button"
      onClick={onOpen}
      tabIndex={duplicate ? -1 : 0}
      aria-label={title + " — Voir la publication Instagram"}
    >
      {item.previewImage && !failed ? (
        <Image
          src={item.previewImage}
          alt={title}
          fill
          sizes="(max-width: 700px) 68vw, (max-width: 900px) 30vw, 20vw"
          loading="lazy"
          onError={() => setFailed(true)}
          unoptimized={item.previewImage.startsWith("/media/")}
        />
      ) : (
        <span className="instagram-card-fallback">
          <span>
            Les moments
            <br />
            Sakado
          </span>
          <small>Voir cette publication sur Instagram</small>
        </span>
      )}
      <span className="instagram-card-icon">
        <Icon name="instagram" size={18} />
      </span>
      {(item.mediaType === "VIDEO" || item.mediaType === "REEL") && (
        <span className="instagram-card-play" aria-label="Vidéo">
          ▶
        </span>
      )}
      <span className="instagram-card-caption">
        {title}
        <small>{item.destination?.name || "@sakado_sfax"}</small>
      </span>
    </button>
  );
}
