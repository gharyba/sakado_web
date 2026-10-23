import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const local = JSON.parse(readFileSync(".local/postgres-config.json", "utf8"));
const database = new URL(process.env.DATABASE_URL ?? "");
if (
  database.hostname !== "127.0.0.1" ||
  database.port !== "55432" ||
  database.pathname !== "/sakado" ||
  database.username !== local.user ||
  database.password !== local.password
)
  throw Error(
    "Presentation browser checks require the verified local database.",
  );
export default defineConfig({
  testDir: "./tests/presentation-browser",
  globalSetup: "./tests/phase09b-browser/verify-local.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  outputDir: ".local/official-presentation-audit/browser-results",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3134",
    channel: "chrome",
    headless: true,
    trace: "off",
    screenshot: "off",
  },
  projects: [
    {
      name: "official-private-development",
      testMatch: ["presentation.spec.ts", "story.spec.ts"],
    },
    {
      name: "official-production-denial",
      testMatch: "production.spec.ts",
      use: { baseURL: "http://127.0.0.1:3135" },
    },
  ],
  webServer: [
    {
      command:
        "node scripts/dev-presentation.mjs" +
        (process.env.PRESENTATION_TEST_HERO === "s16" ? " --hero=s16" : ""),
      url: "http://127.0.0.1:3134/dev/presentation",
      reuseExistingServer: false,
      timeout: 120000,
      env: { DEMO_MODE: "false", CLIENT_DEMO: "false", STAGING_MODE: "false" },
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3135",
      url: "http://127.0.0.1:3135/api/health",
      reuseExistingServer: false,
      timeout: 60000,
      env: {
        DATABASE_URL: process.env.DATABASE_URL!,
        DEMO_MODE: "false",
        CLIENT_DEMO: "false",
        OFFICIAL_PRESENTATION: "false",
        STAGING_MODE: "false",
        SITE_URL: "https://presentation.example.test",
        ADMIN_URL: "",
        TRUST_PROXY: "false",
      },
    },
  ],
});
