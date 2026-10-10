import { Brand } from "./brand";
import { NavigationShell } from "./navigation/navigation-shell";
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
      <NavigationShell brand={<Brand name={name} logo={logo} />} />
    </>
  );
}
