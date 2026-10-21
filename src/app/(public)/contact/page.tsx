import { getSettings } from "@/lib/settings";
import { databaseConfigured } from "@/lib/db";
import { whatsappLink } from "@/lib/content-policy";
import { contactSubjects } from "@/lib/contact-validation";
import { PageIntro } from "@/components/page-intro";
import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Contact",
  "Une question sur une aventure ? Contactez Sakado Sfax pour préparer votre prochaine expérience en pleine nature.",
  "/contact",
);
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; event?: string }>;
}) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const subject =
    typeof params.subject === "string" &&
    Object.hasOwn(contactSubjects, params.subject)
      ? params.subject
      : "general";
  const event =
    typeof params.event === "string" ? params.event.slice(0, 200) : "";
  const enabled = !settings.demo && databaseConfigured();
  const whatsapp = whatsappLink(settings.whatsappNumber);
  return (
    <div className="container page-section">
      <PageIntro
        eyebrow="ON EN PARLE ?"
        title="L’aventure commence par un bonjour."
      >
        <p>Une sortie, un groupe privé, une idée ? Échangeons.</p>
      </PageIntro>
      <div className="contact-layout">
        <div>
          <h2>Écrivez-nous</h2>
          {!enabled && (
            <p className="notice">
              Le formulaire sera activé prochainement. Retrouvez Sakado sur
              Instagram.
            </p>
          )}
          {settings.demo && (
            <p className="notice">
              Site en démonstration. N’envoyez pas de données personnelles
              réelles lors de vos essais.
            </p>
          )}
          <ContactForm enabled={enabled} subject={subject} event={event} />
        </div>
        <aside className="contact-aside">
          <Icon name="compass" size={40} />
          <h2>Gardons le contact.</h2>
          <p>
            Retrouvez les nouvelles de Sakado et posez vos questions via notre
            compte officiel.
          </p>
          <a
            className="button"
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {settings.instagramHandle} <Icon name="instagram" />
          </a>
          {whatsapp && (
            <a
              className="text-link"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp <Icon />
            </a>
          )}
          {settings.email && (
            <p>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </p>
          )}
          {settings.phone && <p>{settings.phone}</p>}
          {settings.address && <p>{settings.address}</p>}
          <hr />
          <p className="muted">
            Les demandes envoyées via ce formulaire ne constituent pas une
            réservation. Les modalités seront confirmées directement par Sakado.
          </p>
        </aside>
      </div>
    </div>
  );
}
