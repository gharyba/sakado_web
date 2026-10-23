import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import nextEnv from "@next/env";
import pg from "pg";
import {
  securePresentationDirectory,
  writePresentationRuntime,
} from "./presentation-runtime.mjs";
import { preparePresentationCatalog, digest } from "./presentation-files.mjs";

async function main() {
  if (
    process.versions.node.split(".")[0] !== "24" ||
    process.env.NODE_ENV === "production" ||
    process.env.STAGING_MODE === "true" ||
    process.env.DEMO_MODE === "true" ||
    process.env.CLIENT_DEMO === "true"
  )
    throw Error(
      "Official presentation requires local development with demo modes disabled.",
    );
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 1 && args[0] === "--hero=s16"))
    throw Error("Only --hero=s16 is supported.");
  process.env.DEMO_MODE = "false";
  process.env.CLIENT_DEMO = "false";
  nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
  if (
    process.env.NODE_ENV === "production" ||
    (process.env.STAGING_MODE && process.env.STAGING_MODE !== "false")
  )
    throw Error("Staging/production refused.");
  const local = JSON.parse(
    await fs.readFile(".local/postgres-config.json", "utf8"),
  );
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    url.hostname !== "127.0.0.1" ||
    url.port !== "55432" ||
    url.pathname !== "/sakado" ||
    url.username !== local.user ||
    url.password !== local.password
  )
    throw Error("Verified local database required.");
  const db = new pg.Client({
    connectionString: url.href,
    connectionTimeoutMillis: 5000,
  });
  try {
    await db.connect();
    await db.query("BEGIN READ ONLY");
    const id = (
      await db.query(
        "SELECT current_database() AS name, current_setting('data_directory') AS dir",
      )
    ).rows[0];
    if (
      id.name !== "sakado" ||
      (await fs.realpath(id.dir)) !== (await fs.realpath(".local/postgres"))
    )
      throw Error("Database identity refused.");
    await db.query("ROLLBACK");
  } finally {
    await db.end();
  }
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () =>
      reject(Error("Presentation port occupied; no service will be reused.")),
    );
    probe.listen(3134, "127.0.0.1", () => probe.close(resolve));
  });
  const catalog = await preparePresentationCatalog();
  const directory = path.resolve(".local/official-presentation");
  await fs.mkdir(directory, { recursive: true });
  // Reject unexpected explicit grants, establish and verify owner/SYSTEM-only access.
  await securePresentationDirectory(directory);
  const code = randomBytes(24).toString("base64url");
  const accessFile = path.join(directory, "access-code.txt");
  await writePresentationRuntime(
    directory,
    "catalog.json",
    JSON.stringify(catalog),
  );
  await writePresentationRuntime(directory, "access-code.txt", code);
  const started = Date.now();
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3134",
    ],
    {
      stdio: "inherit",
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: "development",
        DEMO_MODE: "false",
        CLIENT_DEMO: "false",
        CLIENT_DEMO_DIRECTORY: "",
        STAGING_MODE: "false",
        OFFICIAL_PRESENTATION: "true",
        PRESENTATION_DATABASE_VERIFIED: "true",
        PRESENTATION_ORIGIN: "http://127.0.0.1:3134",
        PRESENTATION_STARTED: String(started),
        PRESENTATION_SECRET: randomBytes(48).toString("hex"),
        PRESENTATION_CODE_HASH: digest(code),
        PRESENTATION_HERO: args.length ? "s16" : "s08",
        SITE_URL: "",
        ADMIN_URL: "",
        TRUST_PROXY: "false",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  );
  console.log(
    "Official PostgreSQL presentation: http://127.0.0.1:3134/dev/presentation",
  );
  console.log(
    "Enter the code from .local/official-presentation/access-code.txt within five minutes. Session expires after one hour. Never share this file or expose this server.",
  );
  const timer = setTimeout(() => {
    void fs.rm(accessFile, { force: true });
  }, 5 * 60_000);
  timer.unref();
  child.on("exit", (code) => {
    clearTimeout(timer);
    void fs.rm(accessFile, { force: true });
    process.exitCode = code ?? 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => child.kill(signal));
}
main().catch(() => {
  console.error(
    "Official presentation startup refused. Verify local runtime/database, free port and private asset integrity; no settings printed.",
  );
  process.exitCode = 1;
});
