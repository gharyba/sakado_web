import { getSettings } from "@/lib/settings";
import { databaseConfigured } from "@/lib/db";
import { whatsappLink } from "@/lib/content-policy";
import { contactSubjects } from "@/lib/contact-validation";
import { ContactIntroduction } from "@/components/company/final-journey";
import styles from "@/components/company/final-journey.module.css";
import { getOfficialPresentation } from "@/lib/official-presentation";
import { MotionScene } from "@/components/motion/scene";
import { MotionToggle } from "@/components/motion/preference";
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
  const [settings, params, presentation] = await Promise.all([
    getSettings(),
    searchParams,
    getOfficialPresentation(),
  ]);
  const subject =
    typeof params.subject === "string" &&
    Object.hasOwn(contactSubjects, params.subject)
      ? params.subject
      : "general";
  const event =
    typeof params.event === "string" ? params.event.slice(0, 200) : "";
  const enabled = !settings.demo && databaseConfigured();
  const whatsapp = whatsappLink(settings.whatsappNumber);
  const photo =
    presentation?.gallery[0] ??
    (settings.heroImage
      ? { src: settings.heroImage, alt: `${settings.name} — plein air` }
      : undefined);
  const telephone = settings.phone?.replace(/[\s().-]/g, "");
  const validTelephone =
    telephone && /^\+?\d{3,15}$/.test(telephone) ? telephone : null;
  return (
    <div className={`container ${styles.page}`} data-contact-page>
      <ContactIntroduction photo={photo} />
      <div className={styles.preference}>
        <MotionToggle />
      </div>
      <MotionScene
        cinematic
        data-final-journey="form"
        className={styles.contactLayout}
        id="votre-message"
      >
        <div>
          <header className={styles.formHeader} data-journey-form-intro>
            <p className={styles.eyebrow}>UN MESSAGE, UN PREMIER PAS</p>
            <h2>Écrivez-nous</h2>
          </header>
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
        <aside
          className={styles.information}
          aria-labelledby="contact-information-heading"
        >
          <Icon name="compass" size={40} />
          <h2 id="contact-information-heading">Gardons le contact.</h2>
          <p data-journey-copy>
            Retrouvez les nouvelles de Sakado et posez vos questions via notre
            compte officiel.
          </p>
          <dl>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.instagramHandle} <Icon name="instagram" />
                </a>
              </dd>
            </div>
            {whatsapp && (
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    WhatsApp <Icon />
                  </a>
                </dd>
              </div>
            )}
            {settings.email && (
              <div>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </dd>
              </div>
            )}
            {settings.phone && (
              <div>
                <dt>Téléphone</dt>
                <dd>
                  {validTelephone ? (
                    <a href={`tel:${validTelephone}`}>{settings.phone}</a>
                  ) : (
                    settings.phone
                  )}
                </dd>
              </div>
            )}
            {settings.address && (
              <div>
                <dt>Adresse</dt>
                <dd>{settings.address}</dd>
              </div>
            )}
          </dl>
          <p className={styles.reservationNote}>
            Les demandes envoyées via ce formulaire ne constituent pas une
            réservation. Les modalités seront confirmées directement par Sakado.
          </p>
        </aside>
      </MotionScene>
    </div>
  );
}
