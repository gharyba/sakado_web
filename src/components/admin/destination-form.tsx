import { db } from "@/lib/db";
import { AdminForm } from "./form";
import { Field, Area, Select, Check, Hidden, Block, options } from "./fields";
import { environmentLabels } from "@/lib/format";
export async function DestinationForm({ id }: { id?: string }) {
  const [d, photos] = await Promise.all([
    id ? db.destination.findUniqueOrThrow({ where: { id } }) : null,
    db.galleryImage.findMany({
      where: { authorized: true },
      orderBy: { order: "asc" },
    }),
  ]);
  return (
    <AdminForm endpoint="/api/admin/destinations">
      {id && <Hidden name="id" value={id} />}
      <Block title="La destination">
        <Field label="Nom" name="name" value={d?.name} required />
        <Field label="Lien" name="slug" value={d?.slug} required />
        <Field label="Région" name="region" value={d?.region} />
        <Area label="Description" name="description" value={d?.description} />
        <Select
          label="Environnement"
          name="environment"
          value={d?.environment}
          options={[
            { value: "", label: "À préciser" },
            ...options(environmentLabels),
          ]}
        />
        <Field label="Difficulté" name="difficulty" value={d?.difficulty} />
        <Select
          label="Photo de couverture"
          name="coverImage"
          value={d?.coverImage}
          options={[
            { value: "", label: "Aucune" },
            ...photos.map((p) => ({ value: p.src, label: p.alt })),
          ]}
        />
        <Check
          label="Publier cette destination"
          name="published"
          checked={d?.published}
        />
        <Check label="Mettre en avant" name="featured" checked={d?.featured} />
        <Check
          label="Archiver cette destination"
          name="archived"
          checked={d?.archived}
        />
      </Block>
      <p>Les photos associées se gèrent dans la galerie.</p>
    </AdminForm>
  );
}
