import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const origin = "http://127.0.0.1:3134";
const catalog = () =>
  JSON.parse(readFileSync(".local/official-presentation/catalog.json", "utf8"));
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
test("private media requires a session and never enters the public optimizer", async ({
  page,
  request,
}) => {
  const key = catalog().assets.find(
    (a: { slot: string }) => a.slot === "team-0",
  ).key;
  expect((await request.get(`/dev/presentation-media/${key}`)).status()).toBe(
    404,
  );
  expect((await request.get("/")).headers()["cache-control"]).toContain(
    "no-store",
  );
  await enter(page);
  const response = await page.request.get(`/dev/presentation-media/${key}`);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(
    (
      await page.request.get(`/dev/presentation-media/${key}`, {
        headers: { "Sec-Fetch-Site": "cross-site" },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await page.request.get(`/dev/presentation-media/${key}`, {
        headers: { Origin: "http://evil.invalid" },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await page.request.get(`/dev/presentation-media/${"0".repeat(64)}`)
    ).status(),
  ).toBe(404);
  expect(
    (
      await page.request.get(
        `/_next/image?url=${encodeURIComponent(`/dev/presentation-media/${key}`)}&w=640&q=75`,
      )
    ).status(),
  ).toBe(400);
  expect((await page.request.get("/dev/client-media/" + key)).status()).toBe(
    404,
  );
  expect(
    (await page.request.get("/api/admin/exports?eventId=private")).status(),
  ).toBe(401);
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === "sakado_local_presentation",
  );
  expect(cookie).toMatchObject({
    httpOnly: true,
    sameSite: "Strict",
    domain: "127.0.0.1",
  });
});
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["tablet", 768, 1024],
  ["mobile", 375, 812],
] as const)
  test(`official portraits, S08, CMS categories and private gallery — ${name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await enter(page);
    await expect(page.locator("[data-official-presentation]")).toBeVisible();
    await expect(
      page.locator("[data-parallax-hero] [data-motion-scene]"),
    ).toHaveAttribute("data-motion-state", "ready");
    await expect(
      page.locator('[data-parallax-hero] a[href="/events"]').first(),
    ).toBeVisible();
    const hero = catalog()
      .assets.filter((a: { slot: string }) => a.slot === "hero-s08")
      .sort(
        (a: { width: number }, b: { width: number }) => b.width - a.width,
      )[0];
    expect(hero).toBeDefined();
    await expect(page.locator("[data-hero-image]")).toHaveAttribute(
      "src",
      `/dev/presentation-media/${hero.key}`,
    );
    await page.screenshot({
      path: resolve(`.local/official-presentation-audit/${name}-hero.png`),
    });
    expect((await page.request.get("/api/health")).status()).toBe(200);
    expect(await (await page.request.get("/api/health")).json()).toEqual({
      status: "ok",
    });
    await expect(page.locator(".experience-grid > *")).toHaveCount(7);
    await page.locator("#equipe").scrollIntoViewIfNeeded();
    await expect(page.locator("#equipe article")).toHaveCount(2);
    await expect(page.locator("#equipe img")).toHaveCount(2);
    for (const name of ["Ben Beya Mohamed", "Bouzrara Manel"])
      await expect(
        page.locator("#equipe").getByRole("heading", { name, exact: true }),
      ).toHaveCount(1);
    for (const img of await page.locator("#equipe img").all())
      await expect
        .poll(() =>
          img.evaluate(
            (e: HTMLImageElement) => e.complete && e.naturalWidth > 0,
          ),
        )
        .toBe(true);
    await page.screenshot({
      path: resolve(`.local/official-presentation-audit/${name}-team.png`),
      fullPage: true,
    });
    await page.locator("#equipe").screenshot({
      path: resolve(`.local/official-presentation-audit/${name}-portraits.png`),
    });
    await page.goto("/about");
    await expect(page.locator("#equipe article")).toHaveCount(2);
    await expect(page.locator("#equipe img")).toHaveCount(2);
    await page.goto("/gallery");
    const gallery = page.locator(
      "[data-official-presentation-gallery] [data-floating-memories]",
    );
    await expect(gallery).toHaveAttribute("data-count", "12");
    await expect(gallery).toHaveAttribute("data-cinematic-motion", "on");
    await expect(gallery.locator("details ol a")).toHaveCount(12);
    const viewed = new Set<string>();
    for (let index = 0; index < 12; index++) {
      const photo = gallery.locator("[data-orbit-panel][data-active=true]");
      await photo.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          photo
            .locator("img")
            .evaluate(
              (e: HTMLImageElement) => e.complete && e.naturalWidth > 0,
            ),
        )
        .toBe(true);
      viewed.add((await photo.getAttribute("data-photo-id"))!);
      await gallery
        .getByRole("button", { name: "Photo suivante", exact: true })
        .click();
      await expect(gallery).toHaveAttribute("data-rotating", "false");
    }
    expect(viewed.size).toBe(12);
    await expect(gallery.locator("[data-photo-counter]")).toContainText(
      "01 / 12",
    );
    await page.locator("[data-official-presentation-gallery]").screenshot({
      path: resolve(`.local/official-presentation-audit/${name}-gallery.png`),
    });
    await page
      .locator(
        "[data-official-presentation-gallery] [data-orbit-panel][data-active=true]",
      )
      .first()
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("dialog[open]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    const geometry = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.right > innerWidth + 1 || r.left < -1;
        })
        .slice(0, 10)
        .map((e) => ({
          tag: e.tagName,
          classes: e.className.toString().slice(0, 100),
          left: e.getBoundingClientRect().left,
          right: e.getBoundingClientRect().right,
        })),
    }));
    if (geometry.scroll > geometry.width)
      console.log(JSON.stringify({ viewport: name, geometry }));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
test("reduced motion, native mobile navigation and no-JS presentation stay usable", async ({
  browser,
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await enter(page);
  await expect(page.locator("[data-hero-image]")).toBeVisible();
  await expect(
    page.locator('[data-parallax-hero] [data-motion="background"]'),
  ).toHaveCSS("transform", "none");
  const toggle = page.getByRole("button", {
    name: "Ouvrir la navigation",
    exact: true,
  });
  await toggle.click();
  await expect(
    page.getByRole("dialog", { name: "Navigation", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  const state = await page.context().storageState();
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: state,
    viewport: { width: 375, height: 812 },
  });
  const nojs = await context.newPage();
  await nojs.goto(origin + "/");
  await expect(nojs.locator("[data-hero-emblem] img").first()).toBeVisible();
  await expect(nojs.locator("[data-hero-emblem]")).toHaveCSS(
    "position",
    "absolute",
  );
  await nojs.goto(origin + "/about");
  await expect(nojs.locator("#equipe article")).toHaveCount(2);
  await expect(nojs.locator("#equipe img")).toHaveCount(2);
  await expect(
    nojs.getByRole("heading", { name: "Les visages derrière l’aventure." }),
  ).toBeVisible();
  await context.close();
});
test("hash mismatch blocks bytes without touching private originals", async ({
  page,
}) => {
  await enter(page);
  const filename = ".local/official-presentation/catalog.json";
  const bytes = readFileSync(filename);
  const changed = JSON.parse(bytes.toString());
  const asset = changed.assets.find(
    (a: { slot: string }) => a.slot === "team-0",
  );
  const key = asset.key;
  asset.source.sha256 = "0".repeat(64);
  try {
    writeFileSync(filename, JSON.stringify(changed));
    expect(
      (await page.request.get(`/dev/presentation-media/${key}`)).status(),
    ).toBe(404);
  } finally {
    writeFileSync(filename, bytes);
  }
});
test("hero parallax and MotionToggle retain their official lifecycle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await enter(page);
  const slot =
    process.env.PRESENTATION_TEST_HERO === "s16" ? "hero-s16" : "hero-s08";
  const selected = catalog()
    .assets.filter((a: { slot: string }) => a.slot === slot)
    .sort((a: { width: number }, b: { width: number }) => b.width - a.width)[0];
  await expect(page.locator("[data-hero-image]")).toHaveAttribute(
    "src",
    `/dev/presentation-media/${selected.key}`,
  );
  const scene = page.locator("[data-parallax-hero] [data-motion-scene]");
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  const background = scene.locator('[data-motion="background"]');
  const first = await background.evaluate((e) => getComputedStyle(e).transform);
  await page.evaluate(() => scrollTo(0, 350));
  await expect
    .poll(() => background.evaluate((e) => getComputedStyle(e).transform))
    .not.toBe(first);
  await page
    .getByRole("button", { name: "Désactiver les animations", exact: true })
    .first()
    .click();
  await expect(scene).toHaveAttribute("data-motion-state", "static");
  await expect(background).toHaveCSS("transform", "none");
});
test("cinematic camera, text and expanding frame reverse and clean up together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await enter(page);
  const scene = page.locator("[data-hero-cinematic]");
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  const sample = () =>
    scene.evaluate((root) => {
      const matrix = (selector: string) => {
        const style = getComputedStyle(root.querySelector(selector)!);
        const m = new DOMMatrix(style.transform);
        return { y: m.m42, scale: m.a, opacity: Number(style.opacity) };
      };
      const cta = root
        .querySelector('a[href="/events"]')!
        .getBoundingClientRect();
      const image = root
        .querySelector("[data-hero-camera]")!
        .getBoundingClientRect();
      const frame = root
        .querySelector("[data-hero-window]")!
        .getBoundingClientRect();
      return {
        camera: matrix("[data-hero-camera]"),
        window: matrix("[data-hero-window]"),
        copy: matrix("[data-hero-copy]"),
        height: root.getBoundingClientRect().height,
        ctaY: cta.y + scrollY,
        covered:
          image.top <= frame.top &&
          image.bottom >= frame.bottom &&
          image.left <= frame.left &&
          image.right >= frame.right,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
  mkdirSync(".local/hero-redesign-02", { recursive: true });
  const prefix =
    ".local/hero-redesign-02/" + (process.env.PRESENTATION_TEST_HERO ?? "s08");
  const samples = [];
  for (const y of [0, 250, 500, 700, 250, 0]) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(1000); // Settle the 0.6s scrub before sampling geometry.
    samples.push({ scroll: y, ...(await sample()) });
    if ([0, 500, 700].includes(y))
      await page.screenshot({ path: prefix + "-" + y + ".png" });
  }
  expect(samples[2].camera.y - samples[0].camera.y).toBeGreaterThan(30);
  expect(samples[2].camera.scale).toBeGreaterThan(1.03);
  expect(samples[2].window.scale).toBeGreaterThan(1.03);
  expect(samples[2].copy.y).toBeLessThan(-20);
  expect(samples[2].copy.opacity).toBeLessThan(0.8);
  for (const item of samples) {
    expect(item.covered).toBe(true);
    expect(item.overflow).toBe(false);
    expect(item.height).toBe(samples[0].height);
    expect(Math.abs(item.ctaY - samples[0].ctaY)).toBeLessThan(1);
  }
  expect(Math.abs(samples.at(-1)!.camera.y - samples[0].camera.y)).toBeLessThan(
    1,
  );
  const profile = await page.evaluate(async () => {
    const intervals: number[] = [],
      tasks: number[] = [];
    let shifts = 0;
    const observer = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.entryType === "longtask") tasks.push(e.duration);
        if (
          e.entryType === "layout-shift" &&
          !(e as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput
        )
          shifts += (e as PerformanceEntry & { value: number }).value;
      }
    });
    observer.observe({ entryTypes: ["longtask", "layout-shift"] });
    await new Promise<void>((resolve) => {
      let previous = performance.now(),
        count = 0;
      const frame = (now: number) => {
        intervals.push(now - previous);
        previous = now;
        scrollTo(0, count <= 60 ? count * 10 : (120 - count) * 10);
        if (++count < 120) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    observer.disconnect();
    intervals.sort((a, b) => a - b);
    return {
      frames: intervals.length,
      median: intervals[60],
      p95: intervals[114],
      over50: intervals.filter((n) => n > 50).length,
      tasks,
      shifts,
    };
  });
  writeFileSync(
    prefix + "-metrics.json",
    JSON.stringify({ samples, profile }, null, 2),
  );
  await page.evaluate(() => scrollTo(0, 350));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-motion-state", "static");
  for (const target of await scene
    .locator(
      "[data-hero-camera],[data-hero-window],[data-hero-copy],[data-hero-word]",
    )
    .all()) {
    await expect(target).toHaveCSS("transform", "none");
    await expect(target).toHaveCSS("opacity", "1");
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(scene).toHaveAttribute("data-motion-state", "ready");
  await expect(scene.locator("[data-hero-camera]")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(scene.locator("[data-hero-copy]")).toHaveCSS(
    "transform",
    "none",
  );
  for (const width of [768, 375]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 812 });
    await page.evaluate(() => scrollTo(0, 0));
    await expect(scene.locator("[data-hero-word]").last()).toHaveCSS(
      "opacity",
      "1",
    );
    await page.waitForTimeout(1000);
    await page.screenshot({ path: prefix + "-settled-" + width + ".png" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  expect(errors).toEqual([]);
});

test("unavailable S08 keeps the official labeled fallback without substituting S16", async ({
  page,
}) => {
  await enter(page);
  const filename = ".local/official-presentation/catalog.json";
  const bytes = readFileSync(filename);
  const changed = JSON.parse(bytes.toString());
  changed.assets = changed.assets.filter(
    (a: { slot: string }) => a.slot !== "hero-s08",
  );
  try {
    writeFileSync(filename, JSON.stringify(changed));
    await page.goto("/");
    await expect(page.locator("[data-hero-placeholder]")).toBeVisible();
    await expect(page.locator("[data-hero-image]")).toHaveAttribute(
      "src",
      "/images/camp.svg",
    );
  } finally {
    writeFileSync(filename, bytes);
  }
});

test("logout revokes replayed viewing tokens without granting CMS privileges", async ({
  page,
  request,
}) => {
  await enter(page);
  const cookie = (await page.context().cookies()).find(
    (item) => item.name === "sakado_local_presentation",
  )!;
  const key = catalog().assets.find(
    (a: { slot: string }) => a.slot === "team-0",
  ).key;
  expect(
    (await page.request.get(`/dev/presentation-media/${key}`)).status(),
  ).toBe(200);
  const logout = await page.request.delete("/dev/presentation/session", {
    headers: { Origin: origin },
  });
  expect(logout.status()).toBe(204);
  expect(logout.headers()["set-cookie"]).toMatch(/Max-Age=0/i);
  expect(
    (await page.request.get(`/dev/presentation-media/${key}`)).status(),
  ).toBe(404);
  expect(
    (
      await request.get(`/dev/presentation-media/${key}`, {
        headers: { Cookie: `${cookie.name}=${cookie.value}` },
      })
    ).status(),
  ).toBe(404);
  await page.reload();
  await expect(page.locator("[data-official-presentation]")).toHaveCount(0);
});
test("derivative mismatch denies the selected private bytes", async ({
  page,
}) => {
  await enter(page);
  const filename = ".local/official-presentation/catalog.json";
  const bytes = readFileSync(filename);
  const changed = JSON.parse(bytes.toString());
  const asset = changed.assets.find(
    (a: { slot: string }) => a.slot === "team-0",
  );
  const key = asset.key;
  asset.derivative.sha256 = "0".repeat(64);
  try {
    writeFileSync(filename, JSON.stringify(changed));
    expect(
      (await page.request.get(`/dev/presentation-media/${key}`)).status(),
    ).toBe(404);
  } finally {
    writeFileSync(filename, bytes);
  }
  expect(
    (await page.request.get(`/dev/presentation-media/${key}`)).status(),
  ).toBe(200);
});
