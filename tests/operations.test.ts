import { test } from "node:test";
import assert from "node:assert/strict";
import { eventWriteIssue } from "../src/lib/admin-event-policy";
import { productionEnvironmentIssues } from "../src/lib/production-env";
import { ciDatabaseUrl } from "./ci-database-policy";
import { settingsSchema } from "../src/lib/admin-validation";
import { requestOriginAllowed } from "../src/lib/origin-policy";
import { csvCell } from "../src/lib/csv";

test("CSV quotes values and neutralizes formulas including leading whitespace", () => {
  assert.equal(csvCell('Name; "Quoted"\nLine'), '"Name; ""Quoted""\nLine"');
  for (const value of ["=1+1", " +SUM(1)", "\t@formula", "-1", "\rtext"])
    assert.ok(csvCell(value).startsWith("\"'"));
  assert.equal(csvCell(null), '""');
});

const now = new Date("2030-01-01T00:00:00Z");
const state = {
  status: "UPCOMING" as const,
  published: true,
  registrationStatus: "OPEN" as const,
  startsAt: new Date("2030-02-01"),
  endsAt: new Date("2030-02-02"),
};
test("cookie mutations require the exact trusted origin including its protocol", () => {
  assert.equal(
    requestOriginAllowed("http://127.0.0.1:3111", "127.0.0.1:3111", "http:"),
    true,
  );
  assert.equal(
    requestOriginAllowed(
      "https://admin.example.invalid",
      "admin.example.invalid",
      "http:",
      ["https://admin.example.invalid"],
    ),
    true,
  );
  for (const origin of [
    null,
    "null",
    "http://admin.example.invalid",
    "https://foreign.example.invalid",
    "https://user:password@admin.example.invalid",
    "https://admin.example.invalid/path",
  ])
    assert.equal(
      requestOriginAllowed(origin, "admin.example.invalid", "http:", [
        "https://admin.example.invalid",
      ]),
      false,
    );
});
test("terminal events cannot be published/reopened and only upcoming outings accept registration", () => {
  assert.equal(
    eventWriteIssue(
      { ...state, status: "COMPLETED", registrationStatus: "CLOSED" },
      { ...state, startsAt: new Date("2029-01-01"), endsAt: null },
      now,
    ),
    null,
  );
  assert.equal(eventWriteIssue(state, undefined, now), null);
  for (const status of [
    "DRAFT",
    "CANCELLED",
    "ARCHIVED",
    "COMPLETED",
    "ONGOING",
  ] as const)
    assert.ok(eventWriteIssue({ ...state, status }, undefined, now));
  for (const status of ["CANCELLED", "ARCHIVED", "COMPLETED"] as const)
    assert.ok(eventWriteIssue(state, { ...state, status }, now));
  assert.equal(
    eventWriteIssue(
      { ...state, status: "COMPLETED", registrationStatus: "CLOSED" },
      undefined,
      now,
    ),
    null,
  );
  assert.equal(
    eventWriteIssue(
      {
        ...state,
        status: "ARCHIVED",
        published: false,
        registrationStatus: "CLOSED",
      },
      { ...state, status: "CANCELLED" },
      now,
    ),
    null,
  );
  assert.ok(
    eventWriteIssue(
      { ...state, startsAt: new Date("2029-01-01"), endsAt: null },
      undefined,
      now,
    ),
  );
});
test("production config rejects missing critical settings and unsafe origins without printing values", () => {
  const env = {
    NODE_ENV: "production",
    DEMO_MODE: "false",
    DATABASE_URL: "postgresql://test:dummy@127.0.0.1/sakado",
    AUTH_SECRET: "unique-strong-test-secret-01234567890123456789",
    SITE_URL: "https://example.invalid",
    TRUST_PROXY: "false",
    MEDIA_STORAGE: "local",
  };
  assert.deepEqual(productionEnvironmentIssues(env), []);
  assert.deepEqual(
    productionEnvironmentIssues({ NODE_ENV: "production", DEMO_MODE: "true" }),
    [],
  );
  assert.deepEqual(
    productionEnvironmentIssues({ NODE_ENV: "development" }),
    [],
  );
  for (const patch of [
    { DATABASE_URL: "" },
    { DATABASE_URL: "mysql://test:dummy@127.0.0.1/db" },
    { AUTH_SECRET: "short" },
    { SITE_URL: "http://example.invalid" },
    { ADMIN_URL: "https://example.invalid/admin" },
    { DEMO_MODE: "" },
    { MEDIA_STORAGE: "s3" },
    { TRUST_PROXY: "yes" },
  ])
    assert.ok(productionEnvironmentIssues({ ...env, ...patch }).length);
  const values = productionEnvironmentIssues({
    ...env,
    SITE_URL: "https://person:secret@example.invalid",
  });
  assert.ok(values.length);
  assert.ok(
    !values.join().includes("person") && !values.join().includes("secret@"),
  );
});
test("CI destructive tests reject missing markers, other hosts, users, ports and databases", () => {
  const env = {
    CI: "true",
    GITHUB_ACTIONS: "true",
    RUNNER_OS: "Linux",
    SAKADO_CI_DATABASE: "disposable-service",
    DATABASE_URL:
      "postgresql://sakado_ci:ci-disposable-only@127.0.0.1:55435/sakado_test?schema=public",
  };
  assert.equal(ciDatabaseUrl(env), env.DATABASE_URL);
  for (const patch of [
    { CI: "" },
    { GITHUB_ACTIONS: "" },
    { RUNNER_OS: "Windows" },
    { SAKADO_CI_DATABASE: "" },
    {
      DATABASE_URL: env.DATABASE_URL.replace("127.0.0.1", "db.example.invalid"),
    },
    { DATABASE_URL: env.DATABASE_URL.replace("55435", "5432") },
    { DATABASE_URL: env.DATABASE_URL.replace("sakado_test", "sakado") },
    { DATABASE_URL: env.DATABASE_URL.replace("sakado_ci", "developer") },
  ])
    assert.throws(() => ciDatabaseUrl({ ...env, ...patch }));
});
test("settings reject unsafe links, malformed email, invalid numbers and oversized content", () => {
  const settings = {
    name: "Fixture",
    logoPath: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    instagramUrl: "https://www.instagram.com/sakado_sfax/",
    instagramHandle: "fixture",
    facebookUrl: "",
    footerText: "",
    socialLinks: [],
  };
  assert.ok(settingsSchema.safeParse(settings).success);
  for (const patch of [
    { instagramUrl: "javascript:alert(1)" },
    { facebookUrl: "http://example.invalid" },
    { email: "not-an-email" },
    { whatsappNumber: "123" },
    { footerText: "a".repeat(1001) },
    {
      socialLinks: [
        {
          label: "Unsafe",
          url: "https://person:secret@example.invalid",
          enabled: true,
        },
      ],
    },
  ])
    assert.equal(
      settingsSchema.safeParse({ ...settings, ...patch }).success,
      false,
    );
});
