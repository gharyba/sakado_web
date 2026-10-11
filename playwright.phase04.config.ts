import { defineConfig } from "@playwright/test";

const env = {
  DATABASE_URL: "postgresql://phase04:dummy@127.0.0.1:9/unavailable",
  AUTH_SECRET: "phase04-browser-validation-only-dummy-not-production-000000000",
  DEMO_MODE: "true",
  SITE_URL: "",
  ADMIN_URL: "",
  TRUST_PROXY: "false",
  MEDIA_STORAGE: "local",
  MEDIA_LOCAL_DIR: ".local/phase04-test-uploads",
  NEXT_TELEMETRY_DISABLED: "1",
};
// No fixtures, migrations, database service or real media. The DB endpoint is deliberately unreachable.
export default defineConfig({
  testDir: "./tests/phase04-browser",
  outputDir: ".local/phase04/browser-results-final",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  reporter: "list",
  use: {
    channel: process.env.CI ? undefined : "chrome",
    headless: true,
    baseURL: "http://127.0.0.1:3110",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "node --import tsx tests/phase04-browser/render-admin.ts && node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3110",
    url: "http://127.0.0.1:3110",
    env,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
