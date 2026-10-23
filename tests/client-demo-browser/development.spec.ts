import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

const members = ["Ben Beya Mohamed", "Bouzrara Manel"];
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`private composition, real images and reflow at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|did not match/i.test(message.text()))
        errors.push(message.text());
    });
    const response = await page.goto("/");
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator("h1")).toHaveText("Vivre la nature autrement.");
    await expect(page.locator("[data-navigation]")).toHaveAttribute(
      "data-state",
      "hero",
    );
    await expect(page.locator("#equipe article h3")).toHaveText(members);
    await expect(page.locator("#photos [data-gallery-card]")).toHaveCount(12);
    await expect(page.locator("#partenaires figure")).toHaveCount(6);
    await expect(page.locator("#experiences h3")).toHaveCount(5);
    expect(await page.locator("h1").count()).toBe(1);
    await expect(
      page.locator('[data-parallax-hero] [data-motion="reveal"]'),
    ).toHaveCSS("opacity", "1");
    await expect(page.getByText("Youssef Gharbi", { exact: true })).toHaveCount(
      0,
    );
    await expect(page.locator(".s-client-brand img")).toHaveCount(2);
    await fs.mkdir(".local/client-preview-review", { recursive: true });
    await page.waitForFunction(() =>
      [
        ...document.querySelectorAll<HTMLImageElement>(
          "[data-hero-image], [data-navigation] img",
        ),
      ].every((image) => image.complete && image.naturalWidth > 0),
    );
    await page.screenshot({
      path: `.local/client-preview-review/hero-${viewport.width}.png`,
    });
    for (const id of [
      "histoire",
      "photos",
      "equipe",
      "partenaires",
      "prochainement",
    ]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      for (const target of await page
        .locator(`#${id} [data-motion="image"], #${id} [data-motion="reveal"]`)
        .all()) {
        await target.scrollIntoViewIfNeeded();
        await expect(target).toHaveCSS("opacity", "1");
      }
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (section) =>
          [...document.querySelectorAll<HTMLImageElement>(`#${section} img`)]
            .filter(
              (image) =>
                !image.closest(
                  '[data-gallery-card][data-distance="5"], [data-gallery-card][data-distance="6"]',
                ),
            )
            .every((image) => image.complete && image.naturalWidth > 0),
        id,
      );
      expect(
        await page
          .locator("[data-hero-image]")
          .evaluate((image) => (image as HTMLImageElement).currentSrc),
      ).toContain(viewport.width < 700 ? "-750" : "-1440");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.local/client-preview-review/${id}-${viewport.width}.png`,
      });
    }
    await expect(page.locator("[data-navigation]")).toHaveAttribute(
      "data-state",
      "surface",
    );
    expect(
      await page.locator("main img:not([alt]), footer img:not([alt])").count(),
    ).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("gallery keyboard dialog, Escape restoration and routes without fabricated events", async ({
  page,
}) => {
  await page.goto("/");
  const first = page.locator('#photos [data-gallery-card][data-active="true"]');
  await first.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Visionneuse d’images" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Fermer l’image" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(first).toBeFocused();
  for (const route of ["/events", "/adventures", "/destinations"]) {
    await page.goto(route);
    await expect(page.getByText("Bientôt", { exact: true })).toBeVisible();
    await expect(page.locator(".event-card")).toHaveCount(0);
  }
  await page.goto("/about");
  await expect(page.locator("#equipe article h3")).toHaveText(members);
  await page.goto("/gallery");
  await expect(page.locator(".gallery-photo")).toHaveCount(12);
  await page.goto("/experiences");
  await expect(page.locator("#experiences h3")).toHaveCount(5);
});

test("mobile menu keyboard, reduced motion and motion toggle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.locator("[data-parallax-hero] [data-motion-scene]"),
  ).toHaveAttribute("data-motion-state", "static");
  const menu = page.getByRole("button", { name: "Ouvrir la navigation" });
  await menu.click();
  await expect(
    page.getByRole("dialog", { name: "Navigation", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator('[data-motion="background"]')).toHaveCSS(
    "transform",
    "none",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(
    page.locator("[data-parallax-hero] [data-motion-scene]"),
  ).toHaveAttribute("data-motion-state", "ready");
  await page.getByRole("button", { name: "Désactiver les animations" }).click();
  await expect(
    page.locator("[data-parallax-hero] [data-motion-scene]"),
  ).toHaveAttribute("data-motion-state", "static");
});

test("private media allowlist, cross-site and traversal refusal", async ({
  request,
  page,
}) => {
  await page.goto("/");
  const src = await page.locator("[data-hero-image]").getAttribute("src");
  expect(src).toMatch(/^\/dev\/client-media\/[a-f0-9]{64}-1440$/);
  const image = await request.get(src!);
  expect(image.status()).toBe(200);
  expect(image.headers()["cache-control"]).toContain("no-store");
  expect(image.headers()["content-type"]).toBe("image/webp");
  const hostileHeaders: Record<string, string>[] = [
    { host: "example.invalid" },
    { origin: "https://example.invalid" },
    { "sec-fetch-site": "cross-site" },
  ];
  for (const headers of hostileHeaders)
    expect((await request.get(src!, { headers })).status()).toBe(404);
  for (const key of [
    "index.json",
    "source-inventory.json",
    "a".repeat(64) + "-1440",
    "..%2f..%2f.env",
  ])
    expect((await request.get(`/dev/client-media/${key}`)).status()).toBe(404);
});

test("server content and image links remain usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3130/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#histoire h2")).toHaveText(
    "Une passion devenue une entreprise",
  );
  await expect(page.locator("#equipe article h3")).toHaveText(members);
  for (const target of await page.locator("[data-motion]").all()) {
    await expect(target).toHaveCSS("opacity", "1");
    await expect(target).toHaveCSS("transform", "none");
    await expect(target).toHaveCSS("clip-path", "none");
    await expect(target).toHaveCSS("filter", "none");
  }
  await expect(page.locator("#photos [data-gallery-carousel]")).toHaveAttribute(
    "data-carousel-motion",
    "static",
  );
  const link = page.locator('#photos [data-gallery-card][data-active="true"]');
  const target = await link.getAttribute("href");
  await link.click();
  await expect(page).toHaveURL(new RegExp(target!));
  expect((await page.request.get(page.url())).headers()["content-type"]).toBe(
    "image/webp",
  );
  await context.close();
});
