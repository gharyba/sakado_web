import { defineConfig } from "@playwright/test";
import { phase05DatabaseUrl } from "./tests/phase05-browser/database";

const env = {
  DATABASE_URL: phase05DatabaseUrl(),
  AUTH_SECRET: "phase05-isolated-browser-only-not-production-00000000000000000",
  DEMO_MODE: "false",
  SITE_URL: "https://example.invalid",
  // Test public and /admin paths on one loopback host, without dedicated-admin root rewriting.
  ADMIN_URL: "",
  TRUST_PROXY: "false",
  MEDIA_STORAGE: "local",
  MEDIA_LOCAL_DIR: ".local/phase05/test-uploads",
  NEXT_TELEMETRY_DISABLED: "1",
};
export default defineConfig({
  testDir: "./tests/phase05-browser",
  globalSetup: "./tests/phase05-browser/setup.ts",
  outputDir: ".local/phase05/browser-results",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: "list",
  use: {
    channel: process.env.CI ? undefined : "chrome",
    headless: true,
    baseURL: "http://127.0.0.1:3111",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3111",
      url: "http://127.0.0.1:3111",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3112",
      url: "http://127.0.0.1:3112",
      env: {
        ...env,
        DATABASE_URL: "postgresql://phase05:dummy@127.0.0.1:9/unavailable",
        DEMO_MODE: "true",
        SITE_URL: "",
        ADMIN_URL: "",
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3113",
      url: "http://127.0.0.1:3113/icon.svg",
      env: {
        ...env,
        DATABASE_URL: "postgresql://phase05:dummy@127.0.0.1:9/unavailable",
        DEMO_MODE: "false",
        SITE_URL: "https://example.invalid",
        ADMIN_URL: "",
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
