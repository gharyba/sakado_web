import { getSettings } from "@/lib/settings";
import { PageIntro } from "@/components/page-intro";
import { ContactCTA } from "@/components/contact-cta";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "À propos",
  "Découvrez Sakado Sfax, camping, randonnée et aventures en pleine nature en Tunisie.",
  "/about",
);
export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <div className="container page-section">
        <PageIntro eyebrow="SAKADO SFAX" title="L’aventure commence ici." />
        <div className="prose">
          <p className="large-copy">{settings.about}</p>
          {settings.story ? (
            <section>
              <h2>Notre histoire</h2>
              <p className="preserve-lines">{settings.story}</p>
            </section>
          ) : (
            <p className="notice">
              L’histoire officielle de Sakado sera partagée après validation par
              son équipe.
            </p>
          )}
          {settings.mission && (
            <section>
              <h2>Notre mission</h2>
              <p>{settings.mission}</p>
            </section>
          )}
          {settings.values.length > 0 && (
            <section>
              <h2>Nos valeurs</h2>
              <ul>
                {settings.values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </section>
          )}
          {settings.sinceYear && <p>Depuis {settings.sinceYear}.</p>}
        </div>
      </div>
      <ContactCTA
        whatsappNumber={settings.whatsappNumber}
        title={settings.contactCtaTitle}
        text={settings.contactCtaText}
      />
    </>
  );
}
