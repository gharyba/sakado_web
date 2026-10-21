import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("the official local launcher refuses remote databases without exposing credentials", () => {
  const marker = "local-launcher-sensitive-probe";
  const database = new URL(
    "postgresql://probe@not-a-local-host.invalid/sakado",
  );
  database.password = marker;
  const result = spawnSync(process.execPath, ["scripts/dev.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "development",
      STAGING_MODE: "false",
      DEMO_MODE: "false",
      DATABASE_URL: database.href,
    },
    encoding: "utf8",
    timeout: 10000,
    windowsHide: true,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /refuses a non-loopback database/);
  assert.ok(!result.stderr.includes(marker));
});

test("local preview flags cannot start the launcher in staging or production", () => {
  for (const environment of [
    { NODE_ENV: "production", STAGING_MODE: "false" },
    { NODE_ENV: "development", STAGING_MODE: "true" },
  ] as const) {
    const result = spawnSync(process.execPath, ["scripts/dev.mjs", "--demo"], {
      env: { ...process.env, ...environment, DEMO_MODE: "true" },
      encoding: "utf8",
      timeout: 10000,
      windowsHide: true,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /not a staging or production deployment/);
  }
});
