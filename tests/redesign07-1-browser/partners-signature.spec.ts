import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
const dependency = createRequire(`${process.cwd()}/package.json`);

test("every public route retains legal links and ends its footer with the vector signature", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/about",
    "/experiences",
    "/events",
    "/destinations",
    "/adventures",
    "/gallery",
    "/gallery?view=instagram",
    "/contact",
    "/privacy",
  ]) {
    expect((await page.goto(route))?.status()).toBe(200);
    const footer = page.locator(".site-footer");
    const signature = footer.locator("[data-developer-signature]");
    await expect(signature).toHaveCount(1);
    await expect(
      signature.getByRole("img", {
        name: "Signature du développeur Ghrayba_jr",
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      signature.getByRole("link", {
        name: "Contacter le développeur Ghrayba_jr",
      }),
    ).toHaveAttribute("href", "mailto:ygharbi955@gmail.com");
    await expect(signature.locator("a")).toHaveCount(1);
    for (const href of [
      "/events",
      "/destinations",
      "/gallery",
      "/about",
      "/contact",
      "/privacy",
    ])
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    expect(
      await signature.evaluate(
        (el) => el.parentElement?.lastElementChild === el,
      ),
    ).toBe(true);
    expect(
      await footer
        .locator('a[href="/privacy"]')
        .evaluate((el) =>
          Boolean(
            el.compareDocumentPosition(
              document.querySelector("[data-developer-signature]")!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        ),
    ).toBe(true);
  }
});

test("public Partners fallback is honest, follows Gallery and preserves Community", async ({
  page,
  request,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.goto("/");
  const partners = page.locator("#partenaires");
  await expect(
    partners.getByRole("heading", { name: "Nos Partenaires", exact: true }),
  ).toBeVisible();
  await expect(partners.locator("img,a")).toHaveCount(0);
  await expect(partners.locator("[data-partners-empty]")).toBeVisible();
  await expect(page.locator('.contact-cta a[href="/contact"]')).toBeVisible();
  await expect(page.locator("section.community")).toHaveCount(1);
  await expect(page.locator("#equipe h3")).toHaveText([
    "Ben Beya Mohamed",
    "Bouzrara Manel",
  ]);
  expect(
    await partners.evaluate((el) => {
      const gallery = document.querySelector("#equipe")?.nextElementSibling;
      const closing = document.querySelector('[data-final-journey="closing"]');
      return Boolean(
        gallery &&
        closing &&
        gallery.compareDocumentPosition(el) &
          Node.DOCUMENT_POSITION_FOLLOWING &&
        el.compareDocumentPosition(closing) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }),
  ).toBe(true);
  expect(
    requests.some((path) => path.startsWith("/dev/presentation-media/")),
  ).toBe(false);
  const privatePath = `/dev/presentation-media/${"a".repeat(64)}`;
  expect((await request.get(privatePath)).status()).toBe(404);
  expect(
    (
      await request.get(
        `/_next/image?url=${encodeURIComponent(privatePath)}&w=640&q=75`,
      )
    ).status(),
  ).toBe(400);
});

test("developer signature supports keyboard focus and email activation", async ({
  page,
}) => {
  await page.goto("/");
  const link = page.locator("[data-developer-signature] a");
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS("outline-style", "solid");
  await expect(link).toHaveAttribute("href", "mailto:ygharbi955@gmail.com");
  await expect(page.locator("[data-developer-signature]")).not.toContainText(
    "ygharbi955@gmail.com",
  );
  await link.press("Enter");
});

for (const width of [1440, 1024, 768, 375]) {
  test(`Partners and developer signature remain readable at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 1024 ? 600 : 900 });
    await page.goto("/#partenaires");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const signature = page.locator("[data-developer-signature]");
    await signature.scrollIntoViewIfNeeded();
    expect(
      await signature.evaluate(
        (el) => el.getBoundingClientRect().right <= innerWidth,
      ),
    ).toBe(true);
    await fs.mkdir(".local/redesign07-1/screenshots", { recursive: true });
    await signature.screenshot({
      path: `.local/redesign07-1/screenshots/signature-footer-${width}.png`,
    });
    await page.locator("#partenaires").screenshot({
      path: `.local/redesign07-1/screenshots/public-partners-${width}.png`,
      style: "[data-navigation],.skip-link{visibility:hidden!important}",
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await signature
        .locator("svg")
        .evaluate((el) => el.getBoundingClientRect().right <= innerWidth),
    ).toBe(true);
    expect(
      await page
        .locator("#partenaires")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  });
}

test("no JavaScript and motion preferences preserve the artwork and headings", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/#partenaires");
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(page.locator("[data-partners-story]")).toHaveAttribute(
    "data-motion-state",
    "static",
  );
  await expect(page.locator("#partenaires [data-home-word]").first()).toHaveCSS(
    "transform",
    "none",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-developer-signature] svg")).toHaveCSS(
    "transform",
    "none",
  );
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/");
    await expect(
      staticPage.getByRole("heading", { name: "Nos Partenaires", exact: true }),
    ).toBeVisible();
    await expect(
      staticPage.locator("[data-developer-signature] svg"),
    ).toHaveCount(1);
    await staticPage.locator('.site-footer a[href="/privacy"]').click();
    await expect(staticPage).toHaveURL(/\/privacy$/);
  } finally {
    await context.close();
  }
});

test("Partners and signature have no scoped automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/#partenaires");
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
        { include: ["[data-partners-section]", "[data-developer-signature]"] },
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
      )
    ).violations;
  });
  expect(violations).toEqual([]);
});
