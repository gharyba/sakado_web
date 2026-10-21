import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clientDemoEnabled,
  clientDemoRequestAllowed,
  loopbackHost,
} from "../src/lib/client-demo-policy";

const env = {
  NODE_ENV: "development",
  CLIENT_DEMO: "true",
  DEMO_MODE: "true",
  DATABASE_URL: "",
};
test("private preview requires explicit development flags and a disconnected database", () => {
  assert.equal(clientDemoEnabled(env), true);
  for (const override of [
    { NODE_ENV: "production" },
    { NODE_ENV: "test" },
    { CLIENT_DEMO: "false" },
    { DEMO_MODE: "false" },
    { STAGING_MODE: "true" },
    { DATABASE_URL: "configured" },
  ])
    assert.equal(clientDemoEnabled({ ...env, ...override }), false);
  assert.equal(clientDemoEnabled({}), false);
});
test("private media rejects remote, malformed and spoofed loopback hosts", () => {
  for (const host of ["localhost:3000", "127.0.0.1:3130", "[::1]:3000"])
    assert.equal(loopbackHost(host), true);
  for (const host of [
    null,
    "",
    "localhost.evil:3000",
    "127.0.0.1@evil",
    "evil@localhost",
    "localhost:99999",
    "localhost:0",
    "0.0.0.0:3000",
    "localhost:3000/",
    "LOCALHOST:3000",
  ])
    assert.equal(loopbackHost(host), false);
});
test("cross-site image requests and foreign origins cannot read private preview media", () => {
  const headers = new Headers({ host: "localhost:3000" });
  assert.equal(clientDemoRequestAllowed(headers, env), true);
  headers.set("origin", "http://localhost:3000");
  assert.equal(clientDemoRequestAllowed(headers, env), true);
  headers.set("origin", "https://example.invalid");
  assert.equal(clientDemoRequestAllowed(headers, env), false);
  headers.delete("origin");
  headers.set("sec-fetch-site", "cross-site");
  assert.equal(clientDemoRequestAllowed(headers, env), false);
  headers.delete("sec-fetch-site");
  assert.equal(
    clientDemoRequestAllowed(headers, { ...env, NODE_ENV: "production" }),
    false,
  );
});
