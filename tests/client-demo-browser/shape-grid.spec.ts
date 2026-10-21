import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";

type Probe = {
  paints: number;
  cells: number;
  observers: number;
  listeners: number;
};
type GridWindow = Window & {
  gridProbe: Probe;
  gridHidden: boolean;
  gridSaveData: boolean;
};
const grid = (page: Page) => page.locator(".s-preview-shape-grid");
const stats = (page: Page) =>
  page.evaluate(() => (window as unknown as GridWindow).gridProbe);

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const probe: Probe = { paints: 0, cells: 0, observers: 0, listeners: 0 };
    (window as unknown as GridWindow).gridProbe = probe;
    const isGrid = (el: Element) =>
      el.classList.contains("s-preview-shape-grid");
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    const fill = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.parentElement && isGrid(this.canvas.parentElement))
        probe.paints++;
      return clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.fillRect = function (...args) {
      if (this.canvas.parentElement && isGrid(this.canvas.parentElement))
        probe.cells++;
      return fill.apply(this, args);
    };
    // Track only the decoration's resources, independently of GSAP/React.
    for (const prototype of [
      IntersectionObserver.prototype,
      ResizeObserver.prototype,
    ]) {
      const watched = new WeakSet<object>();
      const observe = prototype.observe;
      const disconnect = prototype.disconnect;
      prototype.observe = function (target: Element) {
        if (isGrid(target) && !watched.has(this)) {
          watched.add(this);
          probe.observers++;
        }
        return observe.call(
          this as IntersectionObserver & ResizeObserver,
          target,
        );
      };
      prototype.disconnect = function () {
        if (watched.delete(this)) probe.observers--;
        return disconnect.call(this as IntersectionObserver & ResizeObserver);
      };
    }
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      callback,
      options,
    ) {
      if (
        this instanceof HTMLElement &&
        this.id === "experiences" &&
        /^(pointermove|pointerleave)$/.test(type)
      )
        probe.listeners++;
      return add.call(this, type, callback, options);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      callback,
      options,
    ) {
      if (
        this instanceof HTMLElement &&
        this.id === "experiences" &&
        /^(pointermove|pointerleave)$/.test(type)
      )
        probe.listeners--;
      return remove.call(this, type, callback, options);
    };
  });
});

async function screenshot(page: Page, path: string, sectionOnly = true) {
  await fs.mkdir(".local/shape-grid-review", { recursive: true });
  // Long element captures otherwise repeat fixed/sticky chrome inside the crop.
  const chrome = await page.addStyleTag({
    content: `nextjs-portal { display: none !important; } ${sectionOnly ? "[data-navigation], .skip-link { visibility: hidden !important; }" : ""}`,
  });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  });
  if (sectionOnly) await page.locator("#experiences").screenshot({ path });
  else await page.screenshot({ path });
  await chrome.evaluate((el) => el.parentNode?.removeChild(el));
}

async function ready(page: Page) {
  await page.goto("/");
  await page.locator("#experiences").scrollIntoViewIfNeeded();
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
  await expect.poll(async () => (await stats(page)).observers).toBe(2);
  await expect
    .poll(() =>
      grid(page)
        .locator("canvas")
        .evaluate((el: HTMLCanvasElement) => el.width),
    )
    .toBeGreaterThan(1);
}

async function illuminate(page: Page) {
  const bounds = await page.locator("#experiences").boundingBox();
  expect(bounds).not.toBeNull();
  // Empty upper-right section background, away from headings and controls.
  await page.mouse.move(bounds!.x + bounds!.width - 35, bounds!.y + 45);
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "active");
  await expect.poll(async () => (await stats(page)).cells).toBeGreaterThan(0);
}

async function staticResources(page: Page) {
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "static");
  await expect.poll(async () => (await stats(page)).observers).toBe(0);
  expect((await stats(page)).listeners).toBe(0);
  expect(
    await grid(page)
      .locator("canvas")
      .evaluate((el: HTMLCanvasElement) => el.width * el.height),
  ).toBe(1);
  await expect(grid(page)).not.toHaveCSS("background-image", "none");
  await expect(page.locator("#experiences h2")).toBeVisible();
}

test("desktop grid is bounded, secondary, idle between trails and transparent to links", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration|did not match/i.test(message.text()))
      errors.push(message.text());
  });
  await ready(page);
  await expect(grid(page)).toHaveAttribute("aria-hidden", "true");
  await expect(grid(page)).toHaveCSS("pointer-events", "none");
  await expect(grid(page).locator("canvas")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  const backing = await grid(page)
    .locator("canvas")
    .evaluate((el: HTMLCanvasElement) => ({
      pixels: el.width * el.height,
      ratio: el.width / el.getBoundingClientRect().width,
    }));
  expect(backing.pixels).toBeLessThanOrEqual(1_000_000);
  expect(backing.ratio).toBeLessThanOrEqual(1.5);
  const before = await page.locator("#experiences").boundingBox();
  await illuminate(page);
  await screenshot(page, ".local/shape-grid-review/desktop-active.png", false);
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
  const idle = await stats(page);
  await page.waitForTimeout(750);
  expect((await stats(page)).paints).toBe(idle.paints);
  expect(await page.locator("#experiences").boundingBox()).toEqual(before);
  for (const link of await page.locator("#experiences a").all()) {
    await link.hover();
    await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
    expect(
      await link.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
          ),
        );
      }),
    ).toBe(true);
    await expect(link).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(link).toHaveCSS("transform", "none");
  }
  const first = page.locator("#experiences a").first();
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact$/);
  await expect(grid(page)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("system reduction, saved toggle, visibility and data saving release the canvas", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as GridWindow).gridHidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => (window as unknown as GridWindow).gridHidden,
    });
    (window as unknown as GridWindow).gridSaveData = false;
    const connection = new EventTarget();
    Object.defineProperty(connection, "saveData", {
      get: () => (window as unknown as GridWindow).gridSaveData,
    });
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
  });
  await ready(page);
  await illuminate(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await staticResources(page);
  await expect(
    page.getByRole("button", {
      name: "Désactiver les animations",
      exact: true,
    }),
  ).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .click();
  await staticResources(page);
  await page.reload();
  await page.locator("#experiences").scrollIntoViewIfNeeded();
  await staticResources(page);
  await page
    .getByRole("button", { name: "Réactiver les animations", exact: true })
    .click();
  await page.locator("#experiences").scrollIntoViewIfNeeded();
  await illuminate(page);
  await page.evaluate(() => {
    (window as unknown as GridWindow).gridHidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await staticResources(page);
  await page.evaluate(() => {
    (window as unknown as GridWindow).gridHidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
  await page.evaluate(() => {
    (window as unknown as GridWindow).gridSaveData = true;
    (
      navigator as Navigator & { connection: EventTarget }
    ).connection.dispatchEvent(new Event("change"));
  });
  await staticResources(page);
  const idle = await stats(page);
  await page.waitForTimeout(750);
  expect((await stats(page)).paints).toBe(idle.paints);
});

test("offscreen, resize and client navigation clean up without accumulating resources", async ({
  page,
}) => {
  await ready(page);
  for (let visit = 0; visit < 3; visit++) {
    await illuminate(page);
    await page.locator("#partenaires").scrollIntoViewIfNeeded();
    await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
    const idle = await stats(page);
    await page.waitForTimeout(750);
    expect((await stats(page)).paints).toBe(idle.paints);
    await page.locator("#experiences").scrollIntoViewIfNeeded();
    await illuminate(page);
    if (visit === 0) {
      await page.setViewportSize({ width: 320, height: 812 });
      await staticResources(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.locator("#experiences").scrollIntoViewIfNeeded();
      await illuminate(page);
    }
    await page.locator("#experiences a").first().click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect.poll(async () => (await stats(page)).observers).toBe(0);
    expect((await stats(page)).listeners).toBe(0);
    const disposed = await stats(page);
    await page.mouse.move(1200, 400);
    await page.waitForTimeout(750);
    expect((await stats(page)).paints).toBe(disposed.paints);
    await page
      .locator("[data-navigation]")
      .getByRole("link", { name: /Accueil/ })
      .click();
    await page.locator("#experiences").scrollIntoViewIfNeeded();
    await expect.poll(async () => (await stats(page)).observers).toBe(2);
    expect((await stats(page)).listeners).toBe(2);
  }
  await page.goto("/experiences");
  await expect(grid(page)).toHaveCount(0);
});

for (const width of [320, 375, 768]) {
  test(`static touch layout and controls reflow at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|did not match/i.test(message.text()))
        errors.push(message.text());
    });
    try {
      await page.goto("/");
      await page.locator("#experiences").scrollIntoViewIfNeeded();
      await expect(grid(page)).toHaveAttribute(
        "data-shape-grid-state",
        "static",
      );
      await expect(grid(page)).not.toHaveCSS("background-image", "none");
      expect(
        await grid(page)
          .locator("canvas")
          .evaluate((el: HTMLCanvasElement) => el.width * el.height),
      ).toBe(1);
      await expect(page.locator("#experiences a")).toHaveCount(5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await screenshot(page, `.local/shape-grid-review/mobile-${width}.png`);
      await page.locator("#experiences a").first().tap();
      await expect(page).toHaveURL(/\/contact$/);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test("200% text zoom and 400% equivalent viewport keep copy, links and texture in flow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/");
  await expect(
    page.getByRole("button", {
      name: "Désactiver les animations",
      exact: true,
    }),
  ).toBeEnabled();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  for (const width of [720, 360, 320]) {
    await page.setViewportSize({ width, height: 812 });
    await page.locator("#experiences").scrollIntoViewIfNeeded();
    await staticResources(page);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      elements: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
        .map((el) => ({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          right: el.getBoundingClientRect().right,
        }))
        .slice(0, 15),
    }));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      JSON.stringify({ width, overflow }),
    ).toBe(true);
    for (const link of await page.locator("#experiences a").all()) {
      await expect(link).toBeVisible();
      const rect = await link.boundingBox();
      expect(rect!.width).toBeLessThanOrEqual(width);
    }
    await screenshot(page, `.local/shape-grid-review/reflow-${width}.png`);
  }
});

for (const fallback of [
  "no-js",
  "no-canvas",
  "no-intersection-observer",
] as const) {
  test(`${fallback} retains static grid and native navigation`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: fallback !== "no-js",
      viewport: { width: 1440, height: 900 },
    });
    if (fallback === "no-canvas")
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = new Proxy(original, {
          apply(target, element: HTMLCanvasElement, args) {
            if (
              element.parentElement?.classList.contains("s-preview-shape-grid")
            )
              return null;
            return Reflect.apply(target, element, args);
          },
        });
      });
    if (fallback === "no-intersection-observer")
      await context.addInitScript(() => {
        Object.defineProperty(window, "IntersectionObserver", {
          configurable: true,
          value: undefined,
        });
      });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto("/");
      await expect(grid(page)).toHaveAttribute(
        "data-shape-grid-state",
        "static",
      );
      await expect(grid(page)).not.toHaveCSS("background-image", "none");
      await expect(page.locator("#experiences h2")).toHaveText(
        "À chacun son aventure.",
      );
      await page.locator("#experiences a").first().click();
      await expect(page).toHaveURL(/\/contact$/);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test("4x CPU pointer sample paints briefly and performs no idle canvas work", async ({
  page,
}, info) => {
  await ready(page);
  await page.waitForTimeout(1000); // Let the existing one-time section reveal settle.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const result = await page.evaluate(async () => {
    const section = document.querySelector<HTMLElement>("#experiences")!;
    const bounds = section.getBoundingClientRect();
    const intervals: number[] = [];
    const drawTimes: number[] = [];
    const nativeFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) =>
      nativeFrame((now) => {
        const start = performance.now();
        callback(now);
        if (String(callback).includes("shapeGridState"))
          drawTimes.push(performance.now() - start);
      });
    const longTasks: number[] = [];
    const observer = new PerformanceObserver((list) =>
      list.getEntries().forEach((entry) => longTasks.push(entry.duration)),
    );
    observer.observe({ entryTypes: ["longtask"] });
    const initial = { ...(window as unknown as GridWindow).gridProbe };
    let previous = 0;
    await new Promise<void>((resolve) => {
      let index = 0;
      const sample = (now: number) => {
        if (previous) intervals.push(now - previous);
        previous = now;
        if (index < 40)
          section.dispatchEvent(
            new PointerEvent("pointermove", {
              pointerType: "mouse",
              clientX: bounds.right - 40 - index * 2,
              clientY: bounds.top + 45,
            }),
          );
        if (++index < 120) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });
    observer.disconnect();
    window.requestAnimationFrame = nativeFrame;
    const sorted = [...intervals].sort((a, b) => a - b);
    drawTimes.sort((a, b) => a - b);
    return {
      paints:
        (window as unknown as GridWindow).gridProbe.paints - initial.paints,
      cells: (window as unknown as GridWindow).gridProbe.cells - initial.cells,
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      drawSamples: drawTimes.length,
      p95DrawMs: drawTimes[Math.floor(drawTimes.length * 0.95)],
      maxDrawMs: drawTimes.at(-1),
      longTasksMs: longTasks,
    };
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.detach();
  await expect(grid(page)).toHaveAttribute("data-shape-grid-state", "idle");
  const idle = await stats(page);
  await page.waitForTimeout(750);
  expect((await stats(page)).paints).toBe(idle.paints);
  expect(result.paints).toBeGreaterThan(0);
  expect(result.cells).toBeGreaterThan(0);
  expect(result.drawSamples).toBeGreaterThan(0);
  await fs.writeFile(
    ".local/shape-grid-review/performance.json",
    JSON.stringify(result, null, 2),
  );
  await info.attach("grid-performance.json", {
    body: JSON.stringify(result),
    contentType: "application/json",
  });
});
