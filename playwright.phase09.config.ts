import { defineConfig } from "@playwright/test";

const env = {
  DEMO_MODE: "true",
  CLIENT_DEMO: "false",
  CLIENT_DEMO_DIRECTORY: "",
  DATABASE_URL: "",
  SITE_URL: "",
  ADMIN_URL: "",
  STAGING_MODE: "false",
  NEXT_TELEMETRY_DISABLED: "1",
  AUTH_SECRET: "phase09-local-test-only-not-a-production-secret-0000000000",
};
// Public safe-demo checks only. No fixture setup, PostgreSQL service or migration.
export default defineConfig({
  testDir: "./tests/phase09-browser",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  reporter: "list",
  outputDir: ".local/phase09/browser-results",
  use: { channel: "chrome", headless: true, trace: "retain-on-failure" },
  projects: [
    { name: "development", use: { baseURL: "http://127.0.0.1:3140" } },
    { name: "production", use: { baseURL: "http://127.0.0.1:3141" } },
  ],
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3140",
      url: "http://127.0.0.1:3140",
      env,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3141",
      url: "http://127.0.0.1:3141",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
