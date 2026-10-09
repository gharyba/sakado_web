import { test, expect, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const resolveDependency = createRequire(`${process.cwd()}/package.json`);
const header = (page: Page) => page.locator("[data-navigation]");
const toggle = (page: Page) =>
  page.getByRole("button", { name: "Ouvrir la navigation" });
async function openMobile(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await toggle(page).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fermer" })).toBeFocused();
}
async function auditNavigation(page: Page) {
  // axe-core is already supplied by the locked eslint dependency tree.
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
    const result = await axe.run(
      { include: ["[data-navigation]"] },
      { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
    );
    return result.violations;
  });
  expect(violations).toEqual([]);
}

test("hero boundary changes the stable sticky navbar without scroll handlers or GSAP", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(header(page)).toHaveAttribute("data-state", "hero");
  await expect(header(page)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const initialHeight = await header(page).evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  await page.screenshot({ path: info.outputPath("desktop-hero.png") });
  await auditNavigation(page);
  await page
    .locator("[data-navigation-hero]")
    .evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY),
    );
  await expect(header(page)).toHaveAttribute("data-state", "surface");
  await expect(header(page)).toHaveCSS(
    "background-color",
    "rgb(245, 244, 240)",
  );
  expect(
    await header(page).evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(initialHeight);
  expect(
    await header(page).evaluate((el) => el.getBoundingClientRect().top),
  ).toBe(0);
  await page.screenshot({ path: info.outputPath("desktop-scrolled.png") });
  await auditNavigation(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header(page)).toHaveAttribute("data-state", "hero");
  // A deliberately bright future hero still receives the local contrast veil.
  const contrast = await header(page).evaluate((el) => {
    const color = getComputedStyle(el, "::before").backgroundImage;
    return { color, opacity: getComputedStyle(el, "::before").opacity };
  });
  await expect
    .poll(() =>
      header(page).evaluate((el) => getComputedStyle(el, "::before").opacity),
    )
    .toBe("1");
  expect(contrast.color).toContain("0.72");
  const scripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((r) => new URL(r.name).pathname)
      .filter((n) => n.startsWith("/_next/static/") && n.endsWith(".js")),
  );
  for (const script of scripts) {
    expect(
      readFileSync(`.next/${script.replace("/_next/", "")}`, "utf8"),
    ).not.toContain("ScrollTrigger");
  }
  // Worst-case white photograph underneath the weakest (72%) veil stop.
  const luminance = (rgb: number[]) =>
    rgb
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  expect(
    1.05 / (luminance([16, 27, 25].map((v) => v * 0.72 + 255 * 0.28)) + 0.05),
  ).toBeGreaterThan(4.5);
  expect(errors).toEqual([]);
});

test("desktop routes and current-page semantics survive client navigation", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  for (const [label, href] of [
    ["Expériences", "/experiences"],
    ["Événements", "/events"],
    ["Destinations", "/destinations"],
    ["Galerie", "/gallery"],
    ["À propos", "/about"],
    ["Contact", "/contact"],
  ]) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(
      nav.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(header(page)).toHaveAttribute("data-state", "surface");
  }
  await header(page)
    .getByRole("link", { name: /Accueil/ })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(header(page)).toHaveAttribute("data-state", "hero");
});

test("mobile dialog contains focus, escapes, restores focus and passes scoped accessibility checks", async ({
  page,
}, info) => {
  await openMobile(page);
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(
    390,
  );
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Nos aventures" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Fermer" })).toBeFocused();
  await auditNavigation(page);
  await page.screenshot({ path: info.outputPath("mobile-menu.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(toggle(page)).toBeFocused();
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Tab");
  await page.screenshot({ path: info.outputPath("mobile-closed.png") });
});

test("mobile navigation closes on real route changes and breakpoint changes", async ({
  page,
}) => {
  await openMobile(page);
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  await toggle(page).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  await expect(
    page.getByRole("navigation", { name: "Navigation principale" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await toggle(page).click();
  await page.mouse.click(2, 800);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(toggle(page)).toBeFocused();
});

test("responsive layout and short-screen panel avoid horizontal overflow", async ({
  page,
}, info) => {
  await page.goto("/");
  for (const width of [320, 390, 700, 768, 1024, 1199, 1200, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const bounds = await header(page).evaluate((el) => {
      const rects = [...el.querySelectorAll("a,button")]
        .filter((n) => n.getClientRects().length)
        .map((n) => n.getBoundingClientRect());
      return rects.map((r) => ({
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
      }));
    });
    for (const b of bounds) {
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(width);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: info.outputPath(`width-${width}.png`) });
  }
  await page.setViewportSize({ width: 667, height: 320 });
  await toggle(page).click();
  const panel = page.getByRole("dialog");
  expect(await panel.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await panel.getByRole("link", { name: "Nos aventures" }).focus();
  await expect(
    panel.getByRole("link", { name: "Nos aventures" }),
  ).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
});

test("reduced motion and saved disable preference remove all navigation transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openMobile(page);
  await expect(header(page)).toHaveAttribute("data-navigation-motion", "off");
  await expect(page.getByRole("dialog")).toHaveCSS("transition-duration", "0s");
  await page.keyboard.press("Escape");
  await expect(toggle(page)).toBeFocused();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() =>
    localStorage.setItem("sakado-motion-disabled", "true"),
  );
  await page.reload();
  await expect(header(page)).toHaveAttribute("data-navigation-motion", "off");
  await expect(header(page)).toHaveCSS("transition-duration", "0s");
  await expect(toggle(page)).toHaveCSS("transition-duration", "0s");
  await toggle(page).click();
  await expect(page.getByRole("dialog")).toHaveCSS("transition-duration", "0s");
  await page.getByRole("button", { name: "Fermer" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("no-JavaScript fallback preserves mobile routes and keyboard disclosure", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(header(page)).toHaveAttribute("data-state", "surface");
  const summary = header(page).locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  const nav = page.getByRole("navigation", { name: "Navigation mobile" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await context.close();
});

test("missing observer keeps readable static navigation and skip link reaches main", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", { value: undefined });
  });
  await page.goto("/");
  await expect(header(page)).toHaveAttribute("data-state", "surface");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("missing native dialog API retains the functional disclosure fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      value: undefined,
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      value: undefined,
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(toggle(page)).not.toBeVisible();
  await header(page).locator("summary").click();
  await page
    .getByRole("navigation", { name: "Navigation mobile" })
    .getByRole("link", { name: "Galerie", exact: true })
    .click();
  await expect(page).toHaveURL(/\/gallery$/);
});

test("server fallback and hydrated header keep matching geometry", async ({
  browser,
}) => {
  for (const width of [390, 768, 1440]) {
    const contexts = await Promise.all(
      [false, true].map((javaScriptEnabled) =>
        browser.newContext({
          javaScriptEnabled,
          viewport: { width, height: 900 },
        }),
      ),
    );
    const measurements: number[][] = [];
    for (const context of contexts) {
      const page = await context.newPage();
      await page.goto("/");
      if (width < 1200 && context === contexts[1])
        await expect(toggle(page)).toBeVisible();
      measurements.push(
        await header(page).evaluate((el) => {
          const box = (element: Element) => {
            const r = element.getBoundingClientRect();
            return [r.x, r.y, r.width, r.height];
          };
          return [
            ...box(el),
            ...box(el.querySelector(".brand")!),
            ...box(el.lastElementChild!.lastElementChild!),
          ];
        }),
      );
    }
    measurements[0].forEach((value, i) =>
      expect(measurements[1][i]).toBeCloseTo(value, 1),
    );
    await Promise.all(contexts.map((context) => context.close()));
  }
});
