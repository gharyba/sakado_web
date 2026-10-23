import { getSettings } from "@/lib/settings";
import { getSocialLinks } from "@/lib/content";
import { publicOrigin } from "@/lib/content-policy";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { clientAsset, getClientDemoAssets } from "@/lib/client-demo";
import { confirmedSite } from "@/data/confirmed/site";
import previewStyles from "@/components/client-demo/client-preview.module.css";
import { getOfficialPresentation } from "@/lib/official-presentation";
import "@/styles/forest-environment.css";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preview = await getClientDemoAssets();
  if (preview) {
    const logo = clientAsset(preview, "logo").src;
    return (
      <div className={previewStyles.layout}>
        <SiteHeader
          name={confirmedSite.name}
          logo={logo}
          demo={false}
          privatePreview
        />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter
          name={confirmedSite.name}
          logo={logo}
          instagramUrl={confirmedSite.instagramUrl}
          socialLinks={[]}
          footerText={confirmedSite.footerText}
          privatePreview
        />
        <p className="s-client-preview-label">Aperçu client · local</p>
      </div>
    );
  }
  const [s, links] = await Promise.all([getSettings(), getSocialLinks()]);
  const presentation = await getOfficialPresentation();
  const logo = presentation?.logo?.src ?? s.logoPath;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.name,
    description: s.tagline,
    ...(publicOrigin() ? { url: publicOrigin() } : {}),
    sameAs: [s.instagramUrl],
  };
  return (
    <div className="s-company-site">
      <SiteHeader
        name={s.name}
        logo={logo}
        demo={s.demo}
        logoDimensions={presentation?.logo ?? undefined}
      />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter
        name={s.name}
        logo={logo}
        logoDimensions={presentation?.logo ?? undefined}
        instagramUrl={s.instagramUrl}
        socialLinks={links}
        footerText={s.footerText}
      />
      {presentation && (
        <p className="container notice" data-official-presentation>
          Revue privée locale du site officiel · PostgreSQL actif · images non
          autorisées à la publication.{" "}
          <a href="/dev/presentation">Accès à la présentation</a>
        </p>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
