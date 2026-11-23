import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

import {
  reviewOrigin,
  clientReviewEnabled,
  reviewHash,
} from "../src/lib/client-review-policy";

import {
  reviewConfigSchema,
  reviewAudience,
  reviewConfigValid,
  type ReviewConfig,
} from "../src/lib/client-review-grants";

import {
  ngrokTrafficPolicy,
  ngrokPolicyBytes,
  assertNgrokPolicy,
} from "../src/lib/client-review-ngrok";

import { readReviewConfig } from "../src/lib/client-review-media";

const emails = ["developer@example.test", "client@example.test"];

function configuration(): ReviewConfig {
  return reviewConfigSchema.parse({
    version: 1,
    allowedEmails: emails,
    revoked: false,
    grants: [],
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),

    transport: {
      provider: "ngrok",
      origin: "https://synthetic-assigned.ngrok-free.dev",
      policySha256: reviewHash(ngrokPolicyBytes(emails)),
    },
  });
}

test("ngrok requires canonical HTTPS and the runtime origin pinned by its operator configuration", () => {
  const config = configuration();
  const origin = config.transport!.origin;

  const env = {
    CLIENT_REVIEW: "true",
    NODE_ENV: "production",
    CLIENT_REVIEW_ARTIFACT: "true",

    DEMO_MODE: "false",
    CLIENT_DEMO: "false",
    OFFICIAL_PRESENTATION: "false",
    STAGING_MODE: "false",

    CLIENT_REVIEW_DATABASE_VERIFIED: "true",
    CLIENT_REVIEW_ORIGIN: origin,
    CLIENT_REVIEW_BOUND_ORIGIN: origin,
    CLIENT_REVIEW_PROVIDER: "ngrok",

    SITE_URL: origin,
    ADMIN_URL: origin,
    TRUST_PROXY: "false",

    CLIENT_REVIEW_SECRET: randomBytes(48).toString("hex"),

    CLIENT_REVIEW_CODE_HASH: reviewHash("synthetic"),

    CLIENT_REVIEW_AUDIENCE_HASH: reviewAudience(config),

    CLIENT_REVIEW_STARTED: String(Date.now()),

    // Synthetic credentials only.
    DATABASE_URL: "postgresql://synthetic:test-fixture@127.0.0.1:55432/sakado",
  };

  assert.equal(clientReviewEnabled(env), true);

  for (const invalid of [
    "http://synthetic-assigned.ngrok-free.dev",
    origin + "/",
    origin + ":443",
    origin + "/path",
    origin + "?q=1",
    origin + "#fragment",
    "https://synthetic-assigned.ngrok-free.dev.evil.test",
    "https://ngrok-free.dev",
    "https://synthetic-assigned.ngrok-free.app",
    "https://user@synthetic-assigned.ngrok-free.dev",
  ]) {
    assert.equal(reviewOrigin(invalid), null, invalid);
  }

  assert.equal(
    clientReviewEnabled({
      ...env,
      CLIENT_REVIEW_PROVIDER: "",
    }),
    false,
  );

  assert.equal(
    clientReviewEnabled({
      ...env,
      CLIENT_REVIEW_BOUND_ORIGIN: "https://other.ngrok-free.dev",
    }),
    false,
  );

  assert.equal(
    clientReviewEnabled({
      ...env,
      CLIENT_REVIEW_ORIGIN: "https://other.ngrok-free.dev",
      SITE_URL: "https://other.ngrok-free.dev",
      ADMIN_URL: "https://other.ngrok-free.dev",
    }),
    false,
  );
});

test("Google OAuth precedes an exact email deny rule for every method/path; weaker policies never validate", () => {
  const config = configuration();

  const bytes = ngrokPolicyBytes(emails);
  const policy = ngrokTrafficPolicy(emails);

  assert.deepEqual(policy.on_http_request[0], {
    actions: [
      {
        type: "oauth",
        config: {
          provider: "google",
        },
      },
    ],
  });

  assert.deepEqual(policy.on_http_request[1], {
    expressions: [
      '!(actions.ngrok.oauth.identity.email in ["client@example.test","developer@example.test"])',
    ],
    actions: [
      {
        type: "deny",
        config: {
          status_code: 403,
        },
      },
    ],
  });

  assert.doesNotThrow(() => assertNgrokPolicy(config, bytes));

  const mutations = [
    {
      on_http_request: policy.on_http_request.slice(0, 1),
    },
    {
      on_http_request: [
        {
          expressions: ["req.method == 'GET'"],
          ...policy.on_http_request[0],
        },
        policy.on_http_request[1],
      ],
    },
    {
      on_http_request: [
        {
          actions: [
            {
              type: "oauth",
              config: {
                provider: "github",
              },
            },
          ],
        },
        policy.on_http_request[1],
      ],
    },
    {
      on_http_request: [
        policy.on_http_request[0],
        {
          actions: [
            {
              type: "deny",
              config: {
                status_code: 403,
              },
            },
          ],
          expressions: [
            "!actions.ngrok.oauth.identity.email.endsWith('@example.test')",
          ],
        },
      ],
    },
  ];

  for (const changed of mutations) {
    const changedBytes = JSON.stringify(changed);

    assert.throws(() =>
      assertNgrokPolicy(
        {
          ...config,
          transport: {
            ...config.transport!,
            policySha256: reviewHash(changedBytes),
          },
        },
        changedBytes,
      ),
    );
  }

  assert.throws(() => assertNgrokPolicy(config, bytes + " "));

  for (const list of [
    [],
    ["*@example.test"],
    ["developer@example.test", "DEVELOPER@example.test"],
    ["developer@example.test' || true"],
  ]) {
    assert.throws(() => ngrokTrafficPolicy(list));
  }
});

test("origin, policy and audience changes invalidate an active ngrok review without changing media grants", () => {
  const config = configuration();
  const audience = reviewAudience(config);

  assert.equal(reviewConfigValid(config, audience), true);

  assert.equal(
    reviewConfigValid(
      {
        ...config,
        transport: {
          ...config.transport!,
          origin: "https://different.ngrok-free.dev",
        },
      },
      audience,
    ),
    false,
  );

  assert.equal(
    reviewConfigValid(
      {
        ...config,
        transport: {
          ...config.transport!,
          policySha256: "f".repeat(64),
        },
      },
      audience,
    ),
    false,
  );

  assert.equal(
    reviewConfigValid(
      {
        ...config,
        allowedEmails: [emails[0]],
      },
      audience,
    ),
    false,
  );

  assert.equal(
    reviewConfigValid(
      {
        ...config,
        revoked: true,
      },
      audience,
    ),
    false,
  );

  assert.equal(
    reviewConfigSchema.safeParse({
      ...config,
      transport: {
        ...config.transport!,
        origin: "https://example.test",
      },
    }).success,
    false,
  );

  assert.deepEqual(config.grants, []);
});

test("the operator config cannot load with a missing or altered ngrok policy, even if its new hash is supplied", async () => {
  const cwd = process.cwd();
  const base = await fs.realpath(tmpdir());

  const root = await fs.mkdtemp(path.join(base, "sakado-ngrok-policy-"));

  try {
    process.chdir(root);

    await fs.mkdir(".local/client-review", { recursive: true });

    const config = configuration();

    await fs.writeFile(
      ".local/client-review/catalog.json",
      JSON.stringify(config),
    );

    await assert.rejects(() => readReviewConfig());

    await fs.writeFile(
      ".local/client-review/ngrok-traffic-policy.json",
      ngrokPolicyBytes(emails),
    );

    assert.equal(
      (await readReviewConfig()).transport!.origin,
      config.transport!.origin,
    );

    const weaker = JSON.stringify({
      on_http_request: [
        {
          actions: [
            {
              type: "oauth",
              config: {
                provider: "google",
              },
            },
          ],
        },
      ],
    });

    await fs.writeFile(
      ".local/client-review/ngrok-traffic-policy.json",
      weaker,
    );

    await assert.rejects(() => readReviewConfig());

    await fs.writeFile(
      ".local/client-review/catalog.json",
      JSON.stringify({
        ...config,
        transport: {
          ...config.transport!,
          policySha256: reviewHash(weaker),
        },
      }),
    );

    await assert.rejects(() => readReviewConfig());
  } finally {
    process.chdir(cwd);

    const absolute = await fs.realpath(root);

    assert.equal(path.dirname(absolute), base);

    assert.ok(path.basename(absolute).startsWith("sakado-ngrok-policy-"));

    await fs.rm(absolute, {
      recursive: true,
      force: true,
    });
  }
});
