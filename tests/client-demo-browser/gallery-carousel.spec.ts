import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";

const cards = (page: import("@playwright/test").Page) =>
  page.locator("[data-gallery-card]");
const current = (page: import("@playwright/test").Page) =>
  page.locator('[data-gallery-card][data-active="true"]');
const next = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Photo suivante" });
const previous = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Photo précédente" });

test("desktop slots stay centered and change position and size together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto("/");
  await current(page).scrollIntoViewIfNeeded();
  await expect(next(page)).toBeVisible();
  await expect(cards(page)).toHaveCount(12);
  await expect(page.locator('[data-gallery-card][data-slot="-3"]')).toHaveCount(
    1,
  );
  await expect(page.locator('[data-gallery-card][data-slot="3"]')).toHaveCount(
    1,
  );
  const first = page.locator('[data-gallery-card="gallery-0"]');
  const second = page.locator('[data-gallery-card="gallery-1"]');
  const before = await first.boundingBox();
  expect(before).not.toBeNull();
  expect(before!.width).toBeCloseTo(600, 0);
  expect(before!.height).toBeCloseTo(400, 0);
  expect(before!.x + before!.width / 2).toBeCloseTo(960, 0);
  const incomingBefore = await second.boundingBox();
  expect(incomingBefore!.width).toBeCloseTo(160, 0);
  expect(incomingBefore!.x - (before!.x + before!.width)).toBeCloseTo(26, 0);
  const frames = await page.evaluate(async () => {
    const incoming = document.querySelector<HTMLElement>(
      '[data-gallery-card="gallery-1"]',
    )!;
    const outgoing = document.querySelector<HTMLElement>(
      '[data-gallery-card="gallery-0"]',
    )!;
    const frames: {
      time: number;
      x: number;
      width: number;
      height: number;
      outgoingWidth: number;
      brightness: number;
      textOpacity: number;
    }[] = [];
    const start = performance.now();
    (
      document.querySelector(
        'button[aria-label="Photo suivante"]',
      ) as HTMLButtonElement
    ).click();
    await new Promise<void>((resolve) => {
      function sample(time: number) {
        const rect = incoming.getBoundingClientRect();
        frames.push({
          time: time - start,
          x: rect.x + rect.width / 2,
          width: rect.width,
          height: rect.height,
          outgoingWidth: outgoing.getBoundingClientRect().width,
          brightness: Number(
            getComputedStyle(incoming.querySelector("img")!).filter.match(
              /brightness\(([\d.]+)\)/,
            )![1],
          ),
          textOpacity: Number(
            getComputedStyle(
              document.querySelector('[data-gallery-caption="gallery-1"]')!,
            ).opacity,
          ),
        });
        if (time - start < 650) requestAnimationFrame(sample);
        else resolve();
      }
      requestAnimationFrame(sample);
    });
    return frames;
  });
  const moving = frames.filter(
    (frame) => frame.width > 170 && frame.width < 590,
  );
  const intervals = frames
    .slice(1)
    .map((frame, index) => frame.time - frames[index].time)
    .sort((a, b) => a - b);
  const profile = {
    samples: frames.length,
    medianFrameMs: intervals[Math.floor(intervals.length / 2)],
    p95FrameMs: intervals[Math.floor(intervals.length * 0.95)],
    framesOver50ms: intervals.filter((interval) => interval > 50).length,
    scope:
      "One warm 1920px desktop Chrome carousel transition; local development, no CPU throttle",
  };
  await fs.mkdir(".local/client-preview-review/carousel", { recursive: true });
  await fs.writeFile(
    ".local/client-preview-review/carousel/transition-profile.json",
    JSON.stringify(profile, null, 2),
  );
  await test.info().attach("carousel-transition-profile", {
    body: JSON.stringify(profile),
    contentType: "application/json",
  });
  expect(moving.length).toBeGreaterThan(3);
  for (const frame of moving) {
    const growth = (frame.width - 160) / 440;
    const travel = (1366 - frame.x) / 406;
    expect(Math.abs(growth - travel)).toBeLessThan(0.015);
    expect(Math.abs(growth - (frame.height - 290) / 110)).toBeLessThan(0.015);
    expect(frame.width + frame.outgoingWidth).toBeCloseTo(760, 0);
    expect(Math.abs(growth - (frame.brightness - 0.83) / 0.17)).toBeLessThan(
      0.02,
    );
    expect(Math.abs(growth - frame.textOpacity)).toBeLessThan(0.02);
  }
  await expect(second).toHaveCSS("width", "600px");
  await expect(second).toHaveCSS("height", "400px");
  const after = await second.boundingBox();
  expect(after!.x + after!.width / 2).toBeCloseTo(960, 0);
  expect(frames.at(-1)!.time).toBeLessThan(720);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("loops in both directions and rapid input settles in order", async ({
  page,
}) => {
  await page.goto("/");
  await previous(page).click();
  await expect(current(page)).toHaveAttribute(
    "data-gallery-card",
    "gallery-11",
  );
  await expect(current(page)).toHaveCSS("width", "600px");
  await next(page).click();
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-0");
  await expect(current(page)).toHaveCSS("width", "600px");
  for (let i = 0; i < 15; i++) await next(page).click();
  await page.waitForTimeout(9000); // All fifteen serialized 580ms slots must complete.
  await expect(current(page)).toHaveAttribute(
    "data-gallery-card",
    "gallery-3",
    { timeout: 12000 },
  );
  await expect(
    page.locator('[data-gallery-card][data-active="true"]'),
  ).toHaveCount(1);
  await expect(current(page)).toHaveCSS("width", "600px");
  expect(
    await cards(page)
      .locator("img")
      .evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
});

test("loop boundaries preserve every visible card's direction and spacing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto("/");
  await current(page).scrollIntoViewIfNeeded();
  await expect(next(page)).toBeVisible();
  for (const direction of [-1, 1]) {
    const samples = await page.evaluate(async (direction) => {
      const visible = [
        ...document.querySelectorAll<HTMLElement>("[data-gallery-card]"),
      ]
        .filter((card) => Math.abs(Number(card.dataset.slot)) <= 4)
        .sort((a, b) => Number(a.dataset.slot) - Number(b.dataset.slot));
      const rows: { center: number; left: number; right: number }[][] = [];
      const read = () =>
        visible.map((card) => {
          const box = card.getBoundingClientRect();
          return {
            center: box.x + box.width / 2,
            left: box.left,
            right: box.right,
          };
        });
      rows.push(read());
      const start = performance.now();
      (
        document.querySelector(
          `button[aria-label="${direction === 1 ? "Photo suivante" : "Photo précédente"}"]`,
        ) as HTMLButtonElement
      ).click();
      await new Promise<void>((resolve) => {
        function sample(time: number) {
          rows.push(read());
          if (time - start < 650) requestAnimationFrame(sample);
          else resolve();
        }
        requestAnimationFrame(sample);
      });
      return rows;
    }, direction);
    for (let row = 1; row < samples.length; row++) {
      for (let card = 0; card < samples[row].length; card++) {
        const movement =
          samples[row][card].center - samples[row - 1][card].center;
        expect(movement * -direction).toBeGreaterThanOrEqual(-0.5);
        if (card)
          expect(
            samples[row][card].left - samples[row][card - 1].right,
          ).toBeGreaterThan(25);
      }
    }
    expect(
      await page.locator('[data-reassigned="true"]').evaluateAll((elements) =>
        elements.every((element) => {
          const box = element.getBoundingClientRect();
          return box.right <= 0 || box.left >= innerWidth;
        }),
      ),
    ).toBe(true);
  }
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-0");
});

test("saved off, data saving and live reduction switch without transitions", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("sakado-motion-disabled", "true"),
  );
  await page.goto("/");
  await expect(page.locator("[data-gallery-carousel]")).toHaveAttribute(
    "data-carousel-motion",
    "static",
  );
  await next(page).click();
  await expect(current(page)).toHaveCSS("transition-duration", "0s");
  await page
    .getByRole("button", { name: "Réactiver les animations", exact: true })
    .click();
  await expect(page.locator("[data-gallery-carousel]")).toHaveAttribute(
    "data-carousel-motion",
    "on",
  );
  for (let i = 0; i < 4; i++) await next(page).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-5");
  await expect(current(page)).toHaveCSS("transition-duration", "0s");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    const connection = (navigator as Navigator & { connection: EventTarget })
      .connection;
    Object.defineProperty(connection, "saveData", {
      configurable: true,
      value: true,
    });
    connection.dispatchEvent(new Event("change"));
  });
  await expect(page.locator("[data-gallery-carousel]")).toHaveAttribute(
    "data-carousel-motion",
    "static",
  );
  await previous(page).click();
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-4");
  await expect(current(page)).toHaveCSS("transition-duration", "0s");
});

test("keyboard, dialog, Escape and focus restoration", async ({ page }) => {
  await page.goto("/");
  await next(page).focus();
  await page.keyboard.press("Enter");
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-1");
  await previous(page).focus();
  await page.keyboard.press("Space");
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-0");
  await page.keyboard.press("ArrowRight");
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-1");
  const link = current(page);
  await link.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Visionneuse d’images" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("alt", /.+/);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(link).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(previous(page)).toBeFocused();
  const fullImageLink = page.locator(
    '[data-gallery-caption][data-active="true"] a',
  );
  await fullImageLink.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(fullImageLink).toBeFocused();
});

test("responsive gallery remains landscape with visible side previews and a working gallery route", async ({
  page,
}) => {
  for (const width of [768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await current(page).scrollIntoViewIfNeeded();
    const box = (await current(page).boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(1.5, 2);
    expect(box.x + box.width / 2).toBeCloseTo(width / 2, 0);
    for (const slot of [-1, 1]) {
      const side = (await page
        .locator(`[data-gallery-card][data-slot="${slot}"]`)
        .boundingBox())!;
      expect(side.height).toBeGreaterThan(side.width);
      const visibleWidth =
        Math.min(width, side.x + side.width) - Math.max(0, side.x);
      expect(visibleWidth).toBeGreaterThan(14);
    }
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  await page
    .locator("#photos")
    .getByRole("link", { name: "Ouvrir la galerie" })
    .click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(page.locator(".gallery-photo")).toHaveCount(12);
  await expect(page.locator("[data-gallery-carousel]")).toHaveCount(0);
});

test("photo-led homepage activities retain labels, destinations, ShapeGrid and badge removal", async ({
  page,
}) => {
  await page.goto("/");
  const expected = [
    "Randonnées",
    "Séjours en camping",
    "Expéditions sahariennes",
    "Team building",
    "Événements d’entreprise",
  ];
  await expect(page.locator("#experiences h3")).toHaveText(expected);
  await expect(page.locator("[data-client-activity-photo]")).toHaveCount(5);
  await expect(page.locator("#experiences .s-preview-shape-grid")).toHaveCount(
    1,
  );
  for (const link of await page.locator("#experiences a").all())
    await expect(link).toHaveAttribute("href", "/contact");
  await expect(
    page.locator("#histoire").getByText("Depuis 2017", { exact: true }),
  ).toHaveCount(0);
  await page.goto("/experiences");
  await expect(page.locator("#experiences h3")).toHaveText(expected);
  await expect(page.locator("[data-client-activity-photo]")).toHaveCount(0);
  await expect(page.locator(".s-preview-shape-grid")).toHaveCount(0);
});

test("reduced motion, touch and mobile reflow", async ({ browser, page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("[data-gallery-carousel]")).toHaveAttribute(
    "data-carousel-motion",
    "static",
  );
  await next(page).click();
  await expect(current(page)).toHaveAttribute("data-gallery-card", "gallery-1");
  await expect(current(page)).toHaveCSS("transition-duration", "0s");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const touchPage = await context.newPage();
  await touchPage.goto("http://127.0.0.1:3130/");
  await next(touchPage).tap();
  await expect(current(touchPage)).toHaveAttribute(
    "data-gallery-card",
    "gallery-1",
  );
  expect(
    await touchPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

for (const width of [1920, 768, 375, 320]) {
  test(`review capture at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width >= 768 ? 1000 : 812 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|did not match/i.test(message.text()))
        errors.push(message.text());
    });
    await page.goto("/");
    await current(page).scrollIntoViewIfNeeded();
    await expect(current(page).locator("img")).toHaveJSProperty(
      "complete",
      true,
    );
    await fs.mkdir(".local/client-preview-review/carousel", {
      recursive: true,
    });
    await page.waitForFunction(() =>
      [
        ...document.querySelectorAll<HTMLImageElement>(
          '[data-gallery-card]:not([data-distance="5"]):not([data-distance="6"]) img',
        ),
      ].every((image) => image.complete && image.naturalWidth > 0),
    );
    await page.screenshot({
      path: `.local/client-preview-review/carousel/gallery-${width}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    if (width === 320) {
      await page.evaluate(
        () => (document.documentElement.style.fontSize = "200%"),
      );
      await current(page).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: ".local/client-preview-review/carousel/gallery-320-text200.png",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const caption = await page
        .locator('[data-active="true"]')
        .last()
        .boundingBox();
      const controls = await next(page).boundingBox();
      expect(controls!.y).toBeGreaterThan(caption!.y + caption!.height);
    }
  });
}

test("without JavaScript the centered image remains a full-image link", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3130/");
  const link = current(page);
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  await expect(next(page)).toBeHidden();
  await expect(
    page.getByRole("link", { name: "Voir les douze photos de la galerie" }),
  ).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(new RegExp(href!));
  await context.close();
});
