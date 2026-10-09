import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { AdminForm } from "@/components/admin/form";
import { Field, Area, Select, Check, Block } from "@/components/admin/fields";
export default async function Page() {
  await requireAdmin("site");
  const [s, photos] = await Promise.all([
    getSettings(),
    db.galleryImage.findMany({ where: { authorized: true } }),
  ]);
  return (
    <>
      <AdminHeading
        title="Le site Sakado"
        description="Vos modifications sont visibles sur le site après enregistrement."
      />
      <AdminForm endpoint="/api/admin/site">
        <Block title="Les moments Instagram">
          <Field
            label="Titre de la section Instagram"
            name="instagramMediaTitle"
            value={s.instagramMediaTitle}
            required
            maxLength={200}
          />
          <Area
            label="Sous-titre Instagram"
            name="instagramMediaSubtitle"
            value={s.instagramMediaSubtitle}
          />
        </Block>
        <Block title="L’accueil">
          <Field
            label="Titre principal"
            name="heroTitle"
            value={s.heroTitle}
            required
          />
          <Area label="Sous-titre" name="tagline" value={s.tagline} />
          <Select
            label="Image d’accueil"
            name="heroImage"
            value={s.heroImage}
            options={[
              { value: "", label: "Illustration temporaire" },
              ...photos.map((p) => ({ value: p.src, label: p.alt })),
            ]}
          />
          <Check
            label="Afficher l’aperçu de la galerie"
            name="galleryPreview"
            checked={s.galleryPreview}
          />
        </Block>
        <Block title="L’histoire Sakado">
          <Area label="Présentation" name="about" value={s.about} />
          <Area label="Notre histoire" name="story" value={s.story} />
          <Area label="Notre mission" name="mission" value={s.mission} />
          <Area
            label="Nos valeurs · une par ligne"
            name="values"
            value={s.values.join("\n")}
          />
        </Block>
        <Block title="Invitation à nous contacter">
          <Field
            label="Titre"
            name="contactCtaTitle"
            value={s.contactCtaTitle}
          />
          <Area label="Texte" name="contactCtaText" value={s.contactCtaText} />
        </Block>
        <p className="muted">
          Les sorties et destinations mises en avant se sélectionnent dans leurs
          fiches. Les photos mises en avant se sélectionnent dans la galerie.
        </p>
      </AdminForm>
    </>
  );
}
