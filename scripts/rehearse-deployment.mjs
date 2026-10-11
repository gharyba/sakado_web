import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { productionEnvironmentIssues } from "../src/lib/production-env.ts";

// Offline only: does not load .env, connect to DB, install, migrate, start or deploy.
const artifactOnly = process.argv.includes("--artifact-only");
const unknown = process.argv.slice(2).some((x) => x !== "--artifact-only");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function main() {
  if (unknown) throw Error("Unsupported rehearsal argument.");
  const root = await fs.realpath(process.cwd());
  const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));
  const lock = await fs.readFile("package-lock.json");
  const issues = artifactOnly
    ? []
    : productionEnvironmentIssues({ ...process.env, NODE_ENV: "production" });
  if (
    !artifactOnly &&
    (process.env.DEMO_MODE !== "false" || process.env.STAGING_MODE !== "true")
  )
    issues.push(
      "Controlled operational rehearsal requires DEMO_MODE=false and STAGING_MODE=true.",
    );
  if (!artifactOnly) {
    try {
      if (!process.env.MEDIA_LOCAL_DIR) throw Error("missing");
      const folder = await fs.realpath(process.env.MEDIA_LOCAL_DIR);
      for (const privateRoot of ["public", "SAKADO-MEDIA"]) {
        const excluded = path.resolve(root, privateRoot);
        if (folder === excluded || folder.startsWith(excluded + path.sep))
          throw Error("private/public collision");
      }
      if (!(await fs.stat(folder)).isDirectory())
        throw Error("not a directory");
      await fs.access(folder, 2);
    } catch {
      issues.push(
        "MEDIA_LOCAL_DIR must be an existing writable dedicated directory outside public assets and private media evidence.",
      );
    }
  }
  if (
    process.versions.node.split(".")[0] !== "24" ||
    packageJson.engines.node !== "24.x"
  )
    issues.push("Node 24.x is required.");
  let buildId = null;
  try {
    buildId = (await fs.readFile(".next/BUILD_ID", "utf8")).trim();
  } catch {
    issues.push("A completed production build is required.");
  }
  const migrations = [];
  for (const entry of (
    await fs.readdir("prisma/migrations", { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory())
      migrations.push({
        name: entry.name,
        sha256: hash(
          await fs.readFile(
            path.join("prisma/migrations", entry.name, "migration.sql"),
          ),
        ),
      });
  }
  const staticFiles = [];
  const hashes = new Map();
  async function inventory(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        issues.push("Static asset symlinks require review.");
        continue;
      }
      if (entry.isDirectory()) await inventory(file);
      else if (entry.isFile()) {
        const bytes = await fs.readFile(file),
          digest = hash(bytes);
        staticFiles.push({
          path: file.replaceAll("\\", "/"),
          bytes: bytes.length,
          sha256: digest,
        });
        if (
          bytes.length > 2 * 1024 * 1024 ||
          /\.(dump|bak|sql|zip|backup)$/i.test(file)
        )
          issues.push("Unexpected large/backup public asset requires review.");
        hashes.set(digest, [
          ...(hashes.get(digest) ?? []),
          file.replaceAll("\\", "/"),
        ]);
      }
    }
  }
  await inventory("public");
  const audit = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "scripts/check-public-media.ts",
      ...(buildId ? ["--built"] : []),
    ],
    {
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
        DEMO_MODE: "true",
      },
      encoding: "utf8",
      timeout: 60000,
      windowsHide: true,
    },
  );
  if (audit.status !== 0) issues.push("Read-only public-media audit failed.");
  const readiness = JSON.parse(
    await fs.readFile("docs/media/media-04-publication-readiness.json", "utf8"),
  );
  const report = {
    schemaVersion: 1,
    generatedUtc: new Date().toISOString(),
    kind: "OFFLINE_PREFLIGHT",
    sourceCommit: /^[a-f0-9]{40}$/.test(process.env.RELEASE_COMMIT ?? "")
      ? process.env.RELEASE_COMMIT
      : "UNKNOWN",
    sourceState: "UNVERIFIED_UNCOMMITTED_CHANGES_POSSIBLE",
    runtime: { node: process.versions.node, platform: process.platform },
    packageLockSha256: hash(lock),
    schemaSha256: hash(await fs.readFile("prisma/schema.prisma")),
    migrations,
    buildId,
    configuration: artifactOnly
      ? "NOT TESTED"
      : issues.length
        ? "BLOCKED"
        : "PASS",
    media: {
      state: readiness.allAssetsReadiness,
      assets: readiness.assets.length,
      pendingApprovals: readiness.assets.reduce(
        (sum, a) =>
          sum +
          Object.values(a.approvals).filter((v) => v === "PENDING REVIEW")
            .length,
        0,
      ),
    },
    publicFiles: staticFiles,
    duplicates: [...hashes.values()].filter((files) => files.length > 1),
    tests: "NOT TESTED BY THIS PREFLIGHT",
    databaseState: "NOT CONNECTED",
    persistence: "NOT PROVEN",
    launchApproved: false,
    externalStagingApproved: false,
    issues,
  };
  const output = path.join(root, ".local/phase07/reports");
  await fs.mkdir(output, { recursive: true });
  if (!(await fs.realpath(output)).startsWith(root + path.sep))
    throw Error("Unsafe report output.");
  await fs.writeFile(
    path.join(output, "preflight.json"),
    JSON.stringify(report, null, 2),
  );
  for (const issue of issues) console.error(issue);
  console.log(
    "Offline preflight recorded under ignored .local/phase07/reports; no deployment or database access performed.",
  );
  if (issues.length) process.exitCode = 1;
}
main().catch(() => {
  console.error(
    "Offline rehearsal failed. Inspect configuration and local artifacts; no target credentials are printed.",
  );
  process.exitCode = 1;
});
