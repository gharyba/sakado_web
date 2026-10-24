import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { companyActivities } from "../../src/data/confirmed/company";
const resolveDependency = createRequire(`${process.cwd()}/package.json`);
const discovery = (page: Page) => page.locator("[data-experience-discovery]");
const surface = (page: Page) =>
  discovery(page).locator("[data-cinematic-motion]");
const cards = (page: Page) => discovery(page).locator("[data-experience]");
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test("official homepage discovery preserves order, responsive columns, anchors and story continuity", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 812 : 1000 });
    await page.goto("/");
    await discovery(page).scrollIntoViewIfNeeded();
    await expect(cards(page)).toHaveCount(7);
    await expect(cards(page).locator("h3")).toHaveText(
      companyActivities.map((c) => c.name),
    );
    expect(
      await discovery(page)
        .locator(".experience-grid")
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        ),
    ).toBe(width < 700 ? 1 : width < 1200 ? 2 : 3);
    for (let i = 0; i < companyActivities.length; i++)
      await expect(cards(page).nth(i)).toHaveAttribute(
        "href",
        `/experiences#${companyActivities[i].slug}`,
      );
    await noOverflow(page);
    const order = await page
      .locator("[data-home-adventures], [data-experience-discovery], #histoire")
      .evaluateAll((nodes) =>
        nodes.map((n) =>
          n.hasAttribute("data-home-adventures")
            ? "adventures"
            : n.hasAttribute("data-experience-discovery")
              ? "experiences"
              : "story",
        ),
      );
    expect(order).toEqual(["adventures", "experiences", "story"]);
    await expect(discovery(page).locator("[data-home-word]").last()).toHaveCSS(
      "opacity",
      "1",
    );
    await discovery(page).screenshot({
      path: info.outputPath(`discovery-${width}.png`),
      style: "[data-navigation], .skip-link { visibility: hidden !important; }",
    });
  }
  await cards(page).first().click();
  await expect(page).toHaveURL(/\/experiences#randonnee$/);
  await expect(page.locator("#randonnee")).toBeInViewport();
  expect(errors).toEqual([]);
});

test("synthetic zero/one/seven/nine categories and long French copy retain order without clipping", async ({
  page,
}, info) => {
  for (const count of [0, 1, 7, 9]) {
    const html = await readFile(
      `.local/redesign04/fixtures/${count}.html`,
      "utf8",
    );
    await page.setContent(html);
    await expect(cards(page)).toHaveCount(count);
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await noOverflow(page);
      expect(
        await cards(page).evaluateAll((nodes) =>
          nodes.every((n) => n.scrollWidth <= n.clientWidth + 1),
        ),
      ).toBe(true);
    }
    if (count === 9) {
      expect(await cards(page).first().locator("p").textContent()).toContain(
        "sans troncature. ".repeat(1),
      );
      await page.setViewportSize({ width: 375, height: 812 });
      await page.screenshot({
        path: info.outputPath("synthetic-long-copy.png"),
        fullPage: true,
      });
    }
    await expect(page.locator("[data-upcoming-empty]")).toContainText(
      "Les prochaines aventures seront annoncées ici.",
    );
    await expect(page.locator("[data-upcoming-empty] a")).toHaveAttribute(
      "href",
      "/contact",
    );
  }
});

test("enlarged text and narrow reflow retain full content and stable hit targets", async ({
  page,
}, info) => {
  await page.goto("/");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    await discovery(page).scrollIntoViewIfNeeded();
    // Scope reflow to the new section; older hero typography is covered by its suite.
    expect(
      await discovery(page).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.left >= -1 &&
          r.right <= innerWidth + 1 &&
          el.scrollWidth <= el.clientWidth + 1
        );
      }),
    ).toBe(true);
    expect(
      await cards(page).evaluateAll((nodes) =>
        nodes.every(
          (n) =>
            n.scrollWidth <= n.clientWidth + 1 &&
            n.getBoundingClientRect().height >= 44,
        ),
      ),
    ).toBe(true);
  }
  await discovery(page).screenshot({
    path: info.outputPath("discovery-enlarged-text.png"),
    style: "[data-navigation], .skip-link { visibility: hidden !important; }",
  });
});

test("keyboard focus stays stationary while optional arrow motion respects reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await discovery(page).scrollIntoViewIfNeeded();
  await expect(surface(page)).toHaveAttribute("data-cinematic-motion", "on");
  await discovery(page).getByRole("link", { name: "Nos expériences" }).focus();
  await page.keyboard.press("Tab");
  await expect(cards(page).first()).toBeFocused();
  await expect(cards(page).first()).toHaveCSS("outline-style", "solid");
  await expect(cards(page).first()).toHaveCSS("outline-width", "3px");
  await expect(cards(page).first()).toHaveCSS("transform", "none");
  await cards(page).first().hover();
  await expect(
    cards(page).first().locator("[data-experience-arrow]"),
  ).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(surface(page)).toHaveAttribute(
    "data-cinematic-motion",
    "static",
  );
  await expect(cards(page).first()).toHaveCSS("transition-duration", "0s");
  await expect(
    cards(page).first().locator("[data-experience-arrow]"),
  ).toHaveCSS("transform", "none");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/experiences#randonnee$/);
});

for (const mode of ["saved-off", "save-data"] as const) {
  test(`${mode} disables optional discovery transitions`, async ({ page }) => {
    await page.addInitScript((setting) => {
      if (setting === "saved-off")
        localStorage.setItem("sakado-motion-disabled", "true");
      else
        Object.defineProperty(navigator, "connection", {
          configurable: true,
          value: Object.assign(new EventTarget(), { saveData: true }),
        });
    }, mode);
    await page.goto("/");
    await discovery(page).scrollIntoViewIfNeeded();
    await expect(surface(page)).toHaveAttribute(
      "data-cinematic-motion",
      "static",
    );
    await cards(page).first().hover();
    await expect(cards(page).first()).toHaveCSS("transition-duration", "0s");
    await expect(
      cards(page).first().locator("[data-experience-arrow]"),
    ).toHaveCSS("transform", "none");
  });
}

test("no-JavaScript discovery retains complete descriptions and native navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3148/");
    await expect(cards(page)).toHaveCount(7);
    await expect(cards(page).locator("p")).toHaveText(
      companyActivities.map((c) => c.description),
    );
    await expect(surface(page)).toHaveAttribute(
      "data-cinematic-motion",
      "static",
    );
    await noOverflow(page);
    await cards(page).first().click();
    await expect(page).toHaveURL(/\/experiences#randonnee$/);
    await expect(page.locator("#randonnee")).toBeInViewport();
  } finally {
    await context.close();
  }
});

test("discovery has no scoped automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await discovery(page).scrollIntoViewIfNeeded();
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
          ) => Promise<{ violations: unknown[] }>;
        };
      }
    ).axe;
    return (
      await axe.run(
        { include: ["[data-experience-discovery]"] },
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
      )
    ).violations;
  });
  expect(violations).toEqual([]);
});
