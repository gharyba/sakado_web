"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/foundation";

const storageKey = "sakado-motion-disabled";
type Status = "pending" | "on" | "off" | "reduced" | "save-data" | "hidden";
const subscribers = new Set<() => void>();
let initialized = false;
let disabled = false;
let sessionOnly = false;
let reduced: MediaQueryList | undefined;
let connection: (EventTarget & { saveData?: boolean }) | undefined;

function readPreference() {
  try {
    disabled = localStorage.getItem(storageKey) === "true";
  } catch {
    /* Session preference still works when storage is blocked. */
  }
}
function emit() {
  subscribers.forEach((notify) => notify());
}
function storageChanged(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) {
    if (!sessionOnly) readPreference();
    emit();
  }
}
function subscribe(notify: () => void) {
  subscribers.add(notify);
  if (subscribers.size === 1) {
    if (!sessionOnly) readPreference();
    initialized = true;
    reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    reduced?.addEventListener("change", emit);
    connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    connection?.addEventListener?.("change", emit);
    document.addEventListener("visibilitychange", emit);
    window.addEventListener("storage", storageChanged);
  }
  return () => {
    subscribers.delete(notify);
    if (!subscribers.size) {
      reduced?.removeEventListener("change", emit);
      connection?.removeEventListener?.("change", emit);
      document.removeEventListener("visibilitychange", emit);
      window.removeEventListener("storage", storageChanged);
    }
  };
}
function snapshot(): Status {
  if (!initialized || typeof window === "undefined") return "pending";
  if (reduced?.matches) return "reduced";
  if (disabled) return "off";
  if (
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData
  )
    return "save-data";
  if (document.hidden) return "hidden";
  return "on";
}
const serverSnapshot = (): Status => "pending";
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
export function MotionToggle() {
  const status = useMotionPreference();
  return (
    <div className="s-stack">
      <Button
        variant="secondary"
        aria-pressed={status === "off"}
        disabled={
          status === "pending" || status === "reduced" || status === "save-data"
        }
        onClick={() => {
          disabled = !disabled;
          try {
            localStorage.setItem(storageKey, String(disabled));
          } catch {
            sessionOnly = true;
          }
          emit();
        }}
      >
        {status === "off"
          ? "Réactiver les animations"
          : "Désactiver les animations"}
      </Button>
      <p className="s-caption" role="status">
        {status === "reduced"
          ? "Présentation statique : préférence système respectée."
          : status === "save-data"
            ? "Présentation statique : économie de données."
            : status === "off"
              ? "Présentation statique : votre choix est mémorisé si possible."
              : "Animations facultatives. Le défilement reste naturel."}
      </p>
    </div>
  );
}
