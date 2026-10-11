"use client";
import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { can, type Permission, type Role } from "@/lib/permissions";
const items: [string, string, Permission][] = [
  ["Tableau de bord", "/admin", "dashboard"],
  ["Sorties", "/admin/events", "events"],
  ["Inscriptions", "/admin/registrations", "bookings"],
  ["Destinations", "/admin/destinations", "destinations"],
  ["Galerie", "/admin/gallery", "gallery"],
  ["Droits des photos", "/admin/media-readiness", "gallery"],
  ["Instagram", "/admin/instagram", "gallery"],
  ["Messages", "/admin/messages", "messages"],
  ["Le site", "/admin/site", "site"],
  ["Paramètres", "/admin/settings", "settings"],
  ["Utilisateurs", "/admin/users", "users"],
];
export function AdminNavigation({ role }: { role: Role }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={toggle}
        className="admin-menu-toggle"
        aria-expanded={open}
        aria-controls="admin-navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>
      <nav
        id="admin-navigation"
        className={"admin-navigation " + (open ? "is-open" : "")}
        aria-label="Administration"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        {items
          .filter((i) => can(role, i[2]))
          .map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                path === href || (href !== "/admin" && path.startsWith(href))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
      </nav>
      <nav className="admin-bottom-nav" aria-label="Raccourcis mobiles">
        <Link href="/admin">Accueil</Link>
        <Link href="/admin/events">Sorties</Link>
        {can(role, "bookings") && (
          <Link href="/admin/registrations">Inscrits</Link>
        )}
        <button
          aria-controls="admin-navigation"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            toggle.current?.focus();
          }}
        >
          Menu
        </button>
      </nav>
    </>
  );
}
