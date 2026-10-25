import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

// New isolated cluster only. Never reads .env or the real local DB configuration.
const port = 55446;
await new Promise((done, reject) => {
  const probe = createServer();
  probe.once("error", () =>
    reject(
      Error("Redesign 06 test database port is occupied; refusing reuse."),
    ),
  );
  probe.listen(port, "127.0.0.1", () => probe.close(done));
});
const directory = resolve(
  `.local/redesign06/postgres-${randomBytes(8).toString("hex")}`,
);
mkdirSync(resolve(".local/redesign06"), { recursive: true });
const password = randomBytes(32).toString("hex");
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: "redesign06_test",
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
  DATABASE_URL: `postgresql://redesign06_test:${password}@127.0.0.1:${port}/sakado_redesign06_test?schema=public`,
  REDESIGN06_CLUSTER_DIR: directory,
  DEMO_MODE: "false",
  CLIENT_DEMO: "false",
  OFFICIAL_PRESENTATION: "false",
  STAGING_MODE: "false",
  SITE_URL: "https://redesign06.example.test",
  ADMIN_URL: "",
  AUTH_SECRET: randomBytes(48).toString("hex"),
  TRUST_PROXY: "false",
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
        : reject(Error(`Redesign 06 command failed (${code}).`)),
    );
  });
}
let result = 0;
try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("sakado_redesign06_test");
  const client = pg.getPgClient("sakado_redesign06_test", "127.0.0.1");
  await client.connect();
  const identity = (
    await client.query(
      "SELECT current_database() AS name, current_user AS actor, current_setting('data_directory') AS directory",
    )
  ).rows[0];
  await client.end();
  if (
    identity.name !== "sakado_redesign06_test" ||
    identity.actor !== "redesign06_test" ||
    realpathSync(identity.directory) !== realpathSync(directory)
  )
    throw Error("Disposable database identity refused.");
  await run(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
  console.log(
    "Redesign 06: fresh verified disposable database; no real records or private photos used as fixtures.",
  );
  await run([
    "node_modules/@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.redesign06.config.ts",
    ...process.argv.slice(2),
  ]);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Redesign 06 validation failed.",
  );
  result = 1;
} finally {
  await pg.stop();
}
process.exit(result);
