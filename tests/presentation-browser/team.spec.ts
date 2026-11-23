import { test, expect, type Page } from "@playwright/test";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

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
  await expect(page).toHaveURL("http://127.0.0.1:3134/");
}

async function at(page: Page, index: number, progress: number) {
  await page
    .locator("[data-team-member]")
    .nth(index)
    .evaluate((member, progress) => {
      const rect = member.getBoundingClientRect();
      const top = rect.top + scrollY;
      const start = top - innerHeight * 0.88;
      const end = top + rect.height / 2 - innerHeight * 0.44;
      scrollTo(0, start + (end - start) * progress);
    }, progress);
  await page.waitForTimeout(450);
}

async function sample(page: Page, index: number) {
  return page
    .locator("[data-team-member]")
    .nth(index)
    .evaluate((member) => {
      const camera = member.querySelector<HTMLElement>("[data-team-camera]")!;
      const name = member.querySelector<HTMLElement>("[data-team-name]")!;
      const frame = member.querySelector<HTMLElement>("[data-team-frame]")!;
      const transform = new DOMMatrixReadOnly(
        getComputedStyle(camera).transform,
      );
      return {
        scale: transform.a,
        x: transform.e,
        opacity: Number(getComputedStyle(name).opacity),
        mask: getComputedStyle(frame).clipPath,
      };
    });
}

test("two protected portraits reveal, reverse, and return to static on MotionToggle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  const team = page.locator("#equipe");
  await team.scrollIntoViewIfNeeded();
  await expect(team.locator("[data-motion-scene]")).toHaveAttribute(
    "data-motion-state",
    "ready",
  );
  await expect(team.locator("article")).toHaveCount(2);
  await expect(team.locator("img")).toHaveCount(2);
  await expect(team.locator("h3")).toHaveText([
    "Ben Beya Mohamed",
    "Bouzrara Manel",
  ]);
  for (const image of await team.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await at(page, 0, 0.04);
  const entering = await sample(page, 0);
  await at(page, 0, 1.02);
  const settled = await sample(page, 0);
  expect(entering.scale).toBeGreaterThan(settled.scale);
  expect(settled.opacity).toBeGreaterThan(entering.opacity);
  expect(entering.mask).not.toBe(settled.mask);
  await at(page, 0, 0.04);
  const reversed = await sample(page, 0);
  expect(reversed.scale).toBeGreaterThan(settled.scale);

  const frameIntervals = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const team = document.querySelector<HTMLElement>("#equipe")!;
        const top = team.getBoundingClientRect().top + scrollY;
        const travel = Math.min(team.offsetHeight, innerHeight * 1.8);
        const intervals: number[] = [];
        let previous = performance.now();
        let frame = 0;
        const tick = (now: number) => {
          intervals.push(now - previous);
          previous = now;
          const progress = frame <= 60 ? frame / 60 : (120 - frame) / 60;
          scrollTo(0, top + travel * progress);
          if (++frame <= 120) requestAnimationFrame(tick);
          else resolve(intervals.slice(1));
        };
        requestAnimationFrame(tick);
      }),
  );
  const sorted = [...frameIntervals].sort((a, b) => a - b);
  mkdirSync(".local/redesign05-review", { recursive: true });
  writeFileSync(
    ".local/redesign05-review/private-team-frames.json",
    JSON.stringify({
      samples: sorted.length,
      medianMs: sorted[Math.floor(sorted.length / 2)],
      p95Ms: sorted[Math.floor(sorted.length * 0.95)],
      framesOver50Ms: sorted.filter((value) => value > 50).length,
      environment:
        "Local Windows desktop Chrome, synthetic forward/reverse scroll",
    }),
  );

  await page
    .getByRole("button", { name: "Désactiver les animations" })
    .first()
    .click();
  await expect(team.locator("[data-motion-scene]")).toHaveAttribute(
    "data-motion-state",
    "static",
  );
  await expect(team.locator("[data-team-camera]").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(team.locator("[data-team-frame]").first()).toHaveCSS(
    "clip-path",
    "none",
  );
});

test("tablet, mobile, reduced motion and no-JavaScript keep both people readable", async ({
  page,
  browser,
}) => {
  await enter(page);
  for (const width of [768, 375]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 812 });
    await page.goto("/about");
    const team = page.locator("#equipe");
    await team.scrollIntoViewIfNeeded();
    await expect(team.locator("h3")).toHaveText([
      "Ben Beya Mohamed",
      "Bouzrara Manel",
    ]);
    await expect(team.locator("article p")).toHaveText([
      "Fondateur",
      "Gérante",
    ]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    mkdirSync(".local/redesign05-review", { recursive: true });
    await team.screenshot({
      path: `.local/redesign05-review/private-team-${width}.png`,
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#equipe [data-motion-scene]")).toHaveAttribute(
    "data-motion-state",
    "static",
  );
  await expect(page.locator("#equipe [data-team-frame]").first()).toHaveCSS(
    "clip-path",
    "none",
  );
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    storageState: await page.context().storageState(),
    viewport: { width: 375, height: 812 },
  });
  try {
    const staticPage = await nojs.newPage();
    await staticPage.goto("http://127.0.0.1:3134/about");
    await expect(staticPage.locator("#equipe h3")).toHaveText([
      "Ben Beya Mohamed",
      "Bouzrara Manel",
    ]);
    await expect(staticPage.locator("#equipe img")).toHaveCount(2);
  } finally {
    await nojs.close();
  }
});
