import { test } from "node:test";
import assert from "node:assert/strict";
import {
  orbitPose,
  orbitTransitionOffset,
  orbitWindow,
  photoOffset,
  wrapPhoto,
} from "../src/lib/motion/photo-orbit";

test("photo windows loop without duplicates and remain bounded", () => {
  for (const count of [0, 1, 2, 3, 7, 8, 12, 500]) {
    for (const active of [0, Math.max(0, count - 1)]) {
      const window = orbitWindow(count, active);
      assert.equal(window.length, Math.min(count, 7));
      assert.equal(new Set(window).size, window.length);
      assert.ok(window.every((index) => index >= 0 && index < count));
    }
  }
  assert.equal(wrapPhoto(-1, 12), 11);
  assert.equal(wrapPhoto(12, 12), 0);
  assert.equal(photoOffset(11, 0, 12), -1);
  assert.equal(photoOffset(0, 11, 12), 1);
  assert.equal(orbitTransitionOffset(8, 2, -3, 12), -6);
  assert.equal(orbitTransitionOffset(6, 0, 3, 12), 6);
});

test("orbit poses are finite, periodic on the ring, and hidden at the window boundary", () => {
  for (const count of [1, 2, 3, 8, 12]) {
    const front = orbitPose(0, count);
    assert.equal(front.opacity, 1);
    for (let offset = -4; offset <= 4; offset += 0.125) {
      const pose = orbitPose(offset, count);
      assert.ok(!/NaN|Infinity/.test(pose.transform));
      assert.ok(pose.opacity >= 0 && pose.opacity <= 1);
    }
  }
  assert.equal(orbitPose(4, 12).opacity, 0);
  assert.equal(orbitPose(-4, 12).opacity, 0);
  assert.equal(
    orbitPose(0, 8).transform,
    orbitPose(8, 8).transform.replaceAll("-0.000", "0.000"),
  );
});
