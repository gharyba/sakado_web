import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { mkdtemp, writeFile, rm, mkdir, symlink } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  presentationEnabled,
  presentationRequestAllowed,
  accessCodeValid,
  createPresentationSession,
  presentationSessionValid,
} from "../src/lib/official-presentation-policy";
import { productionEnvironmentIssues } from "../src/lib/production-env";
import { safeRead } from "../scripts/presentation-files.mjs";

function environment() {
  const code = randomBytes(24).toString("base64url");
  return {
    code,
    env: {
      NODE_ENV: "development",
      OFFICIAL_PRESENTATION: "true",
      DEMO_MODE: "false",
      CLIENT_DEMO: "false",
      STAGING_MODE: "false",
      DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:55432/sakado",
      PRESENTATION_DATABASE_VERIFIED: "true",
      PRESENTATION_ORIGIN: "http://127.0.0.1:3134",
      PRESENTATION_SECRET: randomBytes(48).toString("hex"),
      PRESENTATION_CODE_HASH: createHash("sha256").update(code).digest("hex"),
      PRESENTATION_STARTED: String(Date.now()),
    },
  };
}
test("official presentation is fail-closed outside verified local non-demo development", () => {
  const { env } = environment();
  assert.equal(presentationEnabled(env), true);
  for (const patch of [
    { NODE_ENV: "production" },
    { NODE_ENV: "test" },
    { DEMO_MODE: "true" },
    { CLIENT_DEMO: "true" },
    { STAGING_MODE: "true" },
    { OFFICIAL_PRESENTATION: "false" },
    { DATABASE_URL: "postgresql://validation:dummy@outside.invalid/sakado" },
    { PRESENTATION_DATABASE_VERIFIED: "false" },
    { PRESENTATION_ORIGIN: "http://localhost:3134" },
    { PRESENTATION_SECRET: "" },
  ])
    assert.equal(presentationEnabled({ ...env, ...patch }), false);
  assert.equal(presentationEnabled(env, Date.now() + 61 * 60_000), false);
  assert.ok(
    productionEnvironmentIssues({
      ...env,
      NODE_ENV: "production",
      DEMO_MODE: "true",
    }).some((x) => x.includes("presentation")),
  );
});
test("presentation request identity rejects cross-site and forwarded identities", () => {
  const { env } = environment();
  const headers = new Headers({ host: "127.0.0.1:3134" });
  assert.equal(presentationRequestAllowed(headers, env), true);
  for (const [key, value] of [
    ["host", "localhost:3134"],
    ["host", "127.0.0.1.evil:3134"],
    ["origin", "http://evil.invalid"],
    ["sec-fetch-site", "cross-site"],
    ["sec-fetch-site", "same-site"],
    ["x-forwarded-host", "evil.invalid"],
    ["forwarded", "host=127.0.0.1:3134"],
  ]) {
    const h = new Headers(headers);
    h.set(key, value);
    assert.equal(presentationRequestAllowed(h, env), false);
  }
});
test("access code and signed viewing session expire and cannot grant a different run access", () => {
  const { code, env } = environment();
  assert.equal(accessCodeValid(code, env), true);
  assert.equal(accessCodeValid("incorrect", env), false);
  assert.equal(accessCodeValid(code, env, Date.now() + 6 * 60_000), false);
  const token = createPresentationSession(env);
  assert.equal(presentationSessionValid(token, env), true);
  assert.equal(presentationSessionValid(token + "x", env), false);
  assert.equal(presentationSessionValid(token, environment().env), false);
  assert.equal(
    presentationSessionValid(token, env, Date.now() + 61 * 60_000),
    false,
  );
  assert.equal(presentationSessionValid(undefined, env), false);
});
test("private reads reject traversal, oversized files and linked paths", async () => {
  await mkdir(".local/presentation-tests", { recursive: true });
  const root = await mkdtemp(path.resolve(".local/presentation-tests/run-"));
  try {
    await writeFile(path.join(root, "safe.webp"), "synthetic");
    assert.equal((await safeRead(root, "safe.webp")).toString(), "synthetic");
    for (const value of [
      "../safe.webp",
      "a/../safe.webp",
      "/safe.webp",
      "a\\safe.webp",
    ])
      await assert.rejects(safeRead(root, value));
    await assert.rejects(safeRead(root, "safe.webp", 2));
    // Directory junctions are available on Windows without symbolic-link privileges.
    await symlink(
      root,
      path.join(root, "linked"),
      process.platform === "win32" ? "junction" : "dir",
    );
    await assert.rejects(safeRead(root, "linked/safe.webp"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("dedicated launcher refuses production, staging and demo selections before startup", () => {
  for (const patch of [
    { NODE_ENV: "production" },
    { STAGING_MODE: "true" },
    { DEMO_MODE: "true" },
    { CLIENT_DEMO: "true" },
  ] as const) {
    const result = spawnSync(
      process.execPath,
      ["scripts/dev-presentation.mjs"],
      {
        env: {
          ...process.env,
          NODE_ENV: "development",
          STAGING_MODE: "false",
          DEMO_MODE: "false",
          CLIENT_DEMO: "false",
          ...patch,
        },
        encoding: "utf8",
        timeout: 15000,
        windowsHide: true,
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /startup refused/);
    assert.doesNotMatch(result.stdout, /Official PostgreSQL presentation:/);
  }
});

test("operational production startup refuses presentation mode even alongside demo mode", () => {
  for (const demo of ["false", "true"]) {
    const result = spawnSync(process.execPath, ["scripts/start.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        DEMO_MODE: demo,
        CLIENT_DEMO: "false",
        OFFICIAL_PRESENTATION: "true",
        DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
        AUTH_SECRET: "",
        SITE_URL: "",
        ADMIN_URL: "",
      },
      encoding: "utf8",
      timeout: 15000,
      windowsHide: true,
    });
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Local official presentation is forbidden in production/,
    );
    assert.doesNotMatch(result.stdout, /Ready|Local:/);
  }
});
