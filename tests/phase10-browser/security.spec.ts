import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { phase05Db } from "../phase05-browser/database";

const origin = "http://127.0.0.1:3111";
async function login(page: Page) {
  const auth = JSON.parse(readFileSync(".local/test-auth.json", "utf8"));
  await page.goto("/admin/login");
  await page.getByLabel("Adresse e-mail").fill(auth.owner);
  await page.getByLabel("Mot de passe").fill(auth.password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "sakado_admin_session")).toMatchObject({
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  });
  // HTTP loopback API transport only; no application cookie policy is weakened.
  await page
    .context()
    .addCookies(cookies.map((c) => ({ ...c, secure: false })));
}

test("unknown, incorrect-password and inactive login failures are generic", async ({
  page,
}) => {
  const auth = JSON.parse(readFileSync(".local/test-auth.json", "utf8"));
  const messages: string[] = [];
  for (const [email, password] of [
    ["unknown-phase10@example.invalid", auth.password],
    [auth.owner, "incorrect-password-phase10"],
    [auth.inactive, auth.password],
  ]) {
    await page.goto("/admin/login");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();
    await expect(page.locator('[role="status"]')).not.toBeEmpty();
    messages.push((await page.locator('[role="status"]').textContent())!);
    expect(
      (await page.context().cookies()).some(
        (c) => c.name === "sakado_admin_session",
      ),
    ).toBe(false);
  }
  expect(new Set(messages).size).toBe(1);
});

test("synthetic image is normalized, private by default and explicitly publishable then withdrawable", async ({
  page,
  request,
}) => {
  await login(page);
  const db = phase05Db();
  try {
    const bytes = await sharp({
      create: { width: 2800, height: 100, channels: 3, background: "#426d80" },
    })
      .withMetadata()
      .png()
      .toBuffer();
    expect((await sharp(bytes).metadata()).exif).toBeDefined();
    const uploaded = await page.request.post("/api/admin/media", {
      headers: { Origin: origin },
      multipart: {
        file: {
          name: "synthetic-phase10.png",
          mimeType: "image/png",
          buffer: bytes,
        },
        alt: "Synthetic Phase 10 swatch",
      },
    });
    expect(uploaded.status()).toBe(200);
    const row = await db.galleryImage.findFirstOrThrow({
      where: { alt: "Synthetic Phase 10 swatch" },
    });
    expect(row).toMatchObject({ published: false, authorized: false });
    expect((await request.get(row.src)).status()).toBe(404);
    const privateResponse = await page.request.get(row.src);
    expect(privateResponse.status()).toBe(200);
    expect(privateResponse.headers()["cache-control"]).toContain("no-store");
    const metadata = await sharp(await privateResponse.body()).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(2400);
    expect(metadata.exif).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    const input = {
      id: row.id,
      alt: row.alt,
      caption: "Synthetic test only",
      category: "",
      eventId: "",
      destinationId: "",
      authorized: true,
      published: true,
      featured: false,
      order: 0,
    };
    expect(
      (
        await page.request.post("/api/admin/gallery", {
          headers: { Origin: origin },
          data: input,
        })
      ).status(),
    ).toBe(200);
    expect((await request.get(row.src)).status()).toBe(200);
    expect(
      (
        await page.request.post("/api/admin/gallery", {
          headers: { Origin: origin },
          data: { ...input, published: false },
        })
      ).status(),
    ).toBe(200);
    expect((await request.get(row.src)).status()).toBe(404);
  } finally {
    await db.$disconnect();
  }
});

test("malformed multipart, SVG and disguised bytes fail safely without creating media", async ({
  page,
}) => {
  await login(page);
  const db = phase05Db();
  try {
    const before = await db.galleryImage.count();
    const malformed = await page.request.post("/api/admin/media", {
      headers: {
        Origin: origin,
        "Content-Type": "multipart/form-data; boundary=missing",
      },
      data: "invalid",
    });
    expect(malformed.status()).toBe(400);
    for (const [name, mimeType, buffer] of [
      ["test.svg", "image/svg+xml", Buffer.from("<svg/>")],
      ["test.png", "image/png", Buffer.from("this is not an image")],
    ] as const) {
      const response = await page.request.post("/api/admin/media", {
        headers: { Origin: origin },
        multipart: {
          file: { name, mimeType, buffer },
          alt: "Rejected synthetic upload",
        },
      });
      expect(response.status()).toBe(400);
      expect(JSON.stringify(await response.json())).not.toMatch(
        /stack|postgresql:|node_modules/,
      );
    }
    expect(await db.galleryImage.count()).toBe(before);
  } finally {
    await db.$disconnect();
  }
});

test("same-origin security headers and public SEO exclude private routes", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toMatch(
    /\/admin|private-event|database-demo|private-destination/,
  );
  const admin = await request.get("/admin/login");
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
  expect(admin.headers()["cache-control"]).toContain("no-store");
});
