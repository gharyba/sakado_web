import { defineConfig } from "@playwright/test";

// DB-disconnected production rendering. No fixture database, migrations or real messages.
export default defineConfig({
  testDir: "./tests/redesign07-1-browser",
  outputDir: ".local/redesign07-1/browser-results",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3164",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3164",
    url: "http://127.0.0.1:3164/",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_URL: "",
      DEMO_MODE: "true",
      CLIENT_DEMO: "false",
      OFFICIAL_PRESENTATION: "false",
      STAGING_MODE: "false",
      SITE_URL: "",
      ADMIN_URL: "",
      CONTACT_EMAIL: "",
      CONTACT_PHONE: "",
      CONTACT_ADDRESS: "",
      WHATSAPP_NUMBER: "",
      TRUST_PROXY: "false",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
