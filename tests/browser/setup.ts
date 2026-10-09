import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { hashPassword } from "../../src/lib/security";
import { testDb, testDatabaseUrl } from "../test-database";
export default async function setup() {
  execFileSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
      stdio: "inherit",
    },
  );
  const db = testDb();
  try {
    // This helper refuses remote databases and always addresses sakado_test.
    await db.auditLog.deleteMany();
    await db.adminSession.deleteMany();
    await db.booking.deleteMany();
    await db.instagramMedia.deleteMany();
    await db.galleryImage.deleteMany();
    await db.eventScheduleItem.deleteMany();
    await db.event.deleteMany();
    await db.destination.deleteMany();
    await db.eventCategory.deleteMany();
    await db.contactMessage.deleteMany();
    await db.rateLimit.deleteMany();
    await db.socialLink.deleteMany();
    await db.siteSettings.deleteMany();
    await db.adminUser.deleteMany();
    const password = randomBytes(24).toString("base64url");
    const auth = {
      password,
      owner: "owner@example.invalid",
      admin: "admin@example.invalid",
      editor: "editor@example.invalid",
      inactive: "inactive@example.invalid",
    };
    for (const [email, name, role, active] of [
      [auth.owner, "Test Owner", "OWNER", true],
      [auth.admin, "Test Admin", "ADMIN", true],
      [auth.editor, "Test Editor", "EDITOR", true],
      [auth.inactive, "Test Inactive", "ADMIN", false],
    ] as const)
      await db.adminUser.create({
        data: {
          email,
          name,
          role,
          active,
          passwordHash: await hashPassword(password),
        },
      });
    await mkdir(".local", { recursive: true });
    await writeFile(".local/test-auth.json", JSON.stringify(auth));
    const category = await db.eventCategory.create({
      data: {
        slug: "verified-category",
        name: "Catégorie de vérification",
        enabled: true,
      },
    });
    for (const [slug, title, published, source] of [
      ["verified-event", "Événement de vérification", true, "CONFIRMED"],
      ["private-event", "Événement non publié", false, "CONFIRMED"],
      ["database-demo", "Événement démo en base", true, "DEMO"],
    ] as const)
      await db.event.create({
        data: {
          slug,
          title,
          shortDescription: "Données techniques de vérification uniquement.",
          description:
            "Fiche technique créée dans la base isolée des tests automatisés.",
          published,
          source,
          categoryId: category.id,
          status: "UPCOMING",
          registrationStatus: "OPEN",
          capacity: 20,
          price: 90,
          startsAt: new Date(Date.now() + 30 * 86400000),
          endsAt: new Date(Date.now() + 31 * 86400000),
        },
      });
    const privateEvent = await db.event.findUniqueOrThrow({
      where: { slug: "private-event" },
    });
    const publicEvent = await db.event.findUniqueOrThrow({
      where: { slug: "verified-event" },
    });
    const destination = await db.destination.create({
      data: {
        slug: "private-destination",
        name: "Destination de vérification privée",
        description: "Donnée de test uniquement.",
        published: false,
      },
    });
    await db.galleryImage.createMany({
      data: [
        {
          id: "private-related-photo",
          src: "/images/trail.svg",
          alt: "Image liée à une destination privée",
          authorized: true,
          published: true,
          eventId: publicEvent.id,
          destinationId: destination.id,
        },
        {
          id: "private-photo",
          src: "/images/trail.svg",
          alt: "Image privée de vérification",
          authorized: true,
          published: true,
          eventId: privateEvent.id,
        },
        {
          id: "unauthorized-photo",
          src: "/images/camp.svg",
          alt: "Image non autorisée de vérification",
          authorized: false,
          published: true,
        },
      ],
    });
  } finally {
    await db.$disconnect();
  }
}
