import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { phase05Db } from "../phase05-browser/database";
import { newSessionToken, tokenHash } from "../../src/lib/security";
import { mutate } from "../../src/lib/admin-mutations";
import { occupied } from "../../src/lib/event-policy";
import { createRequire } from "node:module";

const origin = "http://127.0.0.1:3111";
async function asRole(page: Page, role: "OWNER" | "ADMIN" | "EDITOR") {
  const db = phase05Db();
  try {
    const actor = await db.adminUser.findFirstOrThrow({
      where: { role, active: true },
    });
    const token = newSessionToken();
    await db.adminSession.create({
      data: {
        adminId: actor.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    // Synthetic fixture session only; insecure cookie solely for loopback HTTP test transport.
    await page.context().addCookies([
      {
        name: "sakado_admin_session",
        value: token,
        url: origin,
        httpOnly: true,
        sameSite: "Strict",
        secure: false,
      },
    ]);
    return actor;
  } finally {
    await db.$disconnect();
  }
}
function post(page: Page, resource: string, data: unknown, source = origin) {
  return page.request.post(`${origin}/api/admin/${resource}`, {
    data,
    headers: { Origin: source },
  });
}
function eventInput(
  row: Awaited<
    ReturnType<ReturnType<typeof phase05Db>["event"]["findUniqueOrThrow"]>
  >,
) {
  return {
    ...row,
    price: row.price === null ? "" : Number(row.price),
    capacity: row.capacity ?? "",
    difficulty: "",
    included: "",
    excluded: "",
    equipment: "",
    schedule: [],
  };
}

test("anonymous mutations and exports are denied without disclosing data", async ({
  page,
}) => {
  for (const resource of [
    "events",
    "bookings",
    "destinations",
    "categories",
    "gallery",
    "messages",
    "site",
    "settings",
    "users",
    "instagram",
    "media",
  ]) {
    const response = await post(page, resource, {});
    expect(response.status(), resource).toBe(401);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  expect(
    (await page.request.get("/api/admin/exports?eventId=private")).status(),
  ).toBe(401);
  await page.goto("/admin/events");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

for (const role of ["EDITOR", "ADMIN"] as const)
  test(`${role} cannot escalate or call forbidden mutations directly`, async ({
    page,
  }) => {
    const actor = await asRole(page, role);
    for (const resource of role === "EDITOR"
      ? ["users", "settings", "bookings", "destinations", "messages"]
      : ["users", "settings"])
      expect(
        (await post(page, resource, { id: actor.id, role: "OWNER" })).status(),
      ).toBe(403);
    // Next may already have streamed the protected layout/loading response with HTTP 200.
    expect([200, 403]).toContain((await page.goto("/admin/users"))?.status());
    await expect(
      page.getByRole("heading", { name: "Accès non autorisé", exact: true }),
    ).toBeVisible();
    expect(await page.locator("form").count()).toBe(0);
    await page.goto("/admin");
    await expect(
      page
        .getByRole("navigation", { name: "Administration", exact: true })
        .getByRole("link", { name: "Utilisateurs" }),
    ).toHaveCount(0);
    const db = phase05Db();
    try {
      await expect(
        mutate(db, "users", {}, { id: actor.id, role: "OWNER" }),
      ).rejects.toMatchObject({ status: 403 });
      expect(
        (await db.adminUser.findUniqueOrThrow({ where: { id: actor.id } }))
          .role,
      ).toBe(role);
    } finally {
      await db.$disconnect();
    }
  });

test("origin, body format, unknown resource and unsafe settings are rejected", async ({
  page,
}) => {
  await asRole(page, "OWNER");
  expect(
    (
      await post(page, "events", {}, "https://foreign.example.invalid")
    ).status(),
  ).toBe(403);
  expect(
    (await page.request.post("/api/admin/events", { data: {} })).status(),
  ).toBe(403);
  expect((await post(page, "not-a-resource", {})).status()).toBe(404);
  const invalidImport = await post(page, "instagram", {
    intent: "import",
    urls: "https://foreign.example.invalid/post",
  });
  expect(invalidImport.status()).toBe(400);
  expect((await invalidImport.json()).error).toBe(
    "Liste de liens Instagram invalide.",
  );
  expect(
    (
      await page.request.post("/api/admin/events", {
        data: "not-json",
        headers: { Origin: origin, "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.put("/api/admin/events", {
        data: {},
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(405);
  const response = await post(page, "settings", {
    name: "Fixture",
    instagramUrl: "javascript:alert(1)",
    footerText: "",
    socialLinks: [],
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).fields.instagramUrl).toBe(
    "Vérifiez ce champ.",
  );
});

test("terminal event policies, stale versions, cancellation and last-owner protection are enforced", async ({
  page,
}) => {
  const owner = await asRole(page, "OWNER");
  const db = phase05Db();
  try {
    const original = await db.event.findUniqueOrThrow({
      where: { slug: "phase05-open" },
    });
    const row = await db.event.create({
      data: {
        slug: "phase06-transition",
        title: "Synthetic transition",
        shortDescription: "Test only",
        description: "Isolated test only",
        startsAt: original.startsAt,
        endsAt: original.endsAt,
        capacity: 5,
        price: 10,
        status: "UPCOMING",
        registrationStatus: "OPEN",
        published: true,
      },
    });
    for (const status of ["CANCELLED", "ARCHIVED", "COMPLETED", "ONGOING"])
      expect(
        (await post(page, "events", { ...eventInput(row), status })).status(),
      ).toBe(409);
    expect(
      (
        await post(page, "events", {
          ...eventInput(row),
          version: row.version + 1,
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await post(page, "events", {
          id: row.id,
          intent: "cancel",
          version: row.version,
        })
      ).status(),
    ).toBe(200);
    const cancelled = await db.event.findUniqueOrThrow({
      where: { id: row.id },
    });
    expect(cancelled).toMatchObject({
      status: "CANCELLED",
      registrationStatus: "CLOSED",
      published: false,
    });
    expect(
      (
        await post(page, "events", {
          ...eventInput(cancelled),
          status: "UPCOMING",
          registrationStatus: "OPEN",
          published: true,
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await post(page, "events", {
          ...eventInput(cancelled),
          description: "Safe historical correction",
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await post(page, "users", {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: "ADMIN",
          active: true,
          password: "",
        })
      ).status(),
    ).toBe(409);
    expect(
      (await db.adminUser.findUniqueOrThrow({ where: { id: owner.id } })).role,
    ).toBe("OWNER");
  } finally {
    await db.$disconnect();
  }
});

test("owner manages accounts without exposing hashes and account changes revoke sessions", async ({
  page,
}) => {
  await asRole(page, "OWNER");
  const input = {
    name: "Synthetic staff",
    email: "phase06-staff@example.invalid",
    role: "EDITOR",
    active: true,
    password: randomUUID(),
  };
  const created = await post(page, "users", input);
  expect(created.status()).toBe(200);
  expect(await created.text()).not.toMatch(/password|argon2|tokenHash/i);
  const db = phase05Db();
  try {
    const user = await db.adminUser.findUniqueOrThrow({
      where: { email: input.email },
    });
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    const token = newSessionToken();
    await db.adminSession.create({
      data: {
        adminId: user.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    const updated = await post(page, "users", {
      ...input,
      id: user.id,
      password: "",
      active: false,
    });
    expect(updated.status()).toBe(200);
    expect(await db.adminSession.count({ where: { adminId: user.id } })).toBe(
      0,
    );
    expect(
      (
        await page.request.post("/api/admin/site", {
          headers: { Origin: origin, Cookie: "sakado_admin_session=" + token },
          data: {},
        })
      ).status(),
    ).toBe(401);
  } finally {
    await db.$disconnect();
  }
});

test("concurrent admin confirmations cannot overbook; identical retries are no-ops and stale edits fail", async ({
  page,
}) => {
  await asRole(page, "ADMIN");
  const db = phase05Db();
  try {
    const event = await db.event.create({
      data: {
        slug: "phase06-capacity",
        title: "Synthetic capacity",
        shortDescription: "Test only",
        description: "Test only",
        startsAt: new Date(Date.now() + 86400000),
        capacity: 1,
        price: 10,
        published: true,
        status: "UPCOMING",
        registrationStatus: "WAITLIST_ONLY",
      },
    });
    const rows = await Promise.all(
      [0, 1].map((n) =>
        db.booking.create({
          data: {
            eventId: event.id,
            reference: `PH06-${n}`,
            idempotencyKey: randomUUID(),
            firstName: "Test",
            lastName: "Participant",
            email: `phase06-${n}@example.invalid`,
            phone: "+21620000000",
            participantCount: 1,
            totalAmount: 10,
            status: "WAITLIST",
          },
        }),
      ),
    );
    const edit = (row: (typeof rows)[number]) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      participantCount: 1,
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      internalNote: null,
    });
    const results = await Promise.all(
      rows.map((row) => post(page, "bookings", edit(row))),
    );
    expect(results.map((r) => r.status()).sort()).toEqual([200, 409]);
    const current = await db.booking.findFirstOrThrow({
      where: { eventId: event.id, status: "CONFIRMED" },
    });
    expect(
      occupied(await db.booking.findMany({ where: { eventId: event.id } })),
    ).toBe(1);
    const before = await db.auditLog.count({ where: { entityId: current.id } });
    expect((await post(page, "bookings", edit(current))).status()).toBe(200);
    expect(await db.auditLog.count({ where: { entityId: current.id } })).toBe(
      before,
    );
    expect(
      (
        await post(page, "bookings", {
          ...edit(current),
          expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
        })
      ).status(),
    ).toBe(409);
    await db.event.update({
      where: { id: event.id },
      data: {
        status: "CANCELLED",
        registrationStatus: "CLOSED",
        published: false,
      },
    });
    expect(
      (
        await post(page, "bookings", { ...edit(current), participantCount: 2 })
      ).status(),
    ).toBe(409);
  } finally {
    await db.$disconnect();
  }
});

test("blocked media is rejected in covers and uploads; registry is read-only and selectors omit it", async ({
  page,
}) => {
  await asRole(page, "OWNER");
  expect(
    (
      await post(page, "site", { heroImage: "/images/S08-unapproved.webp" })
    ).status(),
  ).toBe(409);
  const response = await page.request.post("/api/admin/media", {
    headers: { Origin: origin },
    multipart: {
      alt: "Blocked synthetic bytes",
      file: {
        name: "S08-unapproved.webp",
        mimeType: "image/webp",
        buffer: Buffer.from("synthetic-not-a-photo"),
      },
      authorized: "on",
    },
  });
  expect(response.status()).toBe(409);
  await page.goto("/admin/media-readiness");
  await expect(page.getByText(/17 fichiers suivis/)).toContainText(
    "17 BLOCKED",
  );
  expect(await page.locator("main img").count()).toBe(0);
  await page.goto("/admin/events/new");
  expect(
    await page.locator('select[name="coverImage"] option').allTextContents(),
  ).not.toContain("S08");
});

test("admin limiter rejects excessive mutations without changing content", async ({
  page,
}) => {
  const actor = await asRole(page, "EDITOR");
  const db = phase05Db();
  const { createHmac } = await import("node:crypto");
  const key = createHmac(
    "sha256",
    "phase05-isolated-browser-only-not-production-00000000000000000",
  )
    .update(`admin-mutation:${actor.id}:${Math.floor(Date.now() / 900000)}`)
    .digest("hex");
  try {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 300, expiresAt: new Date(Date.now() + 900000) },
      update: { count: 300 },
    });
    expect((await post(page, "site", {})).status()).toBe(429);
  } finally {
    await db.rateLimit.deleteMany({ where: { key } });
    await db.$disconnect();
  }
});

test("login rotates opaque secure sessions, logout invalidates, and expired/inactive sessions fail", async ({
  page,
}) => {
  const auth = JSON.parse(readFileSync(".local/test-auth.json", "utf8"));
  await page.goto("/admin/login");
  await page.getByLabel("Adresse e-mail").fill(auth.owner);
  await page.getByLabel("Mot de passe").fill(auth.password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === "sakado_admin_session",
  )!;
  expect(cookie).toMatchObject({
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  expect(cookie.value).toMatch(/^[a-zA-Z0-9_-]{43}$/);
  await page.context().addCookies([{ ...cookie, secure: false }]);
  const db = phase05Db();
  try {
    expect(
      await db.adminSession.findUnique({
        where: { tokenHash: tokenHash(cookie.value) },
      }),
    ).not.toBeNull();
    // Authenticated GET /admin/login correctly redirects. Display the form first,
    // then restore the old synthetic cookie to exercise rotation on the login POST.
    await page.context().clearCookies();
    await page.goto("/admin/login");
    await page.context().addCookies([{ ...cookie, secure: false }]);
    await page.getByLabel("Adresse e-mail").fill(auth.owner);
    await page.getByLabel("Mot de passe").fill(auth.password);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();
    await expect(page).toHaveURL(/\/admin$/);
    const rotated = (await page.context().cookies()).find(
      (c) => c.name === cookie.name,
    )!;
    expect(rotated.value).not.toBe(cookie.value);
    expect(
      await db.adminSession.findUnique({
        where: { tokenHash: tokenHash(cookie.value) },
      }),
    ).toBeNull();
    await page.context().addCookies([{ ...rotated, secure: false }]);
    await page.getByRole("button", { name: /Déconnexion/ }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    expect(
      await db.adminSession.findUnique({
        where: { tokenHash: tokenHash(rotated.value) },
      }),
    ).toBeNull();
    for (const inactive of [false, true]) {
      const actor = await db.adminUser.findFirstOrThrow({
        where: inactive ? { active: false } : { role: "OWNER", active: true },
      });
      const token = newSessionToken();
      await db.adminSession.create({
        data: {
          adminId: actor.id,
          tokenHash: tokenHash(token),
          expiresAt: new Date(Date.now() + (inactive ? 3600000 : -1000)),
        },
      });
      await page.context().addCookies([
        {
          name: cookie.name,
          value: token,
          url: origin,
          httpOnly: true,
          secure: false,
          sameSite: "Strict",
        },
      ]);
      expect((await post(page, "site", {})).status()).toBe(401);
    }
  } finally {
    await db.$disconnect();
  }
});

test("health is minimal, no-store and does not call a missing database in demo mode", async ({
  page,
}) => {
  const ready = await page.request.get("/api/health");
  expect(ready.status()).toBe(200);
  expect(await ready.json()).toEqual({ status: "ok" });
  expect(ready.headers()["cache-control"]).toBe("no-store");
  const demo = await page.request.get("http://127.0.0.1:3112/api/health");
  expect(await demo.json()).toEqual({ status: "ok", mode: "demo" });
  const broken = await page.request.get("http://127.0.0.1:3113/api/health");
  expect(broken.status()).toBe(503);
  expect(await broken.json()).toEqual({ status: "unavailable" });
  expect(
    (
      await page.request.post("http://127.0.0.1:3113/api/admin/events", {
        headers: { Origin: "http://127.0.0.1:3113" },
        data: {},
      })
    ).status(),
  ).toBe(401);
  const failure = await page.request.post(
    "http://127.0.0.1:3113/api/admin/events",
    {
      headers: {
        Origin: "http://127.0.0.1:3113",
        Cookie: "sakado_admin_session=" + "a".repeat(43),
      },
      data: {},
    },
  );
  expect(failure.status()).toBe(503);
  expect(await failure.text()).not.toMatch(
    /Prisma|postgresql|DATABASE_URL|stack/i,
  );
});

test("demo mode never bypasses auth or writes even when the database is available", async ({
  page,
}) => {
  expect(
    (
      await page.request.post("http://127.0.0.1:3114/api/admin/site", {
        headers: { Origin: "http://127.0.0.1:3114" },
        data: {},
      })
    ).status(),
  ).toBe(401);
  await asRole(page, "OWNER");
  const db = phase05Db();
  try {
    const before = await db.auditLog.count();
    for (const resource of [
      "events",
      "site",
      "gallery",
      "media",
      "instagram",
      "users",
    ]) {
      const response = await page.request.post(
        `http://127.0.0.1:3114/api/admin/${resource}`,
        { headers: { Origin: "http://127.0.0.1:3114" }, data: {} },
      );
      expect(response.status()).toBe(409);
    }
    expect(
      (
        await page.request.get(
          "http://127.0.0.1:3114/api/admin/exports?eventId=phase05-open",
        )
      ).status(),
    ).toBe(409);
    expect(await db.auditLog.count()).toBe(before);
  } finally {
    await db.$disconnect();
  }
});

test("admin validation associates errors and prevents duplicate submissions while preserving values", async ({
  page,
}) => {
  await asRole(page, "OWNER");
  let submissions = 0;
  await page.route("**/api/admin/events", async (route) => {
    submissions++;
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto("/admin/events/new");
  await page
    .getByLabel("Nom de la sortie", { exact: true })
    .fill("Synthetic invalid form");
  await page
    .getByLabel("Lien de la sortie", { exact: true })
    .fill("phase06-invalid-form");
  await page
    .getByRole("button", { name: "Créer la sortie", exact: true })
    .click();
  await page
    .locator(".admin-form")
    .evaluate((form) =>
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
  const summary = page.getByRole("status", {
    name: "Résultat de l’enregistrement",
  });
  await expect(summary).toContainText("Vérifiez les champs");
  expect(submissions).toBe(1);
  await expect(summary).toBeFocused();
  const description = page.getByLabel("Description courte", { exact: true });
  await expect(description).toHaveAttribute("aria-invalid", "true");
  await summary.getByRole("link", { name: /Description courte/ }).click();
  await expect(description).toBeFocused();
  await expect(
    page.getByLabel("Nom de la sortie", { exact: true }),
  ).toHaveValue("Synthetic invalid form");
  const require = createRequire(`${process.cwd()}/package.json`);
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (
            context: unknown,
            options: unknown,
          ) => Promise<{ violations: { id: string }[] }>;
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
});

test("destructive confirmation supports cancellation, feedback and keyboard focus", async ({
  page,
}) => {
  await asRole(page, "OWNER");
  const db = phase05Db();
  try {
    const event = await db.event.findUniqueOrThrow({
      where: { slug: "phase05-closed" },
    });
    await page.goto(`/admin/events/${event.id}`);
    const cancel = page.getByRole("button", {
      name: "Annuler la sortie",
      exact: true,
    });
    page.once("dialog", (dialog) => dialog.dismiss());
    await cancel.focus();
    await page.keyboard.press("Enter");
    await expect(cancel).toBeFocused();
    expect(
      (await db.event.findUniqueOrThrow({ where: { id: event.id } })).status,
    ).toBe("UPCOMING");
    page.once("dialog", (dialog) => dialog.accept());
    await cancel.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText("Annulée · Non publiée", { exact: true }),
    ).toBeVisible();
  } finally {
    await db.$disconnect();
  }
});

for (const width of [375, 768, 1440])
  test(`admin essential pages reflow and mobile menu is keyboard usable at ${width}`, async ({
    page,
  }) => {
    await asRole(page, "OWNER");
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    mkdirSync(".local/phase06/screenshots", { recursive: true });
    const db = phase05Db();
    try {
      const event = await db.event.findUniqueOrThrow({
        where: { slug: "phase05-open" },
      });
      for (const [name, path] of [
        ["dashboard", "/admin"],
        ["event", `/admin/events/${event.id}/edit`],
        ["registrations", "/admin/registrations"],
        ["media", "/admin/media-readiness"],
      ]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          name,
        ).toBe(true);
        await page.screenshot({
          path: `.local/phase06/screenshots/${name}-${width}.png`,
          fullPage: true,
        });
        await page.screenshot({
          path: `.local/phase06/screenshots/${name}-${width}-viewport.png`,
        });
      }
      if (width < 760) {
        const toggle = page.getByRole("button", {
          name: "☰ Menu",
          exact: true,
        });
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await page
          .getByRole("navigation", { name: "Administration", exact: true })
          .getByRole("link", { name: "Sorties", exact: true })
          .focus();
        await page.keyboard.press("Escape");
        await expect(toggle).toBeFocused();
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
      }
    } finally {
      await db.$disconnect();
    }
  });
