import { test, expect } from "@playwright/test";

test("production hides the development route and preserves existing navigation", async ({
  page,
}) => {
  const response = await page.goto("/dev/motion");
  expect(response?.status()).toBe(404);
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator("#motion-lab")).toHaveCount(0);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('a[href="/dev/motion"]')).toHaveCount(0);
});
