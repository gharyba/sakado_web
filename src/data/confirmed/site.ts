// Only client-confirmed facts belong here. Empty values must remain empty until confirmed.
import { company } from "./company";
export const confirmedSite = {
  footerText: "Le grand air. Les belles rencontres. L’aventure en Tunisie.",
  contactCtaTitle: "Votre prochaine aventure commence par un échange.",
  contactCtaText: "Une question ? Contactez-nous.",
  galleryPreview: true,
  instagramMediaTitle: "Nos aventures",
  instagramMediaSubtitle: "Revivez quelques-uns de nos meilleurs moments.",
  name: "SAKADO SFAX",
  tagline: "Camping, randonnée et aventures en pleine nature avec Sakado Sfax.",
  heroTitle: "Explorez. Respirez. Vivez l’aventure.",
  instagramUrl: "https://www.instagram.com/sakado_sfax/?hl=fr",
  instagramHandle: "@Sakado_sfax",
  logoPath: null as string | null,
  heroImage: null as string | null,
  about: company.about,
  story: company.story as string | null,
  mission: company.mission as string | null,
  values: company.values as string[],
  sinceYear: company.founded as number | null,
  whySakado: [] as { title: string; description: string }[],
  communityMetrics: [] as { label: string; value: string }[],
};
