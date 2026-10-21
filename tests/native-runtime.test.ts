import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("native preflight ignores supplied database credentials and refuses a false Linux claim", () => {
  const probe = "native-preflight-private-probe";
  const database = new URL("postgresql://probe@must-not-connect.invalid/probe");
  database.password = probe;
  const env = { ...process.env, DATABASE_URL: database.href };
  const result = spawnSync(
    process.execPath,
    ["scripts/check-native-runtime.mjs"],
    {
      env,
      encoding: "utf8",
      timeout: 20000,
      windowsHide: true,
    },
  );
  assert.equal(result.status, 0);
  assert.ok(!result.stdout.includes(probe) && !result.stderr.includes(probe));
  assert.equal(JSON.parse(result.stdout).databaseQueries, false);
  assert.equal(JSON.parse(result.stdout).platform, process.platform);
  if (process.platform !== "linux") {
    const linux = spawnSync(
      process.execPath,
      ["scripts/check-native-runtime.mjs", "--linux"],
      {
        env,
        encoding: "utf8",
        timeout: 10000,
        windowsHide: true,
      },
    );
    assert.equal(linux.status, 1);
    assert.ok(!linux.stdout.includes(probe) && !linux.stderr.includes(probe));
  }
});
