import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { phase05Db } from "./database";
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const origin = "http://127.0.0.1:3111";
const resolveDependency = createRequire(`${process.cwd()}/package.json`);
async function auditMain(page: Page) {
  await page.addScriptTag({
    path: resolveDependency.resolve("axe-core/axe.min.js"),
  });
  const violations = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (
            context: unknown,
            options: unknown,
          ) => Promise<{
            violations: { id: string; help: string; nodes: unknown[] }[];
          }>;
        };
      }
    ).axe;
    return (
      await axe.run(
        { include: ["main"] },
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
      )
    ).violations;
  });
  expect(violations).toEqual([]);
}
async function fillRegistration(page: Page, email: string) {
  await page.getByLabel("Prénom", { exact: true }).fill("Test");
  await page.getByLabel("Nom", { exact: true }).fill("Visitor");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Téléphone", { exact: true }).fill("+21620000001");
  await page.getByLabel("Nombre de participants", { exact: true }).fill("2");
}
async function overflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("listing filters actual categories/destinations, open requests and past adventures", async ({
  page,
}) => {
  expect((await page.goto("/events"))?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Prochaines aventures",
  );
  await page
    .getByLabel("Activité", { exact: true })
    .selectOption({ label: "Activité synthétique Phase 05" });
  await page
    .getByLabel("Destination", { exact: true })
    .selectOption("phase05-destination");
  await page.getByLabel("Inscriptions ouvertes ou liste d’attente").check();
  await page.getByRole("button", { name: "Filtrer", exact: true }).click();
  await expect(page.locator(".event-card")).toHaveCount(3);
  await expect(page.locator(".event-grid")).not.toContainText("Fixture closed");
  await expect(page.locator(".event-grid")).toContainText("Fixture waitlist");
  await page.goto("/events?category=absent");
  await expect(
    page.getByText("Aucune aventure ne correspond à ces filtres."),
  ).toBeVisible();
  await page.goto("/adventures");
  await expect(page.locator(".event-card")).toHaveCount(1);
  await page.locator(".event-card a").click();
  await expect(page.getByText("Récit synthétique conservé.")).toBeVisible();
  await expect(page.locator("#inscription")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "S’inscrire", exact: true }),
  ).toHaveCount(0);
});
test("detail renders factual program, relationships, gated memories and metadata without private records", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/events/phase05-open");
  await expect(
    page.getByText("Étape synthétique jour 1", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Étape synthétique jour 2", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Inclusion stockée", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Découvrir Destination synthétique/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "D’autres aventures à découvrir" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Moments de cette aventure" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Moment publié synthétique/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Moment privé synthétique/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Moment publié synthétique/ }).click();
  await expect(
    page.getByRole("dialog").locator('a[href*="phase05public"]'),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.invalid/events/phase05-open",
  );
  const schema = JSON.parse(
    await page
      .locator('.s-event-page > script[type="application/ld+json"]')
      .innerText(),
  );
  expect(schema.name).toBe("Aventure synthétique Phase 05");
  expect(schema).not.toHaveProperty("offers");
  expect(errors).toEqual([]);
  await page.goto("/destinations/phase05-destination");
  await expect(
    page.getByRole("heading", { name: "Prochaines aventures ici" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Les aventures passées ici" }),
  ).toBeVisible();
  expect((await request.get("/events/private-event")).status()).toBe(404);
  expect((await request.get("/events/phase05-cancelled")).status()).toBe(404); // Existing visibility rule.
  expect((await request.get("/api/admin/exports")).status()).toBe(401);
});
for (const [slug, message] of [
  ["closed", "Inscriptions fermées."],
  ["full", "Complet. Les inscriptions sont fermées."],
  ["expired", "La date limite d’inscription est passée."],
  ["not-open", "Les inscriptions ne sont pas encore ouvertes."],
] as const) {
  test(`${slug} has an understandable state and no registration action`, async ({
    page,
  }) => {
    await page.goto(`/events/phase05-${slug}`);
    await expect(page.locator(".s-event-summary")).toContainText(message);
    await expect(page.locator("#inscription")).toHaveCount(0);
    await expect(page.locator(".s-event-mobile-cta")).toHaveCount(0);
  });
}
test("hidden availability never leaks counts into public HTML or form max", async ({
  page,
}) => {
  await page.goto("/events/phase05-hidden-count");
  await expect(page.locator(".s-event-summary")).not.toContainText("Capacité");
  await expect(page.locator(".s-event-summary")).not.toContainText(
    "Places disponibles",
  );
  await expect(
    page.getByLabel("Nombre de participants", { exact: true }),
  ).toHaveAttribute("max", "100");
});
test("keyboard form errors associate fields, preserve values and review before submission", async ({
  page,
}) => {
  await page.goto("/events/phase05-open#inscription");
  await page.getByLabel("Prénom", { exact: true }).fill("Saved");
  await page
    .getByRole("button", { name: "Vérifier ma demande", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("alert", { name: "Erreurs de la demande d’inscription" }),
  ).toBeFocused();
  await expect(page.getByLabel("Nom", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Nom", { exact: true })).toHaveAttribute(
    "aria-describedby",
    "registration-lastName-error",
  );
  await expect(page.getByLabel("Prénom", { exact: true })).toHaveValue("Saved");
  await fillRegistration(page, "review@example.invalid");
  await page
    .getByRole("button", { name: "Vérifier ma demande", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Vérifier ma demande", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".s-registration-review")).toContainText(
    "review@example.invalid",
  );
  await page.getByRole("button", { name: "Modifier", exact: true }).click();
  await expect(page.getByLabel("Prénom", { exact: true })).toBeFocused();
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue(
    "review@example.invalid",
  );
});
test("lost success response retries idempotently and returns accurate waitlist reference", async ({
  page,
}) => {
  await page.goto("/events/phase05-waitlist#inscription");
  await fillRegistration(page, "retry@example.invalid");
  let first = true;
  await page.route("**/api/registrations", async (route) => {
    if (first) {
      first = false;
      const saved = await route.fetch();
      expect(saved.status()).toBe(201);
      await route.abort("failed");
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "Vérifier ma demande", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Envoyer ma demande sur liste d’attente",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("alert", { name: "Erreurs de la demande d’inscription" }),
  ).toContainText("sans recharger");
  await page
    .getByRole("button", {
      name: "Envoyer ma demande sur liste d’attente",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Votre demande a bien été enregistrée.",
    }),
  ).toBeFocused();
  await expect(
    page.getByRole("status").filter({ hasText: "Votre référence" }),
  ).toContainText("Liste d’attente");
  const db = phase05Db();
  try {
    expect(
      await db.booking.count({ where: { email: "retry@example.invalid" } }),
    ).toBe(1);
  } finally {
    await db.$disconnect();
  }
});
test("registration API validates fields, deadlines, counts and closed states without private response data", async ({
  request,
}) => {
  const db = phase05Db();
  try {
    const event = await db.event.findUniqueOrThrow({
      where: { slug: "phase05-open" },
    });
    const input = {
      eventId: event.id,
      firstName: "Test",
      lastName: "API",
      email: "api@example.invalid",
      phone: "+21620000000",
      participantCount: 1,
      idempotencyKey: randomUUID(),
    };
    expect(
      (await request.post("/api/registrations", { data: input })).status(),
    ).toBe(403);
    for (const invalid of [
      { email: "invalid" },
      { phone: "invalid-phone" },
      { participantCount: 0 },
    ]) {
      const response = await request.post("/api/registrations", {
        headers: { Origin: origin },
        data: { ...input, ...invalid },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.fields).toHaveProperty(Object.keys(invalid)[0]);
      expect(JSON.stringify(body)).not.toContain("api@example.invalid");
    }
    expect(
      (
        await request.post("/api/registrations", {
          headers: { Origin: origin },
          data: { ...input, participantCount: 7 },
        })
      ).status(),
    ).toBe(409);
    for (const slug of ["closed", "expired", "cancelled"]) {
      const closed = await db.event.findUniqueOrThrow({
        where: { slug: `phase05-${slug}` },
      });
      const response = await request.post("/api/registrations", {
        headers: { Origin: origin },
        data: {
          ...input,
          eventId: closed.id,
          email: `${slug}@example.invalid`,
          idempotencyKey: randomUUID(),
        },
      });
      expect(response.status()).toBe(409);
    }
  } finally {
    await db.$disconnect();
  }
});
for (const width of [375, 390, 430, 768, 1024, 1440])
  test(`responsive discovery/detail/form/past at ${width}px with reduced motion`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: width < 700 ? 812 : 1024 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    mkdirSync(".local/phase05/screenshots", { recursive: true });
    for (const [route, name] of [
      ["/events", "events"],
      ["/events/phase05-open", "event"],
      ["/adventures", "past"],
    ]) {
      expect((await page.goto(route))?.status()).toBe(200);
      await overflow(page);
      await page.screenshot({
        path: `.local/phase05/screenshots/${name}-${width}.png`,
        fullPage: true,
      });
      if (width === 375 || width === 1440)
        await page.screenshot({
          path: `.local/phase05/screenshots/${name}-${width}-viewport.png`,
        });
    }
    await page.goto("/events/phase05-open#inscription");
    await fillRegistration(page, "responsive@example.invalid");
    await page
      .getByRole("button", { name: "Vérifier ma demande", exact: true })
      .click();
    await overflow(page);
    await page.screenshot({
      path: `.local/phase05/screenshots/review-${width}.png`,
      fullPage: true,
    });
    if (width === 375 || width === 1440)
      await page.screenshot({
        path: `.local/phase05/screenshots/review-${width}-viewport.png`,
      });
    expect(errors).toEqual([]);
  });
test("unavailable PostgreSQL does not affect demo pages or permit demo registrations", async ({
  page,
  request,
}) => {
  for (const path of ["/", "/events", "/events/demo-camping", "/adventures"])
    expect((await page.goto(`http://127.0.0.1:3112${path}`))?.status()).toBe(
      200,
    );
  await page.goto("http://127.0.0.1:3112/events/demo-camping");
  await expect(page.locator("#inscription")).toHaveCount(0);
  await expect(
    page.getByText("Inscriptions désactivées en démonstration.").first(),
  ).toBeVisible();
  expect(
    (
      await request.post("http://127.0.0.1:3112/api/registrations", {
        headers: { Origin: "http://127.0.0.1:3112" },
        data: {},
      })
    ).status(),
  ).toBe(409);
});

test("scoped WCAG checks cover listing, detail, errors and review; initial route payloads stay measurable", async ({
  page,
}) => {
  const payloads: {
    route: string;
    resources: number;
    rawBytes: number;
    gzipBytes: number;
  }[] = [];
  for (const route of ["/", "/events", "/events/phase05-open"]) {
    await page.goto(route);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.waitForLoadState("networkidle");
    const scripts = await page.evaluate(() => [
      ...new Set(
        performance
          .getEntriesByType("resource")
          .map((entry) => new URL(entry.name).pathname)
          .filter(
            (path) => path.startsWith("/_next/static/") && path.endsWith(".js"),
          ),
      ),
    ]);
    const bytes = scripts.map((path) =>
      readFileSync(`.next/${path.replace("/_next/", "")}`),
    );
    payloads.push({
      route,
      resources: scripts.length,
      rawBytes: bytes.reduce((total, value) => total + value.length, 0),
      gzipBytes: bytes.reduce(
        (total, value) => total + gzipSync(value).length,
        0,
      ),
    });
    if (route !== "/") await auditMain(page);
  }
  mkdirSync(".local/phase05", { recursive: true });
  writeFileSync(
    ".local/phase05/bundle.json",
    JSON.stringify(payloads, null, 2),
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await page
    .getByRole("button", { name: "Vérifier ma demande", exact: true })
    .click();
  await expect(
    page.getByRole("alert", { name: "Erreurs de la demande d’inscription" }),
  ).toBeFocused();
  await auditMain(page);
  await fillRegistration(page, "audit@example.invalid");
  await page
    .getByRole("button", { name: "Vérifier ma demande", exact: true })
    .click();
  await auditMain(page);
});

test("configured production database failure remains an error, without raw diagnostics in the response", async ({
  request,
}) => {
  const response = await request.get("http://127.0.0.1:3113/events");
  expect(response.status()).toBe(500);
  const html = await response.text();
  expect(html).not.toContain("Une nuit sous les étoiles");
  expect(html).not.toContain("PrismaClientInitializationError");
  const failed = await request.post("http://127.0.0.1:3113/api/registrations", {
    headers: { Origin: "http://127.0.0.1:3113" },
    data: {
      eventId: "unavailable",
      firstName: "Test",
      lastName: "Visitor",
      email: "unavailable@example.invalid",
      phone: "+21620000000",
      participantCount: 1,
      idempotencyKey: randomUUID(),
    },
  });
  expect(failed.status()).toBe(500);
  expect(await failed.json()).toEqual({
    error: "Impossible d’enregistrer votre demande. Réessayez.",
  });
});

test("without JavaScript event facts remain readable and registration offers a contact fallback", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}/events/phase05-open`);
    await expect(page.locator(".s-registration-fallback")).toBeVisible();
    await expect(page.locator(".s-registration")).toHaveAttribute(
      "method",
      "post",
    );
    await expect(
      page
        .locator(".s-registration-fallback")
        .getByRole("link", { name: "contacter Sakado" }),
    ).toHaveAttribute("href", "/contact");
    await expect(page.locator(".s-registration fieldset")).toHaveAttribute(
      "disabled",
      "",
    );
    await expect(page.getByLabel("Prénom", { exact: true })).toBeDisabled();
    await overflow(page);
  } finally {
    await context.close();
  }
});

test("admin creates and publishes an event, anonymous visitor registers, admin manages the saved request", async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(120000);
  const auth = JSON.parse(readFileSync(".local/test-auth.json", "utf8"));
  await page.goto("/admin/login");
  await page.getByLabel("Adresse e-mail").fill(auth.owner);
  await page.getByLabel("Mot de passe").fill(auth.password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  // Local loopback test only. Application cookie settings are unchanged.
  await page.context().addCookies(
    (await page.context().cookies()).map((cookie) => ({
      ...cookie,
      secure: false,
    })),
  );
  await page
    .getByRole("link", { name: "+ Ajouter une sortie", exact: true })
    .click();
  await page
    .getByLabel("Nom de la sortie", { exact: true })
    .fill("Workflow isolé Phase 05");
  await page
    .getByLabel("Lien de la sortie", { exact: true })
    .fill("phase05-workflow");
  await page
    .getByLabel("Description courte", { exact: true })
    .fill("Données de test uniquement.");
  await page
    .getByLabel("Description complète", { exact: true })
    .fill("Workflow synthétique sans offre commerciale.");
  await page
    .getByLabel("Début", { exact: true })
    .fill(new Date(Date.now() + 50 * 86400000).toISOString().slice(0, 16));
  await page.getByLabel("Tarif par participant (TND)").fill("75.500");
  await page.getByLabel("Capacité", { exact: true }).fill("4");
  await page
    .getByRole("button", { name: "+ Ajouter une étape", exact: true })
    .click();
  await page
    .getByLabel("Étape", { exact: true })
    .fill("Étape workflow synthétique");
  await page.getByLabel("Heure", { exact: true }).fill("07:30");
  await page
    .getByRole("button", { name: "Créer la sortie", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/events\/(?!new$)[^/]+$/);
  const id = page.url().split("/").pop()!;
  expect((await request.get("/events/phase05-workflow")).status()).toBe(404);
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
  await page.getByLabel("Mettre en avant", { exact: true }).check();
  await page
    .getByRole("button", { name: "Enregistrer la sortie", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`/admin/events/${id}$`));
  const visitorContext = await browser.newContext();
  const visitor = await visitorContext.newPage();
  try {
    await visitor.goto(`${origin}/`);
    await expect(visitor.locator("[data-parallax-hero]")).toBeVisible();
    await visitor
      .getByRole("link", { name: /Workflow isolé Phase 05/ })
      .click();
    await expect(
      visitor.getByText("Étape workflow synthétique", { exact: true }),
    ).toBeVisible();
    await fillRegistration(visitor, "workflow05@example.invalid");
    await visitor
      .getByRole("button", { name: "Vérifier ma demande", exact: true })
      .click();
    await visitor
      .getByRole("button", {
        name: "Envoyer ma demande d’inscription",
        exact: true,
      })
      .click();
    await expect(
      visitor.getByRole("heading", {
        name: "Votre demande a bien été enregistrée.",
      }),
    ).toBeVisible();
    await expect(
      visitor.getByRole("status").filter({ hasText: "Votre référence" }),
    ).toContainText("en attente de confirmation");
    expect(
      (
        await visitor.request.get(`${origin}/api/admin/exports?eventId=${id}`)
      ).status(),
    ).toBe(401);
  } finally {
    await visitorContext.close();
  }
  await page.goto(`/admin/events/${id}/registrations`);
  await expect(
    page.getByText("workflow05@example.invalid", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voir / gérer", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Statut", exact: true })
    .selectOption("CONFIRMED");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Inscription enregistrée.",
  );
  const db = phase05Db();
  try {
    const saved = await db.booking.findFirstOrThrow({ where: { eventId: id } });
    expect(saved.status).toBe("CONFIRMED");
    expect(saved.participantCount).toBe(2);
    expect(saved.totalAmount.toString()).toBe("151");
  } finally {
    await db.$disconnect();
  }
  const html = await (await request.get("/events/phase05-workflow")).text();
  expect(html).not.toContain("workflow05@example.invalid");
  expect(html).not.toContain("+21620000001");
  // Exercise existing Instagram publication controls using ONLY our synthetic fixture.
  await page.goto("/admin/instagram");
  await expect(
    page.getByRole("heading", { name: "Les moments Instagram", exact: true }),
  ).toBeVisible();
  const mediaDb = phase05Db();
  try {
    const synthetic = await mediaDb.instagramMedia.findUniqueOrThrow({
      where: { instagramUrl: "https://www.instagram.com/p/phase05private/" },
    });
    const mediaData = {
      id: synthetic.id,
      instagramUrl: synthetic.instagramUrl,
      eventId: synthetic.eventId,
      title: "Moment privé synthétique",
      published: true,
      showOnHomepage: true,
    };
    expect(
      (
        await page.request.post("/api/admin/instagram", {
          headers: { Origin: origin },
          data: mediaData,
        })
      ).status(),
    ).toBe(200);
    await page.goto("/");
    await expect(
      page
        .getByRole("region", { name: "Publications Instagram Sakado" })
        .getByRole("button", { name: /Moment privé synthétique/ })
        .first(),
    ).toBeVisible();
    await page.goto("/gallery?view=instagram");
    await expect(
      page.getByRole("button", { name: /Moment privé synthétique/ }),
    ).toBeVisible();
    expect(
      (
        await page.request.post("/api/admin/instagram", {
          headers: { Origin: origin },
          data: { ...mediaData, published: false, showOnHomepage: false },
        })
      ).status(),
    ).toBe(200);
    const restored = await mediaDb.instagramMedia.findUniqueOrThrow({
      where: { id: synthetic.id },
    });
    expect(restored.published).toBe(false);
    expect(restored.showOnHomepage).toBe(false);
    await page.goto("/events/phase05-open");
    await expect(
      page.getByRole("button", { name: /Moment privé synthétique/ }),
    ).toHaveCount(0);
  } finally {
    await mediaDb.$disconnect();
  }
});
