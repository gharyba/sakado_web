import test from "node:test";
import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import {
  clientReviewEnabled,
  createReviewSession,
  reviewSessionValid,
  revokeReviewSession,
  reviewAuthorized,
  reviewCookie,
  reviewHash,
  reviewProof,
  reviewCodeValid,
  reviewPathAllowed,
  reviewRequestAllowed,
  clearReviewSessions,
} from "../src/lib/client-review-policy";
import {
  reviewConfigSchema,
  reviewAudience,
  reviewConfigValid,
  assetRemotelyGranted,
} from "../src/lib/client-review-grants";
import { createReviewHandler } from "../src/lib/client-review-http";
import { productionEnvironmentIssues } from "../src/lib/production-env";

const config = () =>
  reviewConfigSchema.parse({
    version: 1,
    allowedEmails: ["reviewer@example.test"],
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    revoked: false,
    grants: [],
  });
function environment() {
  const origin = "https://synthetic-review.trycloudflare.com";
  return {
    NODE_ENV: "production",
    CLIENT_REVIEW: "true",
    CLIENT_REVIEW_ARTIFACT: "true",
    DEMO_MODE: "false",
    CLIENT_DEMO: "false",
    OFFICIAL_PRESENTATION: "false",
    STAGING_MODE: "false",
    CLIENT_REVIEW_DATABASE_VERIFIED: "true",
    CLIENT_REVIEW_ORIGIN: origin,
    SITE_URL: origin,
    ADMIN_URL: origin,
    TRUST_PROXY: "false",
    CLIENT_REVIEW_SECRET: randomBytes(48).toString("hex"),
    CLIENT_REVIEW_CODE_HASH: reviewHash("synthetic-code"),
    CLIENT_REVIEW_AUDIENCE_HASH: reviewAudience(config()),
    CLIENT_REVIEW_STARTED: String(Date.now()),
    DATABASE_URL: "postgresql://synthetic:unused@127.0.0.1:55432/sakado",
    AUTH_SECRET: randomBytes(48).toString("hex"),
  };
}
test("remote review fails closed for incomplete configuration and exact HTTPS origin violations", () => {
  const env = environment();
  assert.equal(clientReviewEnabled(env), true);
  assert.deepEqual(productionEnvironmentIssues(env), []);
  for (const key of Object.keys(env).filter(
    (key) => !["AUTH_SECRET"].includes(key),
  ))
    assert.equal(clientReviewEnabled({ ...env, [key]: "" }), false, key);
  for (const origin of [
    "http://synthetic-review.trycloudflare.com",
    "https://trycloudflare.com",
    "https://synthetic-review.trycloudflare.com.evil.test",
    env.SITE_URL + "/path",
    env.SITE_URL + "/",
    env.SITE_URL + ":443",
  ])
    assert.equal(
      clientReviewEnabled({
        ...env,
        CLIENT_REVIEW_ORIGIN: origin,
        SITE_URL: origin,
        ADMIN_URL: origin,
      }),
      false,
    );
  assert.ok(
    productionEnvironmentIssues({ ...env, CLIENT_REVIEW_SECRET: "" }).length,
  );
  const headers = new Headers({ host: new URL(env.SITE_URL).host });
  assert.equal(reviewRequestAllowed(headers, env), true);
  for (const [name, value] of [
    ["host", "127.0.0.1:3144"],
    ["forwarded", "host=trusted"],
    ["x-forwarded-host", "evil.test"],
    ["x-forwarded-proto", "http"],
    ["origin", "https://evil.test"],
  ]) {
    const changed = new Headers(headers);
    changed.set(name, value);
    assert.equal(reviewRequestAllowed(changed, env), false);
  }
});
test("independent opaque sessions expire, revoke, reject replay across runs and require internal proof", () => {
  const env = environment(),
    now = Date.now();
  const a = createReviewSession(env, now),
    b = createReviewSession(env, now);
  assert.notEqual(a.token, b.token);
  assert.equal(reviewSessionValid(a.token, env, now), true);
  assert.equal(
    reviewSessionValid(
      b.token,
      { ...env, CLIENT_REVIEW_SECRET: randomBytes(48).toString("hex") },
      now,
    ),
    false,
  );
  const headers = new Headers({
    host: new URL(env.SITE_URL).host,
    cookie: `${reviewCookie}=${b.token}`,
    "Cf-Access-Authenticated-User-Email": "reviewer@example.test",
  });
  assert.equal(reviewAuthorized(headers, env, now), false);
  headers.set("x-sakado-review-proof", reviewProof(b.token, env, now));
  assert.equal(reviewAuthorized(headers, env, now), true);
  assert.equal(reviewAuthorized(headers, env, now + 10_000), false);
  headers.set(
    "cookie",
    `${reviewCookie}=${a.token}; ${reviewCookie}=${b.token}`,
  );
  assert.equal(reviewAuthorized(headers, env, now), false);
  revokeReviewSession(b.token);
  assert.equal(reviewSessionValid(b.token, env, now), false);
  assert.equal(reviewSessionValid(a.token, env, a.expires), false);
  assert.equal(reviewCodeValid("synthetic-code", env, now), true);
  assert.equal(
    reviewCodeValid(
      "synthetic-code",
      env,
      Number(env.CLIENT_REVIEW_STARTED) + 300_000,
    ),
    false,
  );
  clearReviewSessions();
});
test("grants are per asset, hash, audience and expiry; pending participant or minor clearance is rejected", () => {
  const current = config(),
    now = Date.now();
  const asset = {
    slot: "partner-0",
    key: "b".repeat(64),
    source: { sha256: "a".repeat(64) },
    derivative: { sha256: "b".repeat(64) },
  };
  const grant = {
    slot: asset.slot,
    sourceSha256: asset.source.sha256,
    derivativeSha256: asset.key,
    purpose: "temporary-remote-client-review",
    authorizedBy: "Synthetic test operator",
    evidenceReference: "SYNTHETIC-ONLY",
    reviewedAt: new Date(now - 1000).toISOString(),
    expiresAt: current.expiresAt,
    ownerAuthorization: "CONFIRMED",
    participantClearance: "NOT_APPLICABLE",
    minorClearance: "NOT_APPLICABLE",
  };
  assert.equal(assetRemotelyGranted(current, asset), false);
  const granted = reviewConfigSchema.parse({ ...current, grants: [grant] });
  assert.equal(assetRemotelyGranted(granted, asset), true);
  assert.equal(
    assetRemotelyGranted(granted, { ...asset, slot: "partner-1" }),
    false,
  );
  assert.equal(
    assetRemotelyGranted(granted, {
      ...asset,
      source: { sha256: "c".repeat(64) },
    }),
    false,
  );
  assert.equal(
    assetRemotelyGranted(granted, asset, Date.parse(current.expiresAt)),
    false,
  );
  assert.equal(
    reviewConfigValid({ ...granted, revoked: true }, reviewAudience(granted)),
    false,
  );
  assert.equal(reviewConfigValid(granted, "d".repeat(64)), false);
  assert.equal(
    reviewConfigSchema.safeParse({
      ...granted,
      allowedEmails: ["*@example.test"],
    }).success,
    false,
  );
  for (const key of [
    "ownerAuthorization",
    "participantClearance",
    "minorClearance",
  ])
    assert.equal(
      reviewConfigSchema.safeParse({
        ...current,
        grants: [{ ...grant, [key]: "PENDING REVIEW" }],
      }).success,
      false,
    );
});
test("only official read-only paths are eligible; admin, dev, media, exports, optimizers and encoded traversal stay blocked", () => {
  for (const path of [
    "/admin",
    "/api/admin/exports",
    "/api/contact",
    "/dev/presentation",
    "/dev/motion",
    "/media/private",
    "/_next/image",
    "/.env",
    "/SAKADO-MEDIA/a.webp",
    "/images/../admin",
    "/%61dmin",
    "//admin",
  ])
    assert.equal(reviewPathAllowed(path), false, path);
  for (const method of ["POST", "PATCH", "PUT", "DELETE"])
    assert.equal(reviewPathAllowed("/contact", method), false);
  assert.equal(reviewPathAllowed("/about"), true);
  assert.equal(reviewPathAllowed("/_next/static/chunks/a.js"), true);
});
test("HTTP ingress enforces independent login, origin, read-only routing, credential stripping and global revocation", async () => {
  const saved = { ...process.env };
  Object.assign(process.env, environment());
  let current = config(),
    nextCalls = 0,
    mediaCalls = 0;
  const server = createServer(
    createReviewHandler({
      config: async () => current,
      media: async () => {
        mediaCalls++;
        return null;
      },
      next: async (req, res) => {
        nextCalls++;
        assert.equal(req.headers.authorization, undefined);
        assert.equal(req.headers.cookie?.includes("admin"), false);
        assert.equal(
          reviewAuthorized(new Headers(req.headers as Record<string, string>)),
          true,
        );
        res.end("official");
      },
    }),
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = (server.address() as { port: number }).port;
  const send = (
    path: string,
    method = "GET",
    extra: Record<string, string> = {},
    body = "",
  ) =>
    new Promise<{
      status: number;
      headers: import("node:http").IncomingHttpHeaders;
    }>((resolve, reject) => {
      const req = httpRequest(
        {
          host: "127.0.0.1",
          port,
          path,
          method,
          headers: {
            host: new URL(process.env.CLIENT_REVIEW_ORIGIN!).host,
            ...extra,
          },
        },
        (res) => {
          res.resume();
          res.once("end", () =>
            resolve({ status: res.statusCode!, headers: res.headers }),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  try {
    assert.equal((await send("/")).status, 303);
    assert.equal(
      (
        await send("/_client-review/media/" + "a".repeat(64), "GET", {
          "Cf-Access-Authenticated-User-Email": "reviewer@example.test",
          "x-sakado-review-proof": "forged",
        })
      ).status,
      404,
    );
    assert.equal(mediaCalls, 0);
    const loginHeaders = {
      origin: process.env.CLIENT_REVIEW_ORIGIN!,
      "content-type": "application/x-www-form-urlencoded",
    };
    assert.equal(
      (
        await send(
          "/_client-review/session",
          "POST",
          { ...loginHeaders, origin: "https://evil.test" },
          "code=synthetic-code",
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await send(
          "/_client-review/session",
          "POST",
          loginHeaders,
          "code=wrong",
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await send(
          "/_client-review/session",
          "POST",
          loginHeaders,
          "x=" + "z".repeat(2000),
        )
      ).status,
      400,
    );
    const opened = await send(
      "/_client-review/session",
      "POST",
      loginHeaders,
      "code=synthetic-code",
    );
    assert.equal(opened.status, 303);
    const setCookie = opened.headers["set-cookie"]![0];
    assert.match(setCookie, /HttpOnly; Secure; SameSite=Strict/);
    assert.match(setCookie, /^__Host-/);
    const cookie = setCookie.split(";")[0];
    assert.equal(
      (
        await send("/", "GET", {
          cookie: cookie + "; admin=synthetic",
          authorization: "ignored",
        })
      ).status,
      200,
    );
    for (const path of [
      "/admin",
      "/api/admin/users",
      "/api/admin/exports",
      "/dev/presentation",
      "/.env",
      "/media/private",
      "/_next/image?url=%2Fdev%2Fpresentation-media%2Fa&w=640&q=75",
    ])
      assert.equal((await send(path, "GET", { cookie })).status, 404);
    assert.equal((await send("/contact", "POST", { cookie })).status, 404);
    assert.equal(
      (await send("/", "GET", { cookie, "next-action": "synthetic" })).status,
      404,
    );
    assert.equal(
      (await send("/", "GET", { cookie, "x-forwarded-host": "evil.test" }))
        .status,
      404,
    );
    assert.equal(
      (await send("/", "GET", { cookie, "sec-fetch-site": "cross-site" }))
        .status,
      404,
    );
    assert.equal(
      (await send("/_client-review/media/" + "a".repeat(64), "GET", { cookie }))
        .status,
      404,
    );
    assert.equal(mediaCalls, 1);
    assert.equal(
      (
        await send("/_client-review/session", "DELETE", {
          cookie,
          origin: process.env.CLIENT_REVIEW_ORIGIN!,
        })
      ).status,
      204,
    );
    assert.equal((await send("/", "GET", { cookie })).status, 303);
    current = { ...current, revoked: true };
    assert.equal((await send("/_client-review")).status, 404);
    current = { ...current, revoked: false };
    let limited = 0;
    for (let attempt = 0; attempt < 11; attempt++)
      limited = (
        await send(
          "/_client-review/session",
          "POST",
          loginHeaders,
          "code=wrong",
        )
      ).status;
    assert.equal(limited, 429);
    assert.equal(nextCalls, 1);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    clearReviewSessions();
    for (const key of Object.keys(process.env))
      if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
