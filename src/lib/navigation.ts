export type NavigationItem = readonly [label: string, href: string];

// Existing public routes only. The wordmark also links to the homepage.
export const publicNavigation: readonly NavigationItem[] = [
  ["Accueil", "/"],
  ["Expériences", "/experiences"],
  ["Événements", "/events"],
  ["Destinations", "/destinations"],
  ["Galerie", "/gallery"],
  ["À propos", "/about"],
  ["Contact", "/contact"],
];
export const navigationAction = { label: "Nos aventures", href: "/events" };
export const desktopNavigationQuery = "(min-width: 1200px)";

export function isCurrentNavigation(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function heroCoversNavigation({
  pathname,
  contrast,
  top,
  bottom,
  headerBottom,
}: {
  pathname: string;
  contrast?: string;
  top: number;
  bottom: number;
  headerBottom: number;
}) {
  return (
    pathname === "/" &&
    contrast === "dark" &&
    [top, bottom, headerBottom].every(Number.isFinite) &&
    top <= headerBottom &&
    bottom > headerBottom
  );
}
