import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { mediaRegistry } from "../../src/lib/media-readiness-policy";

const widths = [375, 390, 768, 1024, 1440];
const manifestBytes = readFileSync("docs/media/asset-manifest.json");
const manifest = JSON.parse(manifestBytes.toString());
const readiness = JSON.parse(
  readFileSync("docs/media/media-04-publication-readiness.json", "utf8"),
);
const registry = mediaRegistry(
  readiness,
  manifest,
  createHash("sha256").update(manifestBytes).digest("hex"),
);
const noOverflow = async (page: import("@playwright/test").Page) => {
  const outside = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width && (r.right > innerWidth + 1 || r.left < -1);
      })
      .slice(0, 10)
      .map((n) => n.className),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Overflow at ${page.url()}: ${JSON.stringify(outside)}`,
  ).toBe(true);
};

test("demo homepage and gallery render at all required widths with an unavailable DB", async ({
  page,
}, info) => {
  const errors: string[] = [],
    paths: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => paths.push(new URL(r.url()).pathname));
  for (const width of widths) {
    await page.setViewportSize({ width, height: width >= 768 ? 1024 : 812 });
    for (const route of ["/", "/gallery"]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await noOverflow(page);
      if (route === "/gallery") {
        const controls = await page
          .locator(".s-gallery-controls")
          .boundingBox();
        const filters = await page
          .getByRole("group", { name: "Filtrer la galerie" })
          .boundingBox();
        expect(filters!.y).toBeGreaterThanOrEqual(
          controls!.y + controls!.height,
        );
      }
      const gallery = page.locator(".s-cinematic-gallery");
      await gallery.scrollIntoViewIfNeeded();
      await expect(gallery.locator("img").first()).toBeVisible();
      expect(
        await gallery
          .locator("img")
          .evaluateAll((imgs) =>
            imgs.every(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(
          `${route === "/" ? "home-media" : "gallery"}-${width}.png`,
        ),
      });
    }
  }
  expect(errors).toEqual([]);
  expect(
    paths.filter((p) => /SAKADO-MEDIA|private|sakado-photos|\.jpe?g$/i.test(p)),
  ).toEqual([]);
  for (const a of registry.assets)
    expect(paths.some((p) => p.includes(a.originalFilename))).toBe(false);
  await info.attach("requested-image-paths", {
    body: JSON.stringify(
      [...new Set(paths.filter((p) => /images|media|instagram/i.test(p)))],
      null,
      2,
    ),
    contentType: "application/json",
  });
});

test("story is progressively enhanced; reduced motion and MotionToggle restore static content", async ({
  page,
}, info) => {
  await page.goto("/");
  const story = page.locator(".s-about-story");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-motion-state", "ready");
  await expect(story.locator(".s-story-passage").first()).toBeVisible();
  await expect(story.locator(".s-story-passage").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(story.locator(".s-story-image")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: info.outputPath("about-story-desktop.png") });
  await page.getByRole("button", { name: "Désactiver les animations" }).click();
  await expect(story).toHaveAttribute("data-motion-state", "static");
  expect(
    await story
      .locator("[data-motion]")
      .evaluateAll((nodes) => nodes.every((n) => !n.getAttribute("style"))),
  ).toBe(true);
  await page.goto("/gallery");
  await expect(page.locator(".s-cinematic-gallery")).toHaveAttribute(
    "data-cinematic-motion",
    "static",
  );
  await page.getByRole("button", { name: "Réactiver les animations" }).click();
  await expect(page.locator(".s-cinematic-gallery")).toHaveAttribute(
    "data-cinematic-motion",
    "on",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".s-cinematic-gallery")).toHaveAttribute(
    "data-cinematic-motion",
    "static",
  );
  await expect(
    page.getByRole("button", { name: "Désactiver les animations" }),
  ).toBeDisabled();
  expect(
    await page
      .locator(".s-gallery-visual")
      .first()
      .evaluate((n) => getComputedStyle(n).transform),
  ).toBe("none");
  await page.goto("/");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-motion-state", "static");
  await page.setViewportSize({ width: 375, height: 812 });
  await story.scrollIntoViewIfNeeded();
  await story.screenshot({
    path: info.outputPath("about-story-mobile-reduced.png"),
  });
});

test("gallery filters, keyboard lightbox, Escape and focus restoration work", async ({
  page,
}) => {
  await page.goto("/gallery");
  const cards = page.locator(".s-cinematic-gallery .gallery-photo");
  const first = cards.first();
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
  const filters = page.getByRole("group", { name: "Filtrer la galerie" });
  await filters.getByRole("button").nth(1).click();
  await expect(filters.getByRole("button").nth(1)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await cards.count()).toBeGreaterThan(0);
  await filters.getByRole("button", { name: "Tout", exact: true }).click();
  await page.getByRole("link", { name: "Instagram", exact: true }).click();
  await expect(page).toHaveURL(/view=instagram/);
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("mobile gallery stays flat and every photo has a no-JavaScript link fallback", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3110/gallery");
  const link = page.locator(".gallery-photo").first();
  await expect(link).toHaveAttribute("href", /^\/images\/.+\.svg$/);
  expect(
    await page
      .locator(".s-gallery-visual")
      .first()
      .evaluate((n) => getComputedStyle(n).transform),
  ).toBe("none");
  await noOverflow(page);
  await link.click();
  await expect(page).toHaveURL(/\/images\/.+\.svg$/);
  await context.close();
});

test("initial demo payload defers the animation engine and desktop focus flattens gallery depth", async ({
  page,
}, info) => {
  await page.goto("/");
  const scripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((r) => new URL(r.name).pathname)
      .filter((p) => p.startsWith("/_next/static/") && p.endsWith(".js")),
  );
  let rawBytes = 0,
    gzipBytes = 0;
  for (const path of scripts) {
    const bytes = readFileSync(`.next/${path.replace("/_next/", "")}`);
    expect(bytes.toString()).not.toContain("ScrollTrigger");
    rawBytes += bytes.length;
    gzipBytes += gzipSync(bytes).length;
  }
  await info.attach("initial-js-payload", {
    body: JSON.stringify({ chunks: scripts.length, rawBytes, gzipBytes }),
    contentType: "application/json",
  });
  writeFileSync(
    ".local/phase04/initial-js-payload.json",
    JSON.stringify({ chunks: scripts.length, rawBytes, gzipBytes }, null, 2),
  );
  await page.goto("/gallery");
  const visual = page.locator(".s-gallery-visual").first();
  await expect(page.locator(".s-cinematic-gallery")).toHaveAttribute(
    "data-cinematic-motion",
    "on",
  );
  expect(await visual.evaluate((n) => getComputedStyle(n).transform)).not.toBe(
    "none",
  );
  await page.locator(".gallery-photo").first().focus();
  expect(await visual.evaluate((n) => getComputedStyle(n).transform)).toBe(
    "none",
  );
});

test("blocked files, readiness data, evidence and media routes are not publicly served; admin requires auth", async ({
  request,
}) => {
  for (const a of registry.assets) {
    for (const prefix of [
      "/images/",
      "/SAKADO-MEDIA/",
      "/SAKADO-MEDIA/originals/",
    ]) {
      expect(
        (
          await request.get(prefix + encodeURIComponent(a.originalFilename))
        ).status(),
      ).toBe(404);
    }
  }
  for (const route of [
    "/",
    "/about",
    "/events",
    "/events/demo-camping",
    "/destinations",
    "/experiences",
    "/contact",
    "/gallery",
    "/gallery?view=instagram",
    "/privacy",
    "/sitemap.xml",
    "/robots.txt",
  ]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const body = await response.text();
    expect(body).not.toMatch(/SAKADO-MEDIA|sakado-photos|signed-evidence/);
    for (const a of registry.assets) {
      expect(body).not.toContain(a.originalFilename);
      expect(body).not.toContain(a.sourceSha256);
    }
  }
  expect((await request.get("/opengraph-image")).status()).toBe(200);
  for (const path of [
    "/docs/media/asset-manifest.json",
    "/docs/media/media-04-publication-readiness.json",
    "/SAKADO-MEDIA/private/media-04/",
    "/SAKADO-MEDIA/media-04-approval.html",
    "/media/S08.webp",
    "/media/123e4567-e89b-12d3-a456-426614174000.webp",
  ])
    expect((await request.get(path)).status()).toBe(404);
  const admin = await request.get("/admin/media-readiness", {
    maxRedirects: 0,
  });
  expect([303, 307]).toContain(admin.status());
  expect(admin.headers().location).toContain("/admin/login");
  for (const route of [
    "/api/admin/gallery",
    "/api/admin/site",
    "/api/admin/media",
    "/api/admin/instagram",
  ])
    expect((await request.post(route, { data: {} })).status()).toBe(401);
});

test("isolated admin presentation is readable at all widths, read-only and contains no private paths or previews", async ({
  page,
}, info) => {
  // Presentation only, not a substitute for an authenticated database-backed CMS test.
  const html = readFileSync(".local/phase04/admin-presentation.html", "utf8");
  const styles = [
    "src/styles/tokens.css",
    "src/app/globals.css",
    "src/app/admin/admin.css",
    "src/styles/cinematic.css",
  ]
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
  await page.setContent(
    `<html lang="fr"><head><style>${styles}</style></head><body><main class="sakado-admin admin-login" style="padding:1rem">${html}</main></body></html>`,
  );
  await expect(page.locator("article")).toHaveCount(17);
  await expect(page.locator("img, input, form, button")).toHaveCount(0);
  expect(html).not.toMatch(/SAKADO-MEDIA|C:\\|EV-|signed-evidence/);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`admin-presentation-${width}.png`),
    });
  }
});
