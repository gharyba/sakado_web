import { test, expect, type Locator } from "@playwright/test";
import fs from "node:fs/promises";

async function settled(gallery: Locator, id: number) {
  await expect(gallery).toHaveAttribute("data-rotating", "false");
  await expect(gallery).toHaveAttribute("data-active-id", `lab-${id}`);
  await expect(
    gallery.locator("[data-orbit-panel][data-active=true]"),
  ).toHaveCount(1);
}

test("3D orbit, reverse, wraparound, rapid clicks and secondary selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/photo-orbit");
  const gallery = page.locator("[data-floating-memories]");
  await expect(gallery).toHaveAttribute("data-cinematic-motion", "on");
  await expect(gallery.locator("[data-orbit-panel]")).toHaveCount(7);
  await expect(gallery.locator("[data-orbit-stage]")).toHaveCSS(
    "perspective",
    "1200px",
  );
  await expect(gallery.locator("[data-orbit-rig]")).toHaveCSS(
    "transform-style",
    "preserve-3d",
  );
  const sample = () =>
    gallery.locator('[data-photo-id="lab-1"]').evaluate((node) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(node).transform);
      return { x: m.m41, z: m.m43, yaw: m.m13 };
    });
  const before = await sample();
  expect(Math.abs(before.z)).toBeGreaterThan(20);
  expect(Math.abs(before.yaw)).toBeGreaterThan(0.1);
  await gallery
    .getByRole("button", { name: "Photo suivante", exact: true })
    .click();
  await expect(gallery).toHaveAttribute("data-rotating", "true");
  await expect
    .poll(async () => Math.abs((await sample()).z - before.z))
    .toBeGreaterThan(5);
  await settled(gallery, 1);
  expect(Math.abs((await sample()).z)).toBeLessThan(0.1);
  await expect(gallery.locator("[data-photo-counter]")).toContainText(
    "02 / 12",
  );
  await gallery
    .getByRole("button", { name: "Photo précédente", exact: true })
    .click();
  await settled(gallery, 0);
  await gallery
    .getByRole("button", { name: "Photo précédente", exact: true })
    .click();
  await settled(gallery, 11);
  await gallery
    .getByRole("button", { name: "Photo suivante", exact: true })
    .click();
  await settled(gallery, 0);
  await gallery
    .getByRole("button", { name: "Photo suivante", exact: true })
    .evaluate((button: HTMLButtonElement) => {
      for (let i = 0; i < 8; i++) button.click();
    });
  await settled(gallery, 1);
  await gallery.locator('[data-photo-id="lab-2"]').click();
  await settled(gallery, 2);
  await gallery.locator('[data-photo-id="lab-11"]').focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      gallery
        .locator('[data-photo-id="lab-8"]')
        .evaluate((node) => Number(getComputedStyle(node).opacity)),
    )
    .toBeGreaterThan(0.1);
  await settled(gallery, 11);
  await expect(gallery.locator("[data-orbit-panel]")).toHaveCount(7);
});

test("viewer keyboard, focus restoration and motion preference changes", async ({
  page,
}) => {
  await page.goto("/dev/photo-orbit");
  const gallery = page.locator("[data-floating-memories]");
  const next = gallery.getByRole("button", {
    name: "Photo suivante",
    exact: true,
  });
  await next.focus();
  await page.keyboard.press("ArrowRight");
  await settled(gallery, 1);
  const open = gallery.getByRole("button", { name: "Voir la photo" });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Visionneuse d’images" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Fermer l’image" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Fermer l’image" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
  await next.click();
  await page.getByRole("button", { name: "Désactiver les animations" }).click();
  await settled(gallery, 2);
  await expect(gallery).toHaveAttribute("data-cinematic-motion", "static");
  await next.click();
  await settled(gallery, 3);
  await page.getByRole("button", { name: "Réactiver les animations" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(gallery).toHaveAttribute("data-cinematic-motion", "static");
  await next.click();
  await settled(gallery, 4);
});

for (const width of [1440, 1024, 768, 375]) {
  test(`responsive geometry and touch at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1024 ? 600 : 900 });
    await page.goto("/dev/photo-orbit");
    const gallery = page.locator("[data-floating-memories]");
    await gallery.scrollIntoViewIfNeeded();
    await expect(
      gallery.locator("[data-orbit-panel][data-active=true] img"),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const stage = gallery.locator("[data-orbit-stage]");
    await stage.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 220, clientY: 200 }],
    });
    await stage.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 100, clientY: 205 }],
    });
    await settled(gallery, 1);
    await stage.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 200, clientY: 300 }],
    });
    await stage.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 210, clientY: 100 }],
    });
    await settled(gallery, 1);
    await fs.mkdir(".local/redesign06", { recursive: true });
    await gallery.screenshot({ path: `.local/redesign06/lab-${width}.png` });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("zero, one, two, many and filtered photo sets", async ({ page }) => {
  await page.goto("/dev/photo-orbit?count=0");
  await expect(page.locator("[data-gallery-empty]")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Photo suivante" }),
  ).toHaveCount(0);
  for (const count of [1, 2, 40]) {
    await page.goto(`/dev/photo-orbit?count=${count}`);
    const gallery = page.locator("[data-floating-memories]");
    await expect(gallery.locator("[data-orbit-panel]")).toHaveCount(
      Math.min(7, count),
    );
    const next = gallery.getByRole("button", { name: "Photo suivante" });
    if (count === 1) {
      await expect(next).toBeDisabled();
      continue;
    }
    await next.click();
    await settled(gallery, 1);
    await gallery.getByRole("button", { name: "Photo précédente" }).click();
    await settled(gallery, 0);
  }
  await page.getByRole("button", { name: "B", exact: true }).click();
  await expect(page.locator("[data-floating-memories]")).toHaveAttribute(
    "data-count",
    "20",
  );
  await expect(page.locator("[data-floating-memories]")).toHaveAttribute(
    "data-active-id",
    "lab-1",
  );
});

test("slow, broken and undecodable images keep layout and navigation usable", async ({
  page,
}) => {
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/images/camp.svg", async (route) => {
    await blocked;
    await route.continue();
  });
  await page.goto("/dev/photo-orbit", { waitUntil: "domcontentloaded" });
  const stage = page.locator("[data-orbit-stage]");
  const before = await stage.boundingBox();
  release();
  await expect
    .poll(() =>
      page
        .locator("[data-active=true] img")
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    )
    .toBe(true);
  expect((await stage.boundingBox())?.height).toBe(before?.height);
  await page.goto("/dev/photo-orbit?broken=true");
  await expect(
    page.getByText("Photo indisponible", { exact: false }),
  ).toBeVisible();
  const gallery = page.locator("[data-floating-memories]");
  await expect(
    gallery.getByRole("button", { name: "Voir la photo" }),
  ).toBeDisabled();
  await gallery.getByRole("button", { name: "Photo suivante" }).click();
  await settled(gallery, 1);
  await page.route("**/images/coast.svg", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/webp",
      body: "not-an-image",
    }),
  );
  await page.goto("/dev/photo-orbit?count=2");
  await expect(
    page.getByText("Photo indisponible", { exact: false }),
  ).toBeVisible();
  await page
    .locator("[data-floating-memories]")
    .getByRole("button", { name: "Photo suivante" })
    .click();
  await settled(page.locator("[data-floating-memories]"), 1);
});

test("all photo links remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/dev/photo-orbit");
    await page
      .getByText("Parcourir toutes les photos (12)", { exact: true })
      .click();
    await expect(page.locator("details ol a")).toHaveCount(12);
    await page.locator("details ol a").last().click();
    await expect(page).toHaveURL(/\/images\/trail\.svg$/);
  } finally {
    await context.close();
  }
});
