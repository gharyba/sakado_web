import { defineConfig } from "@playwright/test";
import path from "node:path";

const env = {
  CLIENT_DEMO: "true",
  CLIENT_DEMO_DIRECTORY: path.resolve(".local/client-preview"),
  DEMO_MODE: "true",
  DATABASE_URL: "",
  STAGING_MODE: "false",
  SITE_URL: "",
  ADMIN_URL: "",
  NEXT_TELEMETRY_DISABLED: "1",
  AUTH_SECRET: "client-preview-test-only-not-a-production-secret-000000000000",
};
// No fixtures, migrations, services or real databases. Private images stay local.
export default defineConfig({
  testDir: "./tests/client-demo-browser",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  reporter: "list",
  outputDir: "test-results/client-demo",
  use: { channel: "chrome", headless: true, trace: "retain-on-failure" },
  projects: [
    {
      name: "private-development",
      testMatch: /(?:development|motion|shape-grid|gallery-carousel)\.spec\.ts/,
      use: { baseURL: "http://127.0.0.1:3130" },
    },
    {
      name: "production-denial",
      testMatch: /production\.spec\.ts/,
      use: { baseURL: "http://127.0.0.1:3131" },
    },
  ],
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3130",
      url: "http://127.0.0.1:3130",
      env,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3131",
      url: "http://127.0.0.1:3131",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
