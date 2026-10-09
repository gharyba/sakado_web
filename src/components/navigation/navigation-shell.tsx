"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/link";
import { Container, ButtonLink } from "@/components/ui/foundation";
import { useMotionPreference } from "@/components/motion/preference";
import { MobileNavigation } from "@/components/mobile-navigation";
import {
  heroCoversNavigation,
  isCurrentNavigation,
  navigationAction,
  publicNavigation,
} from "@/lib/navigation";
import styles from "./navigation.module.css";

export function NavigationShell({ brand }: { brand: ReactNode }) {
  const pathname = usePathname();
  const preference = useMotionPreference();
  const header = useRef<HTMLElement>(null);
  const [heroPath, setHeroPath] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const element = header.current;
    const hero = document.querySelector<HTMLElement>(
      "#main > [data-navigation-hero]",
    );
    if (!element || !hero || pathname !== "/" || !window.IntersectionObserver)
      return;
    let intersection: IntersectionObserver;
    let measuredHeight = -1;
    const connect = () => {
      const height = element.getBoundingClientRect().height;
      if (height === measuredHeight) return;
      measuredHeight = height;
      intersection?.disconnect();
      intersection = new IntersectionObserver(
        () => {
          const bounds = hero.getBoundingClientRect();
          setHeroPath(
            heroCoversNavigation({
              pathname,
              contrast: hero.dataset.navigationHero,
              top: bounds.top,
              bottom: bounds.bottom,
              headerBottom: element.getBoundingClientRect().bottom,
            })
              ? pathname
              : null,
          );
        },
        { rootMargin: `-${height}px 0px 0px 0px`, threshold: 0 },
      );
      intersection.observe(hero);
    };
    connect();
    const resize = window.ResizeObserver ? new ResizeObserver(connect) : null;
    resize?.observe(element);
    return () => {
      intersection?.disconnect();
      resize?.disconnect();
    };
  }, [pathname]);

  return (
    <header
      ref={header}
      className={styles.header}
      data-navigation=""
      data-state={heroPath === pathname && !menuOpen ? "hero" : "surface"}
      data-overlay={pathname === "/"}
      data-navigation-motion={preference === "on" ? "enabled" : "off"}
    >
      <Container className={styles.inner}>
        <div className={styles.brand}>{brand}</div>
        <nav className={styles.desktop} aria-label="Navigation principale">
          {publicNavigation.slice(1).map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                isCurrentNavigation(pathname, href) ? "page" : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <ButtonLink href={navigationAction.href} className={styles.action}>
            {navigationAction.label}
          </ButtonLink>
          <MobileNavigation
            items={publicNavigation}
            enhanced={
              preference !== "pending" &&
              typeof HTMLDialogElement !== "undefined" &&
              typeof HTMLDialogElement.prototype.showModal === "function"
            }
            animate={preference === "on"}
            onOpenChange={setMenuOpen}
          />
        </div>
      </Container>
    </header>
  );
}
