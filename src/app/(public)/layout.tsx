import { getSettings } from "@/lib/settings";
import { getSocialLinks } from "@/lib/content";
import { publicOrigin } from "@/lib/content-policy";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <>
      <SiteHeader name={s.name} logo={s.logoPath} demo={s.demo} />
      <main id="main">{children}</main>
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
    </>
  );
}
