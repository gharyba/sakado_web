import Link from "@/components/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { dateLabel, priceLabel } from "@/lib/format";
import {
  lifecycle,
  lifecycleLabels,
  occupied,
  confirmed,
  registrationLabels,
} from "@/lib/event-policy";
import { AdminForm } from "@/components/admin/form";
import { Field, Area, Check, Hidden } from "@/components/admin/fields";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin("events");
  const p = await searchParams;
  const [all, categories] = await Promise.all([
    db.event.findMany({
      orderBy: { startsAt: "desc" },
      include: {
        bookings: { select: { status: true, participantCount: true } },
        destination: { select: { name: true } },
      },
    }),
    db.eventCategory.findMany({ orderBy: { order: "asc" } }),
  ]);
  const events = all.filter(
    (e) =>
      (!p.q || e.title.toLocaleLowerCase().includes(p.q.toLocaleLowerCase())) &&
      (!p.status || lifecycle(e) === p.status),
  );
  return (
    <>
      <AdminHeading
        title="Les sorties"
        description="Les aventures à venir, en préparation et les souvenirs à conserver."
      >
        <Link href="/admin/events/new" className="button">
          + Ajouter une sortie
        </Link>
      </AdminHeading>
      <form className="admin-filters">
        <input
          name="q"
          aria-label="Rechercher une sortie"
          placeholder="Rechercher une sortie…"
          defaultValue={p.q}
        />
        <select
          name="status"
          aria-label="Filtrer les sorties"
          defaultValue={p.status ?? ""}
        >
          <option value="">Toutes les sorties</option>
          {Object.entries(lifecycleLabels).map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="button">Filtrer</button>
      </form>
      <div className="admin-records">
        {events.map((e) => (
          <article className="admin-record" key={e.id}>
            <div>
              <span className="admin-badge">
                {lifecycleLabels[lifecycle(e)]}
              </span>
              <h2>
                <Link href={"/admin/events/" + e.id}>{e.title}</Link>
              </h2>
              <p>
                {e.destination?.name ?? e.location ?? "Lieu à préciser"} ·{" "}
                {dateLabel(e.startsAt?.toISOString() ?? null)}
              </p>
            </div>
            <div>
              <strong>
                {priceLabel(
                  e.price === null ? null : Number(e.price),
                  e.currency,
                )}
              </strong>
              <p>
                {occupied(e.bookings)} / {e.capacity ?? "—"} places ·{" "}
                {confirmed(e.bookings)} confirmés
              </p>
              <small>
                {registrationLabels[e.registrationStatus]} ·{" "}
                {e.published ? "Publiée" : "Non publiée"}
              </small>
            </div>
            <div className="admin-actions">
              <Link href={"/admin/events/" + e.id}>Voir</Link>
              <Link href={"/admin/events/" + e.id + "/edit"}>Modifier</Link>
            </div>
          </article>
        ))}
      </div>
      {!events.length && (
        <p className="admin-empty">Aucune sortie pour ces critères.</p>
      )}
      <details className="admin-panel">
        <summary>Gérer les catégories d’expériences</summary>
        {[...categories, null].map((c, index) => (
          <AdminForm
            key={c?.id ?? "new"}
            endpoint="/api/admin/categories"
            submit={c ? "Enregistrer la catégorie" : "Ajouter une catégorie"}
          >
            {c && <Hidden name="id" value={c.id} />}
            <div className="admin-fields">
              <Field label="Nom" name="name" value={c?.name} required />
              <Field label="Lien" name="slug" value={c?.slug} required />
              <Area
                label="Description"
                name="description"
                value={c?.description}
              />
              <Field
                label="Ordre"
                name="order"
                type="number"
                value={c?.order ?? index}
              />
              <Check
                label="Activer cette catégorie"
                name="enabled"
                checked={c?.enabled}
              />
            </div>
          </AdminForm>
        ))}
      </details>
    </>
  );
}
