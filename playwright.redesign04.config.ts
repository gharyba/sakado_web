import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";

// Public application components with an unreachable dummy DB; no private media or fixtures in PostgreSQL.
export default defineConfig({
  testDir: "./tests/redesign04-browser",
  testMatch: "discovery.spec.ts",
  outputDir: ".local/redesign04/browser-results",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3148",
    channel: process.env.CI ? undefined : "chrome",
    headless: true,
    trace: "off",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command:
      "node --import tsx tests/redesign04-browser/render-fixtures.ts && node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3148",
    url: "http://127.0.0.1:3148",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
      AUTH_SECRET: randomBytes(48).toString("hex"),
      DEMO_MODE: "true",
      CLIENT_DEMO: "false",
      OFFICIAL_PRESENTATION: "false",
      STAGING_MODE: "false",
      SITE_URL: "",
      ADMIN_URL: "",
      TRUST_PROXY: "false",
      MEDIA_STORAGE: "local",
      MEDIA_LOCAL_DIR: ".local/redesign04/unused-uploads",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
