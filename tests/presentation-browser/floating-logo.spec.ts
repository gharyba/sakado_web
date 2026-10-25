import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";

async function enter(page: Page) {
  await page.goto("/dev/presentation");
  await page
    .getByLabel("Code de présentation local")
    .fill(
      readFileSync(
        ".local/official-presentation/access-code.txt",
        "utf8",
      ).trim(),
    );
  await page.getByRole("button", { name: "Ouvrir le site officiel" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3134/");
}

function capturePath(name: string) {
  mkdirSync(".local/floating-logo-review", { recursive: true });
  return `.local/floating-logo-review/${name}.png`;
}

test("protected crest travels from the hero photo to the viewport corner and reverses", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  const scene = page.locator("[data-hero-cinematic]");
  const slot = page.locator("[data-hero-emblem-slot]");
  const emblem = page.locator("[data-hero-emblem]");
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  await expect(emblem).toHaveCSS("position", "fixed");
  await expect
    .poll(() =>
      emblem
        .locator("img")
        .first()
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const frame = (await page.locator("[data-hero-frame]").boundingBox())!;
  const initial = (await emblem.boundingBox())!;
  expect(initial.x).toBeGreaterThan(frame.x + frame.width * 0.55);
  expect(initial.x + initial.width).toBeLessThan(frame.x + frame.width);
  expect(initial.y).toBeGreaterThan(frame.y);
  expect(initial.y + initial.height).toBeLessThan(frame.y + frame.height);
  await page.screenshot({ path: capturePath("desktop-top") });

  const end = await scene.evaluate(
    (element) => element.getBoundingClientRect().bottom + scrollY,
  );
  await page.evaluate((top) => scrollTo(0, top), end / 2);
  await page.waitForTimeout(850);
  const middle = (await emblem.boundingBox())!;
  expect(middle.x).toBeGreaterThan(initial.x);
  expect(middle.width).toBeLessThan(initial.width);
  await page.screenshot({ path: capturePath("desktop-halfway") });

  await page.evaluate((top) => scrollTo(0, top), end + 80);
  await page.waitForTimeout(850);
  const final = (await emblem.boundingBox())!;
  expect(final.x + final.width).toBeGreaterThan(1440 - 40);
  expect(final.y + final.height).toBeGreaterThan(900 - 40);
  expect(final.width).toBeLessThan(70);
  await page.screenshot({ path: capturePath("desktop-floating") });

  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(850);
  const returned = (await emblem.boundingBox())!;
  const anchor = (await slot.boundingBox())!;
  expect(Math.abs(returned.x - anchor.x)).toBeLessThan(3);
  expect(Math.abs(returned.y - anchor.y)).toBeLessThan(3);
  await page.screenshot({ path: capturePath("desktop-returned") });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-motion-state", "static");
  await expect(emblem).toHaveCSS("position", "absolute");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  await page.getByRole("button", { name: "Désactiver les animations" }).click();
  await expect(scene).toHaveAttribute("data-motion-state", "static");
  await expect(emblem).toHaveCSS("position", "absolute");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => scrollTo(0, 0));
  await expect(emblem).toBeInViewport();
  await page.getByRole("button", { name: "Activer les animations" }).click();
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(emblem).toBeInViewport();
});

for (const width of [1024, 768, 375]) {
  test(`protected crest stays clear and contained at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await enter(page);
    const emblem = page.locator("[data-hero-emblem]");
    await expect(emblem).toBeVisible();
    await expect
      .poll(() =>
        emblem
          .locator("img")
          .first()
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    const frame = (await page.locator("[data-hero-frame]").boundingBox())!;
    const mark = (await emblem.boundingBox())!;
    expect(mark.x).toBeGreaterThanOrEqual(frame.x);
    expect(mark.x + mark.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
    if (width === 375) {
      const shortcuts = (await page
        .locator("[data-parallax-hero]")
        .getByRole("navigation", { name: "Explorer Sakado" })
        .boundingBox())!;
      expect(mark.y + mark.height).toBeLessThan(shortcuts.y);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: capturePath(`top-${width}`) });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(emblem).toHaveCSS("position", "absolute");
  });
}
