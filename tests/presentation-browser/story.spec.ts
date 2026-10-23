import { test, expect, type Page } from "@playwright/test";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { company } from "../../src/data/confirmed/company";

const origin = "http://127.0.0.1:3134";
async function enter(page: Page) {
  await page.goto("/dev/presentation");
  await page
    .getByLabel("Code de présentation local")
    .fill(
      readFileSync(
        ".local/official-presentation/access-code.txt",
        "utf8",
      ).trim(),
    );
  await page.getByRole("button", { name: "Ouvrir le site officiel" }).click();
  await expect(page).toHaveURL(origin + "/");
}
async function at(page: Page, progress: number) {
  await page.locator("[data-story-list]").evaluate((node, progress) => {
    const rect = node.getBoundingClientRect();
    const start = rect.top + scrollY - innerHeight * 0.7;
    scrollTo(0, start + (rect.height + innerHeight * 0.32) * progress);
  }, progress);
  await page.waitForTimeout(150);
}
async function sample(page: Page) {
  return page.locator("[data-company-story]").evaluate((node) => ({
    cameras: [...node.querySelectorAll("[data-story-camera]")].map((camera) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(camera).transform);
      return { x: m.e, y: m.f, scale: m.a };
    }),
    frames: [...node.querySelectorAll("[data-story-frame]")].map((frame) =>
      Number(getComputedStyle(frame).opacity),
    ),
    height: node.querySelector("[data-story-list]")!.getBoundingClientRect()
      .height,
  }));
}
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`confirmed photographic chapters and responsive reflow at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await enter(page);
    mkdirSync(".local/redesign03-review", { recursive: true });
    for (const route of ["/", "/about"]) {
      await page.goto(route);
      const story = page.locator("[data-company-story]");
      await story.scrollIntoViewIfNeeded();
      await expect(story).toHaveAttribute("data-motion-state", "ready");
      await expect(story.locator("li > span")).toHaveText(
        company.chapters.map((c) => c.year),
      );
      await expect(story.locator("h3")).toHaveCount(3);
      for (const chapter of company.chapters)
        await expect(
          story.getByRole("heading", { name: chapter.title, exact: true }),
        ).toBeVisible();
      await expect(story.locator("img")).toHaveCount(3);
      await at(page, 0.5);
      await expect
        .poll(() =>
          story
            .locator("img")
            .evaluateAll((nodes) =>
              nodes.every((n) => (n as HTMLImageElement).naturalWidth > 0),
            ),
        )
        .toBe(true);
      expect(
        await story
          .locator("img")
          .evaluateAll((nodes) =>
            nodes.every((n) =>
              (n as HTMLImageElement)
                .getAttribute("src")!
                .startsWith("/dev/presentation-media/"),
            ),
          ),
      ).toBe(true);
      if (viewport.width < 700) {
        expect(
          await story.locator("img").evaluateAll((images) =>
            images.every((image) => {
              const source = image.closest("picture")?.querySelector("source");
              return (
                !source ||
                (image as HTMLImageElement).currentSrc ===
                  new URL(source.srcset, location.href).href
              );
            }),
          ),
        ).toBe(true);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(await story.innerHTML()).not.toMatch(
        /SAKADO-MEDIA|sourceDirectory|sourcePath|[A-Z]:\\/,
      );
      if (viewport.width < 1200)
        await expect(story).toHaveAttribute("data-story-layout", "flow");
      if (viewport.width < 700)
        for (const camera of await story.locator("[data-story-camera]").all())
          await expect(camera).toHaveCSS("transform", "none");
      await page.screenshot({
        path: `.local/redesign03-review/${route === "/" ? "home" : "about"}-${viewport.width}.png`,
      });
    }
    expect(errors).toEqual([]);
  });
}

test("desktop chapters crossfade, reverse, keep geometry and restore exact static styles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  await page.goto("/about");
  const story = page.locator("[data-company-story]");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-story-layout", "sticky");
  const widths = await story
    .locator("[data-story-frame]")
    .evaluateAll((frames) =>
      frames.map((frame) => frame.getBoundingClientRect().width),
    );
  expect(widths[2]).toBeGreaterThan(widths[0] * 1.8);
  mkdirSync(".local/redesign03-review", { recursive: true });
  const observations = [];
  for (const p of [0.15, 0.5, 0.85, 0.5, 0.15]) {
    await at(page, p);
    observations.push(await sample(page));
    if (p === 0.85)
      await page.screenshot({
        path: ".local/redesign03-review/about-desktop-closing.png",
      });
  }
  expect(observations[0].frames[0]).toBeGreaterThan(0.98);
  expect(observations[1].frames[1]).toBeGreaterThan(0.98);
  expect(observations[2].frames[2]).toBeGreaterThan(0.98);
  expect(observations[0].cameras[0].scale).toBeGreaterThan(1.005);
  expect(observations[2].cameras[0].scale).toBeCloseTo(1, 3);
  expect(observations[4].cameras[0].scale).toBeCloseTo(
    observations[0].cameras[0].scale,
    3,
  );
  expect(observations[4].cameras[0].y).toBeCloseTo(
    observations[0].cameras[0].y,
    1,
  );
  expect(observations[3].frames[1]).toBeCloseTo(observations[1].frames[1], 2);
  const activeHeight = observations[0].height;
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .first()
    .click();
  await expect(story).toHaveAttribute("data-motion-state", "static");
  expect(await story.getAttribute("data-story-layout")).toBeNull();
  expect(
    Math.abs((await sample(page)).height - activeHeight),
  ).toBeLessThanOrEqual(1);
  expect(
    await story
      .locator(
        "[data-story-frame], [data-story-camera], [data-story-phase], [data-story-word], [data-story-emphasis], [data-story-progress]",
      )
      .evaluateAll((nodes) =>
        nodes.every((node) => !node.getAttribute("style")),
      ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Réactiver les animations", exact: true })
    .first()
    .click();
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-motion-state", "ready");
  await page.setViewportSize({ width: 1440, height: 700 });
  await expect(story).toHaveAttribute("data-story-layout", "flow");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(story).toHaveAttribute("data-story-layout", "sticky");
  await at(page, 0.5);
  await page.goto("/events");
  await page.goBack();
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-motion-state", "ready");
  await expect(story.locator("h3")).toHaveCount(3);
  mkdirSync(".local/redesign03-review", { recursive: true });
  writeFileSync(
    ".local/redesign03-review/reverse-samples.json",
    JSON.stringify(observations, null, 2),
  );
});

test("reduced-motion and authenticated no-JavaScript retain all three chapters", async ({
  page,
  browser,
}) => {
  await enter(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const story = page.locator("[data-company-story]");
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute("data-motion-state", "static");
  for (const camera of await story.locator("[data-story-camera]").all())
    await expect(camera).toHaveCSS("transform", "none");
  await expect(story.locator("li > span")).toHaveText(
    company.chapters.map((c) => c.year),
  );
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: await page.context().storageState(),
    viewport: { width: 375, height: 812 },
  });
  try {
    const nojs = await context.newPage();
    for (const route of ["/", "/about"]) {
      await nojs.goto(origin + route);
      const staticStory = nojs.locator("[data-company-story]");
      await expect(staticStory).toHaveAttribute("data-motion-state", "static");
      for (const copy of await staticStory
        .locator("[data-story-phase]")
        .all()) {
        await copy.scrollIntoViewIfNeeded();
        await expect(copy).toHaveCSS("opacity", "1");
      }
      await expect(staticStory.locator("li > span")).toHaveText(
        company.chapters.map((c) => c.year),
      );
      expect(
        await nojs.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  } finally {
    await context.close();
  }
});
