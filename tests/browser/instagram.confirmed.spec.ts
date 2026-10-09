import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { testDb } from "../test-database";
import urls from "../../src/data/instagram-media.json";
import { importInstagramMedia } from "../../src/lib/instagram-import";
import { serializable } from "../../src/lib/transactions";
import { normalizeInstagramUrl } from "../../src/lib/instagram-policy";
const auth = JSON.parse(readFileSync(".local/test-auth.json", "utf8"));
test.beforeAll(async () => {
  const db = testDb();
  try {
    await db.instagramMedia.deleteMany();
    const first = await serializable(db, (tx) =>
      importInstagramMedia(tx, urls),
    );
    expect(first.imported).toBe(45);
    const repeat = await serializable(db, (tx) =>
      importInstagramMedia(tx, urls),
    );
    expect(repeat.imported).toBe(0);
    expect(repeat.duplicates).toBe(45);
    expect(
      await db.instagramMedia.count({
        where: { published: false, mediaType: "INSTAGRAM_MEDIA" },
      }),
    ).toBe(45);
    await db.galleryImage.create({
      data: {
        src: "/images/camp.svg",
        alt: "Instagram test preview",
        published: true,
        authorized: true,
      },
    });
    for (let i = 0; i < 20; i++)
      await db.instagramMedia.update({
        where: { instagramUrl: normalizeInstagramUrl(urls[i])! },
        data: {
          published: true,
          showOnHomepage: true,
          title: "Moment test " + i,
          previewImage: i === 0 ? null : "/images/camp.svg",
          mediaType: i === 1 ? "REEL" : "INSTAGRAM_MEDIA",
        },
      });
    const privateEvent = await db.event.findUniqueOrThrow({
      where: { slug: "private-event" },
    });
    await db.instagramMedia.update({
      where: { instagramUrl: normalizeInstagramUrl(urls[20])! },
      data: {
        published: true,
        showOnHomepage: true,
        title: "PRIVATE_INSTAGRAM_SENTINEL",
        eventId: privateEvent.id,
      },
    });
  } finally {
    await db.$disconnect();
  }
});
test("homepage selects 16 public items, loops, pauses, restores focus and never loads Instagram", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (/instagram\.com|cdninstagram\.com/.test(r.url()))
      external.push(r.url());
  });
  await page.goto("http://localhost:3101/");
  const region = page.getByRole("region", {
    name: "Publications Instagram Sakado",
  });
  await region.scrollIntoViewIfNeeded();
  const cards = region.locator(
    ".instagram-track-group:not(.instagram-copy) .instagram-card",
  );
  await expect(cards).toHaveCount(16);
  await expect(page.getByText("PRIVATE_INSTAGRAM_SENTINEL")).toHaveCount(0);
  await page.mouse.move(0, 0);
  const start = await region.evaluate((el) => el.scrollLeft);
  await expect
    .poll(() => region.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(start + 5);
  const width = await region
    .locator(".instagram-track-group")
    .first()
    .evaluate((el) => el.getBoundingClientRect().width);
  await region.evaluate((el, width) => {
    el.scrollLeft = width - 2;
  }, width);
  await expect
    .poll(() => region.evaluate((el) => el.scrollLeft))
    .toBeLessThan(100);
  await region.hover();
  const stopped = await region.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(250);
  expect(await region.evaluate((el) => el.scrollLeft)).toBeCloseTo(stopped, 0);
  await cards.first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Voir sur Instagram" }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(cards.first()).toBeFocused();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Reprendre", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator(".instagram-section")
    .screenshot({ path: "test-results/instagram-desktop-section.png" });
  expect(external).toEqual([]);
  expect(await page.locator("iframe").count()).toBe(0);
});
test("mobile swipe, manual controls and reduced motion fit the viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto("http://localhost:3101/");
    const region = page.getByRole("region", {
      name: "Publications Instagram Sakado",
    });
    await region.scrollIntoViewIfNeeded();
    const before = await region.evaluate((el) => el.scrollLeft);
    await page.waitForTimeout(300);
    expect(await region.evaluate((el) => el.scrollLeft)).toBe(before);
    await expect(
      page.getByRole("button", { name: "Pause", exact: true }),
    ).not.toBeVisible();
    const box = (await region.boundingBox())!;
    const client = await context.newCDPSession(page);
    const y = Math.min(box.y + 120, 740);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 330, y }],
    });
    for (const x of [280, 220, 160, 90]) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y }],
      });
      await page.waitForTimeout(30);
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => region.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(before + 30);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .locator(".instagram-section")
      .screenshot({ path: "test-results/instagram-mobile-section.png" });
    await page.screenshot({
      path: "test-results/instagram-mobile.png",
      fullPage: true,
    });
  } finally {
    await context.close();
  }
});
test("gallery shares the library and admin import, editing, authorization and deletion work", async ({
  page,
  request,
}) => {
  expect(
    (
      await request.post("/api/admin/instagram", {
        data: { intent: "import", urls: urls[0] },
      })
    ).status(),
  ).toBe(401);
  await page.goto("/gallery?view=instagram");
  await expect(page.locator(".instagram-grid .instagram-card")).toHaveCount(20);
  await page
    .getByRole("button", { name: "Vidéos / Reels", exact: true })
    .click();
  await expect(page.locator(".instagram-grid .instagram-card")).toHaveCount(1);
  await page.goto("/admin/login");
  await page.getByLabel("Adresse e-mail").fill(auth.owner);
  await page.getByLabel("Mot de passe").fill(auth.password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  // APIRequestContext does not send Secure cookies over local HTTP. Keep this fixture-only.
  await page
    .context()
    .addCookies(
      (await page.context().cookies()).map((cookie) => ({
        ...cookie,
        secure: false,
      })),
    );
  await page.goto("/admin/instagram");
  await expect(page.locator(".admin-media-grid article")).toHaveCount(24);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Les moments Instagram",
  );
  await page
    .getByLabel("Liens Instagram", { exact: true })
    .fill(urls.join("\n"));
  await page
    .getByRole("button", { name: "Importer les liens", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toContainText(
    "0 publication(s) importée(s), 45 doublon(s)",
  );
  const headers = { Origin: "http://127.0.0.1:3101" };
  expect(
    (
      await page.request.post("/api/admin/instagram", {
        headers: { Origin: "https://foreign.invalid" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/admin/instagram", {
        headers,
        data: { instagramUrl: "https://evil.test/p/x/" },
      })
    ).status(),
  ).toBe(400);
  const db = testDb();
  try {
    const row = await db.instagramMedia.findUniqueOrThrow({
      where: { instagramUrl: normalizeInstagramUrl(urls[44])! },
    });
    const data = {
      id: row.id,
      instagramUrl: row.instagramUrl,
      title: "Admin edited Instagram",
      published: true,
      showOnHomepage: true,
      displayOrder: 99999,
    };
    expect(
      (
        await page.request.post("/api/admin/instagram", { headers, data })
      ).status(),
    ).toBe(200);
    await page.goto("/gallery?view=instagram");
    await expect(
      page.getByRole("button", { name: /Admin edited Instagram/ }),
    ).toBeVisible();
    expect(
      (
        await page.request.post("/api/admin/instagram", {
          headers,
          data: { id: row.id, intent: "delete" },
        })
      ).status(),
    ).toBe(200);
    expect(await db.instagramMedia.count()).toBe(44);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/instagram");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await db.$disconnect();
  }
});
