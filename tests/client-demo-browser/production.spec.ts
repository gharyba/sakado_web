import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test("production ignores CLIENT_DEMO and never serves private assets", async ({
  page,
  request,
}) => {
  const index = JSON.parse(
    await fs.readFile(".local/client-preview/index.json", "utf8"),
  );
  for (const asset of index.assets) {
    const response = await request.get(
      `/dev/client-media/${asset.variants[0].key}`,
    );
    expect(response.status()).toBe(404);
    expect((await response.body()).length).toBe(0);
  }
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(
    "Explorez. Respirez. Vivez l’aventure.",
  );
  await expect(page.locator(".s-client-preview-label")).toHaveCount(0);
  await expect(page.locator('[src^="/dev/client-media/"]')).toHaveCount(0);
  // Phase 09 makes confirmed names/roles public with initials; portraits remain private.
  await expect(page.locator("#equipe article h3")).toHaveCount(2);
  await expect(page.locator("#equipe img")).toHaveCount(0);
  await expect(page.locator(".s-preview-shape-grid")).toHaveCount(0);
  await expect(page.locator("[data-gallery-carousel]")).toHaveCount(0);
  await expect(page.locator("[data-client-activity-photo]")).toHaveCount(0);
});
