import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  tokenHash,
  allowRequest,
} from "../src/lib/security";
import { can } from "../src/lib/permissions";
test("Argon2id hashes use independent salts and reject incorrect passwords", async () => {
  const a = await hashPassword("a-long-test-password"),
    b = await hashPassword("a-long-test-password");
  assert.match(a, /^\$argon2id\$/);
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("a-long-test-password", a), true);
  assert.equal(await verifyPassword("wrong", a), false);
  assert.equal(await verifyPassword("anything", "broken"), false);
});
test("opaque session tokens are random and stored only as digests", () => {
  const a = newSessionToken(),
    b = newSessionToken();
  assert.notEqual(a, b);
  assert.ok(a.length >= 40);
  assert.equal(tokenHash(a).length, 64);
  assert.notEqual(tokenHash(a), a);
  assert.notEqual(tokenHash(a), tokenHash(b));
});
test("role matrix denies sensitive functions to editors and user/settings management to admins", () => {
  assert.equal(can("OWNER", "users"), true);
  assert.equal(can("ADMIN", "users"), false);
  assert.equal(can("ADMIN", "settings"), false);
  assert.equal(can("ADMIN", "bookings"), true);
  assert.equal(can("EDITOR", "bookings"), false);
  assert.equal(can("EDITOR", "messages"), false);
  assert.equal(can("EDITOR", "events"), true);
});
test("request limits stop repeated attempts and expire", () => {
  assert.equal(allowRequest("test-rate", 2, 1000, 0), true);
  assert.equal(allowRequest("test-rate", 2, 1000, 1), true);
  assert.equal(allowRequest("test-rate", 2, 1000, 2), false);
  assert.equal(allowRequest("test-rate", 2, 1000, 1001), true);
});
