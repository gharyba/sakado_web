/** Company facts explicitly supplied for Phase 09. No media/publication permission is implied. */
export const company = {
  name: "Sakado Sfax",
  founded: 2017,
  established: 2022,
  founder: "Mohamed Ben Beya",
  philosophy: "Vivre la nature autrement.",
  about:
    "Depuis 2017, Sakado Sfax invite à découvrir les richesses naturelles de la Tunisie à travers des expériences de plein air authentiques et des rencontres humaines.",
  story:
    "Fondée en 2017 par Mohamed Ben Beya, Sakado devient officiellement une entreprise en 2022, tout en conservant sa passion pour la nature, la découverte et le partage.",
  mission:
    "Faire découvrir la Tunisie autrement : prendre le temps d’explorer, partager l’aventure et respecter les espaces naturels qui nous accueillent.",
  values: [
    "Sécurité",
    "Respect de la nature",
    "Communauté",
    "Découverte",
    "Lien humain authentique",
  ],
  chapters: [
    {
      year: "2017",
      title: "Le début d’une aventure",
      text: "Mohamed Ben Beya fonde Sakado Sfax avec une envie : faire découvrir la richesse naturelle de la Tunisie et partager des expériences humaines en plein air.",
    },
    {
      year: "2022",
      title: "Une passion devient entreprise",
      text: "Sakado est formellement établie en entreprise. La passion de ses débuts reste au cœur de son approche : explorer, partager et respecter la nature.",
    },
    {
      year: "Aujourd’hui",
      title: "Vivre la nature autrement",
      text: "Camping, randonnée, kayak, paddle et découvertes du littoral ou de la forêt : des expériences pour se retrouver, découvrir et vivre la nature ensemble.",
    },
  ],
};

export const companyTeam = [
  { name: "Ben Beya Mohamed", role: "Fondateur", initials: "BM" },
  { name: "Bouzrara Manel", role: "Gérante", initials: "BM" },
  { name: "Aladin Jemni", role: "Graphiste / Animateur", initials: "AJ" },
  { name: "Jad Tagougui", role: "Photographe / Vidéaste", initials: "JT" },
  { name: "Ayoub Hamza", role: "Guitariste / Chanteur", initials: "AH" },
] as const;

export const companyActivities = [
  {
    slug: "randonnee",
    name: "Randonnée",
    description:
      "Marcher à son rythme, observer les paysages et partager le plaisir du chemin.",
  },
  {
    slug: "camping",
    name: "Camping",
    description:
      "Prendre le temps de vivre dehors et retrouver la simplicité d’un séjour en pleine nature.",
  },
  {
    slug: "kayak",
    name: "Kayak",
    description:
      "Découvrir les paysages depuis l’eau et partager une autre façon d’explorer.",
  },
  {
    slug: "paddle",
    name: "Paddle",
    description:
      "Trouver son équilibre sur l’eau et profiter d’un regard différent sur le littoral.",
  },
  {
    slug: "exploration-cotiere",
    name: "Exploration côtière",
    description:
      "Suivre les horizons marins et observer la diversité des paysages du littoral tunisien.",
  },
  {
    slug: "aventures-en-foret",
    name: "Aventures en forêt",
    description:
      "Emprunter les chemins boisés, écouter et découvrir les milieux naturels avec respect.",
  },
  {
    slug: "retraites-nature",
    name: "Retraites nature",
    description:
      "Faire une pause dans le quotidien pour se reconnecter à la nature et aux autres.",
  },
] as const;
