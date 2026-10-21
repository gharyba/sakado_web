import { getSettings } from "@/lib/settings";
import { PageIntro } from "@/components/page-intro";
import { ContactCTA } from "@/components/contact-cta";
import { pageMetadata } from "@/lib/metadata";
import { getClientDemoAssets } from "@/lib/client-demo";
import { ClientDemoDetail } from "@/components/client-demo/client-home";
import { CompanyTeam, CompanyTimeline } from "@/components/company/sections";
import { MotionToggle } from "@/components/motion/preference";
export const metadata = pageMetadata(
  "À propos",
  "Découvrez Sakado Sfax, camping, randonnée et aventures en pleine nature en Tunisie.",
  "/about",
);
export default async function AboutPage() {
  const assets = await getClientDemoAssets();
  if (assets) return <ClientDemoDetail assets={assets} section="about" />;
  const settings = await getSettings();
  return (
    <>
      <div className="container page-section">
        <PageIntro eyebrow="SAKADO SFAX" title="L’aventure commence ici." />
        <MotionToggle />
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
      <CompanyTimeline standalone />
      <CompanyTeam />
      <ContactCTA
        whatsappNumber={settings.whatsappNumber}
        title={settings.contactCtaTitle}
        text={settings.contactCtaText}
      />
    </>
  );
}
