import Image from "next/image";
import Link from "@/components/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { AdminForm, ActionButton } from "@/components/admin/form";
import { Field, Area, Select, Check, Hidden } from "@/components/admin/fields";
import { storedMediaAllowed } from "@/lib/media-mutation-guard";
export default async function Page() {
  await requireAdmin("gallery");
  const [photos, events, places] = await Promise.all([
    db.galleryImage.findMany({ orderBy: { order: "asc" } }),
    db.event.findMany({ select: { id: true, title: true } }),
    db.destination.findMany({ select: { id: true, name: true } }),
  ]);
  const availability = new Map(
    await Promise.all(
      photos.map(
        async (photo) =>
          [photo.id, await storedMediaAllowed(photo.src)] as const,
      ),
    ),
  );
  return (
    <>
      <AdminHeading
        title="La galerie"
        description="Les instants à partager, avec les droits d’utilisation confirmés."
      />
      <p>
        <Link className="text-link" href="/admin/media-readiness">
          Vérifier les droits MEDIA-04 →
        </Link>
        {" · "}
        <Link className="text-link" href="/admin/instagram">
          Gérer les publications Instagram →
        </Link>
      </p>
      <section className="admin-panel">
        <h2>Ajouter une photo</h2>
        <AdminForm
          endpoint="/api/admin/media"
          multipart
          submit="Téléverser la photo"
        >
          <div className="admin-fields">
            <label className="admin-field">
              Photo · JPEG, PNG ou WebP, 10 Mo maximum
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            <Field
              label="Description de la photo"
              name="alt"
              required
              minLength={2}
              maxLength={300}
            />
            <Check
              label="Sakado est autorisé à utiliser cette photo"
              name="authorized"
            />
          </div>
          <p className="muted">
            Sur mobile, choisissez une photo dans votre galerie ou utilisez
            l’appareil photo proposé par votre navigateur. L’envoi optimise
            l’image et retire ses métadonnées.
          </p>
        </AdminForm>
      </section>
      <div className="admin-media-grid">
        {photos.map((photo) => (
          <article className="admin-panel" key={photo.id}>
            {availability.get(photo.id) ? (
              <Image
                className="admin-photo"
                src={photo.src}
                alt={photo.alt}
                width={480}
                height={320}
                unoptimized
              />
            ) : (
              <p className="s-readiness-badge">
                Aperçu indisponible · publication bloquée. Consultez le registre
                des droits avant toute sélection.
              </p>
            )}
            <AdminForm endpoint="/api/admin/gallery">
              <Hidden name="id" value={photo.id} />
              <Field
                label="Description accessible"
                name="alt"
                value={photo.alt}
                required
              />
              <Area label="Légende" name="caption" value={photo.caption} />
              <Field
                label="Catégorie de galerie"
                name="category"
                value={photo.category}
              />
              <Select
                label="Sortie associée"
                name="eventId"
                value={photo.eventId}
                options={[
                  { value: "", label: "Aucune" },
                  ...events.map((e) => ({ value: e.id, label: e.title })),
                ]}
              />
              <Select
                label="Destination associée"
                name="destinationId"
                value={photo.destinationId}
                options={[
                  { value: "", label: "Aucune" },
                  ...places.map((d) => ({ value: d.id, label: d.name })),
                ]}
              />
              <Field
                label="Ordre"
                name="order"
                type="number"
                value={photo.order}
              />
              <Check
                label="Droits d’utilisation confirmés"
                name="authorized"
                checked={photo.authorized}
              />
              <Check
                label="Publier"
                name="published"
                checked={photo.published}
              />
              <Check
                label="Mettre en avant"
                name="featured"
                checked={photo.featured}
              />
            </AdminForm>
            <ActionButton
              endpoint="/api/admin/gallery"
              payload={{ id: photo.id, intent: "delete" }}
              label="Supprimer la photo"
              confirmMessage="Voulez-vous vraiment supprimer cette photo ?"
            />
          </article>
        ))}
      </div>
      {!photos.length && <p className="admin-empty">Aucune photo ajoutée.</p>}
    </>
  );
}
