"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "@/components/link";
import { Icon } from "./icon";
import type { InstagramMediaItem } from "@/lib/instagram-policy";
export function InstagramMediaDialog({
  item,
  onClose,
}: {
  item: InstagramMediaItem | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!item) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const el = dialog.current;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (el?.open) el.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [item]);
  return (
    <dialog
      ref={dialog}
      className="instagram-dialog"
      aria-labelledby="instagram-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close();
      }}
    >
      <button
        autoFocus
        type="button"
        className="instagram-dialog-close"
        aria-label="Fermer la publication"
        onClick={() => dialog.current?.close()}
      >
        <Icon name="close" />
      </button>
      {item && (
        <div className="instagram-dialog-content">
          <p className="eyebrow">LES MOMENTS SAKADO</p>
          <h2 id="instagram-dialog-title">
            {item.title || item.event?.title || "Une aventure à revivre"}
          </h2>
          {item.previewImage && (
            <div className="instagram-dialog-image">
              <Image
                src={item.previewImage}
                alt={item.title || "Un moment Sakado"}
                fill
                sizes="(max-width:700px) 85vw, 480px"
                unoptimized={item.previewImage.startsWith("/media/")}
              />
            </div>
          )}
          {item.event && (
            <Link className="text-link" href={"/events/" + item.event.slug}>
              {item.event.title} <Icon />
            </Link>
          )}
          {item.destination && (
            <Link
              className="text-link"
              href={"/destinations/" + item.destination.slug}
            >
              {item.destination.name} <Icon name="pin" />
            </Link>
          )}
          <p>
            Retrouvez cette publication sur Instagram. Si elle est privée ou
            indisponible, les autres aventures restent accessibles dans la
            galerie Sakado.
          </p>
          <a
            className="button"
            href={item.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir sur Instagram <Icon name="instagram" />
          </a>
        </div>
      )}
    </dialog>
  );
}
