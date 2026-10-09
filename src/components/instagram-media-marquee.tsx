"use client";
import { useEffect, useId, useRef, useState } from "react";
import { InstagramMediaCard } from "./instagram-media-card";
import { InstagramMediaDialog } from "./instagram-media-dialog";
import { Icon } from "./icon";
import type { InstagramMediaItem } from "@/lib/instagram-policy";
export function InstagramMediaMarquee({
  items,
  title = "Nos aventures",
  subtitle = "Revivez quelques-uns de nos meilleurs moments.",
}: {
  items: InstagramMediaItem[];
  title?: string;
  subtitle?: string;
}) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null),
    group = useRef<HTMLDivElement>(null);
  const interaction = useRef({
    hover: false,
    focus: false,
    pointer: false,
    until: 0,
  });
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<InstagramMediaItem | null>(null);
  useEffect(() => {
    const el = viewport.current,
      first = group.current;
    if (!el || !first || items.length < 2) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false,
      frame = 0,
      last = 0,
      position = el.scrollLeft;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const tick = (time: number) => {
      frame = 0;
      const state = interaction.current;
      const width = first.getBoundingClientRect().width;
      if (
        last &&
        width > el.clientWidth &&
        !state.hover &&
        !state.focus &&
        !state.pointer &&
        Date.now() > state.until
      ) {
        if (Math.abs(el.scrollLeft - position) > 1) position = el.scrollLeft;
        position += Math.min(time - last, 50) * 0.022;
        if (position >= width) position %= width;
        el.scrollLeft = position;
      } else position = el.scrollLeft;
      last = time;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      stop();
      if (
        visible &&
        !document.hidden &&
        !motion.matches &&
        !paused &&
        !selected
      )
        frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    const release = () => {
      interaction.current.pointer = false;
      interaction.current.until = Date.now() + 1800;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [items.length, paused, selected]);
  const navigate = (direction: number) => {
    interaction.current.until = Date.now() + 3000;
    viewport.current?.scrollBy({
      left: direction * (viewport.current.clientWidth * 0.7),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <section className="instagram-section section" aria-labelledby={id}>
      <div className="container instagram-heading">
        <div>
          <p className="eyebrow">LES MOMENTS SAKADO</p>
          <h2 id={id}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {items.length > 1 && (
          <div
            className="instagram-controls"
            role="group"
            aria-label="Défilement des publications"
          >
            <button
              type="button"
              aria-label="Publications précédentes"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="instagram-pause"
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? "Reprendre" : "Pause"}
            </button>
            <button
              type="button"
              aria-label="Publications suivantes"
              onClick={() => navigate(1)}
            >
              →
            </button>
          </div>
        )}
      </div>
      {items.length ? (
        <div
          className="instagram-viewport"
          ref={viewport}
          role="region"
          aria-label="Publications Instagram Sakado"
          onMouseEnter={() => {
            interaction.current.hover = true;
          }}
          onMouseLeave={() => {
            interaction.current.hover = false;
          }}
          onFocusCapture={() => {
            interaction.current.focus = true;
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
              interaction.current.focus = false;
          }}
          onPointerDown={() => {
            interaction.current.pointer = true;
          }}
          onWheel={() => {
            interaction.current.until = Date.now() + 2200;
          }}
        >
          {[0, 1, 2].slice(0, items.length > 1 ? 3 : 1).map((copy) => (
            <div
              key={copy}
              ref={copy === 0 ? group : undefined}
              className={
                "instagram-track-group" + (copy ? " instagram-copy" : "")
              }
              aria-hidden={copy ? true : undefined}
            >
              {items.map((item) => (
                <InstagramMediaCard
                  key={item.id}
                  item={item}
                  duplicate={copy > 0}
                  onOpen={() => setSelected(item)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="container instagram-empty">
          Les moments de nos aventures seront partagés ici prochainement.
        </p>
      )}
      <div className="container instagram-footer">
        <a
          className="button"
          href="https://www.instagram.com/sakado_sfax/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Suivez-nous sur Instagram <Icon name="instagram" />
        </a>
        <a className="text-link" href="/gallery?view=instagram">
          Tous les moments <Icon />
        </a>
      </div>
      <InstagramMediaDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
