import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import {
  companyActivities,
  companyTeam,
} from "../../src/data/confirmed/company";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`confirmed company presentation and safe media at ${viewport.width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    const images: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|did not match/i.test(message.text()))
        errors.push(message.text());
    });
    page.on("request", (request) => {
      if (request.resourceType() === "image")
        images.push(new URL(request.url()).pathname);
    });
    const response = await page.goto("/");
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator("h1")).toHaveText(
      "Explorez. Respirez. Vivez l’aventure.",
    );
    await expect(page.locator(".experience-category h3")).toHaveText(
      companyActivities.map((activity) => activity.name),
    );
    await expect(page.locator("[data-story-timeline] li > span")).toHaveText([
      "2017",
      "2022",
      "Aujourd’hui",
    ]);
    await expect(page.locator("#equipe article h3")).toHaveText(
      companyTeam.map((member) => member.name),
    );
    await expect(page.locator("#equipe article p")).toHaveText(
      companyTeam.map((member) => member.role),
    );
    await expect(page.locator("#equipe img")).toHaveCount(0);
    await expect(page.getByText("Photo à venir", { exact: true })).toHaveCount(
      5,
    );
    await expect(page.locator(".brand img")).toHaveCount(0);
    await expect(page.getByText("Youssef Gharbi", { exact: true })).toHaveCount(
      0,
    );
    await fs.mkdir(".local/phase09/screenshots", { recursive: true });
    await expect(
      page.locator('[data-parallax-hero] [data-motion="reveal"]'),
    ).toHaveCSS("opacity", "1");
    await page.screenshot({
      path: `.local/phase09/screenshots/${info.project.name}-hero-${viewport.width}.png`,
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
        path: `.local/phase09/screenshots/${info.project.name}-${selector === "#equipe" ? "team" : selector === ".site-footer" ? "footer" : "story"}-${viewport.width}.png`,
      });
    }
    expect(
      images.filter((src) =>
        /client-media|SAKADO-MEDIA|\.local|\/media\//i.test(src),
      ),
    ).toEqual([]);
    expect(errors).toEqual([]);
    expect(
      Number.parseFloat(
        await page
          .locator(".footer-links > a")
          .first()
          .evaluate((el) => getComputedStyle(el).fontSize),
      ),
    ).toBeGreaterThanOrEqual(14);
  });
}

test("all public demo routes and illustrative detail CTAs work without PostgreSQL", async ({
  page,
}) => {
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
    "/events/demo-camping",
    "/destinations/demo-foret",
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.goto("/experiences");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    companyActivities.map((activity) => activity.name),
  );
  await page
    .getByRole("link", { name: "Parlons de cette expérience →" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('form button[type="submit"]')).toBeDisabled();
  await expect(
    page.getByRole("link", { name: /@Sakado_sfax/i }),
  ).toHaveAttribute("href", /instagram\.com\/sakado_sfax/);
});

test("demo preserves admin authorization and denies private media/evidence", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await request.get("/api/admin/exports?type=events")).status()).toBe(401);
  expect((await request.post("/api/admin/events", { data: {} })).status()).toBe(
    401,
  );
  for (const url of [
    "/SAKADO-MEDIA/contact-sheet.html",
    "/.local/client-preview/index.json",
    "/docs/media/media-04-publication-readiness.json",
    "/dev/client-media/" + "a".repeat(64) + "-1440",
  ])
    expect((await request.get(url)).status(), url).toBe(404);
  await page.goto("/events/demo-camping");
  await expect(page.locator('form[action*="registrations"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /confirmer.*inscription/i }),
  ).toHaveCount(0);
});

test("reduced motion and mobile menu keep the complete company presentation usable", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  if (info.project.name === "development") {
    await expect(page.locator('[data-motion="background"]')).toHaveCSS(
      "transform",
      "none",
    );
  } else {
    // The development illustration is intentionally absent from production.
    await expect(page.locator('[data-motion="background"]')).toHaveCount(0);
    await expect(page.locator('[data-parallax-hero] h1')).toBeVisible();
  }
  const menu = page.getByRole("button", {
    name: "Ouvrir la navigation",
    exact: true,
  });
  await menu.click();
  await expect(
    page.getByRole("dialog", { name: "Navigation", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page.locator("[data-story-timeline]").scrollIntoViewIfNeeded();
  for (const target of await page
    .locator("[data-story-phase], [data-story-progress]")
    .all()) {
    await expect(target).toHaveCSS("transform", "none");
    await expect(target).toHaveCSS("opacity", "1");
  }
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  for (const width of [360, 320]) {
    await page.setViewportSize({ width, height: 812 });
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
    await expect(page.locator(".footer-links > a").first()).toBeVisible();
  }
});

test("server company story, team and gallery links work without JavaScript", async ({
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
      companyTeam.map((member) => member.name),
    );
    await expect(page.locator("[data-story-timeline] li")).toHaveCount(3);
    await page
      .getByRole("link", { name: "Ouvrir la galerie", exact: true })
      .click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.locator(".gallery-photo")).toHaveCount(3);
  } finally {
    await context.close();
  }
});
