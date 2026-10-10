import { defineConfig } from "@playwright/test";

// No fixture preparation, database connection, uploads or migrations.
export default defineConfig({
  testDir: "./tests/navigation-browser",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  reporter: "list",
  use: {
    channel: "chrome",
    headless: true,
    baseURL: "http://127.0.0.1:3104",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3104",
    url: "http://127.0.0.1:3104",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_URL: "",
      AUTH_SECRET:
        "navigation-validation-only-not-a-real-production-secret-000000",
      DEMO_MODE: "true",
      SITE_URL: "",
      ADMIN_URL: "",
      TRUST_PROXY: "false",
      MEDIA_STORAGE: "local",
      MEDIA_LOCAL_DIR: ".local/navigation-test-uploads",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
