"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/components/motion/preference";
import styles from "./shape-grid.module.css";

const MAX_PIXELS = 1_000_000;
const TRAIL_MS = 650;
type Cell = { x: number; y: number; strength: number; at: number };

/** Square-cell illumination adapted from the supplied React Bits ShapeGrid.
 * CSS owns the static grid; canvas paints only a short, local pointer trail.
 * No drift, intro, click cascade, glow, tilt or continuous idle animation.
 */
function mountGrid(host: HTMLDivElement, canvas: HTMLCanvasElement) {
  const section = host.parentElement;
  const drawing = canvas.getContext("2d");
  if (!section || !drawing) return;
  const context = drawing;
  const cells = new Map<string, Cell>();
  let alive = true;
  let visible = false;
  let frame = 0;
  let lastDraw = 0;
  let ratio = 1;
  let size = 48;
  let accent = "";

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = 0;
    cells.clear();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    host.dataset.shapeGridState = "idle";
  }

  function resize() {
    clear();
    if (!visible) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    ratio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(MAX_PIXELS / (width * height)),
    );
    // Flooring both dimensions keeps the allocation strictly within the cap.
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    const style = getComputedStyle(host);
    size = parseFloat(style.backgroundSize) || 48;
    accent = style.getPropertyValue("--s-shape-grid-accent").trim();
  }

  function draw(now: number) {
    frame = 0;
    if (!alive || !visible) return;
    // At most 30 paints/second, only while the finite trail is fading.
    if (now - lastDraw >= 1000 / 30) {
      lastDraw = now;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = accent;
      context.strokeStyle = accent;
      context.lineWidth = 1;
      for (const [key, cell] of cells) {
        const remaining = 1 - (now - cell.at) / TRAIL_MS;
        if (remaining <= 0) {
          cells.delete(key);
          continue;
        }
        const opacity = cell.strength * remaining * remaining;
        context.globalAlpha = opacity * 0.14;
        context.fillRect(cell.x + 1, cell.y + 1, size - 1, size - 1);
        context.globalAlpha = opacity * 0.45;
        context.strokeRect(cell.x + 0.5, cell.y + 0.5, size, size);
      }
      context.globalAlpha = 1;
    }
    if (cells.size) frame = requestAnimationFrame(draw);
    else host.dataset.shapeGridState = "idle";
  }

  function move(event: PointerEvent) {
    if (!visible || !alive || event.pointerType !== "mouse") return;
    // The decoration never reacts to a control, selection or touch gesture.
    if (
      event.buttons ||
      (event.target instanceof Element &&
        event.target.closest(
          "a, button, input, select, textarea, [contenteditable], [role='button']",
        ))
    )
      return;
    const rect = host.getBoundingClientRect();
    const column = Math.floor((event.clientX - rect.left) / size);
    const row = Math.floor((event.clientY - rect.top) / size);
    const now = performance.now();
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${column + dx}:${row + dy}`;
        // A small bounded neighborhood, rather than scanning the whole canvas.
        cells.delete(key);
        cells.set(key, {
          x: (column + dx) * size,
          y: (row + dy) * size,
          strength: dx === 0 && dy === 0 ? 1 : 0.25,
          at: now,
        });
      }
    }
    while (cells.size > 36) cells.delete(cells.keys().next().value!);
    host.dataset.shapeGridState = "active";
    if (!frame) frame = requestAnimationFrame(draw);
  }

  const intersection = new IntersectionObserver(([entry]) => {
    if (!alive) return;
    visible = entry.isIntersecting;
    resize();
  });
  const dimensions = new ResizeObserver(() => {
    if (alive) resize();
  });
  intersection.observe(host);
  dimensions.observe(host);
  section.addEventListener("pointermove", move, { passive: true });
  section.addEventListener("pointerleave", clear, { passive: true });
  host.dataset.shapeGridState = "idle";

  return () => {
    alive = false;
    clear();
    intersection.disconnect();
    dimensions.disconnect();
    section.removeEventListener("pointermove", move);
    section.removeEventListener("pointerleave", clear);
    // Release the backing store on preference changes and route teardown.
    canvas.width = 1;
    canvas.height = 1;
    host.dataset.shapeGridState = "static";
  };
}

export function ShapeGrid() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const preference = useMotionPreference();

  useEffect(() => {
    if (
      preference !== "on" ||
      !host.current ||
      !canvas.current ||
      !window.matchMedia ||
      !window.IntersectionObserver ||
      !window.ResizeObserver
    )
      return;
    const media = window.matchMedia(
      "(min-width: 900px) and (hover: hover) and (pointer: fine)",
    );
    const element = host.current;
    const surface = canvas.current;
    let dispose: (() => void) | undefined;
    const update = () => {
      dispose?.();
      dispose = media.matches ? mountGrid(element, surface) : undefined;
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      dispose?.();
    };
  }, [preference]);

  return (
    <div
      ref={host}
      className={`s-preview-shape-grid ${styles.texture}`}
      data-shape-grid-state="static"
      aria-hidden="true"
    >
      <canvas ref={canvas} width={1} height={1} aria-hidden="true" />
    </div>
  );
}
