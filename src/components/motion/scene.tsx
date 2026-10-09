"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { useMotionPreference } from "./preference";

/** Children may be server components; the controller only enhances their DOM. */
export function MotionScene({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const root = ref.current;
    if (!root || preference !== "on" || !window.matchMedia) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const start = async () => {
      try {
        const { mountScene, releaseUnusedEngine } =
          await import("@/lib/motion/runtime");
        if (disposed) {
          releaseUnusedEngine();
          return;
        }
        cleanup = mountScene(root);
        setReady(true);
      } catch {
        // Missing chunk/API leaves all server-rendered content visible.
        cleanup?.();
      }
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                observer?.disconnect();
                void start();
              }
            },
            { rootMargin: "300px" },
          );
    if (observer) observer.observe(root);
    else void start();
    return () => {
      disposed = true;
      observer?.disconnect();
      cleanup?.();
      setReady(false);
    };
  }, [preference]);
  return (
    <div
      {...props}
      ref={ref}
      className={`s-motion-scene ${className}`}
      data-motion-scene
      data-motion-state={ready && preference === "on" ? "ready" : "static"}
    >
      {children}
    </div>
  );
}
