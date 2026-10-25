import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import {
  companyActivities,
  companyTeam,
} from "../../src/data/confirmed/company";

test("official homepage and About retain two public-safe team fallbacks", async ({
  page,
  browser,
}, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["/", "/about"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const team = page.locator("#equipe");
    await expect(team.locator("article")).toHaveCount(2);
    await expect(team.locator("h3")).toHaveText([
      "Ben Beya Mohamed",
      "Bouzrara Manel",
    ]);
    await expect(team.locator("article p")).toHaveText([
      "Fondateur",
      "Gérante",
    ]);
    await expect(team.locator("img")).toHaveCount(0);
    await expect(team.getByText("Portrait à venir")).toHaveCount(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await fs.mkdir(".local/redesign05-review", { recursive: true });
    await team.screenshot({
      path: `.local/redesign05-review/public-${info.project.name}-${route === "/" ? "home" : "about"}.png`,
    });
  }
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const staticPage = await nojs.newPage();
    await staticPage.goto(`${info.project.use.baseURL}/about`);
    await expect(staticPage.locator("#equipe h3")).toHaveText([
      "Ben Beya Mohamed",
      "Bouzrara Manel",
    ]);
    await expect(staticPage.locator("#equipe img")).toHaveCount(0);
  } finally {
    await nojs.close();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#equipe").screenshot({
    path: `.local/redesign05-review/public-${info.project.name}-desktop-section.png`,
    animations: "disabled",
    style: "[data-navigation], .skip-link { visibility: hidden !important; }",
  });
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`actual PostgreSQL company presentation at ${viewport.width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (/hydration|did not match/i.test(m.text())) errors.push(m.text());
    });
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveAccessibleName(
      "Explorez. Respirez. Vivez l’aventure.",
    );
    await expect(
      page.locator(".preview-banner, .s-client-preview-label"),
    ).toHaveCount(0);
    await expect(page.locator(".experience-category h3")).toHaveText(
      companyActivities.map((a) => a.name),
    );
    await expect(page.locator("[data-story-timeline] li > span")).toHaveText([
      "2017",
      "2022",
      "Aujourd’hui",
    ]);
    await expect(page.locator("#equipe article h3")).toHaveText(
      companyTeam.map((m) => m.name),
    );
    await expect(page.locator("#equipe article p")).toHaveText(
      companyTeam.map((m) => m.role),
    );
    await expect(
      page.locator(
        "#equipe img, .gallery-photo, .event-card, .destination-card",
      ),
    ).toHaveCount(0);
    await expect(
      page.locator(
        '[src*="client-media"], [src*="879605b7"], [src*="SAKADO-MEDIA"]',
      ),
    ).toHaveCount(0);
    await fs.mkdir(".local/phase09b/screenshots", { recursive: true });
    await expect(
      page.locator("[data-parallax-hero] [data-hero-copy] h1"),
    ).toHaveCSS("opacity", "1");
    await page.screenshot({
      path: `.local/phase09b/screenshots/${info.project.name}-hero-${viewport.width}.png`,
    });
    for (const selector of [
      "[data-story-timeline]",
      "#equipe",
      ".site-footer",
    ]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      for (const target of await page
        .locator(
          `${selector} [data-motion="reveal"], ${selector} [data-motion="image"]`,
        )
        .all()) {
        await target.scrollIntoViewIfNeeded();
        await expect(target).toHaveCSS("opacity", "1");
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.local/phase09b/screenshots/${info.project.name}-${selector === "#equipe" ? "team" : selector === ".site-footer" ? "footer" : "story"}-${viewport.width}.png`,
      });
    }
    expect(errors).toEqual([]);
  });
}

test("official routes use confirmed categories, honest empty listings and actual database health", async ({
  page,
  request,
}) => {
  expect(await (await request.get("/api/health")).json()).toEqual({
    status: "ok",
  });
  for (const route of [
    "/",
    "/about",
    "/experiences",
    "/events",
    "/adventures",
    "/destinations",
    "/gallery",
    "/gallery?view=instagram",
    "/contact",
    "/privacy",
  ]) {
    expect((await page.goto(route))?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".preview-banner")).toHaveCount(0);
  }
  for (const route of ["/events/demo-camping", "/destinations/demo-foret"])
    expect((await request.get(route)).status(), route).toBe(404);
  await page.goto("/experiences");
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText(companyActivities.map((a) => a.name));
  await page
    .getByRole("link", { name: "Parlons de cette expérience →" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  // Check availability without submitting a contact message to the real local DB.
  await expect(page.locator('form button[type="submit"]')).toBeEnabled();
});

test("unauthenticated and forged sessions cannot access admin or withheld/private media", async ({
  page,
  request,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: "sakado_admin_session", value: "a".repeat(43), url: baseURL! },
  ]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await request.get("/api/admin/exports?type=events")).status()).toBe(
    401,
  );
  expect((await request.post("/api/admin/events", { data: {} })).status()).toBe(
    401,
  );
  for (const route of [
    "/media/879605b7-d54d-4fc7-aca1-42303a26b326.webp",
    "/SAKADO-MEDIA/media-04-approval.html",
    "/docs/media/media-04-publication-readiness.json",
    "/.local/client-preview/index.json",
    "/dev/client-media/" + "a".repeat(64) + "-1440",
  ])
    expect((await request.get(route)).status(), route).toBe(404);
});

test("reduced motion, mobile menu and enlarged text remain usable in official mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const toggle = page.getByRole("button", {
    name: "Ouvrir la navigation",
    exact: true,
  });
  await toggle.click();
  await expect(
    page.getByRole("dialog", { name: "Navigation", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  for (const target of await page
    .locator("[data-story-phase], [data-story-progress]")
    .all())
    await expect(target).toHaveCSS("transform", "none");
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  for (const width of [360, 320]) {
    await page.setViewportSize({ width, height: 812 });
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("official company content is server-rendered without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#equipe article h3")).toHaveText(
      companyTeam.map((m) => m.name),
    );
    await expect(page.locator("[data-story-timeline] li")).toHaveCount(3);
    await page
      .getByRole("link", { name: "Ouvrir la galerie", exact: true })
      .click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.locator(".gallery-photo")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
