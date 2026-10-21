import { test, expect, type Page, type Locator } from "@playwright/test";
import fs from "node:fs/promises";

const scene = (page: Page) =>
  page.locator("[data-parallax-hero] [data-motion-scene]");
const background = (page: Page) =>
  page.locator('[data-parallax-hero] [data-motion="background"]');
const text = (page: Page) =>
  page.locator('[data-parallax-hero] [data-motion="text"]');
async function matrix(target: Locator) {
  return target.evaluate((el) => {
    const value = new DOMMatrix(getComputedStyle(el).transform);
    return { y: value.m42, scale: value.a };
  });
}
async function ready(page: Page) {
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
  await expect(
    page.locator('[data-parallax-hero] [data-motion="reveal"]'),
  ).toHaveCSS("opacity", "1");
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>("[data-hero-image]");
    return image?.complete && image.naturalWidth > 0;
  });
}

test("cinematic opening uses a mask and entrance-only blur while actions remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const evidence = { blur: false, mask: false };
    (
      window as unknown as { openingEvidence: typeof evidence }
    ).openingEvidence = evidence;
    const observer = new MutationObserver(() => {
      for (const target of document.querySelectorAll<HTMLElement>(
        '[data-parallax-hero] [data-motion-choreography="opening"]',
      )) {
        const style = getComputedStyle(target);
        if (/blur\((?!0px)[\d.]+px\)/.test(style.filter)) evidence.blur = true;
        if (
          target.dataset.motion === "image" &&
          style.clipPath !== "none" &&
          !style.clipPath.startsWith("inset(0%")
        )
          evidence.mask = true;
      }
    });
    observer.observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
    });
  });
  await page.goto("/");
  await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
  await expect
    .poll(
      async () =>
        (
          await page.evaluate(
            () =>
              (window as unknown as { openingEvidence: { blur: boolean } })
                .openingEvidence,
          )
        ).blur,
    )
    .toBe(true);
  await fs.mkdir(".local/client-preview-review/cinematic", { recursive: true });
  await page.screenshot({
    path: ".local/client-preview-review/cinematic/opening-entry.png",
  });
  await expect(
    page.locator('[data-parallax-hero] [data-motion="reveal"]'),
  ).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as {
            openingEvidence: { blur: boolean; mask: boolean };
          }
        ).openingEvidence,
    ),
  ).toEqual({ blur: true, mask: true });
  await expect(
    page.locator('[data-parallax-hero] [data-motion="reveal"]'),
  ).toHaveCSS("filter", "blur(0px)");
  await expect(
    page.locator('[data-parallax-hero] [data-motion="image"]'),
  ).toHaveCSS("clip-path", "inset(0% 0px 0px)");
  await page
    .getByRole("link", { name: "Découvrir Sakado", exact: true })
    .click();
  await expect(page).toHaveURL(/#histoire$/);
});

test("delayed images keep visible content and pending entrances cancel with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const image = page.locator("#photos img").first();
  const src = await image.getAttribute("src");
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route(src!, async (route) => {
    requested = true;
    await gate;
    await route.continue();
  });
  try {
    // The masonry entrance remains on its dedicated route.
    await page.goto("/gallery", { waitUntil: "domcontentloaded" });
    await page
      .locator("#photos .gallery-photo")
      .first()
      .scrollIntoViewIfNeeded();
    await expect.poll(() => requested).toBe(true);
    const target = page.locator('#photos [data-motion="image"]').first();
    await expect(target).toHaveCSS("opacity", "1");
    await expect(target).toHaveCSS("clip-path", "none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    release();
    await expect
      .poll(async () =>
        image.evaluate(
          (el) =>
            (el as HTMLImageElement).complete &&
            (el as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(target).toHaveCSS("transform", "none");
    await expect(target).toHaveCSS("clip-path", "none");
    await expect(target).not.toHaveAttribute(
      "data-cinematic-revealing",
      "true",
    );
    await expect(page.locator("#photos h2")).toBeVisible();
  } finally {
    release();
  }
});

test("timeline advances human-readable milestone emphasis and progress without pinning", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const timeline = page.locator("[data-story-timeline]");
  await timeline.scrollIntoViewIfNeeded();
  await expect(timeline).toHaveAttribute("data-motion-state", "ready");
  const range = await timeline.evaluate((el) => {
    const bounds = el.getBoundingClientRect();
    const top = bounds.top + scrollY;
    return {
      start: top - innerHeight * 0.72,
      end: top + bounds.height - innerHeight * 0.32,
    };
  });
  await fs.mkdir(".local/client-preview-review/cinematic", { recursive: true });
  const progresses: number[] = [];
  for (const [index, progress] of [0.15, 0.5, 0.9].entries()) {
    await page.evaluate(
      (position) => window.scrollTo(0, position),
      range.start + (range.end - range.start) * progress,
    );
    const phases = page.locator("[data-story-phase]");
    await expect
      .poll(async () =>
        Number(
          await phases
            .nth(index)
            .evaluate((el) => getComputedStyle(el).opacity),
        ),
      )
      .toBeGreaterThan(0.96);
    progresses.push(
      (await matrix(page.locator("[data-story-progress]"))).scale,
    );
    if (index > 0)
      expect(
        Number(
          await phases
            .nth(index - 1)
            .evaluate((el) => getComputedStyle(el).opacity),
        ),
      ).toBeLessThan(0.86);
    await page.screenshot({
      path: `.local/client-preview-review/cinematic/timeline-${index}.png`,
    });
  }
  expect(progresses[1]).toBeGreaterThan(progresses[0]);
  expect(progresses[2]).toBeGreaterThan(progresses[1]);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(timeline.locator("li > span")).toHaveText([
    "2017",
    "2022",
    "Aujourd’hui",
  ]);
  for (const year of await timeline.locator("li > span").all())
    await expect(year).toHaveCSS("transform", "none");
});

test("gallery budget and portrait/name/role sequencing remain controlled on entry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const evidence = { peak: 0, portrait: 0, name: 0, role: 0 };
    (
      window as unknown as { sequenceEvidence: typeof evidence }
    ).sequenceEvidence = evidence;
    new MutationObserver(() => {
      evidence.peak = Math.max(
        evidence.peak,
        document.querySelectorAll(
          '#photos [data-motion-group="gallery"][data-cinematic-revealing]',
        ).length,
      );
      const first = document.querySelector("#equipe article");
      for (const [key, selector] of [
        ["portrait", '[data-motion="image"]'],
        ["name", "[data-motion]:has(h3)"],
        ["role", "[data-motion]:has(p)"],
      ] as const) {
        if (
          !evidence[key] &&
          first
            ?.querySelector(selector)
            ?.hasAttribute("data-cinematic-revealing")
        )
          evidence[key] = performance.now();
      }
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-cinematic-revealing"],
      childList: true,
    });
  });
  await ready(page);
  await page.goto("/gallery");
  for (const index of [0, 4, 8, 11]) {
    await page
      .locator("#photos .gallery-photo")
      .nth(index)
      .scrollIntoViewIfNeeded();
    await expect(page.locator("#photos [data-motion-scene]")).toHaveAttribute(
      "data-motion-state",
      "ready",
    );
    if (index === 0) {
      await expect
        .poll(async () =>
          page
            .locator("#photos img")
            .first()
            .evaluate(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
        )
        .toBe(true);
      await fs.mkdir(".local/client-preview-review/cinematic", {
        recursive: true,
      });
      await page.screenshot({
        path: ".local/client-preview-review/cinematic/gallery-entry.png",
      });
    }
  }
  const galleryPeak = await page.evaluate(
    () =>
      (window as unknown as { sequenceEvidence: { peak: number } })
        .sequenceEvidence.peak,
  );
  await ready(page);
  await page.locator("#equipe article").first().scrollIntoViewIfNeeded();
  await expect
    .poll(
      async () =>
        (
          await page.evaluate(
            () =>
              (window as unknown as { sequenceEvidence: { role: number } })
                .sequenceEvidence,
          )
        ).role,
    )
    .toBeGreaterThan(0);
  const evidence = await page.evaluate(
    () =>
      (
        window as unknown as {
          sequenceEvidence: {
            peak: number;
            portrait: number;
            name: number;
            role: number;
          };
        }
      ).sequenceEvidence,
  );
  await page.screenshot({
    path: ".local/client-preview-review/cinematic/team-entry.png",
  });
  expect(galleryPeak).toBeGreaterThan(0);
  expect(galleryPeak).toBeLessThanOrEqual(3);
  expect(evidence.name).toBeGreaterThan(evidence.portrait);
  expect(evidence.role).toBeGreaterThan(evidence.name);
  await expect(page.locator("#photos [data-gallery-card]")).toHaveCount(12);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
]) {
  test(`actual photo parallax, stable controls and restrained reveals at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await ready(page);
    const before = await matrix(background(page));
    const geometry = () =>
      page.evaluate(() =>
        [
          "[data-parallax-hero]",
          "#histoire",
          "#photos",
          "#equipe",
          "[data-navigation]",
        ].map((selector) => {
          const el = document.querySelector(selector)!;
          return {
            height: el.getBoundingClientRect().height,
            width: el.getBoundingClientRect().width,
          };
        }),
      );
    const original = await geometry();
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect
      .poll(async () => (await matrix(background(page))).y)
      .toBeGreaterThan(before.y + 1);
    const after = await matrix(background(page));
    const copy = await matrix(text(page));
    expect(after.y - before.y).toBeLessThan(40); // Image travels much less than page scroll.
    expect(copy.y).toBeLessThan(-1);
    expect(Math.abs(copy.y)).toBeLessThanOrEqual(
      viewport.width === 768 ? 5.5 : 10,
    );
    expect(after.scale).toBeLessThanOrEqual(
      viewport.width === 768 ? 1.01925 : 1.035,
    );
    for (const link of await page.locator("[data-parallax-hero] a").all()) {
      await expect(link).toHaveCSS("transform", "none");
      expect(
        await link.evaluate((el) => Boolean(el.closest("[data-motion]"))),
      ).toBe(false);
    }
    await page.locator("#histoire ol").scrollIntoViewIfNeeded();
    await expect(
      page.locator('#histoire ol [data-motion="reveal"]'),
    ).toHaveCount(3);
    for (const target of await page
      .locator('#histoire ol [data-motion="reveal"]')
      .all())
      await expect(target).toHaveCSS("opacity", "1");
    const activeCard = page.locator(
      '#photos [data-gallery-card][data-active="true"]',
    );
    await activeCard.hover();
    await expect(
      page.locator("#photos [data-gallery-carousel]"),
    ).toHaveAttribute("data-carousel-motion", "on");
    await expect(page.locator("#photos [data-gallery-card]")).toHaveCount(12);
    const beforeFocus = await activeCard.boundingBox();
    await activeCard.focus();
    expect(await activeCard.boundingBox()).toEqual(beforeFocus);
    await page.locator("#equipe article").first().hover();
    const portrait = page.locator("#equipe article img").first();
    await expect(portrait).not.toHaveCSS("transform", "none");
    await page.mouse.move(0, 0);
    await expect(portrait).toHaveCSS("transform", "none");
    await expect(page.locator("#partenaires [data-motion]")).toHaveCount(6);
    expect(await geometry()).toEqual(original);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("[data-navigation]")).toHaveAttribute(
      "data-state",
      "surface",
    );
  });
}

test("touch/mobile disables scroll transforms and hover depth; keeps short fades", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await ready(page);
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 350));
      await expect(background(page)).toHaveCSS("transform", "none");
      await expect(text(page)).toHaveCSS("transform", "none");
      await page
        .locator('#photos [data-gallery-card][data-active="true"]')
        .scrollIntoViewIfNeeded();
      await expect(
        page.locator('#photos [data-gallery-card][data-active="true"]'),
      ).toHaveCSS("opacity", "1");
      await page.locator("#equipe article").first().hover();
      await expect(page.locator("#equipe article img").first()).toHaveCSS(
        "transform",
        "none",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  } finally {
    await context.close();
  }
});

test("live reduced motion and saved toggle restore all target styles without shifting layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  for (const id of ["histoire", "photos", "equipe"])
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const target of await page.locator("[data-motion]").all()) {
    await expect(target).toHaveCSS("transform", "none");
    await expect(target).toHaveCSS("opacity", "1");
    await expect(target).toHaveCSS("filter", "none");
    await expect(target).toHaveCSS("clip-path", "none");
  }
  for (const target of await page
    .locator("[data-story-phase], [data-story-progress]")
    .all()) {
    await expect(target).toHaveCSS("transform", "none");
    await expect(target).toHaveCSS("opacity", "1");
  }
  for (const surface of await page.locator("[data-cinematic-motion]").all())
    await expect(surface).toHaveAttribute("data-cinematic-motion", "static");
  await page.locator('#photos [data-gallery-card][data-active="true"]').hover();
  await expect(page.locator("#photos [data-gallery-carousel]")).toHaveAttribute(
    "data-carousel-motion",
    "static",
  );
  await page.locator("#equipe article").first().hover();
  await expect(page.locator("#equipe article img").first()).toHaveCSS(
    "transform",
    "none",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "static");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Réactiver les animations", exact: true }),
  ).toBeEnabled();
  await expect(background(page)).toHaveCSS("transform", "none");
  await page
    .getByRole("button", { name: "Réactiver les animations", exact: true })
    .click();
  await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
});

test("client route changes clean up scenes without accumulating global listeners", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  async function visitSections() {
    for (const id of ["histoire", "photos", "equipe"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      for (const target of await page
        .locator(`#${id} [data-motion-scene]`)
        .all())
        await expect(target).toHaveAttribute("data-motion-state", "ready");
    }
  }
  await visitSections();
  const cdp = await page.context().newCDPSession(page);
  async function count() {
    let total = 0;
    for (const expression of ["window", "document"]) {
      const { result } = await cdp.send("Runtime.evaluate", { expression });
      const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
        objectId: result.objectId!,
      });
      total += listeners.filter((listener) =>
        ["scroll", "resize"].includes(listener.type),
      ).length;
      await cdp.send("Runtime.releaseObject", { objectId: result.objectId! });
    }
    return total;
  }
  const mounted = await count();
  for (let i = 0; i < 2; i++) {
    await page
      .locator("[data-navigation]")
      .getByRole("link", { name: "Contact", exact: true })
      .click();
    await expect(page.locator("[data-motion-scene]")).toHaveCount(0);
    expect(await count()).toBeLessThanOrEqual(mounted);
    await page
      .locator("[data-navigation]")
      .getByRole("link", { name: /Accueil/ })
      .click();
    await expect(scene(page)).toHaveAttribute("data-motion-state", "ready");
    await visitSections();
    expect(await count()).toBeLessThanOrEqual(mounted);
  }
  await cdp.detach();
});

test("warm actual-photo scroll profile and no cumulative layout shift", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const result = await page.evaluate(async () => {
    const intervals: number[] = [];
    const longTasks: number[] = [];
    let layoutShift = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "longtask") longTasks.push(entry.duration);
        if (entry.entryType === "layout-shift") {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) layoutShift += shift.value;
        }
      }
    });
    observer.observe({ entryTypes: ["longtask", "layout-shift"] });
    let previous = 0;
    await new Promise<void>((resolve) => {
      let frame = 0;
      const height = document
        .querySelector("[data-parallax-hero]")!
        .getBoundingClientRect().height;
      function sample(now: number) {
        if (previous) intervals.push(now - previous);
        previous = now;
        window.scrollTo(0, (height * 0.7 * frame) / 90);
        if (++frame <= 90) requestAnimationFrame(sample);
        else requestAnimationFrame(() => resolve());
      }
      requestAnimationFrame(sample);
    });
    observer.disconnect();
    const sorted = [...intervals].sort((a, b) => a - b);
    return {
      samples: intervals.length,
      medianFrameMs: sorted[Math.floor(sorted.length / 2)],
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      framesOver50ms: intervals.filter((value) => value > 50).length,
      longTasksMs: longTasks,
      layoutShift,
    };
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.detach();
  const evidence = {
    ...result,
    cpuThrottle: 4,
    scope:
      "Warm desktop Chrome, development build, actual private hero; not real-device certification",
  };
  await info.attach("private-demo-scroll-profile.json", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
  console.log(JSON.stringify(evidence));
  expect(result.samples).toBe(90);
  expect(result.layoutShift).toBeLessThanOrEqual(0.01);
});
