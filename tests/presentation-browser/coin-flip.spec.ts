import { test, expect } from "@playwright/test";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

const reviewDir = ".local/floating-logo-review";

test("protected coin renders front, both thin edges, back, and front again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
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
  const scene = page.locator("[data-hero-cinematic]");
  const coin = page.locator("[data-hero-coin]");
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  const end = await scene.evaluate(
    (element) => element.getBoundingClientRect().bottom + scrollY,
  );
  mkdirSync(reviewDir, { recursive: true });
  const states: { angle: number; widthRatio: number }[] = [];
  for (const expected of [0, 90, 180, 270, 360]) {
    const progress = (expected / 360) * 0.55;
    await page.evaluate((y) => scrollTo(0, y), end * progress);
    await page.waitForTimeout(1100);
    const state = await coin.evaluate((element) => {
      const matrix = new DOMMatrix(getComputedStyle(element).transform);
      const outer = element.parentElement!.getBoundingClientRect();
      const back = element.querySelector<HTMLElement>("[data-hero-coin-back]")!;
      const backMatrix = matrix.multiply(
        new DOMMatrix(getComputedStyle(back).transform),
      );
      return {
        angle:
          ((Math.atan2(matrix.m31, matrix.m11) * 180) / Math.PI + 360) % 360,
        widthRatio: element.getBoundingClientRect().width / outer.width,
        backFacingForward: backMatrix.m11 > 0,
        facesHidden: [...element.children].every(
          (face) => getComputedStyle(face).backfaceVisibility === "hidden",
        ),
      };
    });
    const distance = Math.abs(((state.angle - expected + 540) % 360) - 180);
    expect(distance, `${expected}° rendered rotation`).toBeLessThan(16);
    expect(state.facesHidden).toBe(true);
    if (expected === 90 || expected === 270) {
      expect(state.widthRatio, `${expected}° rendered width`).toBeLessThan(0.2);
    } else {
      expect(state.widthRatio).toBeGreaterThan(0.8);
    }
    if (expected === 180) expect(state.backFacingForward).toBe(true);
    states.push({ angle: state.angle, widthRatio: state.widthRatio });
    await page.screenshot({ path: `${reviewDir}/coin-${expected}.png` });
  }
  for (const [index, expected] of [270, 180, 90, 0].entries()) {
    const progress = (expected / 360) * 0.55;
    await page.evaluate((y) => scrollTo(0, y), end * progress);
    await page.waitForTimeout(900);
    const angle = await coin.evaluate((element) => {
      const matrix = new DOMMatrix(getComputedStyle(element).transform);
      return ((Math.atan2(matrix.m31, matrix.m11) * 180) / Math.PI + 360) % 360;
    });
    expect(
      Math.abs(((angle - expected + 540) % 360) - 180),
      `reverse state ${index}`,
    ).toBeLessThan(16);
  }
  expect(states[1].widthRatio).toBeLessThan(states[0].widthRatio / 4);
  expect(states[3].widthRatio).toBeLessThan(states[4].widthRatio / 4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-motion-state", "static");
  await expect(coin).toHaveCSS("transform", "none");
});

test("records the protected coin through a slow forward and reverse scroll", async ({
  browser,
  page,
}) => {
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
  mkdirSync(reviewDir, { recursive: true });
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3134",
    viewport: { width: 1440, height: 900 },
    storageState: await page.context().storageState(),
    recordVideo: { dir: reviewDir, size: { width: 1440, height: 900 } },
  });
  const recorded = await context.newPage();
  const video = recorded.video();
  try {
    await recorded.goto("/");
    const scene = recorded.locator("[data-hero-cinematic]");
    await expect(scene).toHaveAttribute("data-motion-state", "ready");
    await expect(recorded.locator("[data-hero-coin-front] img")).toBeVisible();
    const end = await scene.evaluate(
      (element) => element.getBoundingClientRect().bottom + scrollY,
    );
    await recorded.evaluate(async (maxScroll) => {
      for (const direction of [1, -1]) {
        await new Promise<void>((resolve) => {
          let started = 0;
          const frame = (now: number) => {
            if (!started) started = now;
            const progress = Math.min(1, (now - started) / 5500);
            scrollTo(
              0,
              maxScroll * (direction === 1 ? progress : 1 - progress),
            );
            if (progress < 1) requestAnimationFrame(frame);
            else resolve();
          };
          requestAnimationFrame(frame);
        });
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }, end);
  } finally {
    await context.close();
  }
  if (!video) throw new Error("Protected scroll recording was not created.");
  copyFileSync(await video.path(), `${reviewDir}/sakado-coin-flip-slow.webm`);
});
