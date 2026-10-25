import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { withTestDatabase } from "./database";
const dependency = createRequire(`${process.cwd()}/package.json`);

for (const width of [1440, 1024, 768, 375]) {
  test(`Contact and footer reflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1024 ? 600 : 900 });
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "L’aventure commence par un bonjour.",
    );
    await expect(
      page.locator("[data-contact-page] [data-journey-frame] img"),
    ).toHaveCount(0);
    await expect(page.locator('[name="name"]')).toBeEnabled();
    await expect(
      page.getByRole("link", { name: "redesign07@example.test" }),
    ).toHaveAttribute("href", "mailto:redesign07@example.test");
    await expect(
      page.getByRole("link", { name: "+1 (202) 555-0123", exact: true }),
    ).toHaveAttribute("href", "tel:+12025550123");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await fs.mkdir(".local/redesign07/screenshots", { recursive: true });
    await page.locator("[data-contact-page]").screenshot({
      path: `.local/redesign07/screenshots/contact-test-${width}.png`,
      style: "[data-navigation], .skip-link {visibility:hidden!important}",
    });
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    const footer = page.locator(".site-footer");
    for (const href of [
      "/events",
      "/destinations",
      "/gallery",
      "/about",
      "/contact",
      "/privacy",
    ])
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    await expect(
      footer.getByRole("link", { name: "Instagram" }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    await footer.screenshot({
      path: `.local/redesign07/screenshots/footer-test-${width}.png`,
      style: "[data-navigation], .skip-link {visibility:hidden!important}",
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator('[name="message"]').scrollIntoViewIfNeeded();
    if (width === 1440) {
      const menu = page.getByRole("button", {
        name: "Ouvrir la navigation",
        exact: true,
      });
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(
        page.getByRole("dialog", { name: "Navigation", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator('[name="message"]')).toHaveCSS(
      "transform",
      "none",
    );
  });
}

test("scroll reverses copy, fields keep focus/value, and both preferences clean up", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/contact");
  const intro = page.locator('[data-final-journey="contact"]');
  await expect(intro).toHaveAttribute("data-motion-state", "ready");
  const copy = intro.locator("[data-journey-copy]");
  const y = () =>
    copy.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
    );
  const before = await y();
  await page.evaluate(() => scrollTo(0, 700));
  await expect.poll(y).toBeLessThan(before - 1);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(async () => Math.abs((await y()) - before)).toBeLessThan(1);
  const name = page.locator('[name="name"]');
  await name.focus();
  await page.keyboard.type("Essai local");
  await page.evaluate(() => scrollBy(0, 150));
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("Essai local");
  await expect(page.locator("[data-contact-form]")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator("[data-contact-form]")).toHaveCSS("opacity", "1");
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(intro).toHaveAttribute("data-motion-state", "static");
  await expect(copy).toHaveCSS("transform", "none");
  await page
    .getByRole("button", { name: "Réactiver les animations", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(intro).toHaveAttribute("data-motion-state", "static");
  await page.locator('.site-footer a[href="/privacy"]').focus();
  const privacy = page.locator('.site-footer a[href="/privacy"]');
  await expect(privacy).toBeFocused();
  await expect(privacy).toHaveCSS("transform", "none");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator("[data-contact-page]")).toHaveCount(0);
  expect(
    await page
      .locator(".s-company-site")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--s-theme-night").trim(),
      ),
  ).toBe("#07110f");
});

test("CMS closing copy and legal/social links survive the redesign", async ({
  page,
}) => {
  const original = await withTestDatabase(
    async (client) =>
      (
        await client.query('SELECT content FROM "SiteSettings" WHERE id=$1', [
          "main",
        ])
      ).rows[0].content,
  );
  try {
    await withTestDatabase(async (client) => {
      await client.query(
        'UPDATE "SiteSettings" SET content=content || $1::jsonb WHERE id=$2',
        [
          JSON.stringify({
            contactCtaTitle: "Une conclusion éditable dans le CMS",
            contactCtaText: "Texte de test isolé.",
            footerText: "Un message de pied de page éditable.",
          }),
          "main",
        ],
      );
    });
    await page.goto("/");
    await expect(page.locator('[data-final-journey="closing"] h2')).toHaveText(
      "Une conclusion éditable dans le CMS",
    );
    await expect(page.locator("[data-journey-footer-copy]")).toHaveText(
      "Un message de pied de page éditable.",
    );
    await page
      .locator('[data-final-journey="closing"] a[href="/contact"]')
      .click();
    await expect(page).toHaveURL(/\/contact$/);
  } finally {
    await withTestDatabase(async (client) => {
      await client.query('UPDATE "SiteSettings" SET content=$1 WHERE id=$2', [
        JSON.stringify(original),
        "main",
      ]);
    });
  }
});

test("scoped contact/footer accessibility and public media protections", async ({
  page,
  request,
}) => {
  await page.goto("/contact");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addScriptTag({ path: dependency.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (
            context: unknown,
            options: unknown,
          ) => Promise<{ violations: unknown[] }>;
        };
      }
    ).axe;
    return (
      await axe.run(
        { include: ["[data-contact-page]", ".site-footer"] },
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
      )
    ).violations;
  });
  expect(violations).toEqual([]);
  const privatePath = `/dev/presentation-media/${"a".repeat(64)}`;
  expect((await request.get(privatePath)).status()).toBe(404);
  expect(
    (
      await request.get(
        `/_next/image?url=${encodeURIComponent(privatePath)}&w=640&q=75`,
      )
    ).status(),
  ).toBe(400);
  expect((await request.get("/api/admin/exports?type=events")).status()).toBe(
    401,
  );
});
