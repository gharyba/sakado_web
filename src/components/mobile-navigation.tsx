"use client";
import Link from "@/components/link";
import { useRef } from "react";
export function MobileNavigation({ items }: { items: string[][] }) {
  const details = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={details} className="mobile-nav">
      <summary aria-label="Menu — Ouvrir la navigation">
        <span className="menu-lines" /> Menu
      </summary>
      <nav aria-label="Navigation mobile">
        {items.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            onClick={() => {
              if (details.current) details.current.open = false;
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
