import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Read-only, fixed input paths only: no .env, remote, database or deployment access.
// Output is context for review, never proof of CI, hosting, tests or release approval.
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--linux"))
    throw Error("Unsupported argument");
  const native = JSON.parse(
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL("./check-native-runtime.mjs", import.meta.url)),
        ...args,
      ],
      {
        encoding: "utf8",
        timeout: 20000,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      },
    ),
  );
  const git = (args) =>
    execFileSync("git", args, {
      encoding: "utf8",
      timeout: 10000,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  let source = { commit: null, workingTreeClean: null };
  try {
    const commit = git(["rev-parse", "HEAD"]);
    if (!/^[a-f0-9]{40}$/.test(commit)) throw Error("Invalid source identity");
    source = {
      commit,
      workingTreeClean:
        git(["status", "--porcelain", "--untracked-files=normal"]) === "",
    };
  } catch {
    /* Unknown stays unknown; environment variables cannot claim a commit. */
  }
  let buildId = null;
  try {
    const value = (await readFile(".next/BUILD_ID", "utf8")).trim();
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(value))
      throw Error("Invalid build identifier");
    buildId = value;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const migrations = [];
  for (const entry of (
    await readdir("prisma/migrations", { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory())
      migrations.push({
        name: entry.name,
        sha256: sha(
          await readFile(`prisma/migrations/${entry.name}/migration.sql`),
        ),
      });
  }
  console.log(
    JSON.stringify(
      {
        schemaVersion: 1,
        kind: "NATIVE_AND_ARTIFACT_CONTEXT_ONLY",
        generatedUtc: new Date().toISOString(),
        source,
        artifacts: {
          packageLockSha256: sha(await readFile("package-lock.json")),
          prismaSchemaSha256: sha(await readFile("prisma/schema.prisma")),
          migrations,
          observedBuildId: buildId,
          buildMatchesSource: "NOT VERIFIED",
        },
        native,
        applicationTests: "NOT RECORDED BY THIS CHECK",
        externalStaging: "NOT TESTED",
        productionLaunchApproved: false,
      },
      null,
      2,
    ),
  );
}
main().catch(() => {
  console.error(
    "Validation context could not be recorded; no settings, paths or captured child output printed.",
  );
  process.exitCode = 1;
});
