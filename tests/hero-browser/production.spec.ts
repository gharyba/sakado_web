import { test, expect } from "@playwright/test";

test("production without selected imagery is static, functional and contains no development assets", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const hero = page.locator("[data-parallax-hero]");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName(
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
  // The independent ambient/story scenes may load GSAP. Hero eligibility remains
  // static without selected imagery; production development routes remain denied.
  for (const route of [
    "/dev/motion",
    "/dev/presentation",
    "/dev/presentation-media/" + "0".repeat(64),
  ])
    expect((await page.request.get(route)).status()).toBe(404);
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
