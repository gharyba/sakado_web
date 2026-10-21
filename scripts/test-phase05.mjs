import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

// Always a NEW cluster. Never reads .env, postgres-config.json or the original data directory.
const port = 55435;
await new Promise((done, reject) => {
  const probe = createServer();
  probe.once("error", () =>
    reject(
      Error(
        "Phase 05 test port 55435 is occupied; refusing to reuse any existing database.",
      ),
    ),
  );
  probe.listen(port, "127.0.0.1", () => probe.close(done));
});
const runId = randomBytes(8).toString("hex");
const directory = resolve(`.local/phase05/postgres-${runId}`);
const password = randomBytes(32).toString("hex");
mkdirSync(resolve(".local/phase05"), { recursive: true });
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: "phase05_test",
  password,
  port,
  persistent: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
const env = {
  ...process.env,
  DATABASE_URL: `postgresql://phase05_test:${password}@127.0.0.1:${port}/sakado_test?schema=public`,
  PHASE05_TEST_CLUSTER_DIR: directory,
  DEMO_MODE: "false",
  NEXT_TELEMETRY_DISABLED: "1",
};
async function run(args) {
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, args, {
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? done()
        : reject(Error(`Phase 05 validation command failed (${code}).`)),
    );
  });
}
let validationExitCode = 0;
try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("sakado_test");
  writeFileSync(
    resolve(".local/phase05/cluster-marker.json"),
    JSON.stringify(
      {
        directory,
        port,
        runId,
        purpose: "Disposable Phase 05 synthetic test database only",
      },
      null,
      2,
    ),
  );
  console.log(
    "Fresh isolated Phase 05 cluster ready on loopback:55435; original database excluded.",
  );
  await run(["--import", "tsx", "tests/database.integration.ts"]);
  if (process.argv.includes("--phase10"))
    await run(["--import", "tsx", "tests/phase10-database.ts"]);
  await run([
    "node_modules/@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.phase05.config.ts",
  ]);
  if (process.argv.includes("--phase06") || process.argv.includes("--phase10"))
    await run([
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.phase06.config.ts",
    ]);
  if (process.argv.includes("--phase10"))
    await run([
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.phase10.config.ts",
    ]);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Phase 05 validation failed.",
  );
  validationExitCode = 1;
} finally {
  await pg.stop();
}
// embedded-postgres' async exit hook otherwise replaces process.exitCode on natural exit.
process.exit(validationExitCode);
