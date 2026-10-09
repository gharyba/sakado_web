import { defineConfig } from "@playwright/test";

const env = {
  DATABASE_URL: "",
  AUTH_SECRET: "hero-validation-only-not-a-real-production-secret-000000000",
  DEMO_MODE: "true",
  SITE_URL: "",
  ADMIN_URL: "",
  TRUST_PROXY: "false",
  MEDIA_STORAGE: "local",
  MEDIA_LOCAL_DIR: ".local/hero-test-uploads",
  NEXT_TELEMETRY_DISABLED: "1",
};
// Deliberately independent from the destructive database fixture/E2E preparation.
export default defineConfig({
  testDir: "./tests/hero-browser",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  reporter: "list",
  use: { channel: "chrome", headless: true, trace: "retain-on-failure" },
  projects: [
    {
      name: "development",
      testMatch: /development\.spec\.ts/,
      use: {
        baseURL: "http://127.0.0.1:3105",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "production",
      testMatch: /production\.spec\.ts/,
      use: {
        baseURL: "http://127.0.0.1:3106",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3105",
      url: "http://127.0.0.1:3105",
      env,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3106",
      url: "http://127.0.0.1:3106",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
