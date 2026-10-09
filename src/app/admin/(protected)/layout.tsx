import { requireAdmin } from "@/lib/auth";
import { AdminNavigation } from "@/components/admin/navigation";
import { logoutAdmin } from "../actions";
import { getSettings } from "@/lib/settings";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const settings = await getSettings();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin">
          {settings.name}
          <small>ADMINISTRATION</small>
        </a>
        <AdminNavigation role={user.role} />
        <a
          className="admin-view-site"
          href={process.env.SITE_URL || "/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir le site ↗
        </a>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>Le grand air se prépare ici.</span>
          <div>
            <span>
              {user.name} <small>{user.role}</small>
            </span>
            <form action={logoutAdmin}>
              <button type="submit">Déconnexion</button>
            </form>
          </div>
        </header>
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
