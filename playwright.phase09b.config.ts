import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const local = JSON.parse(readFileSync(".local/postgres-config.json", "utf8"));
const url = new URL(process.env.DATABASE_URL ?? "");
if (
  url.hostname !== "127.0.0.1" ||
  url.port !== "55432" ||
  url.pathname !== "/sakado" ||
  url.username !== local.user ||
  url.password !== local.password
)
  throw new Error(
    "Phase 09B checks require the verified existing local database.",
  );
const env = {
  DATABASE_URL: url.toString(),
  DEMO_MODE: "false",
  CLIENT_DEMO: "false",
  CLIENT_DEMO_DIRECTORY: "",
  STAGING_MODE: "false",
  // Local test-server configuration only. No provider/DNS or real credentials.
  SITE_URL: "https://phase09b.example.test",
  ADMIN_URL: "",
  AUTH_SECRET: randomBytes(48).toString("hex"),
  TRUST_PROXY: "false",
  MEDIA_STORAGE: "local",
  MEDIA_LOCAL_DIR: resolve("uploads"),
  NEXT_TELEMETRY_DISABLED: "1",
};
export default defineConfig({
  testDir: "./tests/phase09b-browser",
  globalSetup: "./tests/phase09b-browser/verify-local.ts",
  testMatch: "official.spec.ts",
  outputDir: ".local/phase09b/browser-results",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  reporter: "list",
  use: { channel: "chrome", headless: true, trace: "retain-on-failure" },
  projects: [
    { name: "official-development", use: { baseURL: "http://127.0.0.1:3150" } },
    { name: "official-production", use: { baseURL: "http://127.0.0.1:3151" } },
  ],
  // Actual local application data, read-only browser interactions. Never fixtures.
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3150",
      url: "http://127.0.0.1:3150",
      env,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3151",
      url: "http://127.0.0.1:3151",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
