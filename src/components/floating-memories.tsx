"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type TouchEvent,
} from "react";
import type { GalleryPhoto } from "@/lib/types";
import {
  orbitPose,
  orbitTransitionOffset,
  orbitWindow,
  photoOffset,
  wrapPhoto,
} from "@/lib/motion/photo-orbit";
import { useMotionPreference } from "./motion/preference";
import styles from "./floating-memories.module.css";

function title(photo: GalleryPhoto) {
  return photo.caption?.trim() || photo.alt.trim() || "Instant Sakado";
}

function subscribeViewport(notify: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia("(max-width: 699px)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const smallViewport = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(max-width: 699px)").matches;
const serverViewport = () => false;

function PhotoImage({
  photo,
  full = false,
  onResult,
}: {
  photo: GalleryPhoto;
  full?: boolean;
  onResult?: (id: string, failed: boolean) => void;
}) {
  const [failed, setFailed] = useState(false);
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const error = () => {
    if (!live.current) return;
    setFailed(true);
    onResult?.(photo.id, true);
  };
  return failed ? (
    <span className={styles.unavailable} role="status">
      <span aria-hidden="true">↗</span>
      Photo indisponible
      <small>{title(photo)}</small>
    </span>
  ) : (
    <Image
      unoptimized
      src={full ? (photo.fullSrc ?? photo.src) : photo.src}
      alt={photo.alt || title(photo)}
      fill
      sizes={full ? "92vw" : "(max-width: 699px) 78vw, 48vw"}
      loading="lazy"
      onError={error}
      onLoad={async (event) => {
        try {
          await event.currentTarget.decode();
          if (live.current) onResult?.(photo.id, false);
        } catch {
          error();
        }
      }}
    />
  );
}

type Rotation = { from: number; to: number; delta: number };

function PhotoOrbit({
  photos,
  compact,
}: {
  photos: GalleryPhoto[];
  compact: boolean;
}) {
  const count = photos.length;
  const [active, setActive] = useState(0);
  const [rotation, setRotation] = useState<Rotation | null>(null);
  const [viewer, setViewer] = useState<GalleryPhoto | null>(null);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const preference = useMotionPreference();
  const small = useSyncExternalStore(
    subscribeViewport,
    smallViewport,
    serverViewport,
  );
  const panelLimit = small ? 5 : 7;
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const locked = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const current = photos[active];
  const indices = [
    ...new Set([
      ...orbitWindow(count, active, panelLimit),
      ...(rotation ? orbitWindow(count, rotation.to, panelLimit) : []),
    ]),
  ];

  useEffect(() => {
    if (!rotation || !root.current) return;
    const scope = root.current;
    const panels = [
      ...scope.querySelectorAll<HTMLElement>("[data-orbit-panel]"),
    ];
    let disposed = false;
    let revert: (() => void) | undefined;
    const finish = () => {
      if (disposed) return;
      locked.current = false;
      setActive(rotation.to);
      setRotation(null);
    };
    if (preference !== "on") {
      finish();
      return;
    }
    void import("gsap")
      .then(({ gsap }) => {
        if (disposed) return;
        const small = window.matchMedia(
          "(max-width: 699px), (pointer: coarse)",
        ).matches;
        const phase = { value: 0 };
        const context = gsap.context(() => {
          gsap.to(phase, {
            value: rotation.delta,
            duration: small
              ? 0.48
              : Math.min(1.25, 0.82 + Math.abs(rotation.delta) * 0.1),
            ease: "power2.inOut",
            onUpdate: () => {
              // No layout reads or React updates in the animation frame.
              for (const panel of panels) {
                const offset =
                  orbitTransitionOffset(
                    Number(panel.dataset.orbitPanel),
                    rotation.from,
                    rotation.delta,
                    count,
                  ) - phase.value;
                const pose = orbitPose(offset, count, panelLimit);
                panel.style.transform = pose.transform;
                panel.style.opacity = String(pose.opacity);
              }
            },
            onComplete: finish,
          });
        }, scope);
        revert = () => context.revert();
      })
      .catch(finish);
    return () => {
      disposed = true;
      revert?.();
      // Reverting a proxy tween can invoke its update callback at the old phase.
      // Restore the committed destination after context cleanup, not that old phase.
      for (const panel of panels) {
        const pose = orbitPose(
          photoOffset(Number(panel.dataset.orbitPanel), rotation.to, count),
          count,
          panelLimit,
        );
        panel.style.transform = pose.transform;
        panel.style.opacity = String(pose.opacity);
      }
    };
  }, [rotation, preference, active, count, panelLimit]);

  const move = (delta: number) => {
    if (locked.current || count < 2 || !delta) return;
    const target = wrapPhoto(active + delta, count);
    if (target === active) return;
    if (preference !== "on") {
      setActive(target);
      return;
    }
    locked.current = true;
    setRotation({ from: active, to: target, delta });
  };
  const show = (element: HTMLElement) => {
    if (rotation || failed.has(current.id) || !dialog.current?.showModal)
      return false;
    opener.current = element;
    setViewer(current);
    dialog.current.showModal();
    return true;
  };
  const imageResult = (id: string, error: boolean) => {
    if (!error) return;
    setFailed((previous) => new Set(previous).add(id));
  };
  const swipe = (event: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    const end = event.changedTouches[0];
    if (!start || !end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4)
      move(dx < 0 ? 1 : -1);
  };

  return (
    <div
      ref={root}
      className={`${styles.root}${compact ? ` ${styles.compact}` : ""}`}
      data-floating-memories
      data-count={count}
      data-active-id={current.id}
      data-rotating={Boolean(rotation)}
      data-cinematic-motion={preference === "on" ? "on" : "static"}
    >
      <div
        role="region"
        aria-roledescription="carrousel"
        aria-label="Photographies des aventures Sakado"
        aria-busy={Boolean(rotation)}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || viewer) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <div
          className={styles.stage}
          data-orbit-stage
          onTouchStart={(event) => {
            const point = event.touches[0];
            touch.current = point
              ? { x: point.clientX, y: point.clientY }
              : null;
          }}
          onTouchEnd={swipe}
          onTouchCancel={() => {
            touch.current = null;
          }}
        >
          <div className={styles.rig} data-orbit-rig>
            {indices.map((index) => {
              const photo = photos[index];
              const offset = photoOffset(index, active, count);
              const pose = orbitPose(offset, count, panelLimit);
              const hidden =
                count > panelLimit && Math.abs(offset) >= (panelLimit + 1) / 2;
              return (
                <a
                  key={photo.id}
                  href={photo.fullSrc ?? photo.src}
                  className={styles.panel}
                  data-orbit-panel={index}
                  data-photo-id={photo.id}
                  data-active={index === active}
                  style={pose}
                  aria-hidden={hidden || undefined}
                  tabIndex={hidden ? -1 : 0}
                  aria-label={
                    index === active
                      ? `Agrandir la photo ${index + 1} : ${title(photo)}`
                      : `Sélectionner la photo ${index + 1} : ${title(photo)}`
                  }
                  aria-current={index === active ? "true" : undefined}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    if (index !== active) {
                      event.preventDefault();
                      move(photoOffset(index, active, count));
                    } else if (
                      failed.has(photo.id) ||
                      rotation ||
                      show(event.currentTarget)
                    )
                      event.preventDefault();
                  }}
                >
                  <PhotoImage photo={photo} onResult={imageResult} />
                  <span className={styles.panelNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
        <div className={styles.controls}>
          <div
            className={styles.description}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={styles.counter} data-photo-counter>
              {String(active + 1).padStart(2, "0")}{" "}
              <span>/ {String(count).padStart(2, "0")}</span>
            </span>
            <p>{title(current)}</p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={() => move(-1)}
              disabled={count < 2 || Boolean(rotation)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={() => move(1)}
              disabled={count < 2 || Boolean(rotation)}
            >
              →
            </button>
            <button
              type="button"
              ref={openButton}
              className={styles.open}
              onClick={(event) => show(event.currentTarget)}
              disabled={Boolean(rotation) || failed.has(current.id)}
              aria-haspopup="dialog"
            >
              Voir la photo <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
      <details className={styles.catalog}>
        <summary>Parcourir toutes les photos ({count})</summary>
        <ol>
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <a href={photo.fullSrc ?? photo.src}>
                {String(index + 1).padStart(2, "0")} — {title(photo)}
              </a>
            </li>
          ))}
        </ol>
      </details>
      <dialog
        ref={dialog}
        className={`lightbox ${styles.viewer}`}
        aria-label="Visionneuse d’images"
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            event.preventDefault();
            dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onClose={() => {
          setViewer(null);
          (opener.current?.isConnected
            ? opener.current
            : openButton.current
          )?.focus();
        }}
      >
        <button
          type="button"
          autoFocus
          className="lightbox-close"
          aria-label="Fermer l’image"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        {viewer && (
          <>
            <div className="lightbox-image">
              <PhotoImage key={viewer.id} photo={viewer} full />
            </div>
            <p>{title(viewer)}</p>
          </>
        )}
      </dialog>
    </div>
  );
}

export function FloatingMemories({
  photos,
  compact = false,
}: {
  photos: GalleryPhoto[];
  compact?: boolean;
}) {
  const [category, setCategory] = useState("Tout");
  const categories = [
    "Tout",
    ...new Set(
      photos
        .map((photo) => photo.category)
        .filter((item): item is string => Boolean(item)),
    ),
  ];
  const filtered = useMemo(
    () =>
      photos.filter(
        (photo) => category === "Tout" || photo.category === category,
      ),
    [photos, category],
  );
  if (!photos.length)
    return (
      <div className={styles.empty} data-gallery-empty>
        <span className={styles.eyebrow}>SAKADO · FLOATING MEMORIES</span>
        <p>Des instants vécus, des souvenirs à partager.</p>
        <p>
          Les photos des aventures seront partagées ici après validation par
          Sakado.
        </p>
      </div>
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
            type="button"
            key={item}
            className={category === item ? "active" : ""}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {filtered.length > 0 ? (
        <PhotoOrbit
          key={filtered.map((photo) => `${photo.id}:${photo.src}`).join("|")}
          photos={filtered}
          compact={compact}
        />
      ) : (
        <p className="empty-state">Aucune photo dans cette sélection.</p>
      )}
    </>
  );
}
