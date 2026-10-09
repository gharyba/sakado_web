import { test } from "node:test";
import assert from "node:assert/strict";
import {
  heroCoversNavigation,
  isCurrentNavigation,
  publicNavigation,
  navigationAction,
} from "../src/lib/navigation";

test("navigation preserves the verified public routes and existing events action", () => {
  assert.deepEqual(
    publicNavigation.map(([, href]) => href),
    [
      "/",
      "/experiences",
      "/events",
      "/destinations",
      "/gallery",
      "/about",
      "/contact",
    ],
  );
  assert.equal(navigationAction.href, "/events");
});
test("current navigation distinguishes nested routes from similarly prefixed URLs", () => {
  assert.equal(isCurrentNavigation("/", "/"), true);
  assert.equal(isCurrentNavigation("/events/camping", "/events"), true);
  assert.equal(isCurrentNavigation("/events", "/"), false);
  assert.equal(isCurrentNavigation("/events-other", "/events"), false);
});
test("transparent navigation requires an explicit dark homepage boundary under the header", () => {
  const boundary = {
    pathname: "/",
    contrast: "dark",
    top: 0,
    bottom: 655,
    headerBottom: 104,
  };
  assert.equal(heroCoversNavigation(boundary), true);
  for (const changed of [
    { pathname: "/about" },
    { contrast: "light" },
    { contrast: undefined },
    { top: 200 },
    { bottom: 104 },
    { bottom: 0 },
    { bottom: NaN },
    { headerBottom: Infinity },
  ]) {
    assert.equal(heroCoversNavigation({ ...boundary, ...changed }), false);
  }
});
