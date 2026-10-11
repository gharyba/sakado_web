import { selectableMedia } from "@/lib/media-mutation-guard";
import Image from "next/image";
import Link from "@/components/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { AdminForm, ActionButton } from "@/components/admin/form";
import { Field, Area, Select, Check, Hidden } from "@/components/admin/fields";
import {
  mediaPage,
  MEDIA_PAGE_SIZE,
  mediaTypeLabels,
} from "@/lib/instagram-policy";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin("gallery");
  const page = mediaPage((await searchParams).page);
  const [items, count, events, places, photosRaw] = await Promise.all([
    db.instagramMedia.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      take: MEDIA_PAGE_SIZE,
      skip: (page - 1) * MEDIA_PAGE_SIZE,
    }),
    db.instagramMedia.count(),
    db.event.findMany({ select: { id: true, title: true } }),
    db.destination.findMany({ select: { id: true, name: true } }),
    db.galleryImage.findMany({
      where: { authorized: true },
      select: { src: true, alt: true, published: true },
    }),
  ]);

  const photos = await selectableMedia(photosRaw);
  const fields = (item?: (typeof items)[number]) => (
    <>
      <Field
        label="Lien Instagram"
        name="instagramUrl"
        type="url"
        value={item?.instagramUrl}
        required
        maxLength={500}
      />
      <Field
        label="Titre facultatif"
        name="title"
        value={item?.title}
        maxLength={200}
      />
      <Select
        label="Type de média"
        name="mediaType"
        value={item?.mediaType ?? "INSTAGRAM_MEDIA"}
        options={Object.entries(mediaTypeLabels).map(([value, label]) => ({
          value,
          label,
        }))}
      />
      <Select
        label="Aperçu · photo autorisée de la galerie"
        name="previewImage"
        value={item?.previewImage}
        options={[
          { value: "", label: "Carte Instagram sans photo" },
          ...photos.map((p) => ({
            value: p.src,
            label: p.alt + (p.published ? "" : " · photo non publiée"),
          })),
        ]}
      />
      <Select
        label="Sortie associée"
        name="eventId"
        value={item?.eventId}
        options={[
          { value: "", label: "Aucune" },
          ...events.map((e) => ({ value: e.id, label: e.title })),
        ]}
      />
      <Select
        label="Destination associée"
        name="destinationId"
        value={item?.destinationId}
        options={[
          { value: "", label: "Aucune" },
          ...places.map((p) => ({ value: p.id, label: p.name })),
        ]}
      />
      <Field
        label="Ordre"
        name="displayOrder"
        type="number"
        min={0}
        max={100000}
        value={item?.displayOrder ?? 0}
      />
      <Check
        label="Publier sur Sakado"
        name="published"
        checked={item?.published}
      />
      <Check
        label="Afficher sur l’accueil"
        name="showOnHomepage"
        checked={item?.showOnHomepage}
      />
      <Check label="Mettre en avant" name="featured" checked={item?.featured} />
    </>
  );
  return (
    <>
      <AdminHeading
        title="Les moments Instagram"
        description={
          count +
          " publication(s) dans la bibliothèque. L’accueil présente au maximum 16 publications choisies."
        }
      />
      <section className="admin-panel">
        <h2>Importer des liens</h2>
        <p>
          Un lien par ligne, 100 maximum. Les doublons sont ignorés. Les
          nouvelles publications restent privées jusqu’à votre validation.
        </p>
        <AdminForm endpoint="/api/admin/instagram" submit="Importer les liens">
          <Hidden name="intent" value="import" />
          <Area label="Liens Instagram" name="urls" rows={5} />
        </AdminForm>
      </section>
      <section className="admin-panel">
        <details>
          <summary>Ajouter une publication</summary>
          <AdminForm
            endpoint="/api/admin/instagram"
            submit="Ajouter la publication"
          >
            <div className="admin-fields">{fields()}</div>
          </AdminForm>
        </details>
      </section>
      <p className="muted">
        Téléversez les aperçus dans{" "}
        <Link className="text-link" href="/admin/gallery">
          la galerie
        </Link>
        . Une photo doit aussi être publiée pour être visible au public. Une
        association à une sortie ou destination privée masque la publication.
        Les titres de la section se modifient dans « Le site ».
      </p>
      <div className="admin-media-grid">
        {items.map((item) => (
          <article className="admin-panel" key={item.id}>
            {item.previewImage ? (
              <Image
                className="admin-photo"
                src={item.previewImage}
                alt={item.title || "Aperçu Instagram"}
                width={480}
                height={320}
                unoptimized
              />
            ) : (
              <div className="instagram-admin-placeholder">
                Instagram · Aperçu à choisir
              </div>
            )}
            <p>
              <a
                className="text-link"
                href={item.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Prévisualiser sur Instagram ↗
              </a>
            </p>
            <p>
              {item.published ? "Publié" : "Non publié"} ·{" "}
              {item.showOnHomepage ? "Accueil" : "Bibliothèque"}
            </p>
            <AdminForm endpoint="/api/admin/instagram">
              <Hidden name="id" value={item.id} />
              {fields(item)}
            </AdminForm>
            <ActionButton
              endpoint="/api/admin/instagram"
              payload={{ id: item.id, intent: "delete" }}
              label="Retirer de Sakado"
              confirmMessage="Retirer cette publication de Sakado ? Le contenu Instagram ne sera pas supprimé."
            />
          </article>
        ))}
      </div>
      {!items.length && (
        <p className="admin-empty">Aucune publication sur cette page.</p>
      )}
      <nav
        className="instagram-pagination"
        aria-label="Pages de la bibliothèque Instagram"
      >
        {page > 1 && (
          <Link
            className="text-link"
            href={"/admin/instagram?page=" + (page - 1)}
          >
            ← Précédent
          </Link>
        )}
        <span>
          Page {page} / {Math.max(1, Math.ceil(count / MEDIA_PAGE_SIZE))}
        </span>
        {page * MEDIA_PAGE_SIZE < count && (
          <Link
            className="text-link"
            href={"/admin/instagram?page=" + (page + 1)}
          >
            Suivant →
          </Link>
        )}
      </nav>
    </>
  );
}
