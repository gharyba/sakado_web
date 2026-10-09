import Link from "@/components/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/heading";
import { ActionButton } from "@/components/admin/form";
import {
  lifecycle,
  lifecycleLabels,
  occupied,
  confirmed,
  registrationLabels,
} from "@/lib/event-policy";
import { dateLabel, priceLabel } from "@/lib/format";
import { can } from "@/lib/permissions";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin("events");
  const { id } = await params;
  const e = await db.event.findUnique({
    where: { id },
    include: { bookings: { select: { status: true, participantCount: true } } },
  });
  if (!e) notFound();
  return (
    <>
      <AdminHeading
        title={e.title}
        description={
          lifecycleLabels[lifecycle(e)] +
          " · " +
          (e.published ? "Publiée" : "Non publiée")
        }
      >
        <Link className="button" href={"/admin/events/" + id + "/edit"}>
          Modifier
        </Link>
        {can(user.role, "bookings") && (
          <Link
            className="admin-button-secondary"
            href={"/admin/events/" + id + "/registrations"}
          >
            Voir les inscrits
          </Link>
        )}
      </AdminHeading>
      <section className="admin-panel">
        <div className="admin-stats">
          <div>
            <span>Places réservées</span>
            <strong>
              {occupied(e.bookings)} / {e.capacity ?? "—"}
            </strong>
          </div>
          <div>
            <span>Participants confirmés</span>
            <strong>{confirmed(e.bookings)}</strong>
          </div>
          <div>
            <span>Places restantes</span>
            <strong>
              {Math.max(0, (e.capacity ?? 0) - occupied(e.bookings))}
            </strong>
          </div>
        </div>
        <p>
          {dateLabel(e.startsAt?.toISOString() ?? null)} ·{" "}
          {priceLabel(e.price === null ? null : Number(e.price), e.currency)}
        </p>
        <p>{registrationLabels[e.registrationStatus]}</p>
        <p className="preserve-lines">{e.description}</p>
        {e.published && (
          <Link
            className="text-link"
            href={(process.env.SITE_URL ?? "") + "/events/" + e.slug}
            target="_blank"
          >
            Ouvrir la page publique ↗
          </Link>
        )}
      </section>
      <section className="admin-panel">
        <h2>Gérer cette sortie</h2>
        <div className="admin-actions">
          {[
            ["close", "Fermer les inscriptions"],
            ["unpublish", "Dépublier"],
            ["duplicate", "Dupliquer"],
            ["cancel", "Annuler la sortie"],
            ["archive", "Archiver"],
          ].map(([intent, label]) => (
            <ActionButton
              key={intent}
              endpoint="/api/admin/events"
              payload={{ id, intent }}
              label={label}
              confirmMessage={
                ["archive", "cancel"].includes(intent)
                  ? "Confirmer : " + label + " ?"
                  : undefined
              }
            />
          ))}
        </div>
        <p className="muted">
          Les demandes en attente réservent des places jusqu’à leur confirmation
          ou annulation. L’archivage conserve l’historique.
        </p>
      </section>
    </>
  );
}
