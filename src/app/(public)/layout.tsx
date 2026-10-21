import { getSettings } from "@/lib/settings";
import { getSocialLinks } from "@/lib/content";
import { publicOrigin } from "@/lib/content-policy";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { clientAsset, getClientDemoAssets } from "@/lib/client-demo";
import { confirmedSite } from "@/data/confirmed/site";
import previewStyles from "@/components/client-demo/client-preview.module.css";
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
      <SiteHeader name={s.name} logo={s.logoPath} demo={s.demo} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter
        name={s.name}
        logo={s.logoPath}
        instagramUrl={s.instagramUrl}
        socialLinks={links}
        footerText={s.footerText}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
