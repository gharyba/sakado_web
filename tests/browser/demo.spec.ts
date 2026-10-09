import {readFileSync} from "node:fs";
const credentials=JSON.parse(readFileSync(".local/test-auth.json","utf8"));
import { test, expect } from "@playwright/test";
for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`homepage and event details fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Vivez l’aventure",
    );
    await expect(
      page.getByText("Version de démonstration", { exact: false }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: `test-results/home-fold-${width}.png` });
      for (const img of await page.locator("img").all()) {
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveJSProperty("complete", true);
        expect(
          await img.evaluate((node) => (node as HTMLImageElement).naturalWidth),
        ).toBeGreaterThan(0);
      }
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `test-results/home-${width}.png`,
        fullPage: true,
      });
    }
    await page.goto("/events/demo-camping");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Une nuit sous les étoiles",
    );
    await expect(
      page.getByText("Inscriptions désactivées en démonstration.", {exact: false}),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
test("mobile navigation opens and reaches the events page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByLabel("Ouvrir la navigation").click();
  await page
    .getByRole("navigation", { name: "Navigation mobile" })
    .getByRole("link", { name: "Événements" })
    .click();
  await expect(page).toHaveURL(/\/events$/);
});
test("gallery filters, opens a modal and closes with Escape", async ({
  page,
}) => {
  await page.goto("/gallery");
  await page.getByRole("button", { name: "Camping", exact: true }).click();
  await expect(page.getByRole("button", { name: /Agrandir/ })).toHaveCount(1);
  await page.getByRole("button", { name: /Agrandir/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: /Agrandir/ })).toBeFocused();
});
test("contact query prepares the message and saves a real database record", async ({
  page,
}) => {
  await page.goto("/contact?subject=event&event=Aventure%20de%20test");
  await expect(page.getByLabel("Message", { exact: false })).toContainText(
    "Aventure de test",
  );
  await page.getByLabel("Nom", { exact: false }).fill("Test Visitor");
  await page
    .getByLabel("E-mail", { exact: false })
    .fill("visitor@example.invalid");
  await page.getByRole("button", { name: /Envoyer mon message/ }).click();
  await expect(
    page.getByRole("heading", { name: "Merci pour votre message." }),
  ).toBeVisible();
});
test("admin requires authentication, rejects bad login, logs in and logs out", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", { name: "Messages récents" }),
  ).toHaveCount(0);
  await page.getByLabel("Adresse e-mail").fill(credentials.admin);
  await page.getByLabel("Mot de passe").fill("wrong-password");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("status")).toHaveText("Email ou mot de passe incorrect.");
  await page.getByLabel("Mot de passe").fill(credentials.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Bonjour, Test." }),
  ).toBeVisible();
  await page.goto("/admin/messages"); await expect(page.getByText("Une demande concernant un événement",{exact:false})).toHaveCount(0);
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
test("demo SEO disallows indexing and missing routes return 404", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("<loc>");
  const missing = await request.get("/events/does-not-exist");
  expect(missing.status()).toBe(404);
  const image = await request.get("/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
});
