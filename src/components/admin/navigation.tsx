"use client";
import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { can, type Permission, type Role } from "@/lib/permissions";
const items: [string, string, Permission][] = [
  ["Tableau de bord", "/admin", "dashboard"],
  ["Sorties", "/admin/events", "events"],
  ["Inscriptions", "/admin/registrations", "bookings"],
  ["Destinations", "/admin/destinations", "destinations"],
  ["Galerie", "/admin/gallery", "gallery"],
  ["Instagram", "/admin/instagram", "gallery"],
  ["Messages", "/admin/messages", "messages"],
  ["Le site", "/admin/site", "site"],
  ["Paramètres", "/admin/settings", "settings"],
  ["Utilisateurs", "/admin/users", "users"],
];
export function AdminNavigation({ role }: { role: Role }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="admin-menu-toggle"
        aria-expanded={open}
        aria-controls="admin-navigation"
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>
      <nav
        id="admin-navigation"
        className={"admin-navigation " + (open ? "is-open" : "")}
        aria-label="Administration"
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
        <button onClick={() => setOpen(!open)}>Menu</button>
      </nav>
    </>
  );
}
