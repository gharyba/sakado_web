import { reviewHash } from "./client-review-policy";
import type { ReviewConfig } from "./client-review-grants";

/** A single unconditional OAuth gate followed by an exact identity allowlist. */
export function ngrokTrafficPolicy(emails: readonly string[]) {
  if (
    !emails.length ||
    emails.length > 10 ||
    emails.some(
      (email) => !/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    ) ||
    new Set(emails.map((email) => email.toLowerCase())).size !== emails.length
  )
    throw Error("Exact email allowlist required");
  const allowed = [...emails].map((email) => email.toLowerCase()).sort();
  return {
    on_http_request: [
      { actions: [{ type: "oauth", config: { provider: "google" } }] },
      {
        expressions: [
          `!(actions.ngrok.oauth.identity.email in ${JSON.stringify(allowed)})`,
        ],
        actions: [{ type: "deny", config: { status_code: 403 } }],
      },
    ],
  };
}
export function ngrokPolicyBytes(emails: readonly string[]) {
  return JSON.stringify(ngrokTrafficPolicy(emails), null, 2) + "\n";
}
export function assertNgrokPolicy(config: ReviewConfig, bytes: string) {
  if (
    !config.transport ||
    config.transport.provider !== "ngrok" ||
    reviewHash(bytes) !== config.transport.policySha256 ||
    JSON.stringify(JSON.parse(bytes)) !==
      JSON.stringify(ngrokTrafficPolicy(config.allowedEmails))
  )
    throw Error("Verified Google OAuth policy required");
}
