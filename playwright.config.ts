import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./tests/test-database";
const common = {
  DATABASE_URL: testDatabaseUrl(),
  AUTH_SECRET: "isolated-browser-test-secret-with-at-least-48-characters",
  SITE_URL: "https://example.invalid",
  ADMIN_URL: "http://127.0.0.1:3101",
  MEDIA_LOCAL_DIR: ".local/test-uploads",
  TRUST_PROXY: "false",
};
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 45000,
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "demo",
      use: { baseURL: "http://127.0.0.1:3100" },
      testMatch: /demo\.spec\.ts/,
    },
    {
      name: "confirmed",
      use: { baseURL: "http://127.0.0.1:3101" },
      testMatch: /(confirmed|admin)\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: "npm run start -- --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      env: { ...common, DEMO_MODE: "true" },
      timeout: 60000,
    },
    {
      command: "npm run start -- --port 3101",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: false,
      env: { ...common, DEMO_MODE: "false" },
      timeout: 60000,
    },
  ],
});
