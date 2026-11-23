import { withTestDatabase } from "./database";
export default async function setup() {
  // Synthetic test-only coordinates, never written into the real CMS or source defaults.
  await withTestDatabase(async (client) => {
    await client.query(
      'INSERT INTO "SiteSettings" (id, content, "updatedAt") VALUES ($1,$2,now())',
      [
        "main",
        JSON.stringify({
          email: "redesign07@example.test",
          phone: "+1 (202) 555-0123",
          address: "Adresse de test isolée",
        }),
      ],
    );
  });
}
