import setup from "../browser/setup";
import { verifyPhase05Cluster, phase05Db } from "./database";

export default async function phase05Setup() {
  await verifyPhase05Cluster(); // Before existing destructive fixture setup, validate the NEW cluster's actual data directory.
  await setup();
  const db = phase05Db();
  try {
    const category = await db.eventCategory.create({
      data: {
        name: "Activité synthétique Phase 05",
        slug: "phase05-activity",
        enabled: true,
      },
    });
    const destination = await db.destination.create({
      data: {
        name: "Destination synthétique Phase 05",
        slug: "phase05-destination",
        description: "Fixture isolée, pas une destination commerciale.",
        published: true,
      },
    });
    const base = {
      shortDescription: "Données synthétiques dans une base isolée.",
      description: "Aucune offre commerciale réelle. Fixture Phase 05.",
      status: "UPCOMING" as const,
      registrationStatus: "OPEN" as const,
      published: true,
      capacity: 6,
      price: 17.125,
      startsAt: new Date(Date.now() + 40 * 86400000),
      endsAt: new Date(Date.now() + 42 * 86400000),
      location: "Lieu synthétique Phase 05",
      duration: "3 jours",
      difficulty: "Niveau de test",
      categoryId: category.id,
      destinationId: destination.id,
      meetingPoint: "Rendez-vous synthétique",
      meetingTime: "07:00",
      included: ["Inclusion stockée"],
      excluded: ["Exclusion stockée"],
      equipment: ["Matériel stocké"],
      importantInfo: "Consigne stockée",
      cancellationInfo: "Politique de test uniquement",
      registrationDeadline: new Date(Date.now() + 30 * 86400000),
    };
    const event = await db.event.create({
      data: {
        ...base,
        slug: "phase05-open",
        title: "Aventure synthétique Phase 05",
        schedule: {
          create: [
            {
              day: 1,
              time: "07:00",
              title: "Étape synthétique jour 1",
              order: 0,
            },
            {
              day: 2,
              time: "09:00",
              title: "Étape synthétique jour 2",
              order: 0,
            },
          ],
        },
      },
    });
    for (const [slug, overrides] of [
      ["closed", { registrationStatus: "CLOSED" as const }],
      ["full", { registrationStatus: "FULL" as const }],
      ["waitlist", { registrationStatus: "WAITLIST_ONLY" as const }],
      ["expired", { registrationDeadline: new Date(Date.now() - 1000) }],
      ["not-open", { registrationOpenAt: new Date(Date.now() + 86400000) }],
      ["cancelled", { status: "CANCELLED" as const }],
      ["hidden-count", { showAvailability: false, capacity: 71 }],
      [
        "completed",
        {
          status: "COMPLETED" as const,
          startsAt: new Date(Date.now() - 4 * 86400000),
          endsAt: new Date(Date.now() - 2 * 86400000),
          recap: "Récit synthétique conservé.",
        },
      ],
    ] as const)
      await db.event.create({
        data: {
          ...base,
          ...overrides,
          title: `Fixture ${slug} Phase 05`,
          slug: `phase05-${slug}`,
        },
      });
    await db.galleryImage.create({
      data: {
        src: "/images/trail.svg",
        alt: "Illustration de test autorisée",
        eventId: event.id,
        authorized: true,
        published: true,
      },
    });
    await db.instagramMedia.createMany({
      data: [
        {
          instagramUrl: "https://www.instagram.com/p/phase05public/",
          eventId: event.id,
          title: "Moment publié synthétique",
          published: true,
        },
        {
          instagramUrl: "https://www.instagram.com/p/phase05private/",
          eventId: event.id,
          title: "Moment privé synthétique",
          published: false,
        },
      ],
    });
  } finally {
    await db.$disconnect();
  }
}
