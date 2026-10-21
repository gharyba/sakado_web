import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";

const dependency = createRequire(`${process.cwd()}/package.json`);
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`official local production load and accessibility at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const metrics = { lcp: 0, cls: 0 };
      Object.assign(window, { phase10Metrics: metrics });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) metrics.cls += shift.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|did not match/i.test(message.text()))
        errors.push(message.text());
    });
    expect((await page.goto("/"))?.status()).toBe(200);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        ...(
          window as unknown as { phase10Metrics: { lcp: number; cls: number } }
        ).phase10Metrics,
        ttfb: navigation.responseStart - navigation.startTime,
        scripts: [
          ...new Set(
            performance
              .getEntriesByType("resource")
              .map((r) => new URL(r.name).pathname)
              .filter(
                (path) =>
                  path.startsWith("/_next/static/") && path.endsWith(".js"),
              ),
          ),
        ],
        images: [...document.images].map((image) => ({
          loaded: image.complete && !!image.naturalWidth,
          width: image.width,
          height: image.height,
        })),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    const scripts = metrics.scripts.map((path) =>
      readFileSync(`.next/${path.replace("/_next/", "")}`),
    );
    await mkdir(".local/phase10/screenshots", { recursive: true });
    await writeFile(
      `.local/phase10/load-${viewport.width}.json`,
      JSON.stringify(
        {
          description:
            "Single local loopback production load, reduced motion, no network/CPU throttling; not field CWV or staging evidence. No INP measurement.",
          viewport,
          ...metrics,
          rawJsBytes: scripts.reduce((sum, b) => sum + b.length, 0),
          gzipJsBytes: scripts.reduce((sum, b) => sum + gzipSync(b).length, 0),
        },
        null,
        2,
      ),
    );
    expect(metrics.overflow).toBe(false);
    expect(errors).toEqual([]);
    // Offscreen lazy images need not load at the first viewport.
    for (const image of await page.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (node) =>
              node instanceof HTMLImageElement &&
              node.complete &&
              !!node.naturalWidth,
          ),
        )
        .toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `.local/phase10/screenshots/home-${viewport.width}.png`,
    });
    await page.addScriptTag({
      path: dependency.resolve("axe-core/axe.min.js"),
    });
    const violations = await page.evaluate(async () => {
      const axe = (
        window as unknown as {
          axe: {
            run: (
              context: unknown,
              options: unknown,
            ) => Promise<{
              violations: {
                id: string;
                impact: string;
                nodes: { target: string[]; failureSummary: string }[];
              }[];
            }>;
          };
        }
      ).axe;
      return (
        await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations;
    });
    await writeFile(
      `.local/phase10/accessibility-${viewport.width}.json`,
      JSON.stringify(violations, null, 2),
    );
    expect(violations).toEqual([]);
  });
}

test("official public navigation links and metadata resolve without writes", async ({
  page,
  request,
  baseURL,
}) => {
  const links = new Set<string>();
  for (const route of [
    "/",
    "/about",
    "/experiences",
    "/events",
    "/adventures",
    "/destinations",
    "/gallery",
    "/contact",
    "/privacy",
  ]) {
    expect((await page.goto(route))?.status(), route).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("title")).not.toBeEmpty();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")!))) {
      const url = new URL(href, baseURL);
      if (url.origin === baseURL && !url.pathname.startsWith("/admin"))
        links.add(url.pathname + url.search);
    }
  }
  for (const route of links)
    expect((await request.get(route)).status(), route).toBe(200);
});

test("official motion enhances the story and restores static presentation on demand", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const story = page.locator("[data-story-timeline]");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-motion-state", "ready");
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
  await writeFile(
    ".local/phase10/motion-payload.json",
    JSON.stringify(
      {
        description:
          "Local desktop production route after activating the story; no network/CPU throttling or field CWV claim.",
        scripts,
        rawJsBytes: bytes.reduce((sum, b) => sum + b.length, 0),
        gzipJsBytes: bytes.reduce((sum, b) => sum + gzipSync(b).length, 0),
      },
      null,
      2,
    ),
  );
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .first()
    .click();
  await expect(story).toHaveAttribute("data-motion-state", "static");
  for (const target of await page
    .locator("[data-story-phase], [data-story-progress]")
    .all())
    await expect(target).toHaveCSS("transform", "none");
});
