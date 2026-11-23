import fs from "node:fs/promises";
import path from "node:path";
import {
  securePresentationDirectory,
  writePresentationRuntime,
} from "./presentation-runtime.mjs";
import { safeRead } from "./presentation-files.mjs";
import { reviewConfigSchema } from "../src/lib/client-review-grants";
import { reviewHash, reviewOrigin } from "../src/lib/client-review-policy";
import { ngrokPolicyBytes } from "../src/lib/client-review-ngrok";

async function main() {
  const args = process.argv.slice(2);
  if (
    args.some(
      (arg) =>
        !arg.startsWith("--origin=") &&
        !arg.startsWith("--email=") &&
        arg !== "--activate",
    ) ||
    args.filter((arg) => arg.startsWith("--origin=")).length !== 1
  )
    throw Error("Exact origin and email options required");
  const origin = reviewOrigin(
    args.find((arg) => arg.startsWith("--origin="))!.slice(9),
  );
  if (!origin?.endsWith(".ngrok-free.dev"))
    throw Error("Assigned HTTPS ngrok Free origin required");
  const directory = path.resolve(".local/client-review");
  await fs.mkdir(directory, { recursive: true });
  await securePresentationDirectory(directory);
  try {
    await fs.lstat(path.join(directory, "run.lock"));
    throw Error(
      "Active or stale review lock preserved; stop and verify the owned review before configuration.",
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  let existing;
  try {
    existing = reviewConfigSchema.parse(
      JSON.parse(
        (await safeRead(directory, "catalog.json", 100_000)).toString(),
      ),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (existing?.grants.length)
    throw Error(
      "Existing media grants require separate audience review and are preserved.",
    );
  const emails = args
    .filter((arg) => arg.startsWith("--email="))
    .map((arg) => arg.slice(8).toLowerCase());
  const policy = ngrokPolicyBytes(emails);
  const config = reviewConfigSchema.parse({
    version: 1,
    allowedEmails: emails,
    expiresAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    revoked: !args.includes("--activate"),
    grants: existing?.grants ?? [],
    transport: { provider: "ngrok", origin, policySha256: reviewHash(policy) },
  });
  await writePresentationRuntime(
    directory,
    "ngrok-traffic-policy.json",
    policy,
  );
  await writePresentationRuntime(
    directory,
    "catalog.json",
    JSON.stringify(config, null, 2),
  );
  console.log(
    `Pinned ngrok configuration and exact Google OAuth policy prepared; ${config.allowedEmails.length} email(s), zero remote media grants, ${config.revoked ? "revoked" : "temporarily active"}. No tunnel was started.`,
  );
}
main().catch(() => {
  console.error(
    "ngrok review configuration refused. Verify the exact origin/emails, private ACL, inactive review and existing grant restrictions; no values printed.",
  );
  process.exitCode = 1;
});
