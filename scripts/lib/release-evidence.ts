import { z } from "zod";

export const RELEASE_GATES = [
  "ciQuality",
  "ciIntegration",
  "linuxValidation",
  "targetIsolation",
  "externalRuntime",
  "environment",
  "accessRestriction",
  "https",
  "proxyOriginCookies",
  "database",
  "migrations",
  "adminProvisioning",
  "publicSmoke",
  "adminSmoke",
  "registrationE2e",
  "mediaSafety",
  "storageRestart",
  "storageBuildRestart",
  "storageRedeploy",
  "backup",
  "restore",
  "rollback",
  "health",
  "securityHeadersCache",
  "logsPrivacy",
  "imageOptimization",
  "performance",
  "manualAccessibility",
  "physicalDevices",
  "monitoringOwnership",
  "dependencyRiskReview",
] as const;
export const REVIEW_STATUSES = [
  "COMPLETE",
  "PARTIAL",
  "BLOCKED",
  "NOT TESTED",
] as const;
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const commit = z.string().regex(/^[a-f0-9]{40}$/);
const identifier = z.string().regex(/^[a-z][a-z0-9-]{2,63}$/);
const evidenceSchema = z
  .object({
    status: z.enum(REVIEW_STATUSES),
    scope: z.enum(["EXTERNAL_STAGING", "GITHUB_CI"]),
    candidateCommit: commit.nullable(),
    buildId: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,128}$/)
      .nullable(),
    evidenceRef: identifier.nullable(),
    reviewerRef: identifier.nullable(),
    reviewedUtc: z.iso.datetime().nullable(),
  })
  .strict();
export const releaseManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    proposedVersion: z.literal("v1.0.0-rc.1"),
    baseCommit: commit,
    candidateCommit: commit.nullable(),
    candidateBuildId: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,128}$/)
      .nullable(),
    targetNode: z.literal("24.x"),
    externalNodeVersion: z
      .string()
      .regex(/^24\.\d+\.\d+$/)
      .nullable(),
    externalPlatform: z.literal("linux").nullable(),
    approvedStagingOrigin: z.string().max(253).nullable(),
    databaseProviderRef: identifier.nullable(),
    mediaSnapshot: z
      .object({
        assets: z.literal(17),
        blockedAssets: z.literal(17),
        pendingApprovals: z.literal(85),
      })
      .strict(),
    artifacts: z
      .object({
        packageLockSha256: sha,
        prismaSchemaSha256: sha,
        mediaRegistrySha256: sha,
        migrations: z
          .array(
            z
              .object({
                name: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/),
                sha256: sha,
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    gates: z.record(z.enum(RELEASE_GATES), evidenceSchema),
    productionLaunchApproved: z.literal(false),
  })
  .strict();

export type ReleaseManifest = z.infer<typeof releaseManifestSchema>;
export type ReleaseContext = {
  head: string;
  workingTreeClean: boolean;
  artifacts: ReleaseManifest["artifacts"];
  mediaSnapshot: {
    assets: number;
    blockedAssets: number;
    pendingApprovals: number;
  };
  nowUtc: string;
};
/** Offline consistency check of human evidence records, never independent provider proof. */
export function reviewReleaseEvidence(input: unknown, context: ReleaseContext) {
  const parsed = releaseManifestSchema.safeParse(input);
  if (!parsed.success)
    return {
      status: "BLOCKED" as const,
      issues: ["MANIFEST_INVALID"],
      humanReviewRequired: true,
      productionLaunchApproved: false as const,
    };
  const m = parsed.data;
  const issues: string[] = [];
  if (!context.workingTreeClean) issues.push("WORKING_TREE_NOT_CLEAN");
  if (!m.candidateCommit || m.candidateCommit !== context.head)
    issues.push("CANDIDATE_COMMIT_NOT_CURRENT");
  if (!m.candidateBuildId) issues.push("CANDIDATE_BUILD_NOT_RECORDED");
  if (!m.externalNodeVersion || m.externalPlatform !== "linux")
    issues.push("EXTERNAL_RUNTIME_UNVERIFIED");
  if (!m.databaseProviderRef) issues.push("STAGING_DATABASE_UNCONFIRMED");
  if (JSON.stringify(m.mediaSnapshot) !== JSON.stringify(context.mediaSnapshot))
    issues.push("MEDIA_SNAPSHOT_MISMATCH");
  try {
    const url = new URL(m.approvedStagingOrigin ?? "");
    if (
      url.protocol !== "https:" ||
      url.origin !== m.approvedStagingOrigin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      /^(localhost|127\.|\[|sakado\.tn$|www\.sakado\.tn$)/i.test(url.hostname)
    )
      throw Error();
  } catch {
    issues.push("STAGING_ORIGIN_UNCONFIRMED");
  }
  for (const key of [
    "packageLockSha256",
    "prismaSchemaSha256",
    "mediaRegistrySha256",
  ] as const)
    if (m.artifacts[key] !== context.artifacts[key])
      issues.push("ARTIFACT_MISMATCH_" + key);
  if (
    JSON.stringify(m.artifacts.migrations) !==
    JSON.stringify(context.artifacts.migrations)
  )
    issues.push("MIGRATION_INVENTORY_MISMATCH");
  if (
    new Set(m.artifacts.migrations.map((item) => item.name)).size !==
    m.artifacts.migrations.length
  )
    issues.push("DUPLICATE_MIGRATION");
  const now = Date.parse(context.nowUtc);
  if (!Number.isFinite(now)) issues.push("REVIEW_CLOCK_INVALID");
  for (const gate of RELEASE_GATES) {
    const evidence = m.gates[gate];
    const ci = ["ciQuality", "ciIntegration", "linuxValidation"].includes(gate);
    if (evidence.status !== "COMPLETE") issues.push(gate + ":UNRESOLVED");
    if (evidence.scope !== (ci ? "GITHUB_CI" : "EXTERNAL_STAGING"))
      issues.push(gate + ":WRONG_SCOPE");
    if (
      !evidence.evidenceRef ||
      !evidence.reviewerRef ||
      !evidence.reviewedUtc ||
      Date.parse(evidence.reviewedUtc) > now
    )
      issues.push(gate + ":HUMAN_EVIDENCE_REQUIRED");
    if (!m.candidateCommit || evidence.candidateCommit !== m.candidateCommit)
      issues.push(gate + ":COMMIT_MISMATCH");
    if (!ci && (!m.candidateBuildId || evidence.buildId !== m.candidateBuildId))
      issues.push(gate + ":BUILD_MISMATCH");
  }
  return {
    status: issues.length ? ("BLOCKED" as const) : ("COMPLETE" as const),
    issues,
    humanReviewRequired: true,
    productionLaunchApproved: false as const,
  };
}
