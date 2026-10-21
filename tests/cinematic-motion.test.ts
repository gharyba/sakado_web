import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cinematicEntrance,
  cinematicScale,
  cinematicTravel,
  admitCinematicReveal,
} from "../src/lib/motion/cinematic-policy";
import { motionEffects } from "../src/lib/motion/policy";

test("cinematic profile preserves static/touch parallax safety and bounded 55% tablet intensity", () => {
  for (const effect of motionEffects) {
    assert.equal(cinematicTravel(effect, "static", 9999), 0);
    assert.equal(cinematicTravel(effect, "mobile", -9999), 0);
  }
  assert.equal(cinematicTravel("background", "desktop", 9999), 80);
  assert.equal(cinematicTravel("background", "tablet", 9999), 44);
  assert.equal(cinematicTravel("text", "tablet", 10), 5.5);
  for (const tier of ["static", "mobile", "tablet", "desktop"] as const) {
    for (const request of [1, 1.06, 999, Infinity, NaN, -100]) {
      assert.ok(cinematicScale(tier, request) >= 1);
      assert.ok(cinematicScale(tier, request) <= 1.05);
    }
  }
});
test("entrance blur is limited to short opening copy and stagger stays capped", () => {
  for (const tier of ["static", "mobile", "tablet", "desktop"] as const) {
    for (const name of [
      "opening",
      "portrait",
      "scene",
      "copy",
      "partner",
      "unknown",
    ]) {
      const settings = cinematicEntrance(name, tier, 100);
      assert.ok(settings.delay <= 0.24);
      assert.ok(settings.scale <= 1.05);
      assert.ok(settings.blur <= 2);
      if (tier === "static")
        assert.deepEqual(settings, {
          duration: 0,
          delay: 0,
          scale: 1,
          mask: 0,
          blur: 0,
        });
      if (tier === "mobile" || name !== "opening")
        assert.equal(settings.blur, 0);
    }
  }
  assert.equal(cinematicEntrance("scene", "desktop", NaN).delay, 0);
  assert.equal(cinematicEntrance("portrait", "mobile", -10).delay, 0);
});
test("gallery budget refuses offscreen entries and more than three concurrent reveals", () => {
  for (const count of [0, 1, 2])
    assert.equal(admitCinematicReveal(count, true), true);
  for (const count of [-1, 3, 12, NaN, 1.5])
    assert.equal(admitCinematicReveal(count, true), false);
  for (const count of [0, 1, 2])
    assert.equal(admitCinematicReveal(count, false), false);
});
