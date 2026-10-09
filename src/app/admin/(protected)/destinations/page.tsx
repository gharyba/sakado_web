import Link from "@/components/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
export default async function Page() {
  await requireAdmin("destinations");
  const rows = await db.destination.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <AdminHeading
        title="Les destinations"
        description="Votre catalogue de lieux et d’horizons."
      >
        <Link className="button" href="/admin/destinations/new">
          + Ajouter une destination
        </Link>
      </AdminHeading>
      <div className="admin-records">
        {rows.map((d) => (
          <article className="admin-record" key={d.id}>
            <div>
              <span className="admin-badge">
                {d.archived
                  ? "Archivée"
                  : d.published
                    ? "Publiée"
                    : "Brouillon"}
              </span>
              <h2>{d.name}</h2>
              <p>{d.region ?? "Région à préciser"}</p>
            </div>
            <Link
              className="admin-button-secondary"
              href={"/admin/destinations/" + d.id}
            >
              Modifier
            </Link>
          </article>
        ))}
      </div>
      {!rows.length && (
        <p className="admin-empty">Aucune destination ajoutée.</p>
      )}
    </>
  );
}
