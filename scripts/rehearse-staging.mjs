import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import EmbeddedPostgres from "embedded-postgres";
import { PrismaClient } from "@prisma/client";
import { rehearsalTargetAllowed } from "../src/lib/staging-policy.ts";
import {
  verifyPassword,
  newSessionToken,
  tokenHash,
} from "../src/lib/security.ts";

// No supplied DATABASE_URL is ever consumed. All mutation targets belong to this run.
const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args[i + 1];
};
const pgBin = option("--pg-bin");
const rollbackDir = option("--rollback-dir");
const port = 55438,
  appPort = 3127;
const root = process.cwd();
const runId = randomBytes(8).toString("hex");
const relativeRun = `.local/phase07/run-${runId}`;
const runRoot = path.resolve(relativeRun),
  clusterDir = path.join(runRoot, "postgres");
const password = randomBytes(32).toString("hex");
const adminPassword = randomBytes(24).toString("base64url");
const authSecret = randomBytes(48).toString("base64url");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const sourceUrl = `postgresql://phase07_test:${password}@127.0.0.1:${port}/sakado_rehearsal?schema=public`;
const restoreUrl = sourceUrl.replace("/sakado_rehearsal?", "/sakado_restore?");
const systemEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) =>
    /^(PATH|SYSTEMROOT|WINDIR|TEMP|TMP|USERPROFILE|HOME|APPDATA|LOCALAPPDATA|COMSPEC|PATHEXT|LANG|LC_ALL)$/i.test(
      key,
    ),
  ),
);
const env = {
  ...systemEnv,
  NODE_ENV: "production",
  DATABASE_URL: sourceUrl,
  AUTH_SECRET: authSecret,
  SITE_URL: "https://staging.example.invalid",
  ADMIN_URL: "",
  DEMO_MODE: "false",
  STAGING_MODE: "true",
  TRUST_PROXY: "false",
  MEDIA_STORAGE: "local",
  MEDIA_LOCAL_DIR: `${relativeRun}/storage`,
  NEXT_TELEMETRY_DISABLED: "1",
  PORT: String(appPort),
  CONTACT_EMAIL: "",
  CONTACT_PHONE: "",
  CONTACT_ADDRESS: "",
  WHATSAPP_NUMBER: "",
};
const report = {
  schemaVersion: 1,
  generatedUtc: new Date().toISOString(),
  platform: process.platform,
  node: process.versions.node,
  syntheticOnly: true,
  steps: [],
  backup: null,
  restore: null,
  storage: null,
  rollback: "NOT TESTED",
  launchApproved: false,
};
let currentStep = "initial safety",
  server,
  pg,
  source,
  restored;
async function step(name, task) {
  currentStep = name;
  await task();
  report.steps.push({ name, status: "PASS" });
  console.log(name + ": PASS");
}
async function freePort(value) {
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () =>
      reject(Error("Rehearsal port occupied; refusing to reuse a service.")),
    );
    probe.listen(value, "127.0.0.1", () => probe.close(resolve));
  });
}
async function run(label, commandArgs, extra = {}, cwd = root, expected = 0) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, commandArgs, {
      cwd,
      env: { ...env, ...extra },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const capture = (chunk) => {
      if (output.length < 2_000_000) output += chunk;
    };
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    const timer = setTimeout(() => {
      child.kill();
      reject(Error(label + " timed out."));
    }, 120000);
    child.once("error", () => {
      clearTimeout(timer);
      reject(Error(label + " could not start."));
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
  if (result.code !== expected)
    throw Error(label + " returned an unexpected status.");
  for (const secret of [password, adminPassword, authSecret, sourceUrl])
    assert.ok(
      !result.output.includes(secret),
      "Child output leaked synthetic credentials.",
    );
  return result.output;
}
async function verifyTarget(db, url, name) {
  assert.ok(rehearsalTargetAllowed(url, name));
  const [actual] = await db.$queryRawUnsafe("SHOW data_directory");
  assert.equal(
    await fs.realpath(actual.data_directory),
    await fs.realpath(clusterDir),
  );
  const [identity] =
    await db.$queryRaw`SELECT current_database() AS database, current_user AS username`;
  assert.equal(identity.database, name);
  assert.equal(identity.username, "phase07_test");
}
async function fingerprint(db) {
  const tables =
    await db.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
  const rows = {};
  for (const { tablename } of tables) {
    assert.ok(/^[A-Za-z_][A-Za-z0-9_]*$/.test(tablename));
    const data = await db.$queryRawUnsafe(
      `SELECT to_jsonb(t)::text AS row FROM public."${tablename}" t`,
    );
    rows[tablename] = {
      count: data.length,
      sha256: hash(
        data
          .map((v) => v.row)
          .sort()
          .join("\n"),
      ),
    };
  }
  const columns =
    await db.$queryRaw`SELECT table_name,column_name,ordinal_position,data_type,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position`;
  const indexes =
    await db.$queryRaw`SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename,indexname`;
  const constraints =
    await db.$queryRaw`SELECT c.relname,k.conname,pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' ORDER BY c.relname,k.conname`;
  const enums =
    await db.$queryRaw`SELECT t.typname,e.enumlabel,e.enumsortorder FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' ORDER BY t.typname,e.enumsortorder`;
  return {
    rows,
    schemaSha256: hash(
      JSON.stringify({ columns, indexes, constraints, enums }),
    ),
  };
}
async function start(extra = {}, cwd = root, hostinger = false) {
  await freePort(appPort);
  let output = "";
  const child = spawn(
    process.execPath,
    ["scripts/start.mjs", ...(hostinger ? ["--hostinger"] : [])],
    {
      cwd,
      env: { ...env, ...extra },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server = child;
  child.stdout.on("data", (chunk) => {
    if (output.length < 1_000_000) output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    if (output.length < 1_000_000) output += chunk;
  });
  child.once("error", () => {});
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null)
      throw Error("Rehearsal application failed to start.");
    try {
      const response = await fetch(`http://127.0.0.1:${appPort}/api/health`, {
        signal: AbortSignal.timeout(1500),
      });
      for (const secret of [password, adminPassword, authSecret])
        assert.ok(!output.includes(secret));
      return response;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw Error("Application readiness timed out.");
}
async function stop() {
  if (!server) return;
  const child = server;
  server = undefined;
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
  else child.kill("SIGTERM");
  for (
    let i = 0;
    i < 50 && child.exitCode === null && child.signalCode === null;
    i++
  )
    await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(
    child.exitCode !== null || child.signalCode !== null,
    "Owned application did not stop.",
  );
}
async function http(url, options) {
  return fetch(`http://127.0.0.1:${appPort}${url}`, {
    ...options,
    signal: AbortSignal.timeout(15000),
  });
}
async function pgTool(name, toolArgs, database) {
  assert.ok(pgBin, "Explicit existing PostgreSQL tool directory required.");
  const url = database === "sakado_restore" ? restoreUrl : sourceUrl;
  const target = database === "sakado_restore" ? restored : source;
  await verifyTarget(target, url, database);
  const command = path.join(
    pgBin,
    name + (process.platform === "win32" ? ".exe" : ""),
  );
  const result = spawnSync(command, toolArgs, {
    env: {
      ...systemEnv,
      PGHOST: "127.0.0.1",
      PGPORT: String(port),
      PGUSER: "phase07_test",
      PGPASSWORD: password,
      PGDATABASE: database,
      PGCONNECT_TIMEOUT: "5",
      PGOPTIONS:
        name === "pg_dump" ? "-c default_transaction_read_only=on" : "",
    },
    encoding: "utf8",
    timeout: 120000,
    windowsHide: true,
  });
  if (result.error || result.status !== 0)
    throw Error("PostgreSQL rehearsal tool failed.");
  assert.ok(!(result.stdout + result.stderr).includes(password));
  return result.stdout;
}
async function main() {
  if (
    args.some((arg, i) =>
      i % 2 === 0
        ? !["--pg-bin", "--rollback-dir"].includes(arg)
        : !arg || arg.startsWith("--"),
    ) ||
    args.length % 2
  )
    throw Error("Unsupported rehearsal arguments.");
  await step("owned target safety", async () => {
    assert.equal(process.versions.node.split(".")[0], "24");
    await fs.access(".next/BUILD_ID");
    await freePort(port);
    await freePort(appPort);
    await fs.mkdir(runRoot, { recursive: true });
    assert.ok(
      (await fs.realpath(runRoot)).startsWith(
        (await fs.realpath(root)) + path.sep,
      ),
    );
    await fs.mkdir(env.MEDIA_LOCAL_DIR, { recursive: true });
    report.candidateBuildId = (
      await fs.readFile(".next/BUILD_ID", "utf8")
    ).trim();
    pg = new EmbeddedPostgres({
      databaseDir: clusterDir,
      user: "phase07_test",
      password,
      port,
      persistent: true,
      authMethod: "scram-sha-256",
      postgresFlags: ["-h", "127.0.0.1"],
      onLog: () => {},
      onError: () => {},
    });
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("sakado_rehearsal");
    await pg.createDatabase("sakado_restore");
    source = new PrismaClient({ datasourceUrl: sourceUrl });
    restored = new PrismaClient({ datasourceUrl: restoreUrl });
    await verifyTarget(source, sourceUrl, "sakado_rehearsal");
    await verifyTarget(restored, restoreUrl, "sakado_restore");
  });
  await step("offline artifact and configuration preflight", () =>
    run("Preflight", ["scripts/rehearse-deployment.mjs"]),
  );
  await step("reviewed migrations and Prisma compatibility", async () => {
    await verifyTarget(source, sourceUrl, "sakado_rehearsal");
    await run("Prisma deploy", [
      "node_modules/prisma/build/index.js",
      "migrate",
      "deploy",
    ]);
    await run("Prisma status", [
      "node_modules/prisma/build/index.js",
      "migrate",
      "status",
    ]);
    assert.equal(await source.event.count(), 0);
  });
  let owner, event, media;
  await step("first owner provisioning and duplicate protection", async () => {
    await verifyTarget(source, sourceUrl, "sakado_rehearsal");
    const inputs = {
      ADMIN_NAME: "Synthetic staging owner",
      ADMIN_EMAIL: "owner@example.invalid",
      ADMIN_PASSWORD: adminPassword,
    };
    await run(
      "Owner provisioning",
      ["--import", "tsx", "scripts/create-admin.ts"],
      inputs,
    );
    owner = await source.adminUser.findFirstOrThrow({
      where: { role: "OWNER" },
    });
    assert.ok(owner.passwordHash.startsWith("$argon2id$"));
    assert.ok(await verifyPassword(adminPassword, owner.passwordHash));
    await run(
      "Duplicate owner rejection",
      ["--import", "tsx", "scripts/create-admin.ts"],
      inputs,
      root,
      1,
    );
    assert.equal(await source.adminUser.count({ where: { role: "OWNER" } }), 1);
    assert.equal(
      await source.auditLog.count({
        where: { action: "INITIAL_OWNER_CREATED" },
      }),
      1,
    );
  });
  await step("synthetic storage adapter and content", async () => {
    await run("Storage write", [
      "--conditions=react-server",
      "--import",
      "tsx",
      "scripts/staging-storage.ts",
      "write",
    ]);
    media = JSON.parse(
      await fs.readFile(
        path.join(root, env.MEDIA_LOCAL_DIR, "synthetic-object.json"),
        "utf8",
      ),
    );
    await source.galleryImage.create({
      data: {
        src: media.src,
        alt: "Generated staging test swatch",
        authorized: true,
        published: true,
        source: "CONFIRMED",
      },
    });
    event = await source.event.create({
      data: {
        slug: "synthetic-staging",
        title: "Synthetic staging rehearsal",
        shortDescription: "Synthetic test only",
        description: "Not a business offer",
        status: "UPCOMING",
        registrationStatus: "OPEN",
        startsAt: new Date(Date.now() + 86400000 * 40),
        published: true,
        source: "CONFIRMED",
        capacity: 2,
      },
    });
  });
  await step("operational startup, health, headers and noindex", async () => {
    const health = await start();
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });
    assert.ok(health.headers.get("cache-control").includes("no-store"));
    for (const url of [
      "/",
      "/events",
      "/adventures",
      "/events/" + event.slug,
      "/contact",
      "/admin/login",
    ]) {
      const response = await http(url);
      assert.equal(response.status, 200);
      assert.ok(response.headers.get("x-robots-tag").includes("noindex"));
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(response.headers.get("x-frame-options"), "DENY");
      assert.ok(
        response.headers
          .get("content-security-policy")
          .includes("frame-ancestors 'none'"),
      );
    }
    assert.ok(
      (await (await http("/robots.txt")).text()).includes("Disallow: /"),
    );
    assert.ok(!(await (await http("/sitemap.xml")).text()).includes("<loc>"));
    assert.equal(
      (await http("/api/admin/exports?eventId=" + event.id)).status,
      401,
    );
    assert.equal((await http("/admin", { redirect: "manual" })).status, 307);
  });
  await step("storage survives application restart", async () => {
    const before = await http(media.src);
    assert.equal(before.status, 200);
    assert.equal(hash(Buffer.from(await before.arrayBuffer())), media.sha256);
    const dynamicOptimized = await http(
      `/_next/image?url=${encodeURIComponent(media.src)}&w=640&q=75`,
      { headers: { Accept: "image/webp" } },
    );
    assert.equal(dynamicOptimized.status, 400);
    const optimized = await http(
      "/_next/image?url=%2Fadmin%2Ficon-192.png&w=640&q=75",
      { headers: { Accept: "image/webp" } },
    );
    assert.equal(optimized.status, 200);
    assert.ok(optimized.headers.get("content-type").startsWith("image/"));
    report.imageOptimization = {
      dynamicMediaRejected: true,
      source: "public static icon only",
      status: optimized.status,
      bytes: (await optimized.arrayBuffer()).byteLength,
      contentType: optimized.headers.get("content-type"),
    };
    await stop();
    await run("Storage restart verification", [
      "--conditions=react-server",
      "--import",
      "tsx",
      "scripts/staging-storage.ts",
      "verify",
    ]);
    await start();
    const after = await http(media.src);
    assert.equal(after.status, 200);
    assert.equal(hash(Buffer.from(await after.arrayBuffer())), media.sha256);
    await stop();
    report.storage = {
      restart: "PASS",
      processRestartHash: media.sha256,
      managedRedeploy: "NOT TESTED",
      durableExternalStorage: "BLOCKED",
    };
  });
  await step("storage failure has no publication side effects", async () => {
    const failure = `${relativeRun}/unwritable-parent`;
    await fs.writeFile(failure, "Synthetic obstruction");
    const count = await source.galleryImage.count();
    await start({ MEDIA_LOCAL_DIR: failure + "/storage" });
    const token = newSessionToken();
    await source.adminSession.create({
      data: {
        adminId: owner.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    const form = new FormData();
    form.set("alt", "Synthetic test swatch");
    form.set(
      "file",
      new Blob(
        [await fs.readFile(path.join(env.MEDIA_LOCAL_DIR, media.src.slice(7)))],
        { type: "image/webp" },
      ),
      "synthetic.webp",
    );
    const response = await http("/api/admin/media", {
      method: "POST",
      headers: {
        Origin: `http://127.0.0.1:${appPort}`,
        Cookie: "sakado_admin_session=" + token,
      },
      body: form,
    });
    report.storageFailure = {
      status: response.status,
      galleryCountBefore: count,
      galleryCountAfter: await source.galleryImage.count(),
    };
    assert.equal(response.status, 503);
    assert.ok(
      !(await response.text()).match(
        /Prisma|\.local|ENOENT|ENOTDIR|password|postgresql/i,
      ),
    );
    assert.equal(await source.galleryImage.count(), count);
    await stop();
  });
  let before;
  await step("complete synthetic backup and archive verification", async () => {
    assert.ok(pgBin);
    await verifyTarget(source, sourceUrl, "sakado_rehearsal");
    before = await fingerprint(source);
    const dump = path.join(runRoot, "synthetic.custom.dump");
    await pgTool(
      "pg_dump",
      ["--format=custom", "--no-password", "--file=" + dump],
      "sakado_rehearsal",
    );
    const bytes = await fs.readFile(dump);
    assert.ok(bytes.length > 5);
    assert.equal(bytes.subarray(0, 5).toString(), "PGDMP");
    const listing = await pgTool(
      "pg_restore",
      ["--list", dump],
      "sakado_restore",
    );
    assert.ok(listing.includes("TABLE DATA"));
    report.backup = {
      format: "custom",
      bytes: bytes.length,
      sha256: hash(bytes),
      tables: Object.keys(before.rows).length,
      syntheticOnly: true,
    };
  });
  await step("separate restore schema and all-row verification", async () => {
    await verifyTarget(restored, restoreUrl, "sakado_restore");
    await pgTool(
      "pg_restore",
      [
        "--exit-on-error",
        "--single-transaction",
        "--no-owner",
        "--no-privileges",
        "--no-password",
        "--dbname=sakado_restore",
        path.join(runRoot, "synthetic.custom.dump"),
      ],
      "sakado_restore",
    );
    assert.deepEqual(await fingerprint(restored), before);
    assert.deepEqual(await fingerprint(source), before);
    assert.equal(await restored.adminUser.count(), 1);
    assert.equal(await restored.event.count(), 1);
    const health = await start({ DATABASE_URL: restoreUrl });
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });
    assert.equal((await http("/events/" + event.slug)).status, 200);
    await stop();
    report.restore = {
      verified: true,
      sourceUnchanged: true,
      schemaSha256: before.schemaSha256,
      rows: before.rows,
      applicationSmoke: "PASS",
    };
  });
  if (rollbackDir)
    await step("previous release application rollback", async () => {
      const previous = await fs.realpath(rollbackDir);
      assert.notEqual(previous, await fs.realpath(root));
      await fs.access(path.join(previous, ".next/BUILD_ID"));
      await fs.access(path.join(previous, "scripts/start.mjs"));
      assert.notEqual(
        (
          await fs.readFile(path.join(previous, ".next/BUILD_ID"), "utf8")
        ).trim(),
        report.candidateBuildId,
      );
      const snapshot = await fingerprint(source);
      const response = await start(
        { MEDIA_LOCAL_DIR: path.resolve(env.MEDIA_LOCAL_DIR) },
        previous,
      );
      assert.equal(response.status, 200);
      assert.equal((await http("/events/" + event.slug)).status, 200);
      const served = await http(media.src);
      assert.equal(served.status, 200);
      assert.equal(hash(Buffer.from(await served.arrayBuffer())), media.sha256);
      assert.equal(
        (
          await http(
            `/_next/image?url=${encodeURIComponent(media.src)}&w=640&q=75`,
          )
        ).status,
        400,
      );
      await stop();
      assert.deepEqual(await fingerprint(source), snapshot);
      await start();
      assert.equal((await http("/api/health")).status, 200);
      await stop();
      report.rollback = {
        previousBuildId: (
          await fs.readFile(path.join(previous, ".next/BUILD_ID"), "utf8")
        ).trim(),
        databaseUnchanged: true,
        mediaHashUnchanged: true,
        candidateRestored: true,
      };
      report.storage.localReleaseSwitch = "PASS";
    });
  await step("invalid environment fail-fast matrix", async () => {
    for (const patch of [
      { AUTH_SECRET: "" },
      { DATABASE_URL: "mysql://invalid" },
      { DEMO_MODE: "wrong" },
      { MEDIA_STORAGE: "unsupported" },
      { SITE_URL: "http://staging.example.invalid" },
      { STAGING_MODE: "wrong" },
    ])
      await run(
        "Invalid startup rejection",
        ["scripts/start.mjs"],
        patch,
        root,
        1,
      );
    await run(
      "Hostname override rejection",
      ["scripts/start.mjs", "-H", "0.0.0.0"],
      {},
      root,
      1,
    );
    const noBuild = path.join(runRoot, "missing-build");
    await fs.mkdir(noBuild);
    const failure = await run(
      "Missing build rejection",
      [path.resolve("scripts/start.mjs")],
      {},
      noBuild,
      1,
    );
    assert.ok(failure.includes("A completed production build is required."));
  });
  await step("database outage and demo health", async () => {
    await verifyTarget(source, sourceUrl, "sakado_rehearsal");
    const outageToken = newSessionToken();
    await source.adminSession.create({
      data: {
        adminId: owner.id,
        tokenHash: tokenHash(outageToken),
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    const unavailable = await start({
      DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
    });
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { status: "unavailable" });
    assert.equal(
      (await http("/api/admin/exports?eventId=synthetic")).status,
      401,
    );
    const privateFailure = await http("/api/admin/events", {
      method: "POST",
      headers: {
        Cookie: "sakado_admin_session=" + outageToken,
        Origin: `http://127.0.0.1:${appPort}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(privateFailure.status, 503);
    assert.deepEqual(await privateFailure.json(), {
      error: "Service indisponible. Réessayez dans quelques instants.",
    });
    const publicFailure = await http("/events");
    const publicBody = await publicFailure.text();
    assert.ok([200, 500].includes(publicFailure.status)); // Streaming may commit status before the error boundary.
    assert.ok(
      !/PrismaClient|postgresql:\/\/|\.local[\\/]|ECONNREFUSED|Can't reach database/.test(
        publicBody,
      ),
    );
    assert.ok(publicBody.length > 0);
    report.databaseOutage = {
      health: 503,
      sessionLookupFailure: 503,
      publicStatus: publicFailure.status,
      privateResponseSanitized: true,
      publicResponseSanitized: true,
    };
    await stop();
    const demo = await start({
      DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
      DEMO_MODE: "true",
    });
    assert.equal(demo.status, 200);
    assert.deepEqual(await demo.json(), { status: "ok", mode: "demo" });
    await stop();
  });
  await step("synthetic object cleanup", async () => {
    await verifyTarget(source, sourceUrl, "sakado_rehearsal");
    await source.galleryImage.deleteMany({ where: { src: media.src } });
    await run("Storage cleanup", [
      "--conditions=react-server",
      "--import",
      "tsx",
      "scripts/staging-storage.ts",
      "remove",
    ]);
    await verifyTarget(restored, restoreUrl, "sakado_restore");
    await restored.$disconnect();
    restored = undefined;
    await pg.dropDatabase("sakado_restore");
  });
}
let exitCode = 0;
try {
  await main();
} catch (error) {
  const line = /rehearse-staging\.mjs:(\d+):\d+/.exec(
    error instanceof Error ? (error.stack ?? "") : "",
  )?.[1];
  report.steps.push({
    name: currentStep,
    status: "FAIL",
    ...(line ? { scriptLine: Number(line) } : {}),
  });
  console.error(
    "Controlled rehearsal failed at: " +
      currentStep +
      (line ? " (script line " + line + ")" : "") +
      ". No real database target was used.",
  );
  exitCode = 1;
} finally {
  const cleanup = {
    application: "NOT STARTED",
    databaseClients: "PASS",
    ownedCluster: "NOT CREATED",
  };
  await stop()
    .then(() => {
      cleanup.application = "PASS";
    })
    .catch(() => {
      cleanup.application = "FAIL";
      exitCode = 1;
    });
  await Promise.all([source?.$disconnect(), restored?.$disconnect()]).catch(
    () => {
      cleanup.databaseClients = "FAIL";
      exitCode = 1;
    },
  );
  if (pg)
    await pg
      .stop()
      .then(async () => {
        await freePort(port);
        cleanup.ownedCluster = "PASS";
      })
      .catch(() => {
        cleanup.ownedCluster = "FAIL";
        exitCode = 1;
      });
  report.cleanup = cleanup;
  await fs.mkdir(runRoot, { recursive: true });
  await fs.writeFile(
    path.join(runRoot, "rehearsal-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    "Synthetic rehearsal report saved under ignored " +
      relativeRun +
      ". Cleanup status recorded; no launch authorization.",
  );
}
process.exit(exitCode);
