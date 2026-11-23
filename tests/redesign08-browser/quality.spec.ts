import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const dependency = createRequire(`${process.cwd()}/package.json`);
const routes = [
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
];
const privateProject = (info: TestInfo) =>
  info.project.name.includes("private");

async function enter(page: Page, info: TestInfo) {
  if (!privateProject(info)) return;
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
  await expect(page).toHaveURL("http://127.0.0.1:3134/");
}

function evidence(info: TestInfo, name: string) {
  const directory = `.local/redesign08/${info.project.name}`;
  mkdirSync(directory, { recursive: true });
  return `${directory}/${name}`;
}

for (const width of [375, 390, 768, 1024, 1440, 1920]) {
  test(`official pages reflow and retain page landmarks at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await enter(page, info);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.name));
    page.on("console", (message) => {
      if (/hydration|did not match/i.test(message.text()))
        errors.push("hydration warning");
    });
    const review = [];
    for (const route of routes) {
      expect((await page.goto(route))?.status(), route).toBe(200);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("[data-navigation]")).toBeVisible();
      await expect(
        page.locator("[data-developer-signature] a"),
      ).toHaveAttribute("href", "mailto:ygharbi955@gmail.com");
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        offenders: [...document.querySelectorAll("main *")]
          .filter(
            (element) => element.getBoundingClientRect().right > innerWidth + 1,
          )
          .slice(0, 8)
          .map((element) => ({
            tag: element.tagName,
            class: element.className,
          })),
        canvas: getComputedStyle(document.querySelector(".s-company-site")!)
          .backgroundColor,
      }));
      review.push({ route, width, ...geometry });
      expect(
        geometry.overflow,
        JSON.stringify({ route, width, ...geometry }),
      ).toBeLessThanOrEqual(1);
      const name =
        route === "/" ? "home" : route.slice(1).replace(/[^a-z0-9]/gi, "-");
      await page.screenshot({
        path: evidence(info, `${name}-${width}.png`),
        caret: "initial",
      });
      if (route === "/" && [375, 1440].includes(width)) {
        for (const [label, selector] of [
          ["team", "#equipe"],
          ["partners", "#partenaires"],
          ["footer", ".site-footer"],
        ]) {
          const section = page.locator(selector);
          if (await section.count()) {
            await section.scrollIntoViewIfNeeded();
            for (const image of await section.locator("img").all()) {
              await image.scrollIntoViewIfNeeded();
              await expect
                .poll(() =>
                  image.evaluate(
                    (element) => (element as HTMLImageElement).naturalWidth,
                  ),
                )
                .toBeGreaterThan(0);
              await image.evaluate((element) =>
                (element as HTMLImageElement).decode(),
              );
            }
            await section.screenshot({
              path: evidence(info, `${label}-${width}.png`),
              caret: "initial",
            });
          }
        }
      }
    }
    writeFileSync(
      evidence(info, `geometry-${width}.json`),
      JSON.stringify(review, null, 2),
    );
    expect(errors).toEqual([]);
  });
}

test("official pages have no automated WCAG A/AA violations", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page, info);
  const findings = [];
  for (const route of [
    "/",
    "/about",
    "/experiences",
    "/events",
    "/destinations",
    "/adventures",
    "/gallery",
    "/contact",
    "/privacy",
  ]) {
    await page.goto(route);
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
                nodes: { target: string[] }[];
              }[];
            }>;
          };
        }
      ).axe;
      const result = await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
      return result.violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map(({ target }) => target),
      }));
    });
    findings.push({ route, violations });
  }
  writeFileSync(
    evidence(info, "accessibility.json"),
    JSON.stringify(findings, null, 2),
  );
  expect(findings.filter(({ violations }) => violations.length)).toEqual([]);
});

test("200% text reflows at a 320px viewport", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page, info);
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const geometry = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    offenders: [...document.querySelectorAll("body *")]
      .map((element) => ({
        tag: element.tagName,
        class: element.className,
        parent: element.parentElement?.className,
        grandparent: element.parentElement?.parentElement?.className,
        right: element.getBoundingClientRect().right,
        width: element.getBoundingClientRect().width,
      }))
      .filter(({ right }) => right > innerWidth + 1)
      .slice(0, 40),
  }));
  writeFileSync(
    evidence(info, "text-reflow.json"),
    JSON.stringify(geometry, null, 2),
  );
  expect(geometry.width, JSON.stringify(geometry)).toBeLessThanOrEqual(320);
});

test("records scoped load, warm scroll and post-navigation memory observations", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const staticControl = process.env.REDESIGN08_STATIC_PROFILE === "true";
  if (staticControl) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    const queries: WeakRef<MediaQueryList>[] = [];
    window.matchMedia = (query: string) => {
      const result = original(query);
      queries.push(new WeakRef(result));
      return result;
    };
    Object.assign(window, {
      retainedQaMediaQueries: () => {
        const counts: Record<string, number> = {};
        for (const reference of queries) {
          const query = reference.deref();
          if (query) counts[query.media] = (counts[query.media] ?? 0) + 1;
        }
        return counts;
      },
    });
  });
  await enter(page, info);
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.waitForTimeout(1000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const metrics = async () => {
    await page.waitForTimeout(400);
    await cdp.send("HeapProfiler.collectGarbage");
    const result = await cdp.send("Performance.getMetrics");
    const globalMotionListeners: Record<string, number> = {};
    for (const expression of ["window", "document"]) {
      const { result: target } = await cdp.send("Runtime.evaluate", {
        expression,
      });
      const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
        objectId: target.objectId!,
      });
      for (const listener of listeners.filter(({ type }) =>
        ["scroll", "resize", "pointermove", "pointerout", "storage"].includes(
          type,
        ),
      )) {
        const key = `${expression}:${listener.type}`;
        globalMotionListeners[key] = (globalMotionListeners[key] ?? 0) + 1;
      }
      await cdp.send("Runtime.releaseObject", { objectId: target.objectId! });
    }
    const retainedMediaQueries = await page.evaluate(() =>
      (
        window as unknown as {
          retainedQaMediaQueries: () => Record<string, number>;
        }
      ).retainedQaMediaQueries(),
    );
    return {
      globalMotionListeners,
      retainedMediaQueries,
      ...Object.fromEntries(
        result.metrics
          .filter(({ name }) =>
            [
              "JSHeapUsedSize",
              "Nodes",
              "Documents",
              "JSEventListeners",
            ].includes(name),
          )
          .map(({ name, value }) => [name, value]),
      ),
    };
  };
  const before = await metrics();
  const scroll = await page.evaluate(async () => {
    const intervals: number[] = [],
      longTasks: number[] = [];
    let shifts = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "longtask") longTasks.push(entry.duration);
        if (
          entry.entryType === "layout-shift" &&
          !(entry as PerformanceEntry & { hadRecentInput: boolean })
            .hadRecentInput
        )
          shifts += (entry as PerformanceEntry & { value: number }).value;
      }
    });
    observer.observe({ entryTypes: ["longtask", "layout-shift"] });
    await new Promise<void>((resolve) => {
      let previous = performance.now(),
        count = 0;
      const frame = (now: number) => {
        intervals.push(now - previous);
        previous = now;
        scrollTo(0, count <= 90 ? count * 18 : (180 - count) * 18);
        if (++count < 180) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    observer.disconnect();
    intervals.sort((a, b) => a - b);
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    return {
      frames: intervals.length,
      medianMs: intervals[90],
      p95Ms: intervals[171],
      framesOver50Ms: intervals.filter((value) => value > 50).length,
      longTasks,
      observedLayoutShift: shifts,
      scriptsDecodedBytes: resources
        .filter(
          (entry) =>
            entry.name.includes("/_next/") && entry.name.endsWith(".js"),
        )
        .reduce((sum, entry) => sum + entry.decodedBodySize, 0),
      scriptsTransferBytes: resources
        .filter(
          (entry) =>
            entry.name.includes("/_next/") && entry.name.endsWith(".js"),
        )
        .reduce((sum, entry) => sum + entry.transferSize, 0),
      resources: resources.length,
    };
  });
  const navigationCycles = [];
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const route of ["/about", "/gallery", "/contact", "/"]) {
      await page.locator(`a[href="${route}"]`).first().click();
      await expect(page).toHaveURL(
        new RegExp(`${route === "/" ? "/$" : route + "$"}`),
      );
    }
    navigationCycles.push({ cycle: cycle + 1, ...(await metrics()) });
  }
  const after = await metrics();
  for (const cycle of navigationCycles.slice(1)) {
    expect(cycle.globalMotionListeners).toEqual(
      navigationCycles[0].globalMotionListeners,
    );
  }
  writeFileSync(
    evidence(
      info,
      staticControl ? "performance-static.json" : "performance.json",
    ),
    JSON.stringify(
      {
        mode: privateProject(info)
          ? "protected development"
          : "official production, blocked public photographs absent",
        viewport: "1440x900",
        reducedMotionControl: staticControl,
        before,
        after,
        navigationCycles,
        scroll,
        limitation:
          "Local desktop Chrome observation; no field score or physical-device certification.",
      },
      null,
      2,
    ),
  );
  await cdp.detach();
});
