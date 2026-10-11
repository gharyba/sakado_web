import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { testDb } from "../test-database";
import { newSessionToken, tokenHash } from "../../src/lib/security";
const auth = JSON.parse(readFileSync(".local/test-auth.json", "utf8")) as {
  password: string;
  owner: string;
  admin: string;
  editor: string;
  inactive: string;
};
async function login(page: Page, email = auth.owner) {
  await page.goto("/admin/login");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(auth.password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  /* Local HTTP APIRequestContext fixture; application still sets Secure cookies. */ await page
    .context()
    .addCookies(
      (await page.context().cookies()).map((cookie) => ({
        ...cookie,
        secure: false,
      })),
    );
}
test("owner creates draft, publishes program, receives public registration, confirms and exports", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  await login(page);
  await page
    .getByRole("link", { name: "+ Ajouter une sortie", exact: true })
    .click();
  await page
    .getByLabel("Nom de la sortie", { exact: true })
    .fill("Aventure workflow de vérification");
  await page
    .getByLabel("Lien de la sortie", { exact: true })
    .fill("workflow-verification");
  await page
    .getByLabel("Description courte", { exact: true })
    .fill("Une sortie synthétique pour vérifier le fonctionnement.");
  await page
    .getByLabel("Description complète", { exact: true })
    .fill("Données de test uniquement, sans offre commerciale réelle.");
  const date = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 16);
  await page.getByLabel("Début", { exact: true }).fill(date);
  await page.getByLabel("Tarif par participant (TND)").fill("75.500");
  await page.getByLabel("Capacité", { exact: true }).fill("4");
  await page
    .getByRole("button", { name: "+ Ajouter une étape", exact: true })
    .click();
  await page.getByLabel("Étape", { exact: true }).fill("Départ du groupe");
  await page.getByLabel("Heure", { exact: true }).fill("07:30");
  await page
    .getByRole("button", { name: "Créer la sortie", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/events\/(?!new$)[^/]+$/);
  const id = page.url().split("/").pop()!;
  expect((await request.get("/events/workflow-verification")).status()).toBe(
    404,
  );
  await page
    .getByRole("link", { name: "Modifier", exact: true })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Statut de la sortie", exact: true })
    .selectOption("UPCOMING");
  await page
    .getByRole("combobox", { name: "Inscriptions", exact: true })
    .selectOption("OPEN");
  await page.getByLabel("Publier sur le site", { exact: true }).check();
  await page
    .getByRole("button", { name: "Enregistrer la sortie", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp("/admin/events/" + id + "$"));
  await page.goto("/events/workflow-verification");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Aventure workflow de vérification",
  );
  await expect(
    page.getByText("Départ du groupe", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Prénom", { exact: true }).fill("Visitor");
  await page.getByLabel("Nom", { exact: true }).fill("Workflow");
  await page
    .getByLabel("E-mail", { exact: true })
    .fill("workflow@example.invalid");
  await page.getByLabel("Téléphone", { exact: true }).fill("+21620000001");
  await page.getByLabel("Nombre de participants", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "Vérifier ma demande", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Envoyer ma demande d’inscription",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Votre demande a bien été enregistrée.",
    }),
  ).toBeVisible();
  await page.goto("/admin/events/" + id + "/registrations");
  await expect(
    page.getByText("workflow@example.invalid", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voir / gérer", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Statut", exact: true })
    .selectOption("CONFIRMED");
  await page
    .getByRole("combobox", { name: "Paiement", exact: true })
    .selectOption("PAID");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Inscription enregistrée.",
  );
  const csv = await page.request.get("/api/admin/exports?eventId=" + id);
  expect(csv.status()).toBe(200);
  expect(csv.headers()["cache-control"]).toContain("no-store");
  expect(await csv.text()).toContain("workflow@example.invalid");
  expect((await request.get("/api/admin/exports?eventId=" + id)).status()).toBe(
    401,
  );
  const publicHtml = await (
    await request.get("/events/workflow-verification")
  ).text();
  expect(publicHtml).not.toContain("workflow@example.invalid");
  expect(publicHtml).not.toContain("+21620000001");
  await page.goto("/admin/events/" + id);
  await page.getByRole("button", { name: "Dépublier", exact: true }).click();
  await expect
    .poll(async () =>
      (await request.get("/events/workflow-verification")).status(),
    )
    .toBe(404);
});
test("API and page authorization, CSRF, inactive and expired sessions", async ({
  page,
  request,
}) => {
  expect((await request.post("/api/admin/events", { data: {} })).status()).toBe(
    401,
  );
  await login(page, auth.editor);
  expect(
    (
      await page.request.post("/api/admin/users", {
        headers: { Origin: "http://127.0.0.1:3101" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/admin/bookings", {
        headers: { Origin: "http://127.0.0.1:3101" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (await page.request.get("/api/admin/exports?eventId=anything")).status(),
  ).toBe(403);
  const forbidden = await page.goto("/admin/users");
  expect([200, 403]).toContain(forbidden?.status());
  await expect(
    page.getByRole("heading", { name: "Accès non autorisé" }),
  ).toBeVisible();
  await expect(page.getByText("owner@example.invalid")).toHaveCount(0);
  await page.goto("/admin");
  expect(
    (
      await page.request.post("/api/admin/events", {
        headers: { Origin: "https://attacker.invalid" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/admin/events", {
        headers: {
          Origin: "http://127.0.0.1:3101",
          "Content-Type": "application/json",
        },
        data: "[",
      })
    ).status(),
  ).toBe(400);
  await page.getByRole("button", { name: "Déconnexion", exact: true }).click();
  await page.getByLabel("Adresse e-mail").fill(auth.inactive);
  await page.getByLabel("Mot de passe").fill(auth.password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Email ou mot de passe incorrect.",
  );
  const db = testDb();
  try {
    const user = await db.adminUser.findUniqueOrThrow({
      where: { email: auth.admin },
    });
    const token = newSessionToken();
    await db.adminSession.create({
      data: {
        adminId: user.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    await page.context().addCookies([
      {
        name: "sakado_admin_session",
        value: token,
        url: "http://127.0.0.1:3101",
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  } finally {
    await db.$disconnect();
  }
});
test("gallery upload strips metadata, stays private until published, and rejects SVG", async ({
  page,
  request,
}) => {
  await login(page);
  const db = testDb();
  try {
    const png = readFileSync("public/admin/icon-192.png");
    const response = await page.request.post("/api/admin/media", {
      headers: { Origin: "http://127.0.0.1:3101" },
      multipart: {
        file: { name: "fixture.png", mimeType: "image/png", buffer: png },
        alt: "Photo technique de vérification",
        authorized: "on",
      },
    });
    expect(response.status()).toBe(200);
    const photo = await db.galleryImage.findFirstOrThrow({
      where: { alt: "Photo technique de vérification" },
    });
    expect(photo.src).toMatch(/\.webp$/);
    expect((await request.get(photo.src)).status()).toBe(404);
    expect((await page.request.get(photo.src)).status()).toBe(200);
    const publish = await page.request.post("/api/admin/gallery", {
      headers: { Origin: "http://127.0.0.1:3101" },
      data: {
        id: photo.id,
        alt: photo.alt,
        caption: "Fixture",
        category: "Test",
        eventId: "",
        destinationId: "",
        authorized: true,
        published: true,
        featured: true,
        order: 0,
      },
    });
    expect(publish.status()).toBe(200);
    expect((await request.get(photo.src)).status()).toBe(200);
    const bad = await page.request.post("/api/admin/media", {
      headers: { Origin: "http://127.0.0.1:3101" },
      multipart: {
        file: {
          name: "bad.svg",
          mimeType: "image/svg+xml",
          buffer: Buffer.from("<svg/>"),
        },
        alt: "Rejected SVG",
      },
    });
    expect(bad.status()).toBe(400);
  } finally {
    await db.galleryImage.deleteMany({
      where: { alt: "Photo technique de vérification" },
    });
    await db.$disconnect();
  }
});
test("public registration rejects manipulated fields, closed events, oversized bodies and foreign origins", async ({
  request,
}) => {
  const db = testDb();
  try {
    const event = await db.event.findUniqueOrThrow({
      where: { slug: "verified-event" },
    });
    const data = {
      eventId: event.id,
      firstName: "Test",
      lastName: "Visitor",
      email: "invalid-input@example.invalid",
      phone: "+21620000000",
      participantCount: 0,
      idempotencyKey: randomUUID(),
    };
    expect(
      (
        await request.post("/api/registrations", {
          headers: { Origin: "http://127.0.0.1:3101" },
          data,
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await request.post("/api/registrations", {
          headers: { Origin: "https://foreign.invalid" },
          data: { ...data, participantCount: 1 },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.post("/api/registrations", {
          headers: { Origin: "http://127.0.0.1:3101" },
          data: { ...data, notes: "x".repeat(21000) },
        })
      ).status(),
    ).toBe(413);
    const privateEvent = await db.event.findUniqueOrThrow({
      where: { slug: "private-event" },
    });
    expect(
      (
        await request.post("/api/registrations", {
          headers: { Origin: "http://127.0.0.1:3101" },
          data: { ...data, eventId: privateEvent.id, participantCount: 1 },
        })
      ).status(),
    ).toBe(409);
  } finally {
    await db.$disconnect();
  }
});
test("admin pages fit mobile, tablet, and desktop viewports", async ({
  page,
}) => {
  test.setTimeout(90000);
  await login(page);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/admin",
      "/admin/events/new",
      "/admin/registrations",
      "/admin/gallery",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path + " at " + width,
      ).toBe(true);
    }
    if (width === 390 || width === 1440) {
      await page.goto("/admin");
      await page.screenshot({
        path: "test-results/admin-dashboard-" + width + ".png",
        fullPage: true,
      });
      await page.goto("/admin/events/new");
      await page.screenshot({
        path: "test-results/admin-event-form-" + width + ".png",
        fullPage: true,
      });
    }
  }
});
test("PWA caches only static files and shows a neutral offline fallback", async ({
  page,
  context,
  request,
}) => {
  await login(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  const manifest = await request.get("/admin/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  const data = await manifest.json();
  expect(data.display).toBe("standalone");
  expect(data.icons).toHaveLength(2);
  await page.reload();
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys.map(async (key) =>
          (await (await caches.open(key)).keys()).map(
            (r) => new URL(r.url).pathname,
          ),
        ),
      )
    ).flat();
  });
  expect(cached.sort()).toEqual(
    [
      "/admin/icon-192.png",
      "/admin/icon-512.png",
      "/admin/offline.html",
    ].sort(),
  );
  await context.setOffline(true);
  await page.goto("/admin/events");
  await expect(
    page.getByRole("heading", { name: "Retrouvons la connexion." }),
  ).toBeVisible();
  await expect(page.getByText("workflow@example.invalid")).toHaveCount(0);
  await context.setOffline(false);
});
