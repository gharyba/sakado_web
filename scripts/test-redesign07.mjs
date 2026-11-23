import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

// New isolated cluster only. Never reads .env or the real local DB configuration.
const port = 55447;
await new Promise((done, reject) => {
  const probe = createServer();
  probe.once("error", () =>
    reject(
      Error("Redesign 07 test database port is occupied; refusing reuse."),
    ),
  );
  probe.listen(port, "127.0.0.1", () => probe.close(done));
});
const directory = resolve(
  `.local/redesign07/postgres-${randomBytes(8).toString("hex")}`,
);
mkdirSync(resolve(".local/redesign07"), { recursive: true });
const password = randomBytes(32).toString("hex");
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: "redesign07_test",
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
  DATABASE_URL: `postgresql://redesign07_test:${password}@127.0.0.1:${port}/sakado_redesign07_test?schema=public`,
  REDESIGN07_CLUSTER_DIR: directory,
  DEMO_MODE: "false",
  CLIENT_DEMO: "false",
  OFFICIAL_PRESENTATION: "false",
  STAGING_MODE: "false",
  SITE_URL: "https://redesign07.example.test",
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
        : reject(Error(`Redesign 07 command failed (${code}).`)),
    );
  });
}
let result = 0;
try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("sakado_redesign07_test");
  const client = pg.getPgClient("sakado_redesign07_test", "127.0.0.1");
  await client.connect();
  const identity = (
    await client.query(
      "SELECT current_database() AS name, current_user AS actor, current_setting('data_directory') AS directory",
    )
  ).rows[0];
  await client.end();
  if (
    identity.name !== "sakado_redesign07_test" ||
    identity.actor !== "redesign07_test" ||
    realpathSync(identity.directory) !== realpathSync(directory)
  )
    throw Error("Disposable database identity refused.");
  await run(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
  console.log(
    "Redesign 07: fresh verified disposable database; no real records or private photos used as fixtures.",
  );
  await run([
    "node_modules/@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.redesign07.config.ts",
    ...process.argv.slice(2),
  ]);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Redesign 07 validation failed.",
  );
  result = 1;
} finally {
  await pg.stop();
}
process.exit(result);
