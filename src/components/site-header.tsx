import Link from "@/components/link";
import { Brand } from "./brand";
import { Icon } from "./icon";
import { MobileNavigation } from "./mobile-navigation";
const navigation = [
  ["Accueil", "/"],
  ["Expériences", "/experiences"],
  ["Événements", "/events"],
  ["Destinations", "/destinations"],
  ["Galerie", "/gallery"],
  ["À propos", "/about"],
  ["Contact", "/contact"],
];
export function SiteHeader({
  name,
  logo,
  demo,
}: {
  name: string;
  logo: string | null;
  demo: boolean;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      {demo && (
        <div className="preview-banner">
          Version de démonstration · Aventures et illustrations fictives ·
          Aucune réservation ouverte
        </div>
      )}
      <header className="site-header">
        <div className="container header-inner">
          <Brand name={name} logo={logo} />
          <nav className="desktop-nav" aria-label="Navigation principale">
            {navigation.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/events" className="button button-small header-cta">
            Découvrir nos aventures <Icon size={16} />
          </Link>
          <MobileNavigation items={navigation} />
        </div>
      </header>
    </>
  );
}
