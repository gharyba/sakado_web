import type { Metadata } from "next";
import { demoEnabled, publicOrigin } from "./content-policy";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  demo = false,
): Metadata {
  const origin = publicOrigin();
  return {
    title,
    description,
    alternates: origin ? { canonical: `${origin}${path}` } : undefined,
    robots:
      demo || demoEnabled() || !origin
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      title: `${title} | SAKADO SFAX`,
      description,
      locale: "fr_TN",
      type: "website",
      siteName: "SAKADO SFAX",
      ...(origin
        ? {
            url: `${origin}${path}`,
            images: [{ url: `${origin}/opengraph-image` }],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(origin ? { images: [`${origin}/opengraph-image`] } : {}),
    },
  };
}
