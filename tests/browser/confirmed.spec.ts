import { test, expect } from "@playwright/test";
test("confirmed mode exposes only published confirmed events and authorized media", async ({
  page,
  request,
}) => {
  await page.goto("/events");
  await expect(
    page.getByText("Événement de vérification", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Version de démonstration", { exact: false }),
  ).toHaveCount(0);
  await expect(page.getByText("Événement non publié")).toHaveCount(0);
  await expect(page.getByText("Événement démo en base")).toHaveCount(0);
  await expect(page.getByText("Une nuit sous les étoiles")).toHaveCount(0);
  expect((await request.get("/events/private-event")).status()).toBe(404);
  expect((await request.get("/events/database-demo")).status()).toBe(404);
  await page.goto("/gallery");
  await expect(page.getByRole("button", { name: /Agrandir/ })).toHaveCount(0);
  await page.goto("/events/verified-event");
  await expect(page.getByRole("button", { name: /Agrandir/ })).toHaveCount(0);
  expect(
    (await request.get("/destinations/private-destination")).status(),
  ).toBe(404);
});
test("production sitemap excludes admin, drafts and demo routes", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  const text = await response.text();
  expect(text).toContain("https://example.invalid/events/verified-event");
  expect(text).not.toContain("private-event");
  expect(text).not.toContain("database-demo");
  expect(text).not.toContain("/admin");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
});
