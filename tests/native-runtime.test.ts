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
  const native = JSON.parse(result.stdout);
  assert.equal(native.databaseQueries, false);
  assert.equal(native.sharpDecodedPixelBytes, 18);
  assert.equal(native.sharpWebpRoundTrip, true);
  assert.equal(native.openssl, process.versions.openssl);
  assert.equal(native.nodeModuleAbi, process.versions.modules);
  if (process.platform === "linux") {
    assert.ok(["glibc", "non-glibc"].includes(native.libc.family));
    if (native.libc.family === "glibc")
      assert.match(native.libc.version, /^\d+\.\d+/);
    else assert.equal(native.libc.version, null);
  } else
    assert.deepEqual(native.libc, { family: "not-applicable", version: null });
  assert.ok(typeof native.libvips === "string" && native.libvips.length > 0);
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

test("native preflight refuses unsupported options without echoing their values", () => {
  const probe = "private-argument-probe";
  const result = spawnSync(
    process.execPath,
    ["scripts/check-native-runtime.mjs", `--${probe}`],
    {
      encoding: "utf8",
      timeout: 10000,
      windowsHide: true,
    },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.ok(!result.stderr.includes(probe));
});
