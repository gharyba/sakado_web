import Link from "@/components/link";
import { Brand } from "./brand";
import { MotionScene } from "./motion/scene";
import { MotionToggle } from "./motion/preference";
import styles from "./site-footer.module.css";
import { DeveloperSignature } from "./developer-signature";
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
    <footer className={`site-footer s-company-footer ${styles.footer}`}>
      <MotionScene cinematic data-final-journey="footer">
        <div className={`container ${styles.statement}`}>
          <p className={styles.eyebrow}>PRENDRE L’AIR</p>
          <p data-journey-footer-copy>{footerText}</p>
        </div>
        <div className={`container ${styles.columns}`}>
          <div className={styles.identity}>
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
          <nav className={styles.links} aria-label="Explorer Sakado">
            <h2>Explorer</h2>
            <Link href="/events">Nos aventures</Link>
            <Link href="/destinations">Destinations</Link>
            <Link href="/gallery">Galerie</Link>
          </nav>
          <nav className={styles.links} aria-label="Sakado et ses réseaux">
            <h2>Restons en lien</h2>
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
          </nav>
        </div>
        <div className={`container ${styles.preference}`}>
          <MotionToggle label="Préférence de mouvement du site" />
        </div>
        <div className={`container footer-bottom ${styles.bottom}`}>
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <Link href="/privacy">Confidentialité</Link>
          <span>Une autre façon de prendre l’air.</span>
        </div>
        <DeveloperSignature />
      </MotionScene>
    </footer>
  );
}
