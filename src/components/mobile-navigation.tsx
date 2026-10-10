"use client";
import Link from "@/components/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/foundation";
import {
  desktopNavigationQuery,
  isCurrentNavigation,
  navigationAction,
  type NavigationItem,
} from "@/lib/navigation";
import styles from "./navigation/navigation.module.css";

export function MobileNavigation({
  items,
  enhanced,
  animate,
  onOpenChange,
}: {
  items: readonly NavigationItem[];
  enhanced: boolean;
  animate: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const details = useRef<HTMLDetailsElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoreFocus = useRef(true);
  const unlock = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  function finishClose(restore = true) {
    clearTimer();
    restoreFocus.current = restore;
    dialog.current?.close?.();
  }
  function requestClose() {
    if (!dialog.current?.open || timer.current) return;
    if (!animate) return finishClose();
    dialog.current.dataset.closing = "true";
    timer.current = setTimeout(() => finishClose(), 160);
  }

  useEffect(() => {
    clearTimer();
    restoreFocus.current = false;
    dialog.current?.close?.();
    if (details.current) details.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia?.(desktopNavigationQuery);
    if (!query) return;
    const changed = () => {
      if (query.matches) {
        clearTimer();
        restoreFocus.current = false;
        dialog.current?.close?.();
        if (details.current) details.current.open = false;
      }
    };
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);

  useEffect(() => {
    if (!animate && dialog.current?.dataset.closing === "true") {
      clearTimer();
      dialog.current.close?.();
    }
  }, [animate]);

  useEffect(
    () => () => {
      clearTimer();
      unlock.current?.();
    },
    [],
  );

  const links = items.map(([label, href]) => (
    <Link
      key={href}
      href={href}
      aria-current={isCurrentNavigation(pathname, href) ? "page" : undefined}
      onNavigate={() => {
        finishClose(false);
        if (details.current) details.current.open = false;
      }}
    >
      {label}
    </Link>
  ));

  return (
    <div className={styles.mobile} data-enhanced={enhanced}>
      <details ref={details} className={styles.fallback}>
        <summary>
          <span aria-hidden="true" className={styles.menuIcon} />
          Menu
        </summary>
        <nav aria-label="Navigation mobile">{links}</nav>
      </details>
      <Button
        ref={toggle}
        variant="secondary"
        className={styles.toggle}
        aria-label="Ouvrir la navigation"
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={() => {
          const panel = dialog.current;
          if (!panel || panel.open) return;
          clearTimer();
          delete panel.dataset.closing;
          restoreFocus.current = true;
          const root = document.documentElement;
          const overflow = root.style.overflow;
          const padding = root.style.paddingRight;
          const scrollbar = window.innerWidth - root.clientWidth;
          if (scrollbar > 0) {
            root.style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + scrollbar}px`;
          }
          root.style.overflow = "hidden";
          unlock.current = () => {
            root.style.overflow = overflow;
            root.style.paddingRight = padding;
            unlock.current = null;
          };
          panel.showModal();
          closeButton.current?.focus({ preventScroll: true });
          setOpen(true);
          onOpenChange(true);
        }}
      >
        <span aria-hidden="true" className={styles.menuIcon} />
        Menu
      </Button>
      <dialog
        ref={dialog}
        id={id}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        data-navigation-motion={animate ? "enabled" : "off"}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex="0"]',
            ),
          ).filter((control) => control.getClientRects().length > 0);
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onClose={() => {
          clearTimer();
          unlock.current?.();
          if (dialog.current) delete dialog.current.dataset.closing;
          setOpen(false);
          onOpenChange(false);
          if (restoreFocus.current)
            toggle.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target !== dialog.current) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            requestClose();
        }}
      >
        <div className={styles.panelHeading}>
          <h2 id={`${id}-title`}>Navigation</h2>
          <Button
            ref={closeButton}
            variant="secondary"
            className={styles.close}
            onClick={requestClose}
          >
            Fermer <span aria-hidden="true">×</span>
          </Button>
        </div>
        <nav className={styles.panelLinks} aria-label="Navigation mobile">
          {links}
        </nav>
        <ButtonLink
          href={navigationAction.href}
          className={styles.panelAction}
          onNavigate={() => finishClose(false)}
        >
          {navigationAction.label}
        </ButtonLink>
      </dialog>
    </div>
  );
}
