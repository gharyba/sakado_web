import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join, resolve, sep, basename } from "node:path";
import { tmpdir } from "node:os";
import {
  approvalAxes,
  bytesEligible,
  eligibleForPublication,
  invalidRegistry,
  mediaRegistry,
  type ReviewAsset,
} from "../src/lib/media-readiness-policy";
import { auditPublicMedia } from "../src/lib/public-media-audit";
import {
  illustrationHashes,
  illustrationIdentityAllowed,
} from "../src/lib/illustration-policy";

test("demo artwork filenames cannot authorize replacement bytes", async () => {
  for (const [filename, hash] of Object.entries(illustrationHashes)) {
    assert.equal(illustrationIdentityAllowed(filename, hash), true);
    assert.equal(
      illustrationIdentityAllowed("/images/" + filename, "0".repeat(64)),
      false,
    );
  }
  const root = await mkdtemp(join(tmpdir(), "sakado-artwork-gate-"));
  try {
    await writeFile(join(root, "camp.svg"), "unreviewed replacement");
    assert.deepEqual(await auditPublicMedia(root, registry()), [
      join(root, "camp.svg"),
    ]);
  } finally {
    const target = resolve(root);
    assert.ok(
      target.startsWith(resolve(tmpdir()) + sep) &&
        basename(target).startsWith("sakado-artwork-gate-"),
    );
    await rm(target, { recursive: true, force: true });
  }
});

const manifestBytes = readFileSync("docs/media/asset-manifest.json");
const manifest = JSON.parse(manifestBytes.toString());
const readiness = JSON.parse(
  readFileSync("docs/media/media-04-publication-readiness.json", "utf8"),
);
const manifestHash = createHash("sha256").update(manifestBytes).digest("hex");
const registry = () =>
  mediaRegistry(
    structuredClone(readiness),
    structuredClone(manifest),
    manifestHash,
  );

test("all 17 source identities and registered derivative hashes remain blocked; 85 axes stay pending", () => {
  const r = registry();
  assert.equal(r.valid, true);
  assert.equal(r.assets.length, 17);
  assert.ok(r.hashes.size > 150);
  assert.equal(
    r.assets
      .flatMap((a) => approvalAxes.map((axis) => a.approvals[axis]))
      .filter((s) => s === "PENDING REVIEW").length,
    85,
  );
  for (const [hash, asset] of r.hashes) {
    assert.equal(bytesEligible(r, hash, "renamed.webp"), false, asset.id);
    assert.equal(eligibleForPublication(asset, r.globalCleared), false);
  }
  assert.equal(bytesEligible(r, "1".repeat(64), "S08-unknown.webp"), false);
  assert.equal(
    bytesEligible(r, "1".repeat(64), "unregistered-legacy.webp"),
    true,
  );
});

test("missing, inconsistent and duplicate registry identities fail closed", () => {
  assert.equal(bytesEligible(invalidRegistry(), "1".repeat(64)), false);
  assert.equal(mediaRegistry({}, manifest, manifestHash).valid, false);
  assert.equal(mediaRegistry(readiness, manifest, "0".repeat(64)).valid, false);
  const altered = structuredClone(readiness);
  altered.assets[0].sourceSha256 = "1".repeat(64);
  assert.equal(mediaRegistry(altered, manifest, manifestHash).valid, false);
  altered.assets[0] = altered.assets[1];
  assert.equal(mediaRegistry(altered, manifest, manifestHash).valid, false);
});

// Synthetic unit fixture only: this never writes to project approval records.
function reviewed(): ReviewAsset {
  const a = registry().assets.find((a) => a.id === "S08")!;
  a.publicationReadiness = "ELIGIBLE FOR HUMAN PUBLICATION DECISION";
  a.independentlyVerifiedAuthorizationEvidence = true;
  a.humanReviewer = "RV-TEST";
  a.reviewDate = "2026-01-01";
  a.evidenceIds = ["EV-TEST"];
  a.unresolvedIssues = [];
  a.permittedUses = "Public website only";
  a.expiryDetermination = "NO EXPIRY (VERIFIED)";
  a.websiteUseVerified =
    a.creditConditionsVerified =
    a.cropAndOptimizationVerified =
      true;
  a.approvedRenditionHashes = [a.sourceSha256];
  for (const axis of approvalAxes) a.approvals[axis] = "APPROVED";
  a.humanDecisions = approvalAxes.map((axis) => ({
    axis,
    status: "APPROVED",
    independentlyVerified: true,
    reviewerId: "RV-TEST",
    evidenceId: "EV-TEST",
    justification: "Synthetic test evidence, never production authorization",
    reviewDate: "2026-01-01",
  }));
  return a;
}

test("CMS-style approval flags alone do not make a registered asset eligible", () => {
  const a = registry().assets[0];
  for (const axis of approvalAxes) a.approvals[axis] = "APPROVED";
  a.publicationReadiness = "APPROVED";
  assert.equal(eligibleForPublication(a, true), false);
});

test("future eligibility requires every evidence, legal, credit, expiry and rendition gate", () => {
  const a = reviewed();
  assert.equal(eligibleForPublication(a, true, "2026-10-10"), true);
  assert.equal(eligibleForPublication(a, false), false);
  for (const key of [
    "websiteUseVerified",
    "creditConditionsVerified",
    "cropAndOptimizationVerified",
    "independentlyVerifiedAuthorizationEvidence",
  ] as const) {
    assert.equal(
      eligibleForPublication({ ...a, [key]: false }, true),
      false,
      key,
    );
  }
  assert.equal(
    eligibleForPublication({ ...a, humanDecisions: [] }, true),
    false,
  );
  assert.equal(
    eligibleForPublication({ ...a, approvedRenditionHashes: [] }, true),
    false,
  );
  assert.equal(
    eligibleForPublication({ ...a, permissionExpiryDate: "2025-01-01" }, true),
    false,
  );
  assert.equal(
    eligibleForPublication({ ...a, reviewDate: "2026-02-30" }, true),
    false,
  );
  assert.equal(
    eligibleForPublication(
      { ...a, unresolvedIssues: ["Missing credit"] },
      true,
    ),
    false,
  );
  assert.equal(
    eligibleForPublication({ ...a, minorReviewPriority: "HIGH" }, true),
    false,
  );
  const minor = {
    ...a,
    minorReviewPriority: "HIGH",
    minorLegalRequirementsVerified: true,
  };
  assert.equal(eligibleForPublication(minor, true), false);
  minor.humanDecisions = (
    minor.humanDecisions as Record<string, unknown>[]
  ).map((d) => ({ ...d, reviewerId: "LR-TEST" }));
  assert.equal(eligibleForPublication(minor, true), true);
});

test("NOT APPLICABLE requires an explicit matching justified human decision; it cannot replace copyright", () => {
  const a = reviewed();
  a.approvals.participantConsent = "NOT APPLICABLE";
  assert.equal(eligibleForPublication(a, true), false);
  a.humanDecisions = (a.humanDecisions as Record<string, unknown>[]).map((d) =>
    d.axis === "participantConsent" ? { ...d, status: "NOT APPLICABLE" } : d,
  );
  assert.equal(eligibleForPublication(a, true), true);
  a.approvals.copyrightPermission = "NOT APPLICABLE";
  assert.equal(eligibleForPublication(a, true), false);
});

test("future approval admits only explicitly bound rendition bytes and still requires global clearance", () => {
  const r = registry(),
    a = reviewed();
  r.assets[r.assets.findIndex((v) => v.id === a.id)] = a;
  r.hashes.set(a.sourceSha256, a);
  r.names.set(a.originalFilename.toLowerCase(), a);
  assert.equal(bytesEligible(r, a.sourceSha256), false);
  r.globalCleared = true;
  assert.equal(bytesEligible(r, a.sourceSha256), true);
  assert.equal(bytesEligible(r, "1".repeat(64), a.originalFilename), false);
});

test("static-file preflight detects renamed blocked bytes, nested variants and known filenames without altering files", async () => {
  const root = await mkdtemp(join(tmpdir(), "sakado-public-audit-"));
  try {
    await mkdir(join(root, "images"));
    const bytes = Buffer.from("Synthetic blocked fixture only"),
      hash = createHash("sha256").update(bytes).digest("hex");
    const r = registry();
    r.hashes.set(hash, r.assets[0]);
    await writeFile(join(root, "images", "renamed.webp"), bytes);
    await writeFile(join(root, "S08-custom.webp"), "unknown bytes");
    await writeFile(join(root, "safe.svg"), "safe placeholder");
    assert.equal((await auditPublicMedia(root, r)).length, 2);
    await assert.rejects(() => auditPublicMedia(root, invalidRegistry()));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
