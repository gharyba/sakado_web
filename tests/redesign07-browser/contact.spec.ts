import { test, expect, type Page } from "@playwright/test";
import { withTestDatabase, messageCount } from "./database";

async function fill(page: Page, email: string) {
  await page.getByLabel("Nom", { exact: false }).fill("Essai local");
  await page.getByLabel("E-mail", { exact: false }).fill(email);
  await page
    .getByLabel("Message", { exact: false })
    .fill("Message synthétique de validation locale.");
}

test("empty/invalid forms and server validation never create a message", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/contact"
    )
      posts++;
  });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  expect(posts).toBe(0);
  await fill(page, "invalid-email");
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  expect(posts).toBe(0);
  await page
    .locator("[data-contact-form]")
    .evaluate((form: HTMLFormElement) => {
      form.noValidate = true;
    });
  await page.getByLabel("Nom", { exact: false }).fill("x");
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(
    page.locator("[data-contact-form]").getByRole("alert"),
  ).toContainText("Vérifiez les champs");
  await expect(page.locator('[name="name"]')).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator('[name="email"]')).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(await messageCount("invalid-email")).toBe(0);
});

test("pending prevents a duplicate; success waits for the real database write", async ({
  page,
}) => {
  const email = "pending-redesign07@example.test";
  let release!: () => void;
  let entered!: () => void;
  let posts = 0;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const captured = new Promise<void>((resolve) => {
    entered = resolve;
  });
  await page.route("**/contact", async (route) => {
    if (route.request().method() === "POST") {
      posts++;
      entered();
      await held;
    }
    await route.continue();
  });
  await page.goto("/contact");
  await fill(page, email);
  await page
    .getByRole("button", { name: "Envoyer mon message" })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await captured;
  await expect(
    page.getByRole("button", { name: "Envoi en cours" }),
  ).toBeDisabled();
  await expect(page.locator("[data-contact-success]")).toHaveCount(0);
  expect(await messageCount(email)).toBe(0);
  release();
  await expect(page.locator("[data-contact-success]")).toBeVisible();
  expect(posts).toBe(1);
  expect(await messageCount(email)).toBe(1);
});

test("honeypot refuses submission and a database failure returns a retryable error", async ({
  page,
}) => {
  const email = "failure-redesign07@example.test";
  await page.goto("/contact");
  await fill(page, email);
  await page.locator('[name="website"]').evaluate((input: HTMLInputElement) => {
    input.value = "bot";
  });
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(
    page.locator("[data-contact-form]").getByRole("alert"),
  ).toContainText("n’a pas pu être envoyé");
  expect(await messageCount(email)).toBe(0);
  await page.goto("/contact");
  await fill(page, email);
  await withTestDatabase(async (client) => {
    await client.query(
      'ALTER TABLE "ContactMessage" RENAME TO "_Redesign07PausedContact"',
    );
  });
  try {
    await page.getByRole("button", { name: "Envoyer mon message" }).click();
    await expect(
      page.locator("[data-contact-form]").getByRole("alert"),
    ).toContainText("n’a pas pu être enregistré");
    await expect(
      page.getByRole("button", { name: "Envoyer mon message" }),
    ).toBeEnabled();
    await expect(page.locator("[data-contact-success]")).toHaveCount(0);
  } finally {
    await withTestDatabase(async (client) => {
      await client.query(
        'ALTER TABLE "_Redesign07PausedContact" RENAME TO "ContactMessage"',
      );
    });
  }
  await fill(page, email);
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(page.locator("[data-contact-success]")).toBeVisible();
  expect(await messageCount(email)).toBe(1);
});

test("native no-JavaScript submission confirms a real isolated write", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/contact?subject=group&event=Essai%20isol%C3%A9");
    await expect(page.locator('[name="subject"]')).toHaveValue("group");
    const email = "nojs-redesign07@example.test";
    await fill(page, email);
    await page.getByRole("button", { name: "Envoyer mon message" }).click();
    await expect(page.locator("[data-contact-success]")).toBeVisible();
    expect(await messageCount(email)).toBe(1);
    await expect(page.locator('.site-footer a[href="/privacy"]')).toBeVisible();
  } finally {
    await context.close();
  }
});

test("email rate limit still refuses the fourth synthetic message", async ({
  page,
}) => {
  const email = "limited-redesign07@example.test";
  for (let index = 0; index < 3; index++) {
    await page.goto("/contact");
    await fill(page, email);
    await page.getByRole("button", { name: "Envoyer mon message" }).click();
    await expect(page.locator("[data-contact-success]")).toBeVisible();
  }
  await page.goto("/contact");
  await fill(page, email);
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(
    page.locator("[data-contact-form]").getByRole("alert"),
  ).toContainText("Trop de messages");
  expect(await messageCount(email)).toBe(3);
});

test("framework origin check rejects a foreign Server Action", async ({
  page,
  request,
}) => {
  const email = "origin-redesign07@example.test";
  await page.goto("/contact");
  await fill(page, email);
  let capture!: (value: {
    headers: Record<string, string>;
    body: Buffer;
  }) => void;
  const captured = new Promise<{
    headers: Record<string, string>;
    body: Buffer;
  }>((resolve) => {
    capture = resolve;
  });
  await page.route("**/contact", (route) => {
    if (route.request().method() === "POST") {
      capture({
        headers: route.request().headers(),
        body: route.request().postDataBuffer()!,
      });
      return route.abort();
    }
    return route.continue();
  });
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  const action = await captured;
  expect(Boolean(action.headers["next-action"])).toBe(true);
  const response = await request.post("/contact", {
    headers: { ...action.headers, origin: "https://foreign.example.test" },
    data: action.body,
  });
  expect(response.status()).toBe(500);
  expect(await messageCount(email)).toBe(0);
});
