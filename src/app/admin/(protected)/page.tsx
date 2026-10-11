import Link from "@/components/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { lifecycle, occupied, confirmed } from "@/lib/event-policy";
import { AdminHeading } from "@/components/admin/heading";
import { dateLabel } from "@/lib/format";
import { can } from "@/lib/permissions";
import { getMediaRegistry } from "@/lib/media-readiness";
import { eligibleForPublication } from "@/lib/media-readiness-policy";
export default async function Dashboard() {
  const user = await requireAdmin();
  const events = await db.event.findMany({
    include: { bookings: { select: { status: true, participantCount: true } } },
    orderBy: { startsAt: "asc" },
  });
  const upcoming = events.filter((e) => lifecycle(e) === "UPCOMING");
  const [unread, recent] = await Promise.all([
    can(user.role, "messages")
      ? db.contactMessage.count({ where: { read: false, archived: false } })
      : 0,
    db.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
  ]);
  const registry = await getMediaRegistry();
  const blocked = registry.valid
    ? registry.assets.filter(
        (a) => !eligibleForPublication(a, registry.globalCleared),
      ).length
    : "Registre indisponible";
  const labels: Record<string, string> = {
    EVENT_CREATED: "Une sortie a été créée",
    EVENT_UPDATED: "Une sortie a été modifiée",
    BOOKING_CREATED: "Une demande d’inscription a été reçue",
    BOOKING_CONFIRMED: "Une inscription a été confirmée",
    GALLERY_UPLOADED: "Une photo a été ajoutée",
    SETTINGS_UPDATED: "Les paramètres ont été modifiés",
    SITE_UPDATED: "Le site a été mis à jour",
    EVENT_ARCHIVE: "Une sortie a été archivée",
    EVENT_CANCEL: "Une sortie a été annulée",
  };
  return (
    <>
      <AdminHeading
        title={"Bonjour, " + user.name.split(" ")[0] + "."}
        description="Un regard sur les aventures qui se préparent."
      >
        <Link className="button" href="/admin/events/new">
          + Ajouter une sortie
        </Link>
      </AdminHeading>
      <div className="admin-stats">
        {[
          ["Prochaines sorties", upcoming.length],
          [
            "Total inscrits",
            events.reduce((n, e) => n + confirmed(e.bookings), 0),
          ],
          [
            "Inscriptions en attente",
            can(user.role, "bookings")
              ? events.reduce(
                  (n, e) =>
                    n + e.bookings.filter((b) => b.status === "PENDING").length,
                  0,
                )
              : "Accès restreint",
          ],
          [
            "Places disponibles",
            upcoming.reduce(
              (n, e) =>
                n + Math.max(0, (e.capacity ?? 0) - occupied(e.bookings)),
              0,
            ),
          ],
          ["Messages non lus", can(user.role, "messages") ? unread : "—"],
          [
            "Sorties terminées",
            events.filter((e) => lifecycle(e) === "COMPLETED").length,
          ],
          [
            "Sorties non publiées",
            events.filter((e) => !e.published && e.status !== "ARCHIVED")
              .length,
          ],
          [
            "Complètes / dernières places",
            upcoming.filter(
              (e) =>
                ["FULL", "FEW_PLACES"].includes(e.registrationStatus) ||
                (e.capacity !== null && occupied(e.bookings) >= e.capacity),
            ).length,
          ],
          ["Photos BLOCKED", blocked],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-quick">
        <Link href="/admin/gallery">+ Ajouter des photos</Link>
        {can(user.role, "destinations") && (
          <Link href="/admin/destinations/new">+ Ajouter une destination</Link>
        )}
        {can(user.role, "bookings") && (
          <Link href="/admin/registrations">Voir les inscrits</Link>
        )}
        <Link href="/admin/site">Modifier le site</Link>
        <Link href="/admin/media-readiness">Revoir les photos BLOCKED</Link>
      </div>
      <section className="admin-panel">
        <div className="admin-section-title">
          <h2>Prochaines sorties</h2>
          <Link href="/admin/events">Tout voir →</Link>
        </div>
        {!upcoming.length ? (
          <p className="admin-empty">Aucune sortie à venir.</p>
        ) : (
          <div className="admin-event-grid">
            {upcoming.slice(0, 6).map((e) => (
              <article className="admin-event-card" key={e.id}>
                <span className="admin-badge">
                  {e.published ? "Publiée" : "Non publiée"}
                </span>
                <h3>{e.title}</h3>
                <p>{dateLabel(e.startsAt?.toISOString() ?? null)}</p>
                <div className="admin-capacity">
                  <strong>
                    {occupied(e.bookings)} / {e.capacity ?? "—"}
                  </strong>
                  <span>places réservées</span>
                </div>
                <p>
                  {confirmed(e.bookings)} confirmés ·{" "}
                  {Math.max(0, (e.capacity ?? 0) - occupied(e.bookings))} places
                  restantes
                </p>
                <div className="admin-actions">
                  <Link href={"/admin/events/" + e.id}>Voir</Link>
                  <Link href={"/admin/events/" + e.id + "/edit"}>Modifier</Link>
                  {can(user.role, "bookings") && (
                    <Link href={"/admin/events/" + e.id + "/registrations"}>
                      Voir les inscrits
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="admin-panel">
        <h2>Dernière activité</h2>
        {recent.length ? (
          <ul className="admin-activity">
            {recent.map((item) => (
              <li key={item.id}>
                <span>
                  {labels[item.action] ?? "Une mise à jour a été enregistrée"}
                </span>
                <time>{dateLabel(item.createdAt.toISOString())}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-empty">
            L’activité de votre équipe apparaîtra ici.
          </p>
        )}
      </section>
    </>
  );
}
