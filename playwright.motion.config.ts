import { defineConfig } from "@playwright/test";

// Deliberately independent from the existing DB/E2E preparation scripts.
const env = {
  // Empty disables existing read services; never inherit the real local .env URL.
  DATABASE_URL: "",
  AUTH_SECRET: "motion-validation-only-not-a-real-production-secret-000000",
  DEMO_MODE: "true",
  SITE_URL: "",
  ADMIN_URL: "",
  TRUST_PROXY: "false",
  MEDIA_STORAGE: "local",
  MEDIA_LOCAL_DIR: ".local/motion-test-uploads",
  NEXT_TELEMETRY_DISABLED: "1",
};
export default defineConfig({
  testDir: "./tests/motion-browser",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: "list",
  use: { channel: "chrome", headless: true, trace: "retain-on-failure" },
  projects: [
    {
      name: "development",
      testMatch: /development\.spec\.ts/,
      use: {
        baseURL: "http://127.0.0.1:3102",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "production-gate",
      testMatch: /production\.spec\.ts/,
      use: { baseURL: "http://127.0.0.1:3103" },
    },
  ],
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3102",
      url: "http://127.0.0.1:3102/dev/motion",
      env,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3103",
      url: "http://127.0.0.1:3103",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
