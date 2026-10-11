import { selectableMedia } from "@/lib/media-mutation-guard";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { AdminHeading } from "@/components/admin/heading";
import { AdminForm } from "@/components/admin/form";
import { Field, Area, Select, Block, Hidden } from "@/components/admin/fields";
import { SocialEditor } from "@/components/admin/social-editor";
export default async function Page() {
  await requireAdmin("settings");
  const [s, photosRaw, links] = await Promise.all([
    getSettings(),
    db.galleryImage.findMany({ where: { authorized: true } }),
    db.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  const photos = await selectableMedia(photosRaw);
  return (
    <>
      <AdminHeading
        title="Les paramètres"
        description="Les informations officielles de Sakado. Ne renseignez que des informations confirmées."
      />
      <AdminForm endpoint="/api/admin/settings">
        <Block title="L’identité">
          <Field
            name="name"
            label="Nom de l’entreprise"
            value={s.name}
            required
          />
          <Select
            name="logoPath"
            label="Logo"
            value={s.logoPath}
            options={[
              { value: "", label: "Nom typographique temporaire" },
              ...photos.map((p) => ({ value: p.src, label: p.alt })),
            ]}
          />
          <Area
            name="footerText"
            label="Texte du pied de page"
            value={s.footerText}
          />
        </Block>
        <Block title="Le contact">
          <Field name="email" label="E-mail" type="email" value={s.email} />
          <Field name="phone" label="Téléphone" type="tel" value={s.phone} />
          <Field
            name="whatsappNumber"
            label="WhatsApp · format international"
            value={s.whatsappNumber}
          />
          <Area name="address" label="Adresse" value={s.address} />
        </Block>
        <Block title="Instagram et communauté">
          <Field
            name="instagramUrl"
            label="Lien Instagram officiel"
            type="url"
            value={s.instagramUrl}
            required
          />
          <Field
            name="instagramHandle"
            label="Nom du compte Instagram"
            value={s.instagramHandle}
          />
          <Field
            name="instagramFollowersLabel"
            label="Abonnés · libellé confirmé"
            value={s.instagramFollowersLabel}
          />
          <Field
            name="instagramPostsLabel"
            label="Publications · libellé confirmé"
            value={s.instagramPostsLabel}
          />
          <Field
            name="communityMembersLabel"
            label="Communauté · libellé confirmé"
            value={s.communityMembersLabel}
          />
        </Block>
        <Hidden name="facebookUrl" value="" />
        <SocialEditor
          initial={links.map(({ label, url, enabled }) => ({
            label,
            url,
            enabled,
          }))}
        />
      </AdminForm>
    </>
  );
}
