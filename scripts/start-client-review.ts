import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { loadEnvConfig } from "@next/env";
import pg from "pg";
import {
  securePresentationDirectory,
  verifyPresentationDirectory,
  writePresentationRuntime,
} from "./presentation-runtime.mjs";
import {
  clientReviewEnabled,
  clearReviewSessions,
  reviewHash,
  reviewOrigin,
} from "../src/lib/client-review-policy";
import {
  readReviewConfig,
  readRemoteReviewImage,
} from "../src/lib/client-review-media";
import {
  reviewAudience,
  reviewConfigValid,
} from "../src/lib/client-review-grants";
import { createReviewHandler } from "../src/lib/client-review-http";
import { productionEnvironmentIssues } from "../src/lib/production-env";

let stage = "arguments";
async function main() {
  const args = process.argv.slice(2);
  const origin =
    args.length === 1 && args[0].startsWith("--origin=")
      ? reviewOrigin(args[0].slice(9))
      : null;
  if (process.versions.node.split(".")[0] !== "24" || !origin)
    throw Error(
      "A precise supported HTTPS review origin and Node 24 are required.",
    );
  stage = "mode checks";
  if (
    ["DEMO_MODE", "CLIENT_DEMO", "OFFICIAL_PRESENTATION", "STAGING_MODE"].some(
      (key) => process.env[key] === "true",
    )
  )
    throw Error("Conflicting modes refused");
  Object.assign(process.env, {
    DEMO_MODE: "false",
    CLIENT_DEMO: "false",
    OFFICIAL_PRESENTATION: "false",
    STAGING_MODE: "false",
  });
  stage = "environment loading";
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  stage = "local database configuration";
  const local = JSON.parse(
    await fs.readFile(".local/postgres-config.json", "utf8"),
  );
  stage = "database URL checks";
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    url.hostname !== "127.0.0.1" ||
    url.port !== "55432" ||
    url.pathname !== "/sakado" ||
    url.username !== local.user ||
    url.password !== local.password
  )
    throw Error("Verified local database required");
  const db = new pg.Client({
    connectionString: url.href,
    connectionTimeoutMillis: 5000,
  });
  stage = "database identity";
  try {
    await db.connect();
    await db.query("BEGIN READ ONLY");
    const identity = (
      await db.query(
        "SELECT current_database() name, current_setting('data_directory') directory",
      )
    ).rows[0];
    if (
      identity.name !== "sakado" ||
      (await fs.realpath(identity.directory)) !==
        (await fs.realpath(".local/postgres"))
    )
      throw Error("Database identity refused");
    await db.query("ROLLBACK");
  } finally {
    await db.end();
  }
  const directory = path.resolve(".local/client-review");
  stage = "private directory permissions";
  await fs.mkdir(directory, { recursive: true });
  await securePresentationDirectory(directory);
  stage = "review configuration";
  const config = await readReviewConfig();
  if (
    config.transport
      ? origin !== config.transport.origin
      : origin.endsWith(".ngrok-free.dev")
  )
    throw Error("Review origin is not the configured exact origin");
  if (!reviewConfigValid(config, reviewAudience(config)))
    throw Error("Client review configuration unavailable");
  const lock = path.join(directory, "run.lock");
  stage = "exclusive runtime lock";
  await fs.writeFile(lock, String(process.pid), { mode: 0o600, flag: "wx" });
  const accessFile = path.join(directory, "access-code.txt");
  let codeTimer: ReturnType<typeof setTimeout> | undefined,
    expiry: ReturnType<typeof setTimeout> | undefined,
    monitor: ReturnType<typeof setInterval> | undefined;
  let app: Awaited<ReturnType<(typeof import("next"))["default"]>> | undefined;
  let stopped = false;
  const server = createServer();
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(codeTimer);
    clearTimeout(expiry);
    clearInterval(monitor);
    clearReviewSessions();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeIdleConnections();
    });
    await app?.close();
    await (
      globalThis as typeof globalThis & {
        prisma?: { $disconnect(): Promise<void> };
      }
    ).prisma?.$disconnect();
    await fs.rm(accessFile, { force: true });
    await fs.rm(lock, { force: true });
    console.log(
      "Client review stopped; its sessions and viewing code are revoked. PostgreSQL was not stopped.",
    );
    if (process.connected) process.disconnect();
  };
  try {
    const code = randomBytes(24).toString("base64url");
    Object.assign(process.env, {
      NODE_ENV: "production",
      CLIENT_REVIEW: "true",
      CLIENT_REVIEW_ARTIFACT: "true",
      DEMO_MODE: "false",
      CLIENT_DEMO: "false",
      OFFICIAL_PRESENTATION: "false",
      STAGING_MODE: "false",
      CLIENT_DEMO_DIRECTORY: "",
      CLIENT_REVIEW_DATABASE_VERIFIED: "true",
      CLIENT_REVIEW_ORIGIN: origin,
      CLIENT_REVIEW_PROVIDER: config.transport?.provider ?? "cloudflare",
      CLIENT_REVIEW_BOUND_ORIGIN: config.transport?.origin ?? origin,
      CLIENT_REVIEW_STARTED: String(Date.now()),
      CLIENT_REVIEW_SECRET: randomBytes(48).toString("hex"),
      CLIENT_REVIEW_CODE_HASH: reviewHash(code),
      CLIENT_REVIEW_AUDIENCE_HASH: reviewAudience(config),
      SITE_URL: origin,
      ADMIN_URL: origin,
      TRUST_PROXY: "false",
      NEXT_TELEMETRY_DISABLED: "1",
    });
    stage = "production environment validation";
    if (
      !clientReviewEnabled() ||
      productionEnvironmentIssues(process.env).length
    )
      throw Error("Production validation refused");
    await verifyPresentationDirectory(directory);
    stage = "Next production preparation";
    const next = (await import("next")).default;
    app = next({ dev: false, hostname: "127.0.0.1", port: 3144 });
    await app.prepare();
    const handler = app.getRequestHandler();
    server.on(
      "request",
      createReviewHandler({
        config: readReviewConfig,
        media: readRemoteReviewImage,
        next: async (req, res) => {
          await handler(req, res);
        },
      }),
    );
    server.requestTimeout = 15_000;
    server.headersTimeout = 10_000;
    server.keepAliveTimeout = 5000;
    // Exclusive loopback listener; never reuse or terminate any existing service.
    stage = "exclusive loopback port";
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(3144, "127.0.0.1", () => {
        server.removeListener("error", reject);
        resolve();
      });
    });
    stage = "viewing code permissions";
    await writePresentationRuntime(directory, "access-code.txt", code);
    codeTimer = setTimeout(() => {
      void fs.rm(accessFile, { force: true });
    }, 5 * 60_000);
    codeTimer.unref();
    expiry = setTimeout(() => {
      void stop().catch(() => {
        process.exitCode = 1;
      });
    }, 60 * 60_000);
    expiry.unref();
    monitor = setInterval(() => {
      void readReviewConfig()
        .then((current) => {
          if (
            !reviewConfigValid(
              current,
              process.env.CLIENT_REVIEW_AUDIENCE_HASH!,
            )
          )
            return stop();
        })
        .catch(() => stop())
        .catch(() => {
          process.exitCode = 1;
        });
    }, 1000);
    monitor.unref();
    for (const signal of ["SIGINT", "SIGTERM"] as const)
      process.once(signal, () => {
        void stop().catch(() => {
          process.exitCode = 1;
        });
      });
    // The Windows validation runner owns this IPC channel; no network stop endpoint.
    process.on("message", (message) => {
      if (message === "STOP_CLIENT_REVIEW")
        void stop().catch(() => {
          process.exitCode = 1;
        });
    });
    console.log(
      `Read-only client review ready on loopback port 3144; ${config.allowedEmails.length} configured email(s), ${config.grants.length} explicit remote media grant(s).`,
    );
    console.log(
      "Open the exact configured HTTPS origin. Read .local/client-review/access-code.txt locally; do not put it in URLs or logs.",
    );
  } catch (error) {
    await stop();
    throw error;
  }
}
main().catch(() => {
  console.error(
    `Client review startup refused at ${stage}. No settings printed.`,
  );
  process.exitCode = 1;
});
