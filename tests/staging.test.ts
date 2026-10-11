import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stagingEnabled,
  rehearsalTargetAllowed,
  relativeStoragePathSafe,
} from "../src/lib/staging-policy";
import { productionEnvironmentIssues } from "../src/lib/production-env";

test("staging indexing suppression is explicit and independent of demo/business permissions", () => {
  assert.equal(
    stagingEnabled({ STAGING_MODE: "true", DEMO_MODE: "false" }),
    true,
  );
  for (const value of [undefined, "false", "yes", "TRUE"])
    assert.equal(stagingEnabled({ STAGING_MODE: value }), false);
  assert.ok(
    productionEnvironmentIssues({
      NODE_ENV: "production",
      DEMO_MODE: "false",
      STAGING_MODE: "true",
    }).length,
  );
  assert.ok(
    productionEnvironmentIssues({
      NODE_ENV: "production",
      DEMO_MODE: "false",
      STAGING_MODE: "yes",
    }).some((x) => x.startsWith("STAGING_MODE")),
  );
});
test("backup/restore tooling cannot accept production, developer, CI or mismatched database targets", () => {
  const url =
    "postgresql://phase07_test:disposable@127.0.0.1:55438/sakado_rehearsal?schema=public";
  assert.equal(rehearsalTargetAllowed(url, "sakado_rehearsal"), true);
  assert.equal(
    rehearsalTargetAllowed(
      url.replace("sakado_rehearsal", "sakado_restore"),
      "sakado_restore",
    ),
    true,
  );
  for (const change of [
    url.replace("127.0.0.1", "db.example.invalid"),
    url.replace("55438", "55432"),
    url.replace("phase07_test", "sakado_ci"),
    url.replace("sakado_rehearsal", "sakado"),
    url.replace("public", "private"),
    url + "&host=remote",
    url + "&schema=private",
    "invalid",
  ])
    assert.equal(rehearsalTargetAllowed(change, "sakado_rehearsal"), false);
  assert.equal(rehearsalTargetAllowed(url, "sakado_restore"), false);
});
test("generated storage artifacts stay under the ignored phase directory without traversal", () => {
  assert.equal(relativeStoragePathSafe(".local/phase07/run-123/storage"), true);
  assert.equal(
    relativeStoragePathSafe(".local\\phase07\\run-123\\storage"),
    true,
  );
  for (const value of [
    "uploads",
    "public/media",
    ".local/phase07/../uploads",
    "C:/private/uploads",
    ".local/phase07/run-123/../../public",
    ".local/phase07//storage",
  ])
    assert.equal(relativeStoragePathSafe(value), false);
});
