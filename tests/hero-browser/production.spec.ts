import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("production without selected imagery is static, functional and contains no development assets", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const hero = page.locator("[data-parallax-hero]");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
    "Explorez. Respirez. Vivez l’aventure.",
  );
  await expect(hero.locator("[data-motion-scene]")).toHaveAttribute(
    "data-motion-state",
    "static",
  );
  await expect(
    hero.locator("[data-hero-image], [data-hero-placeholder]"),
  ).toHaveCount(0);
  await expect(page.locator("[data-navigation]")).toHaveAttribute(
    "data-state",
    "hero",
  );
  const scripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((r) => new URL(r.name).pathname)
      .filter((n) => n.startsWith("/_next/static/") && n.endsWith(".js")),
  );
  for (const script of scripts)
    expect(
      readFileSync(`.next/${script.replace("/_next/", "")}`, "utf8"),
    ).not.toContain("ScrollTrigger");
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [375, 812],
  ]) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`production-${width}x${height}.png`),
    });
  }
  await hero
    .getByRole("navigation", { name: "Explorer Sakado" })
    .getByRole("link", { name: "Événements", exact: true })
    .click();
  await expect(page).toHaveURL(/\/events$/);
  expect(errors).toEqual([]);
});
