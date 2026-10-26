import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { request } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { randomBytes } from "node:crypto";

const directory = ".local/secure-client-preview";
await fs.mkdir(directory, { recursive: true });
const config = JSON.parse(
  await fs.readFile(".local/client-review/catalog.json", "utf8"),
);
const origin =
  config.transport?.origin ?? "https://review-validation.trycloudflare.com";
if (config.grants?.length !== 0)
  throw Error(
    "Browser validation requires the authorized zero-private-grant configuration; no configuration was changed.",
  );
for (const port of [443, 3144, 3145])
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () =>
      reject(
        Error(
          "Validation port occupied; no process will be reused or terminated.",
        ),
      ),
    );
    probe.listen(port, "127.0.0.1", () => probe.close(resolve));
  });
const log = createWriteStream(`${directory}/processes.log`);
const launch = (args, env, ipc = false) => {
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe", ...(ipc ? ["ipc"] : [])],
    windowsHide: true,
  });
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  child.completion = new Promise((resolve) =>
    child.once("exit", (code, signal) => resolve({ code, signal })),
  );
  return child;
};
const ready = async (port, child) => {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode)
      throw Error("Owned validation server exited before readiness.");
    const status = await new Promise((resolve) => {
      const req = request(
        {
          host: "127.0.0.1",
          port,
          path: port === 3144 ? "/_client-review" : "/",
          headers: port === 3144 ? { host: new URL(origin).host } : {},
        },
        (res) => {
          res.resume();
          resolve(res.statusCode);
        },
      );
      req.setTimeout(2000, () => req.destroy());
      req.on("error", () => resolve(0));
      req.end();
    });
    if (status === 200) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw Error("Owned validation server did not become ready.");
};
const stopped = async (child) => {
  let timer;
  try {
    return await Promise.race([
      child.completion,
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              Error(
                "Owned server teardown exceeded 20 seconds; validation failed.",
              ),
            ),
          20_000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};
let preview,
  publicServer,
  tlsProxy,
  result = 1;
try {
  preview = launch(
    ["--import", "tsx", "scripts/start-client-review.ts", `--origin=${origin}`],
    {},
    true,
  );
  await ready(3144, preview);
  publicServer = launch(
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3145",
    ],
    {
      NODE_ENV: "production",
      CLIENT_REVIEW_ARTIFACT: "true",
      CLIENT_REVIEW: "false",
      OFFICIAL_PRESENTATION: "false",
      DEMO_MODE: "false",
      CLIENT_DEMO: "false",
      STAGING_MODE: "false",
      SITE_URL: "https://public-validation.example.test",
      ADMIN_URL: "",
      AUTH_SECRET: randomBytes(48).toString("hex"),
      TRUST_PROXY: "false",
    },
  );
  await ready(3145, publicServer);
  // A real loopback TLS hop covers browser redirect chains too. No request to
  // the assigned public domain is needed or permitted by this test fixture.
  const keyFile = `${directory}/test-tls-key.pem`,
    certFile = `${directory}/test-tls-cert.pem`;
  execFileSync(
    process.env.OPENSSL_EXECUTABLE ||
      (process.platform === "win32"
        ? "C:/Program Files/Git/usr/bin/openssl.exe"
        : "openssl"),
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-sha256",
      "-nodes",
      "-keyout",
      keyFile,
      "-out",
      certFile,
      "-days",
      "1",
      "-subj",
      "/CN=localhost",
      "-addext",
      `subjectAltName=DNS:${new URL(origin).hostname}`,
    ],
    { stdio: "ignore", windowsHide: true },
  );
  tlsProxy = createHttpsServer(
    { key: await fs.readFile(keyFile), cert: await fs.readFile(certFile) },
    (req, res) => {
      if (req.headers.host !== new URL(origin).host) {
        res.writeHead(404);
        res.end();
        return;
      }
      const upstream = request(
        {
          host: "127.0.0.1",
          port: 3144,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, "x-forwarded-proto": "https" },
        },
        (reply) => {
          res.writeHead(reply.statusCode, reply.headers);
          reply.pipe(res);
        },
      );
      upstream.on("error", () => {
        if (!res.headersSent) res.writeHead(502);
        res.end();
      });
      req.pipe(upstream);
    },
  );
  tlsProxy.keepAliveTimeout = 1000;
  tlsProxy.requestTimeout = 15000;
  await new Promise((resolve, reject) => {
    tlsProxy.once("error", reject);
    tlsProxy.listen(443, "127.0.0.1", resolve);
  });
  const tests = spawn(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.client-review.config.ts",
    ],
    {
      stdio: "inherit",
      windowsHide: true,
      env: {
        ...process.env,
        CLIENT_REVIEW_TEST_ORIGIN: origin,
        CLIENT_REVIEW_TEST_TLS: "loopback",
      },
    },
  );
  result = await new Promise((resolve) => tests.once("exit", resolve));
} finally {
  const teardown = [];
  if (tlsProxy)
    await new Promise((resolve) => {
      tlsProxy.close(resolve);
      tlsProxy.closeIdleConnections();
    });
  if (preview && preview.exitCode === null && !preview.signalCode) {
    preview.send("STOP_CLIENT_REVIEW");
    teardown.push({ name: "preview", ...(await stopped(preview)) });
  }
  if (
    publicServer &&
    publicServer.exitCode === null &&
    !publicServer.signalCode
  ) {
    publicServer.kill("SIGTERM");
    teardown.push({ name: "public", ...(await stopped(publicServer)) });
  }
  await fs.writeFile(
    `${directory}/teardown.json`,
    JSON.stringify(teardown, null, 2),
  );
  log.end();
  if (teardown.some((item) => item.name === "preview" && item.code !== 0))
    result = 1;
}
process.exitCode = result ?? 1;
