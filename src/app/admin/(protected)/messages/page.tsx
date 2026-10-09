import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { ActionButton } from "@/components/admin/form";
import { dateLabel } from "@/lib/format";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin("messages");
  const p = await searchParams;
  const rows = await db.contactMessage.findMany({
    where: {
      ...(p.status === "archived"
        ? { archived: true }
        : p.status === "all"
          ? {}
          : {
              archived: false,
              ...(p.status === "read"
                ? { read: true }
                : p.status === "unread"
                  ? { read: false }
                  : {}),
            }),
      ...(p.q
        ? {
            OR: [
              { name: { contains: p.q, mode: "insensitive" } },
              { email: { contains: p.q, mode: "insensitive" } },
              { message: { contains: p.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <AdminHeading
        title="Les messages"
        description="Les demandes envoyées depuis le site Sakado."
      />
      <form className="admin-filters">
        <input
          name="q"
          placeholder="Rechercher un message…"
          aria-label="Rechercher un message"
          defaultValue={p.q}
        />
        <select
          name="status"
          defaultValue={p.status ?? ""}
          aria-label="État des messages"
        >
          <option value="">Boîte de réception</option>
          <option value="unread">Non lus</option>
          <option value="read">Lus</option>
          <option value="archived">Archivés</option>
          <option value="all">Tous</option>
        </select>
        <button className="button">Filtrer</button>
      </form>
      {rows.map((m) => (
        <details className="admin-panel" key={m.id}>
          <summary>
            <span className="admin-badge">
              {m.archived ? "Archivé" : m.read ? "Lu" : "Non lu"}
            </span>{" "}
            {m.subject} · {m.name}
          </summary>
          <p>
            {m.email} {m.phone ? "· " + m.phone : ""} ·{" "}
            {dateLabel(m.createdAt.toISOString())}
          </p>
          <p className="preserve-lines">{m.message}</p>
          <div className="admin-actions">
            {[
              ["read", "Marquer lu"],
              ["unread", "Marquer non lu"],
              ["archive", "Archiver"],
              ["delete", "Supprimer"],
            ].map(([intent, label]) => (
              <ActionButton
                key={intent}
                endpoint="/api/admin/messages"
                payload={{ id: m.id, intent }}
                label={label}
                confirmMessage={
                  intent === "delete"
                    ? "Voulez-vous vraiment supprimer ce message ?"
                    : undefined
                }
              />
            ))}
          </div>
        </details>
      ))}
      {!rows.length && <p className="admin-empty">Aucun nouveau message.</p>}
    </>
  );
}
