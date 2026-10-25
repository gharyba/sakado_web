import { test, expect, type Page } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import { request as httpRequest } from "node:http";

const origin = "https://review-validation.trycloudflare.com";
// Intercept the synthetic HTTPS test origin; no DNS, tunnel or Internet exposure.
async function transport(page: Page) {
  await page.context().route(origin + "/**", async (route) => {
    const url = new URL(route.request().url());
    const allHeaders = await route.request().allHeaders();
    const response = await route.fetch({
      url: "http://127.0.0.1:3144" + url.pathname + url.search,
      headers: { ...allHeaders, host: new URL(origin).host },
      maxRedirects: 0,
    });
    await route.fulfill({ response });
  });
}
async function enter(page: Page) {
  await transport(page);
  await page.goto("/_client-review");
  await page
    .getByLabel("Code de revue privée")
    .fill(readFileSync(".local/client-review/access-code.txt", "utf8").trim());
  await page.getByRole("button", { name: "Ouvrir le site officiel" }).click();
  await expect(page).toHaveURL(origin + "/");
  await expect(page.locator("main h1")).toBeVisible();
}
async function direct(
  path: string,
  headers: Record<string, string | undefined> = {},
  method = "GET",
  body = "",
) {
  return await new Promise<{
    status: number;
    headers: import("node:http").IncomingHttpHeaders;
  }>((resolve, reject) => {
    const req = httpRequest(
      {
        host: "127.0.0.1",
        port: 3144,
        path,
        method,
        headers: { host: new URL(origin).host, ...headers },
      },
      (res) => {
        res.resume();
        res.once("end", () =>
          resolve({ status: res.statusCode!, headers: res.headers }),
        );
      },
    );
    req.on("error", reject);
    req.end(body);
  });
}
test("outer identity headers cannot replace application login or exact origin validation", async () => {
  expect((await direct("/")).status).toBe(303);
  for (const headers of [
    { "Cf-Access-Authenticated-User-Email": "synthetic@example.test" },
    { "Cf-Access-Jwt-Assertion": "forged", "x-sakado-review-proof": "forged" },
  ]) {
    expect(
      (await direct("/_client-review/media/" + "a".repeat(64), headers)).status,
    ).toBe(404);
  }
  for (const headers of [
    { host: "127.0.0.1:3144" },
    { "x-forwarded-host": "evil.test" },
    { origin: "https://evil.test" },
    { "x-forwarded-proto": "http" },
  ])
    expect((await direct("/_client-review", headers)).status).toBe(404);
  const opened = await direct(
    "/_client-review/session",
    { origin, "content-type": "application/x-www-form-urlencoded" },
    "POST",
    new URLSearchParams({
      code: readFileSync(".local/client-review/access-code.txt", "utf8").trim(),
    }).toString(),
  );
  expect(opened.status).toBe(303);
  const cookie = opened.headers["set-cookie"]![0].split(";")[0];
  expect(
    (await direct("/", { cookie })).status,
    "authenticated ingress must reach the official Next page",
  ).toBe(200);
});
test("official fallback pages render at desktop/mobile widths without unapproved private media", async ({
  page,
}) => {
  await enter(page);
  const cookies = await page.context().cookies();
  expect(
    cookies.find((cookie) => cookie.name === "__Host-sakado_review"),
  ).toMatchObject({
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
  });
  mkdirSync(".local/secure-client-preview/captures", { recursive: true });
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["cache-control"]).toContain("no-store");
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      page.locator(
        'img[src^="/_client-review/media/"],img[src^="/dev/"],img[src^="/media/"]',
      ),
    ).toHaveCount(0);
    await expect(page.locator("#equipe article")).toHaveCount(2);
    await expect(page.locator("#partenaires li img")).toHaveCount(0);
    await expect(page.locator("[data-hero-coin]")).toHaveCount(0);
    await expect(page.locator("[data-developer-signature] a")).toHaveAttribute(
      "href",
      "mailto:ygharbi955@gmail.com",
    );
    await page.screenshot({
      path: `.local/secure-client-preview/captures/fallback-${width}.png`,
      caret: "initial",
    });
  }
  for (const route of [
    "/about",
    "/experiences",
    "/events",
    "/destinations",
    "/adventures",
    "/gallery",
    "/contact",
    "/privacy",
  ]) {
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
  }
});
test("authenticated review still denies admin, mutations, private files, dev tools and media without grants", async ({
  page,
}) => {
  await enter(page);
  const cookie = (await page.context().cookies(origin))
    .filter((cookie) => cookie.name === "__Host-sakado_review")
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join(";");
  for (const path of [
    "/admin",
    "/api/admin/users",
    "/api/admin/exports",
    "/dev/presentation",
    "/dev/motion",
    "/dev/photo-orbit",
    "/.env",
    "/SAKADO-MEDIA/a.webp",
    "/_next/image?url=%2F_client-review%2Fmedia%2Ftest&w=640&q=75",
    "/media/private",
    "/_client-review/media/" + "a".repeat(64),
  ])
    expect((await direct(path, { cookie })).status).toBe(404);
  for (const path of [
    "/api/contact",
    "/api/bookings",
    "/api/admin/settings",
    "/contact",
  ])
    expect((await direct(path, { cookie, origin }, "POST")).status).toBe(404);
  expect(
    (await direct("/", { cookie, "next-action": "synthetic" })).status,
  ).toBe(404);
});
test("motion preferences, native navigation, focus and logout remain usable", async ({
  page,
}) => {
  await enter(page);
  const originalCookie = (await page.context().cookies(origin))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join(";");
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .first()
    .click();
  await expect(
    page.locator('[data-motion-scene][data-motion-state="ready"]'),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Réactiver les animations", exact: true })
    .first()
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator('[data-motion-scene][data-motion-state="ready"]'),
  ).toHaveCount(0);
  await page.locator("[data-developer-signature] a").focus();
  await expect(page.locator("[data-developer-signature] a")).toBeFocused();
  expect(
    await page.evaluate(
      async () =>
        (await fetch("/_client-review/session", { method: "DELETE" })).status,
    ),
  ).toBe(204);
  const revoked = await direct("/", { cookie: originalCookie });
  expect(revoked.status).toBe(303);
  expect(revoked.headers.location).toBe(origin + "/_client-review");
  await page.goto("/_client-review");
  await expect(page.getByLabel("Code de revue privée")).toBeVisible();
});
test("the same production artifact remains public-safe with the review mode disabled", async ({
  request,
}) => {
  const base = "http://127.0.0.1:3145";
  expect((await request.get(base + "/")).status()).toBe(200);
  for (const path of [
    "/_client-review",
    "/_client-review/media/" + "a".repeat(64),
    "/dev/presentation",
    "/dev/presentation-media/" + "a".repeat(64),
  ])
    expect((await request.get(base + path)).status()).toBe(404);
  const html = await (await request.get(base + "/")).text();
  expect(html).not.toContain("/_client-review/media/");
  expect(html).not.toContain("/dev/presentation-media/");
});
