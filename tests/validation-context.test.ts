import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";

const script = resolve("scripts/record-validation-evidence.mjs");
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
test("validation context hashes synthetic artifacts without accepting environment claims or leaking settings", () => {
  const folder = mkdtempSync(join(tmpdir(), "sakado-validation-context-"));
  const probe = "private-context-probe";
  const database = new URL("postgresql://probe@must-not-connect.invalid/probe");
  database.password = probe;
  try {
    mkdirSync(join(folder, "prisma/migrations/20261023_context"), {
      recursive: true,
    });
    writeFileSync(join(folder, "package-lock.json"), '{"lockfileVersion":3}');
    writeFileSync(join(folder, "prisma/schema.prisma"), "// synthetic schema");
    writeFileSync(
      join(folder, "prisma/migrations/20261023_context/migration.sql"),
      "-- never executed",
    );
    const run = () =>
      spawnSync(process.execPath, [script], {
        cwd: folder,
        env: {
          ...process.env,
          AUTH_SECRET: probe,
          DATABASE_URL: database.href,
          GITHUB_SHA: "a".repeat(40),
          RELEASE_COMMIT: "a".repeat(40),
        },
        encoding: "utf8",
        timeout: 30000,
        windowsHide: true,
      });
    const result = run();
    assert.equal(result.status, 0);
    assert.ok(!result.stdout.includes(probe) && !result.stderr.includes(probe));
    const context = JSON.parse(result.stdout);
    assert.equal(context.kind, "NATIVE_AND_ARTIFACT_CONTEXT_ONLY");
    assert.deepEqual(context.source, { commit: null, workingTreeClean: null });
    assert.equal(
      context.artifacts.packageLockSha256,
      hash('{"lockfileVersion":3}'),
    );
    assert.equal(
      context.artifacts.prismaSchemaSha256,
      hash("// synthetic schema"),
    );
    assert.deepEqual(context.artifacts.migrations, [
      { name: "20261023_context", sha256: hash("-- never executed") },
    ]);
    assert.equal(context.artifacts.observedBuildId, null);
    assert.equal(context.artifacts.buildMatchesSource, "NOT VERIFIED");
    assert.equal(context.native.databaseQueries, false);
    assert.equal(context.productionLaunchApproved, false);
    assert.equal(context.externalStaging, "NOT TESTED");
    mkdirSync(join(folder, ".next"));
    writeFileSync(join(folder, ".next/BUILD_ID"), `unsafe/${probe}`);
    const invalid = run();
    assert.equal(invalid.status, 1);
    assert.equal(invalid.stdout, "");
    assert.ok(!invalid.stderr.includes(probe));
  } finally {
    // This is only the fresh temporary fixture owned by this test.
    assert.ok(folder.startsWith(join(tmpdir(), "sakado-validation-context-")));
    rmSync(folder, { recursive: true, force: true });
  }
});
