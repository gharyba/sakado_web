import { test, expect } from "@playwright/test";

test("public fallback contains no invented or protected photos; lab denied in production", async ({
  page,
  request,
}) => {
  const paths: string[] = [];
  page.on("request", (request) => paths.push(new URL(request.url()).pathname));
  for (const route of ["/", "/gallery"]) {
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        name: "Nos aventures en images.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("[data-gallery-empty]")).toBeVisible();
    await expect(
      page.locator(
        "[data-floating-memories], [data-official-presentation-gallery]",
      ),
    ).toHaveCount(0);
  }
  expect(
    paths.some((path) => path.startsWith("/dev/presentation-media/")),
  ).toBe(false);
  expect((await request.get("/dev/photo-orbit")).status()).toBe(404);
  const privatePath = `/dev/presentation-media/${"a".repeat(64)}`;
  await page.goto("/");
  await expect(page.locator("#equipe h3")).toHaveText([
    "Ben Beya Mohamed",
    "Bouzrara Manel",
  ]);
  await expect(page.locator("#equipe img")).toHaveCount(0);
  await expect(page.locator("[data-story-timeline] li")).toHaveCount(3);
  expect((await request.get("/api/admin/exports?type=events")).status()).toBe(
    401,
  );
  expect((await request.get(privatePath)).status()).toBe(404);
  expect(
    (
      await request.get(
        `/_next/image?url=${encodeURIComponent(privatePath)}&w=640&q=75`,
      )
    ).status(),
  ).toBe(400);
});
