import fs from "node:fs/promises";
import path from "node:path";
import {
  securePresentationDirectory,
  writePresentationRuntime,
} from "./presentation-runtime.mjs";
import { reviewConfigSchema } from "../src/lib/client-review-grants";

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.some((arg) => !arg.startsWith("--email=")))
    throw Error("Supply explicitly authorized exact email addresses.");
  const config = reviewConfigSchema.parse({
    version: 1,
    allowedEmails: args.map((arg) => arg.slice(8)),
    expiresAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    revoked: false,
    grants: [],
  });
  const directory = path.resolve(".local/client-review");
  await fs.mkdir(directory, { recursive: true });
  await securePresentationDirectory(directory);
  try {
    await fs.lstat(path.join(directory, "catalog.json"));
    throw Error("Existing configuration is preserved; review it manually.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await writePresentationRuntime(
    directory,
    "catalog.json",
    JSON.stringify(config, null, 2),
  );
  console.log(
    "Private review configuration created: exact email allowlist, 24-hour configuration expiry, zero remote media grants. No tunnel was started.",
  );
}
main().catch(() => {
  console.error(
    "Review configuration refused; check exact email syntax, existing configuration and private directory permissions. No values printed.",
  );
  process.exitCode = 1;
});
