import Link from "@/components/link";
import { Brand } from "./brand";
export function SiteFooter({
  name,
  logo,
  instagramUrl,
  socialLinks,
  footerText,
  privatePreview = false,
  logoDimensions,
}: {
  footerText: string;
  privatePreview?: boolean;
  logoDimensions?: { width: number; height: number };
  name: string;
  logo: string | null;
  instagramUrl: string;
  socialLinks: { id: string; label: string; url: string }[];
}) {
  return (
    <footer className="site-footer s-company-footer">
      <div className="container footer-top">
        <div>
          <Brand
            name={name}
            logo={logo}
            privatePreview={privatePreview}
            logoDimensions={logoDimensions}
          />
          <p>
            Le grand air. Les belles rencontres.
            <br />
            L’aventure en Tunisie.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/events">Nos aventures</Link>
          <Link href="/destinations">Destinations</Link>
          <Link href="/gallery">Galerie</Link>
        </div>
        <div className="footer-links">
          <Link href="/about">À propos</Link>
          <Link href="/contact">Contact</Link>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            Instagram ↗
          </a>
          {socialLinks
            .filter((link) => link.url !== instagramUrl)
            .map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label} ↗
              </a>
            ))}
        </div>
        <div className="footer-note">
          <span className="eyebrow">PRENDRE L’AIR</span>
          <p>{footerText}</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <Link href="/privacy">Confidentialité</Link>
        <span>Une autre façon de prendre l’air.</span>
      </div>
    </footer>
  );
}
