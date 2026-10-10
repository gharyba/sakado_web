import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canPin,
  motionDemoEnabled,
  motionDistance,
  motionEffects,
  motionTier,
} from "../src/lib/motion/policy";

test("motion policy keeps accessibility/data preferences authoritative at every width", () => {
  for (const width of [320, 768, 1440]) {
    for (const preference of ["reduced", "disabled", "saveData"] as const) {
      const tier = motionTier({ width, [preference]: true });
      assert.equal(tier, "static");
      for (const effect of motionEffects)
        assert.equal(motionDistance(effect, tier, 999), 0);
    }
  }
  assert.equal(motionTier({ width: Number.NaN }), "static");
  assert.equal(motionTier({ width: 0 }), "static");
});
test("touch and mobile never receive parallax displacement; tablet travel is bounded", () => {
  assert.equal(motionTier({ width: 1440, coarse: true }), "mobile");
  assert.equal(motionTier({ width: 699 }), "mobile");
  assert.equal(motionTier({ width: 700 }), "tablet");
  assert.equal(motionTier({ width: 1199 }), "tablet");
  assert.equal(motionTier({ width: 1200 }), "desktop");
  for (const effect of motionEffects)
    assert.equal(motionDistance(effect, "mobile", 120), 0);
  assert.equal(motionDistance("background", "desktop", 2000), 80);
  assert.equal(motionDistance("foreground", "desktop", -2000), -120);
  assert.equal(motionDistance("background", "tablet", 2000), 32);
  assert.equal(motionDistance("reveal", "desktop", Infinity), 12);
  assert.equal(motionDistance("reveal", "desktop", 0), 0);
});
test("pin safety rejects interactive, tall, short-viewport and non-desktop content", () => {
  const allowed = {
    tier: "desktop" as const,
    viewportHeight: 900,
    elementHeight: 250,
    interactive: false,
  };
  assert.equal(canPin(allowed), true);
  assert.equal(canPin({ ...allowed, interactive: true }), false);
  assert.equal(canPin({ ...allowed, elementHeight: 700 }), false);
  assert.equal(canPin({ ...allowed, elementHeight: NaN }), false);
  assert.equal(canPin({ ...allowed, viewportHeight: 699 }), false);
  assert.equal(canPin({ ...allowed, short: true }), false);
  for (const tier of ["static", "tablet", "mobile"] as const)
    assert.equal(canPin({ ...allowed, tier }), false);
});
test("development laboratory cannot be enabled in production or test environments", () => {
  assert.equal(motionDemoEnabled("development"), true);
  for (const env of [undefined, "production", "test", "Development"])
    assert.equal(motionDemoEnabled(env), false);
});
