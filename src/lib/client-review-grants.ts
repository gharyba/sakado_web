import { z } from "zod";
import { reviewHash } from "./client-review-policy";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const email = z
  .email()
  .regex(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
const clearance = z.enum(["CONFIRMED", "NOT_APPLICABLE"]);
export const reviewGrantSchema = z
  .object({
    slot: z
      .string()
      .regex(
        /^(team-[01]|logo|hero-s(?:08|16)|gallery-(?:[0-9]|1[01])|partner-[0-5])$/,
      ),
    sourceSha256: hash,
    derivativeSha256: hash,
    purpose: z.literal("temporary-remote-client-review"),
    authorizedBy: z.string().trim().min(1).max(120),
    evidenceReference: z.string().trim().min(1).max(240),
    reviewedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    ownerAuthorization: z.literal("CONFIRMED"),
    participantClearance: clearance,
    minorClearance: clearance,
  })
  .strict();
export const reviewConfigSchema = z
  .object({
    version: z.literal(1),
    allowedEmails: z.array(email).min(1).max(10),
    expiresAt: z.iso.datetime(),
    revoked: z.boolean(),
    grants: z.array(reviewGrantSchema).max(40),
  })
  .strict();
export type ReviewConfig = z.infer<typeof reviewConfigSchema>;
export function reviewAudience(config: ReviewConfig) {
  return reviewHash(
    [...config.allowedEmails]
      .map((value) => value.toLowerCase())
      .sort()
      .join("\n"),
  );
}
export function reviewConfigValid(
  config: ReviewConfig,
  audience: string,
  now = Date.now(),
) {
  return (
    !config.revoked &&
    Date.parse(config.expiresAt) > now &&
    reviewAudience(config) === audience &&
    new Set(config.allowedEmails.map((value) => value.toLowerCase())).size ===
      config.allowedEmails.length
  );
}
export function assetRemotelyGranted(
  config: ReviewConfig,
  asset: {
    slot: string;
    key: string;
    source: { sha256: string };
    derivative: { sha256: string };
  },
  now = Date.now(),
) {
  return config.grants.some(
    (grant) =>
      grant.slot === asset.slot &&
      grant.sourceSha256 === asset.source.sha256 &&
      grant.derivativeSha256 === asset.derivative.sha256 &&
      asset.key === grant.derivativeSha256 &&
      Date.parse(grant.reviewedAt) <= now &&
      Date.parse(grant.expiresAt) > now &&
      Date.parse(grant.expiresAt) <= Date.parse(config.expiresAt),
  );
}
