import type { Adventure, Experience, GalleryPhoto, Place } from "@/lib/types";
const blank: Omit<
  Adventure,
  "id" | "slug" | "title" | "category" | "coverImage"
> = {
  shortDescription:
    "Un aperçu du format d’une aventure. Le programme officiel sera publié par Sakado.",
  description:
    "Cette fiche est une démonstration de la future présentation des aventures. Elle ne correspond à aucune sortie organisée ou annoncée par Sakado Sfax.",
  location: null,
  startsAt: null,
  endsAt: null,
  duration: null,
  difficulty: null,
  price: null,
  currency: "TND",
  availablePlaces: null,
  maximumParticipants: null,
  status: "COMING_SOON",
  destinationSlug: null,
  demo: true,
  included: [],
  excluded: [],
  equipment: [],
  meetingPoint: null,
  importantInfo: null,
  cancellationInfo: null,
  schedule: [
    {
      id: "demo-schedule",
      day: 1,
      time: null,
      title: "Étape de démonstration",
      description:
        "Les horaires et activités seront renseignés après validation du programme.",
      order: 0,
    },
  ],
  gallery: [],
};
export const demoEvents: Adventure[] = [
  {
    ...blank,
    id: "demo-camping",
    slug: "demo-camping",
    title: "Une nuit sous les étoiles",
    category: "Camping",
    coverImage: "/images/camp.svg",
  },
  {
    ...blank,
    id: "demo-hiking",
    slug: "demo-randonnee",
    title: "Au rythme des sentiers",
    category: "Randonnée",
    coverImage: "/images/trail.svg",
  },
  {
    ...blank,
    id: "demo-weekend",
    slug: "demo-weekend",
    title: "L’appel du grand air",
    category: "Weekend nature",
    coverImage: "/images/coast.svg",
  },
];
export const demoExperiences: Experience[] = [
  {
    id: "camping",
    slug: "camping",
    name: "Camping",
    description: "Le grand air, du soir au matin.",
    enabled: true,
    demo: true,
  },
  {
    id: "randonnee",
    slug: "randonnee",
    name: "Randonnée",
    description: "Marcher. Observer. Se reconnecter.",
    enabled: true,
    demo: true,
  },
  {
    id: "weekend",
    slug: "weekend-nature",
    name: "Weekend nature",
    description: "Prendre le temps de s’évader.",
    enabled: true,
    demo: true,
  },
  ...["Excursion", "Outdoor activities", "Special experiences"].map(
    (name, i) => ({
      id: `disabled-${i}`,
      slug: `disabled-${i}`,
      name,
      description: null,
      enabled: false,
      demo: true,
    }),
  ),
];
export const demoDestinations: Place[] = [
  {
    id: "demo-forest",
    slug: "demo-foret",
    name: "L’esprit forêt",
    region: null,
    description:
      "Un exemple de fiche destination. Le lieu, sa région et ses expériences seront renseignés par Sakado.",
    coverImage: "/images/trail.svg",
    environment: "FOREST",
    difficulty: null,
    latitude: null,
    longitude: null,
    demo: true,
    gallery: [],
  },
  {
    id: "demo-coast",
    slug: "demo-littoral",
    name: "L’horizon au large",
    region: null,
    description:
      "Un aperçu du catalogue à venir, sans destination officielle annoncée.",
    coverImage: "/images/coast.svg",
    environment: "BEACH",
    difficulty: null,
    latitude: null,
    longitude: null,
    demo: true,
    gallery: [],
  },
];
export const demoGallery: GalleryPhoto[] = [
  {
    id: "camp",
    src: "/images/camp.svg",
    alt: "Illustration de démonstration : campement sous un ciel étoilé",
    caption: "Sous les étoiles",
    category: "Camping",
    demo: true,
  },
  {
    id: "trail",
    src: "/images/trail.svg",
    alt: "Illustration de démonstration : sentier à travers les montagnes",
    caption: "Prendre les sentiers",
    category: "Randonnée",
    demo: true,
  },
  {
    id: "coast",
    src: "/images/coast.svg",
    alt: "Illustration de démonstration : horizon et bord de mer",
    caption: "L’air du large",
    category: "Nature",
    demo: true,
  },
];
export const demoWhy = [
  {
    title: "Le goût de la découverte",
    description: "Une proposition éditoriale à valider avec Sakado.",
  },
  {
    title: "L’aventure se partage",
    description: "Une proposition éditoriale à valider avec Sakado.",
  },
  {
    title: "Plus près de la nature",
    description: "Une proposition éditoriale à valider avec Sakado.",
  },
];
