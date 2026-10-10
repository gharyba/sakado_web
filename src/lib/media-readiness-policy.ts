import { z } from "zod";

export const approvalAxes = [
  "visualApproval",
  "copyrightPermission",
  "participantConsent",
  "minorConsentReview",
  "publicWebsitePublicationApproval",
] as const;
const status = z.enum(["PENDING REVIEW", "APPROVED", "NOT APPLICABLE"]);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const assetSchema = z.object({
  id: z.string().regex(/^S\d{2}$/),
  originalFilename: z.string().min(1),
  sourceSha256: digest,
  photographerRightsHolder: z.string(),
  participantClassification: z.string(),
  minorReviewPriority: z.string(),
  approvals: z.object({
    visualApproval: status,
    copyrightPermission: status,
    participantConsent: status,
    minorConsentReview: status,
    publicWebsitePublicationApproval: status,
  }),
  publicationReadiness: z.string(),
  independentlyVerifiedAuthorizationEvidence: z.boolean(),
  humanReviewer: z.string().nullable(),
  reviewDate: z.string().nullable(),
  evidenceIds: z.array(z.string()),
  humanDecisions: z.array(z.unknown()),
  permittedUses: z.string(),
  permissionExpiryDate: z.string().nullable(),
  expiryDetermination: z.string(),
  unresolvedIssues: z.array(z.string()),
  websiteUseVerified: z.boolean().default(false),
  creditConditionsVerified: z.boolean().default(false),
  cropAndOptimizationVerified: z.boolean().default(false),
  minorLegalRequirementsVerified: z.boolean().default(false),
  approvedRenditionHashes: z.array(digest).default([]),
});
const readinessSchema = z.object({
  sourceManifestSha256: digest,
  publicationAllowed: z.boolean(),
  globalBlockers: z.array(z.object({ id: z.string(), status: z.string() })),
  assets: z.array(assetSchema).min(1),
});
const manifestSchema = z.object({
  assets: z
    .array(
      z
        .object({ id: z.string(), filename: z.string(), sha256: digest })
        .passthrough(),
    )
    .min(1),
});
export type ReviewAsset = z.infer<typeof assetSchema>;
export type MediaRegistry = {
  valid: boolean;
  assets: ReviewAsset[];
  hashes: Map<string, ReviewAsset>;
  names: Map<string, ReviewAsset>;
  globalCleared: boolean;
};
export function invalidRegistry(): MediaRegistry {
  return {
    valid: false,
    assets: [],
    hashes: new Map(),
    names: new Map(),
    globalCleared: false,
  };
}
/** Accept technical identity only. These checks never create evidence or change statuses. */
export function mediaRegistry(
  readinessValue: unknown,
  manifestValue: unknown,
  manifestHash: string,
): MediaRegistry {
  const r = readinessSchema.safeParse(readinessValue),
    m = manifestSchema.safeParse(manifestValue);
  if (!r.success || !m.success || r.data.sourceManifestSha256 !== manifestHash)
    return invalidRegistry();
  const assets = r.data.assets;
  if (
    new Set(assets.map((a) => a.id)).size !== assets.length ||
    new Set(m.data.assets.map((a) => a.id)).size !== m.data.assets.length ||
    assets.length !== m.data.assets.length
  )
    return invalidRegistry();
  for (const a of assets) {
    const original = m.data.assets.find((v) => v.id === a.id);
    if (
      !original ||
      original.sha256 !== a.sourceSha256 ||
      original.filename !== a.originalFilename
    )
      return invalidRegistry();
  }
  const hashes = new Map<string, ReviewAsset>(),
    names = new Map<string, ReviewAsset>();
  let conflict = false;
  const add = (hash: string, a: ReviewAsset) => {
    if (hashes.has(hash) && hashes.get(hash)?.id !== a.id) conflict = true;
    hashes.set(hash, a);
  };
  const visit = (v: unknown, owner?: ReviewAsset) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach((child) => visit(child, owner));
      return;
    }
    const obj = v as Record<string, unknown>;
    const a =
      typeof obj.id === "string"
        ? (assets.find((item) => item.id === obj.id) ?? owner)
        : owner;
    if (
      a &&
      typeof obj.sha256 === "string" &&
      digest.safeParse(obj.sha256).success
    )
      add(obj.sha256, a);
    Object.values(obj).forEach((child) => visit(child, a));
  };
  visit(manifestValue);
  for (const a of assets) {
    add(a.sourceSha256, a);
    a.approvedRenditionHashes.forEach((hash) => add(hash, a));
    names.set(a.originalFilename.toLowerCase(), a);
  }
  if (conflict) return invalidRegistry();
  return {
    valid: true,
    assets,
    hashes,
    names,
    globalCleared:
      r.data.publicationAllowed &&
      r.data.globalBlockers.length > 0 &&
      r.data.globalBlockers.every((b) => b.status === "APPROVED"),
  };
}
/** Trusted, operator-reviewed data is necessary; a CMS checkbox cannot supply it. */
function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function eligibleForPublication(
  a: ReviewAsset,
  globalCleared: boolean,
  today = new Date().toISOString().slice(0, 10),
) {
  if (
    !globalCleared ||
    !a.websiteUseVerified ||
    !a.creditConditionsVerified ||
    !a.cropAndOptimizationVerified ||
    !a.approvedRenditionHashes.length ||
    (a.minorReviewPriority === "HIGH" && !a.minorLegalRequirementsVerified) ||
    a.publicationReadiness !== "ELIGIBLE FOR HUMAN PUBLICATION DECISION" ||
    !a.independentlyVerifiedAuthorizationEvidence ||
    !a.humanReviewer ||
    !a.reviewDate ||
    a.reviewDate > today ||
    !a.evidenceIds.length ||
    a.unresolvedIssues.length ||
    a.permittedUses === "UNKNOWN"
  )
    return false;
  if (!validDate(a.reviewDate)) return false;
  if (
    a.permissionExpiryDate
      ? !validDate(a.permissionExpiryDate) || a.permissionExpiryDate < today
      : a.expiryDetermination !== "NO EXPIRY (VERIFIED)"
  )
    return false;
  return approvalAxes.every((axis) => {
    const value = a.approvals[axis];
    if (
      value !== "APPROVED" &&
      !(
        value === "NOT APPLICABLE" &&
        ["participantConsent", "minorConsentReview"].includes(axis)
      )
    )
      return false;
    return a.humanDecisions.some((value) => {
      if (!value || typeof value !== "object") return false;
      const d = value as Record<string, unknown>;
      return (
        d.axis === axis &&
        d.status === a.approvals[axis] &&
        d.independentlyVerified === true &&
        typeof d.reviewerId === "string" &&
        /^(RV|LR)-[A-Z0-9-]+$/.test(d.reviewerId) &&
        (!(
          a.minorReviewPriority === "HIGH" &&
          ["participantConsent", "minorConsentReview"].includes(axis)
        ) ||
          d.reviewerId.startsWith("LR-")) &&
        typeof d.evidenceId === "string" &&
        /^EV-[A-Z0-9-]+$/.test(d.evidenceId) &&
        a.evidenceIds.includes(d.evidenceId) &&
        typeof d.justification === "string" &&
        d.justification.trim().length >= 10 &&
        typeof d.reviewDate === "string" &&
        validDate(d.reviewDate) &&
        d.reviewDate <= today
      );
    });
  });
}
export function filenameAsset(registry: MediaRegistry, filename: string) {
  const name = filename.split(/[\\/]/).pop()?.toLowerCase() ?? "";
  return (
    registry.names.get(name) ??
    registry.assets.find((a) =>
      new RegExp(`^${a.id}(?:[-_.]|$)`, "i").test(name),
    )
  );
}
export function bytesEligible(
  registry: MediaRegistry,
  hash: string,
  filename?: string,
) {
  if (!registry.valid) return false;
  const matches = [
    registry.hashes.get(hash),
    filename ? filenameAsset(registry, filename) : undefined,
  ].filter((a): a is ReviewAsset => !!a);
  return matches.every(
    (a) =>
      eligibleForPublication(a, registry.globalCleared) &&
      a.approvedRenditionHashes.includes(hash),
  );
}
