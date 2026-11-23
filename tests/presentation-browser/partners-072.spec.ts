import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("private partner band retains six protected, undistorted logos", async ({ page, request }) => {
  await page.goto("/dev/presentation");
  await page.getByLabel("Code de présentation local").fill(
    readFileSync(".local/official-presentation/access-code.txt", "utf8").trim(),
  );
  await page.getByRole("button", { name: "Ouvrir le site officiel" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3134/");

  const section = page.locator("#partenaires");
  const logos = section.locator("li img");
  await expect(logos).toHaveCount(6);
  await expect(section.locator("[data-partner-review]")).toBeVisible();
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await section.scrollIntoViewIfNeeded();
    expect(await section.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    for (const logo of await logos.all()) {
      await expect(logo).toHaveCSS("object-fit", "contain");
      await expect.poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await section.screenshot({ path: `.local/redesign07-2/partners-private-${width}.png` });
  }

  const source = await logos.first().getAttribute("src");
  expect(source).toMatch(/^\/dev\/presentation-media\/[a-f0-9]{64}$/);
  expect((await request.get(source!)).status()).toBe(404);
  expect((await page.request.get(source!)).status()).toBe(200);
  expect((await page.request.get(`/_next/image?url=${encodeURIComponent(source!)}&w=640&q=75`)).status()).toBe(400);
});
