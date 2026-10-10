import { test, expect } from "@playwright/test";

test("save-data changes stop and resume optional enhancement", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const connection = Object.assign(new EventTarget(), { saveData: true });
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
  });
  await page.goto("/dev/motion");
  await expect(page.getByRole("status")).toContainText("économie de données");
  await expect(page.locator('[data-motion="background"]')).toHaveCSS(
    "transform",
    "none",
  );
  await page.evaluate(() => {
    const connection = (
      navigator as Navigator & {
        connection: EventTarget & { saveData: boolean };
      }
    ).connection;
    connection.saveData = false;
    connection.dispatchEvent(new Event("change"));
  });
  await expect(page.locator('[data-motion="background"]')).toHaveCSS(
    "transform",
    /matrix/,
  );
});

test("blocked storage retains the user's disable choice across client navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  await page.goto("/dev/motion");
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await page.getByRole("link", { name: "Accueil existant" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Réactiver les animations" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-motion="background"]')).toHaveCSS(
    "transform",
    "none",
  );
});

test("desktop motion, preference cleanup, resize and route lifecycle", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/dev/motion");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Matière",
  );
  await expect(page.locator("[data-motion-scene]").first()).toHaveAttribute(
    "data-motion-state",
    "ready",
  );
  const layer = page.locator('[data-motion="background"]');
  await expect(layer).toHaveCSS("transform", /matrix/);
  const before = await layer.evaluate(
    (node) => getComputedStyle(node).transform,
  );
  await page.locator("#layers").scrollIntoViewIfNeeded();
  await expect
    .poll(() => layer.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe(before);
  await page.locator("#reveals").scrollIntoViewIfNeeded();
  await expect(page.locator('[data-motion="image"]')).toHaveCSS("opacity", "1");
  await page.locator("#pin").scrollIntoViewIfNeeded();
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  const pin = page.locator('[data-motion="pin"]');
  await expect(pin).toBeVisible();
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(layer).toHaveCSS("transform", "none");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Réactiver les animations" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Réactiver les animations" }).click();
  await expect(layer).toHaveCSS("transform", /matrix/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(layer).toHaveCSS("transform", "none");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("préférence système");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(layer).toHaveCSS("transform", /matrix/);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 600 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#pin").scrollIntoViewIfNeeded();
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.getByRole("link", { name: "Accueil existant" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.goBack();
  await page.locator("#layers").scrollIntoViewIfNeeded();
  await expect(layer).toHaveCSS("transform", /matrix/);
  await page.locator("#pin").scrollIntoViewIfNeeded();
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("reflow and lightweight motion at mobile/tablet widths", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dev/motion");
    await expect(page.locator("[data-motion-scene]").first()).toHaveAttribute(
      "data-motion-state",
      "ready",
    );
    await page.locator("#reveals").scrollIntoViewIfNeeded();
    for (const item of await page
      .locator('[data-motion="reveal"], [data-motion="image"]')
      .all())
      await expect(item).toHaveCSS("opacity", "1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width < 700)
      await expect(page.locator('[data-motion="background"]')).toHaveCSS(
        "transform",
        "none",
      );
    if (width < 1200) await expect(page.locator(".pin-spacer")).toHaveCount(0);
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `test-results/motion-${width}.png`,
        fullPage: true,
      });
  }
});

test("reduced-motion load skips GSAP and keeps every experiment readable", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/dev/motion`);
  await expect(page.getByRole("status")).toContainText("préférence système");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  for (const effect of [
    "background",
    "foreground",
    "reveal",
    "image",
    "transition",
    "pin",
  ]) {
    const item = page.locator(`[data-motion="${effect}"]`).first();
    await expect(item).toHaveCSS("transform", "none");
    await expect(item).toHaveCSS("opacity", "1");
  }
  expect(
    await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some((entry) => /node_modules_gsap/.test(entry.name)),
    ),
  ).toBe(false);
  await context.close();
});

test("no JavaScript retains content, image and ordinary anchor navigation", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 700 },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/dev/motion`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Révélations", exact: true }).click();
  await expect(page).toHaveURL(/#reveals$/);
  await expect(page.getByRole("img")).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(
    await page
      .locator("html")
      .evaluate((node) => node.scrollWidth <= innerWidth),
  ).toBe(true);
  await context.close();
});

test("keyboard and coarse pointer keep controls stable", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/dev/motion`);
  await expect(page.locator("[data-motion-scene]").first()).toHaveAttribute(
    "data-motion-state",
    "ready",
  );
  await expect(page.locator('[data-motion="foreground"]')).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller aux expériences" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#experiments$/);
  await context.close();
});
