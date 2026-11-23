import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { motionQueries } from "../../src/lib/motion/policy";

type QuerySample = { objects: number; callbacks: number };
type OwnershipSample = {
  queries: Record<string, QuerySample>;
  connectedScenes: number;
  detachedScenes: number;
  detachedDetails: { route: string; kind: string; styledTargets: number }[];
};

async function instrumentation(page: Page) {
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    const lists: { ref: WeakRef<MediaQueryList>; listeners: Set<unknown> }[] =
      [];
    window.matchMedia = (query) => {
      const list = nativeMatchMedia(query);
      const listeners = new Set<unknown>();
      lists.push({ ref: new WeakRef(list), listeners });
      const add = list.addEventListener.bind(list);
      const remove = list.removeEventListener.bind(list);
      const legacyAdd = list.addListener.bind(list);
      const legacyRemove = list.removeListener.bind(list);
      list.addEventListener = (
        type: string,
        callback: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ) => {
        if (type === "change") listeners.add(callback);
        add(type, callback, options);
      };
      list.removeEventListener = (
        type: string,
        callback: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
      ) => {
        if (type === "change") listeners.delete(callback);
        remove(type, callback, options);
      };
      list.addListener = (callback) => {
        listeners.add(callback);
        legacyAdd(callback);
      };
      list.removeListener = (callback) => {
        listeners.delete(callback);
        legacyRemove(callback);
      };
      return list;
    };
    const scenes: { ref: WeakRef<Element>; route: string }[] = [];
    const seen = new WeakSet<Element>();
    const record = (element: Element) => {
      for (const scene of [
        element,
        ...element.querySelectorAll("[data-motion-scene]"),
      ]) {
        if (scene.matches("[data-motion-scene]") && !seen.has(scene)) {
          seen.add(scene);
          scenes.push({ ref: new WeakRef(scene), route: location.pathname });
        }
      }
    };
    new MutationObserver((records) => {
      for (const mutation of records)
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) record(node);
        }
    }).observe(document, { childList: true, subtree: true });
    Object.assign(window, {
      lifecycleOwnership: () => {
        const queries: Record<string, { objects: number; callbacks: number }> =
          {};
        for (const { ref, listeners } of lists) {
          const list = ref.deref();
          if (!list) continue;
          const sample = (queries[list.media] ??= { objects: 0, callbacks: 0 });
          sample.objects++;
          sample.callbacks += listeners.size;
        }
        const retained = scenes.flatMap(({ ref, route }) => {
          const scene = ref.deref();
          return scene ? [{ scene, route }] : [];
        });
        return {
          queries,
          connectedScenes: retained.filter(({ scene }) => scene.isConnected)
            .length,
          detachedScenes: retained.filter(({ scene }) => !scene.isConnected)
            .length,
          detachedDetails: retained
            .filter(({ scene }) => !scene.isConnected)
            .map(({ scene, route }) => ({
              route,
              kind:
                [
                  "data-ambient-background",
                  "data-hero-cinematic",
                  "data-company-story",
                  "data-team-story",
                  "data-final-journey",
                  "data-partners-story",
                ]
                  .filter((attribute) => scene.hasAttribute(attribute))
                  .join(",") || "generic",
              styledTargets: scene.querySelectorAll(
                '[style*="transform"], [style*="opacity"]',
              ).length,
            })),
        };
      },
    });
  });
}

async function activateHome(page: Page) {
  await expect(page.locator("main h1")).toBeVisible();
  // Visit the same scopes each time so lazy mounting cannot skew the comparison.
  for (const scene of await page.locator("[data-motion-scene]").all()) {
    await scene.scrollIntoViewIfNeeded();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(250);
}

test("30 route tours dispose inactive media-query owners and preserve motion", async ({
  page,
}, info) => {
  const label = process.env.LIFECYCLE_EVIDENCE_LABEL ?? "after";
  const tours = Number(process.env.LIFECYCLE_DIAGNOSTIC_TOURS ?? 30);
  const folder = `.local/redesign08-1/${label}/${info.project.name}`;
  mkdirSync(folder, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await instrumentation(page);
  if (info.project.name.includes("private")) {
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
  } else await page.goto("/");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const sample = async (cycle: number) => {
    await page.waitForTimeout(200);
    await cdp.send("HeapProfiler.collectGarbage");
    const ownership = await page.evaluate(() =>
      (
        window as unknown as { lifecycleOwnership: () => OwnershipSample }
      ).lifecycleOwnership(),
    );
    const { metrics } = await cdp.send("Performance.getMetrics");
    const memory = Object.fromEntries(
      metrics
        .filter(({ name }) =>
          ["JSHeapUsedSize", "Nodes", "Documents", "JSEventListeners"].includes(
            name,
          ),
        )
        .map(({ name, value }) => [name, value]),
    );
    return { cycle, ...ownership, ...memory };
  };
  const samples = [];
  try {
    await activateHome(page);
    samples.push(await sample(0));
    for (let cycle = 1; cycle <= tours; cycle++) {
      for (const route of ["/about", "/gallery", "/contact", "/"]) {
        await page
          .locator("[data-navigation]")
          .locator(`a[href="${route}"]`)
          .first()
          .click();
        await expect(page).toHaveURL(
          new RegExp(`${route === "/" ? "/$" : route + "$"}`),
        );
        await expect(page.locator("main h1")).toBeVisible();
      }
      await activateHome(page);
      if ([1, 5, 10, 20, 30].includes(cycle)) samples.push(await sample(cycle));
    }
    await page
      .getByRole("button", { name: "Désactiver les animations", exact: true })
      .first()
      .click();
    await expect(
      page.locator('[data-motion-scene][data-motion-state="ready"]'),
    ).toHaveCount(0);
    const disabled = await sample(31);
    await page
      .getByRole("button", { name: "Réactiver les animations", exact: true })
      .first()
      .click();
    await activateHome(page);
    const resumed = await sample(32);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(
      page.locator('[data-motion-scene][data-motion-state="ready"]'),
    ).toHaveCount(0);
    const reduced = await sample(33);
    writeFileSync(
      `${folder}/observations.json`,
      JSON.stringify(
        {
          tours,
          samples,
          disabled,
          resumed,
          reduced,
          limitation:
            "Finite local Chrome observations; heap plateau is not guaranteed.",
        },
        null,
        2,
      ),
    );

    const queries = [...Object.values(motionQueries), "(min-height: 800px)"];
    const warmed = samples.find(({ cycle }) => cycle === 5)!;
    for (const current of samples.filter(({ cycle }) => cycle >= 10)) {
      for (const query of queries) {
        expect(
          current.queries[query]?.callbacks ?? 0,
          `${query}, tour ${current.cycle}`,
        ).toBe(warmed.queries[query]?.callbacks ?? 0);
      }
      expect(
        current.detachedScenes,
        `detached scenes after tour ${current.cycle}`,
        // A legacy private-development control also retains five initial roots.
        // Require no growth after warmup; production must release every root.
      ).toBe(info.project.name.includes("private") ? warmed.detachedScenes : 0);
    }
    for (const query of queries.filter(
      (query) => query !== "(prefers-reduced-motion: reduce)",
    )) {
      expect(
        disabled.queries[query]?.callbacks ?? 0,
        `disabled ${query}`,
      ).toBeLessThanOrEqual(1);
      expect(
        reduced.queries[query]?.callbacks ?? 0,
        `reduced ${query}`,
      ).toBeLessThanOrEqual(1);
    }
  } finally {
    await cdp.detach();
  }
});
