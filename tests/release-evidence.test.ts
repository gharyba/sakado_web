import { test } from "node:test";
import assert from "node:assert/strict";
import pendingManifest from "../docs/release/release-candidate.json";
import {
  RELEASE_GATES,
  reviewReleaseEvidence,
  type ReleaseManifest,
  type ReleaseContext,
} from "../scripts/lib/release-evidence";

function fixture() {
  const m = structuredClone(pendingManifest) as ReleaseManifest;
  m.candidateCommit = "a".repeat(40);
  m.candidateBuildId = "synthetic-build";
  m.externalNodeVersion = "24.19.0";
  m.externalPlatform = "linux";
  m.approvedStagingOrigin = "https://staging.example.org";
  m.databaseProviderRef = "synthetic-db";
  for (const gate of RELEASE_GATES)
    m.gates[gate] = {
      status: "COMPLETE",
      scope: ["ciQuality", "ciIntegration", "linuxValidation"].includes(gate)
        ? "GITHUB_CI"
        : "EXTERNAL_STAGING",
      candidateCommit: m.candidateCommit,
      buildId: m.candidateBuildId,
      evidenceRef: "synthetic-evidence",
      reviewerRef: "synthetic-reviewer",
      reviewedUtc: "2026-10-11T00:00:00Z",
    };
  const context: ReleaseContext = {
    head: m.candidateCommit,
    workingTreeClean: true,
    artifacts: structuredClone(m.artifacts),
    mediaSnapshot: structuredClone(m.mediaSnapshot),
    nowUtc: "2026-10-11T01:00:00Z",
  };
  return { m, context };
}
test("checked-in pending evidence remains blocked without being mutated or granting publication", () => {
  const before = JSON.stringify(pendingManifest);
  const { context } = fixture();
  const result = reviewReleaseEvidence(pendingManifest, context);
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.productionLaunchApproved, false);
  assert.equal(JSON.stringify(pendingManifest), before);
});
test("only matching human evidence can satisfy consistency; it never proves a provider or grants a tag", () => {
  const { m, context } = fixture();
  const result = reviewReleaseEvidence(m, context);
  assert.equal(result.status, "COMPLETE");
  assert.equal(result.humanReviewRequired, true);
  assert.equal(result.productionLaunchApproved, false);
  for (const gate of RELEASE_GATES) {
    const missing = structuredClone(m);
    missing.gates[gate].status = "NOT TESTED";
    assert.equal(reviewReleaseEvidence(missing, context).status, "BLOCKED");
  }
});
test("local passes, missing reviews, stale build/commit and changed artifacts cannot clear external gates", () => {
  for (const change of [
    (m: ReleaseManifest) => {
      m.gates.health.scope = "GITHUB_CI";
    },
    (m: ReleaseManifest) => {
      m.gates.storageRedeploy.reviewerRef = null;
    },
    (m: ReleaseManifest) => {
      m.gates.restore.evidenceRef = null;
    },
    (m: ReleaseManifest) => {
      m.gates.backup.reviewedUtc = "2099-01-01T00:00:00Z";
    },
    (m: ReleaseManifest) => {
      m.gates.registrationE2e.candidateCommit = "b".repeat(40);
    },
    (m: ReleaseManifest) => {
      m.gates.adminSmoke.buildId = "previous-build";
    },
    (m: ReleaseManifest) => {
      m.artifacts.packageLockSha256 = "b".repeat(64);
    },
    (m: ReleaseManifest) => {
      m.artifacts.migrations.pop();
    },
    (m: ReleaseManifest) => {
      m.approvedStagingOrigin = "https://sakado.tn";
    },
    (m: ReleaseManifest) => {
      m.approvedStagingOrigin = "https://staging.example.org/?token=private";
    },
  ]) {
    const { m, context } = fixture();
    change(m);
    assert.equal(reviewReleaseEvidence(m, context).status, "BLOCKED");
  }
  const { m, context } = fixture();
  assert.equal(
    reviewReleaseEvidence(m, { ...context, workingTreeClean: false }).status,
    "BLOCKED",
  );
  assert.equal(
    reviewReleaseEvidence(m, { ...context, head: "b".repeat(40) }).status,
    "BLOCKED",
  );
  assert.equal(
    reviewReleaseEvidence(m, {
      ...context,
      mediaSnapshot: { ...context.mediaSnapshot, pendingApprovals: 84 },
    }).status,
    "BLOCKED",
  );
});
test("unknown keys and malformed or sensitive evidence strings fail closed without echoing values", () => {
  const { m, context } = fixture();
  const secret = "private-value-do-not-echo";
  for (const invalid of [
    { ...m, AUTH_SECRET: secret },
    { ...m, gates: {} },
    {
      ...m,
      gates: {
        ...m.gates,
        health: { ...m.gates.health, evidenceRef: "C:/private/" + secret },
      },
    },
    null,
  ]) {
    const result = reviewReleaseEvidence(invalid, context);
    assert.equal(result.status, "BLOCKED");
    assert.equal(JSON.stringify(result).includes(secret), false);
  }
});
