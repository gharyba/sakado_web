import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveHeroMedia } from "../src/lib/hero";
import {
  motionDistance,
  motionScale,
  revealOpacity,
} from "../src/lib/motion/policy";

test("hero illustration is development-only, independent of demo mode", () => {
  assert.deepEqual(resolveHeroMedia(null, "development"), {
    src: "/images/camp.svg",
    placeholder: true,
  });
  for (const env of ["production", "test", undefined]) {
    for (const image of [
      null,
      "/images/camp.svg",
      "/images/coast.svg",
      "/images/trail.svg",
    ]) {
      assert.deepEqual(resolveHeroMedia(image, env), {
        src: null,
        placeholder: false,
      });
    }
  }
});
test("hero selects only explicit allowed local media, never a reference or arbitrary URL", () => {
  for (const image of [
    "/images/reviewed-photo.avif",
    "/media/123e4567-e89b-12d3-a456-426614174000.webp",
  ]) {
    assert.deepEqual(resolveHeroMedia(image, "production"), {
      src: image,
      placeholder: false,
    });
  }
  for (const image of [
    "/design-references/sakado-hero.png",
    "https://example.com/travel.jpg",
    "/images/../secret.png",
  ])
    assert.deepEqual(resolveHeroMedia(image, "production"), {
      src: null,
      placeholder: false,
    });
});
test("hero scale and readable text motion remain bounded at all motion tiers", () => {
  assert.equal(motionScale("desktop", 99), 1.05);
  assert.equal(motionScale("desktop", NaN), 1);
  assert.equal(motionScale("desktop", 0.5), 1);
  assert.equal(motionScale("tablet", 1.05), 1.02);
  for (const tier of ["static", "mobile"] as const) {
    assert.equal(motionScale(tier, 99), 1);
    assert.equal(motionDistance("text", tier, 100), 0);
  }
  assert.equal(motionDistance("text", "desktop", 100), 12);
  assert.equal(motionDistance("text", "tablet", 10), 4);
  assert.equal(revealOpacity(0.65), 0.65);
  assert.equal(revealOpacity(-1), 0);
  assert.equal(revealOpacity(2), 1);
  assert.equal(revealOpacity(NaN), 0);
});
