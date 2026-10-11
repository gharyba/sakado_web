import { readFile, readdir, realpath, lstat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { reviewReleaseEvidence } from "./lib/release-evidence";

// Fixed local input. No .env loading, network, DB connection, migration or deployment.
async function main() {
  const args = process.argv.slice(2);
  if (
    (args.length && (args.length !== 1 || args[0] !== "--reviewed-evidence")) ||
    process.versions.node.split(".")[0] !== "24"
  )
    throw Error();
  const hashFile = async (file: string) =>
    createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
  const git = (args: string[]) =>
    execFileSync(process.env.SAKADO_GIT_PATH || "git", args, {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  const migrations = [];
  for (const entry of (
    await readdir("prisma/migrations", { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory())
      migrations.push({
        name: entry.name,
        sha256: await hashFile(`prisma/migrations/${entry.name}/migration.sql`),
      });
  }
  const file = args.length
    ? ".local/phase08/release-candidate-evidence.json"
    : "docs/release/release-candidate.json";
  if (args.length) {
    const root = await realpath(process.cwd());
    const actual = await realpath(file);
    if (
      actual !== resolve(root, file) ||
      !actual.startsWith(root + sep) ||
      (await lstat(file)).isSymbolicLink()
    )
      throw Error();
  }
  const bytes = await readFile(file);
  if (bytes.length > 100_000) throw Error();
  const manifest: unknown = JSON.parse(bytes.toString("utf8"));
  const media = JSON.parse(
    await readFile("docs/media/media-04-publication-readiness.json", "utf8"),
  ) as {
    assets: {
      publicationReadiness: string;
      approvals: Record<string, string>;
    }[];
  };
  const result = reviewReleaseEvidence(manifest, {
    head: git(["rev-parse", "HEAD"]),
    workingTreeClean:
      git(["status", "--porcelain", "--untracked-files=all"]).length === 0,
    artifacts: {
      packageLockSha256: await hashFile("package-lock.json"),
      prismaSchemaSha256: await hashFile("prisma/schema.prisma"),
      mediaRegistrySha256: await hashFile(
        "docs/media/media-04-publication-readiness.json",
      ),
      migrations,
    },
    mediaSnapshot: {
      assets: media.assets.length,
      blockedAssets: media.assets.filter(
        (asset) => asset.publicationReadiness === "BLOCKED",
      ).length,
      pendingApprovals: media.assets.reduce(
        (sum, asset) =>
          sum +
          Object.values(asset.approvals).filter(
            (status) => status === "PENDING REVIEW",
          ).length,
        0,
      ),
    },
    nowUtc: new Date().toISOString(),
  });
  console.log("Offline release-evidence consistency: " + result.status);
  if (result.issues.includes("MANIFEST_INVALID"))
    console.error("Manifest schema invalid; values suppressed.");
  else
    console.log(
      "Unresolved checks: " +
        result.issues.length +
        ". Review docs/release/release-candidate.json and docs/EXTERNAL_STAGING.md.",
    );
  console.log(
    "Human evidence verification required; no external validation, tag or launch approval performed.",
  );
  if (result.status !== "COMPLETE") process.exitCode = 1;
}
main().catch(() => {
  console.error(
    "Offline release-evidence check failed safely; no configuration values printed.",
  );
  process.exitCode = 1;
});
