import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

import {
  remoteReviewAssets,
  readRemoteReviewImage,
} from "../src/lib/client-review-media";

import {
  reviewCookie,
  reviewHash,
  createReviewSession,
  reviewProof,
  clearReviewSessions,
} from "../src/lib/client-review-policy";

import {
  reviewAudience,
  type ReviewConfig,
} from "../src/lib/client-review-grants";

import { digest } from "../scripts/presentation-files.mjs";

test("synthetic remote assets require exact grants, live sessions and unchanged sources on every request", async () => {
  const cwd = process.cwd();
  const saved = { ...process.env };

  const root = await fs.mkdtemp(path.join(tmpdir(), "sakado-review-unit-"));

  try {
    process.chdir(root);

    for (const dir of [
      ".local/client-review",
      ".local/official-presentation",
      ".local/client-demo/partners",
      ".local/client-preview",
      "docs/media",
      "SAKADO-MEDIA",
      "originals",
    ]) {
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(
      "docs/media/asset-manifest.json",
      JSON.stringify({
        sourceDirectory: path.resolve("originals"),
      }),
    );

    const source = await sharp({
      create: {
        width: 12,
        height: 12,
        channels: 3,
        background: "#163026",
      },
    })
      .png()
      .toBuffer();

    const derivative = await sharp(source).webp().toBuffer();

    const key = digest(derivative);
    const sourceHash = digest(source);

    const assets = Array.from({ length: 6 }, (_, i) => ({
      key,
      slot: `partner-${i}`,
      label: "Synthetic fixture",
      alt: "Synthetic fixture",
      width: 12,
      height: 12,
      source: {
        root: "client",
        relative: `partners/synthetic-${i}.png`,
        sha256: sourceHash,
      },
      derivative: {
        root: "preview",
        relative: `${key}-480.webp`,
        sha256: key,
      },
    }));

    for (let i = 0; i < 6; i++) {
      await fs.writeFile(
        `.local/client-demo/partners/synthetic-${i}.png`,
        source,
      );
    }

    await fs.writeFile(`.local/client-preview/${key}-480.webp`, derivative);

    await fs.writeFile(
      ".local/official-presentation/catalog.json",
      JSON.stringify({
        version: 1,
        assets,
      }),
    );

    const now = Date.now();

    const config: ReviewConfig = {
      version: 1,
      allowedEmails: ["synthetic@example.test"],
      expiresAt: new Date(now + 3_600_000).toISOString(),
      revoked: false,
      grants: [],
    };

    const writeConfig = () =>
      fs.writeFile(".local/client-review/catalog.json", JSON.stringify(config));

    await writeConfig();

    const origin = "https://synthetic-assets.trycloudflare.com";

    Object.assign(process.env, {
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

      CLIENT_REVIEW_CODE_HASH: reviewHash("synthetic"),

      CLIENT_REVIEW_AUDIENCE_HASH: reviewAudience(config),

      CLIENT_REVIEW_STARTED: String(now),

      // Fake credentials used only in tests.
      DATABASE_URL:
        "postgresql://synthetic:test-fixture@127.0.0.1:55432/sakado",
    });

    const session = createReviewSession();

    const headers = new Headers({
      host: new URL(origin).host,
      cookie: `${reviewCookie}=${session.token}`,
      "x-sakado-review-proof": reviewProof(session.token),
    });

    // No grants: private media must be blocked.
    assert.deepEqual(await remoteReviewAssets(headers), []);

    assert.equal(await readRemoteReviewImage(headers, key), null);

    // Synthetic grants for synthetic files only.
    config.grants = assets.map((asset) => ({
      slot: asset.slot,
      sourceSha256: sourceHash,
      derivativeSha256: key,
      purpose: "temporary-remote-client-review",
      authorizedBy: "Synthetic fixture operator",
      evidenceReference: "SYNTHETIC ONLY — NOT REAL MEDIA APPROVAL",
      reviewedAt: new Date(now - 1000).toISOString(),
      expiresAt: config.expiresAt,
      ownerAuthorization: "CONFIRMED",
      participantClearance: "NOT_APPLICABLE",
      minorClearance: "NOT_APPLICABLE",
    }));

    await writeConfig();

    assert.equal((await remoteReviewAssets(headers)).length, 6);

    const bytes = await readRemoteReviewImage(headers, key);

    assert.deepEqual(bytes, derivative);

    assert.equal((await sharp(bytes!).metadata()).width, 12);

    // A forged identity header must not grant access.
    const anonymous = new Headers({
      host: new URL(origin).host,
      "Cf-Access-Authenticated-User-Email": "synthetic@example.test",
    });

    assert.equal(await readRemoteReviewImage(anonymous, key), null);

    // Removing grants must revoke image access.
    config.grants = [];

    await writeConfig();

    assert.equal(await readRemoteReviewImage(headers, key), null);

    // Grant only one synthetic media slot.
    config.grants = [
      {
        slot: "partner-0",
        sourceSha256: sourceHash,
        derivativeSha256: key,
        purpose: "temporary-remote-client-review",
        authorizedBy: "Synthetic",
        evidenceReference: "SYNTHETIC ONLY",
        reviewedAt: new Date(now - 1000).toISOString(),
        expiresAt: config.expiresAt,
        ownerAuthorization: "CONFIRMED",
        participantClearance: "NOT_APPLICABLE",
        minorClearance: "NOT_APPLICABLE",
      },
    ];

    await writeConfig();

    // Modified original source must be rejected.
    await fs.writeFile(
      ".local/client-demo/partners/synthetic-0.png",
      "synthetic corruption",
    );

    assert.equal(await readRemoteReviewImage(headers, key), null);

    // Restore source.
    await fs.writeFile(".local/client-demo/partners/synthetic-0.png", source);

    // Modified derivative must be rejected.
    await fs.writeFile(
      `.local/client-preview/${key}-480.webp`,
      "synthetic corruption",
    );

    assert.equal(await readRemoteReviewImage(headers, key), null);

    // Path traversal must be denied.
    assert.equal(await readRemoteReviewImage(headers, "../catalog.json"), null);

    // Revoked session must not expose any assets.
    config.revoked = true;

    await writeConfig();

    assert.deepEqual(await remoteReviewAssets(headers), []);
  } finally {
    clearReviewSessions();
    process.chdir(cwd);

    for (const key of Object.keys(process.env)) {
      if (!(key in saved)) {
        delete process.env[key];
      }
    }

    Object.assign(process.env, saved);

    const resolved = await fs.realpath(root);

    assert.equal(path.dirname(resolved), await fs.realpath(tmpdir()));

    assert.ok(path.basename(resolved).startsWith("sakado-review-unit-"));

    await fs.rm(resolved, {
      recursive: true,
      force: true,
    });
  }
});
