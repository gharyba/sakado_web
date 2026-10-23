import { Brand } from "./brand";
import { NavigationShell } from "./navigation/navigation-shell";
export function SiteHeader({
  name,
  logo,
  demo,
  privatePreview = false,
  logoDimensions,
}: {
  name: string;
  logo: string | null;
  demo: boolean;
  privatePreview?: boolean;
  logoDimensions?: { width: number; height: number };
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      {demo && (
        <div className="preview-banner">
          Aperçu client · Illustrations et fiches d’exemple · Aucune réservation
          ouverte
        </div>
      )}
      <NavigationShell
        brand={
          <Brand
            name={name}
            logo={logo}
            privatePreview={privatePreview}
            logoDimensions={logoDimensions}
          />
        }
      />
    </>
  );
}
