
import EmbeddedPostgres from "embedded-postgres";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { randomBytes } from "node:crypto";

// --------------------------------------------------
// 1. Local PostgreSQL configuration
// --------------------------------------------------

mkdirSync(".local", { recursive: true });

const configPath = ".local/postgres-config.json";

const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, "utf8"))
  : {
      user: "sakado_local",
      password: randomBytes(32).toString("hex"),
      port: 55432,
    };

if (!existsSync(configPath)) {
  writeFileSync(configPath, JSON.stringify(config), {
    mode: 0o600,
  });
}

// --------------------------------------------------
// 2. Configure embedded PostgreSQL
// --------------------------------------------------

const pg = new EmbeddedPostgres({
  ...config,
  databaseDir: ".local/postgres",
  persistent: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});

// --------------------------------------------------
// 3. Initialize only when database is missing
// --------------------------------------------------

if (!existsSync(".local/postgres/PG_VERSION")) {
  await pg.initialise();
}

// --------------------------------------------------
// 4. START PostgreSQL
// --------------------------------------------------

// Important: start PostgreSQL before connecting.
await pg.start();

// --------------------------------------------------
// 5. Verify PostgreSQL connection
// --------------------------------------------------

const client = pg.getPgClient("postgres", "127.0.0.1");

await client.connect();

// --------------------------------------------------
// 6. Ensure required databases exist
// --------------------------------------------------

for (const name of ["sakado", "sakado_test"]) {
  const found = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1",
    [name],
  );

  if (!found.rowCount) {
    await pg.createDatabase(name);
  }
}

await client.end();

// --------------------------------------------------
// 7. Preserve existing environment configuration
// --------------------------------------------------

const url =
  `postgresql://${config.user}:${config.password}` +
  `@127.0.0.1:${config.port}/sakado?schema=public`;

let env = existsSync(".env")
  ? readFileSync(".env", "utf8")
  : "";

if (!env.match(/^DATABASE_URL="?postgres/m)) {
  if (
    /^DATABASE_URL=.*file:/m.test(env) &&
    !existsSync(".local/legacy-export.json")
  ) {
    throw Error(
      "Export existing data before changing DATABASE_URL",
    );
  }

  env = /^DATABASE_URL=/m.test(env)
    ? env.replace(
        /^DATABASE_URL=.*$/m,
        `DATABASE_URL="${url}"`,
      )
    : env + `\nDATABASE_URL="${url}"\n`;

  env = /^DEMO_MODE=/m.test(env)
    ? env.replace(/^DEMO_MODE=.*$/m, "DEMO_MODE=false")
    : env + "DEMO_MODE=false\n";

  if (!/^AUTH_SECRET=.+/m.test(env)) {
    env +=
      `\nAUTH_SECRET=${randomBytes(48).toString("hex")}\n`;
  }

  if (!/^ADMIN_URL=/m.test(env)) {
    env += "ADMIN_URL=http://localhost:3000\n";
  }

  writeFileSync(".env", env);
}

// --------------------------------------------------
// 8. PostgreSQL ready
// --------------------------------------------------

console.log(
  `Local PostgreSQL ready on 127.0.0.1:${config.port}. ` +
    "Existing data is persistent; credentials stay " +
    "in ignored local configuration.",
);

// --------------------------------------------------
// 9. Graceful shutdown
// --------------------------------------------------

let stopping = false;

async function stop() {
  if (stopping) return;
  stopping = true;

  try {
    await pg.stop();
    process.exit(0);
  } catch {
    console.error("PostgreSQL shutdown failed.");
    process.exit(1);
  }
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

// --------------------------------------------------
// 10. Keep Node.js running
// --------------------------------------------------

// Keep the launcher active until Ctrl+C or termination.
setInterval(() => {}, 60_000);
