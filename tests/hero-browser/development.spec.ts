import { test, expect, type Page } from "@playwright/test";
import { createRequire } from "node:module";

const resolveDependency = createRequire(`${process.cwd()}/package.json`);
const hero = (page: Page) => page.locator("[data-parallax-hero]");
const scene = (page: Page) => hero(page).locator("[data-motion-scene]");
const background = (page: Page) =>
  hero(page).locator('[data-motion="background"]');
async function ready(page: Page) {
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
  await expect(hero(page).locator('[data-motion="reveal"]')).toHaveCSS(
    "opacity",
    "1",
  );
}

test("desktop composition, image load, native parallax, stable controls and navbar boundary", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration|did not match/i.test(message.text()))
      errors.push(message.text());
  });
  await ready(page);
  const image = hero(page).locator("[data-hero-image]");
  expect(
    await image.evaluate(
      (el) =>
        (el as HTMLImageElement).complete &&
        (el as HTMLImageElement).naturalWidth > 0,
    ),
  ).toBe(true);
  await expect(hero(page).locator("[data-hero-placeholder]")).toContainText(
    "TO BE CONFIRMED",
  );
  await expect(page.locator("[data-navigation]")).toHaveAttribute(
    "data-state",
    "hero",
  );
  const geometry = await hero(page).evaluate((el) => {
    const frame = el
      .querySelector("[data-hero-frame]")!
      .getBoundingClientRect();
    const panel = el.querySelector("nav")!.getBoundingClientRect();
    const header = document
      .querySelector("[data-navigation]")!
      .getBoundingClientRect();
    return {
      frameTop: frame.top,
      frameBottom: frame.bottom,
      panelTop: panel.top,
      panelBottom: panel.bottom,
      headerBottom: header.bottom,
      headerHeight: header.height,
      height: el.getBoundingClientRect().height,
    };
  });
  expect(geometry.frameTop).toBeGreaterThan(geometry.headerBottom);
  expect(geometry.panelTop).toBeLessThan(geometry.frameBottom);
  expect(geometry.panelBottom).toBeGreaterThan(geometry.frameBottom);
  await expect(hero(page).locator("[data-hero-frame]")).toHaveCSS(
    "border-radius",
    "40px",
  );
  const before = await background(page).evaluate(
    (el) => getComputedStyle(el).transform,
  );
  await page.screenshot({ path: info.outputPath("hero-1440x900.png") });
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() =>
      background(page).evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(before);
  const movement = await background(page).evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return { y: m.m42, scale: m.a };
  });
  expect(Math.abs(movement.y)).toBeLessThanOrEqual(32);
  expect(movement.scale).toBeGreaterThanOrEqual(1);
  expect(movement.scale).toBeLessThanOrEqual(1.035);
  const text = hero(page).locator('[data-motion="text"]');
  expect(
    await text.evaluate((el) =>
      Math.abs(new DOMMatrix(getComputedStyle(el).transform).m42),
    ),
  ).toBeLessThanOrEqual(10);
  for (const link of await hero(page).locator("a").all()) {
    await expect(link).toHaveCSS("transform", "none");
    await expect(link).toHaveCSS("opacity", "1");
    expect(
      await link.evaluate((el) => Boolean(el.closest("[data-motion]"))),
    ).toBe(false);
  }
  await hero(page).evaluate((el) =>
    window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY),
  );
  await expect(page.locator("[data-navigation]")).toHaveAttribute(
    "data-state",
    "surface",
  );
  expect(
    await page
      .locator("[data-navigation]")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(geometry.headerHeight);
  expect(
    await hero(page).evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(geometry.height);
  expect(errors).toEqual([]);
});

test("tablet/mobile composition, focal crop and lightweight motion reflow", async ({
  page,
}, info) => {
  await ready(page);
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [375, 812],
    [320, 812],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(hero(page).locator('[data-motion="reveal"]')).toHaveCSS(
      "opacity",
      "1",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(hero(page).locator("[data-hero-image]")).toHaveCSS(
      "object-position",
      "70% 50%",
    );
    if (width < 700)
      await expect(background(page)).toHaveCSS("transform", "none");
    if (width === 768) {
      expect(
        await background(page).evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).a,
        ),
      ).toBeLessThanOrEqual(1.014);
    }
    const frame = await hero(page).locator("[data-hero-frame]").boundingBox();
    const primary = await hero(page)
      .getByRole("link", {
        name: "Découvrir les prochaines aventures",
        exact: true,
      })
      .boundingBox();
    expect(primary!.x).toBeGreaterThan(frame!.x);
    expect(primary!.x + primary!.width).toBeLessThan(frame!.x + frame!.width);
    if (width === 375)
      expect(primary!.y + primary!.height).toBeLessThan(height);
    await page.screenshot({
      path: info.outputPath(`hero-${width}x${height}.png`),
    });
  }
});

test("toggle persistence, live reduced motion and stable static fallback", async ({
  page,
}) => {
  await ready(page);
  const initialHeight = await hero(page).evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "static");
  for (const item of await hero(page).locator("[data-motion]").all()) {
    await expect(item).toHaveCSS("transform", "none");
    await expect(item).toHaveCSS("opacity", "1");
  }
  expect(
    await hero(page).evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(initialHeight);
  await page.reload();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "static");
  await expect(
    page.getByRole("button", { name: "Réactiver les animations" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Réactiver les animations" }).click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene(page)).toHaveAttribute("data-motion-state", "static");
  await expect(background(page)).toHaveCSS("transform", "none");
  await page
    .getByRole("navigation", { name: "Explorer Sakado" })
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("long server copy reflows without overlapping actions or the development caption", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await ready(page);
  await hero(page)
    .getByRole("heading", { level: 1 })
    .evaluate((el) => {
      el.textContent = (el.textContent + " ").repeat(5);
    });
  await hero(page)
    .locator("p")
    .first()
    .evaluate((el) => {
      el.textContent = (el.textContent + " ").repeat(4);
    });
  const boxes = await hero(page).evaluate((el) => {
    const content = el
      .querySelector('a[href="/experiences"]')!
      .getBoundingClientRect();
    const caption = el
      .querySelector("[data-hero-placeholder]")!
      .getBoundingClientRect();
    const frame = el
      .querySelector("[data-hero-frame]")!
      .getBoundingClientRect();
    return {
      contentBottom: content.bottom,
      captionTop: caption.top,
      captionBottom: caption.bottom,
      frameBottom: frame.bottom,
    };
  });
  expect(boxes.captionTop).toBeGreaterThan(boxes.contentBottom);
  expect(boxes.captionBottom).toBeLessThan(boxes.frameBottom);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("no-JS and failed-image fallbacks retain content and real actions", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const staticPage = await context.newPage();
  await staticPage.goto("/");
  await expect(
    hero(staticPage).getByRole("heading", { level: 1 }),
  ).toBeVisible();
  await expect(background(staticPage)).toHaveCSS("transform", "none");
  await hero(staticPage)
    .getByRole("link", {
      name: "Découvrir les prochaines aventures",
      exact: true,
    })
    .click();
  await expect(staticPage).toHaveURL(/\/events$/);
  await context.close();
  await page.route("**/images/camp.svg", (route) => route.abort());
  await ready(page);
  await expect(hero(page).getByRole("heading", { level: 1 })).toBeVisible();
  await hero(page)
    .getByRole("link", { name: "Voir nos expériences", exact: true })
    .click();
  await expect(page).toHaveURL(/\/experiences$/);
});

test("cleanup preserves original styles and never owns ignored interactive targets", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "static");
  await scene(page).evaluate((el) => {
    const copy = document.createElement("div");
    copy.id = "styled-copy";
    copy.dataset.motion = "reveal";
    copy.style.cssText = "color: rgb(255, 255, 255); margin-top: 3px;";
    copy.textContent = "Test de préservation des styles";
    const controls = document.createElement("div");
    controls.id = "ignored-control";
    controls.dataset.motion = "reveal";
    controls.style.opacity = "0.7";
    const button = document.createElement("button");
    button.textContent = "Contrôle de test";
    controls.append(button);
    el.append(copy, controls);
  });
  const original = await page.locator("#styled-copy").getAttribute("style");
  await page.getByRole("button", { name: "Réactiver les animations" }).click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
  await expect(page.locator("#ignored-control")).toHaveCSS("opacity", "0.7");
  await page
    .locator("#ignored-control")
    .evaluate((el) => (el.style.opacity = "0.8"));
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "static");
  await expect(page.locator("#styled-copy")).toHaveAttribute(
    "style",
    original!,
  );
  await expect(page.locator("#ignored-control")).toHaveCSS("opacity", "0.8");
});

test("hero route lifecycle does not accumulate scroll/resize listeners", async ({
  page,
}) => {
  await ready(page);
  const cdp = await page.context().newCDPSession(page);
  async function count() {
    let total = 0;
    for (const expression of ["window", "document"]) {
      const { result } = await cdp.send("Runtime.evaluate", { expression });
      const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
        objectId: result.objectId!,
      });
      total += listeners.filter((l) =>
        ["scroll", "resize"].includes(l.type),
      ).length;
      await cdp.send("Runtime.releaseObject", { objectId: result.objectId! });
    }
    return total;
  }
  const mounted = await count();
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "À propos", exact: true })
      .click();
    await expect(hero(page)).toHaveCount(0);
    expect(await count()).toBeLessThanOrEqual(mounted);
    await page
      .locator("[data-navigation]")
      .getByRole("link", { name: /Accueil/ })
      .click();
    await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
    expect(await count()).toBeLessThanOrEqual(mounted);
  }
  await cdp.detach();
});

test("hero accessibility and warm scroll profile on desktop Chrome at 4x CPU", async ({
  page,
}, info) => {
  await ready(page);
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
        { include: ["[data-parallax-hero]"] },
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
      )
    ).violations;
  });
  expect(violations).toEqual([]);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Performance.enable");
  const metricsBefore = await cdp.send("Performance.getMetrics");
  const profile = await page.evaluate(async () => {
    const intervals: number[] = [];
    const longTasks: number[] = [];
    const observer = new PerformanceObserver((list) =>
      longTasks.push(...list.getEntries().map((e) => e.duration)),
    );
    observer.observe({ entryTypes: ["longtask"] });
    let previous = 0;
    const height = document
      .querySelector("[data-parallax-hero]")!
      .getBoundingClientRect().height;
    await new Promise<void>((resolve) => {
      let frame = 0;
      function sample(time: number) {
        if (previous) intervals.push(time - previous);
        previous = time;
        window.scrollTo(0, height * 0.7 * (frame / 90));
        if (++frame <= 90) requestAnimationFrame(sample);
        else resolve();
      }
      requestAnimationFrame(sample);
    });
    observer.disconnect();
    const sorted = [...intervals].sort((a, b) => a - b);
    return {
      samples: intervals.length,
      medianFrameMs: sorted[Math.floor(sorted.length / 2)],
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      framesOver50ms: intervals.filter((n) => n > 50).length,
      longTasksMs: longTasks,
    };
  });
  const metricsAfter = await cdp.send("Performance.getMetrics");
  const metric = (values: typeof metricsBefore, name: string) =>
    values.metrics.find((m) => m.name === name)?.value ?? 0;
  const result = {
    ...profile,
    scriptMs:
      (metric(metricsAfter, "ScriptDuration") -
        metric(metricsBefore, "ScriptDuration")) *
      1000,
    cpuThrottle: 4,
    device:
      "Desktop Chrome, development build, existing SVG; not real-device certification",
  };
  await info.attach("scroll-profile.json", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  console.log(JSON.stringify(result));
  expect(profile.samples).toBe(90);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.detach();
});
