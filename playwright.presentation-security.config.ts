import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";

// No local configuration, private catalog, database service, fixtures or originals.
const modes = [
  { name: "operational-production", port: 3153, demo: "false" },
  { name: "demo-production", port: 3154, demo: "true" },
];
export default defineConfig({
  testDir: "./tests/presentation-security-browser",
  outputDir: ".local/presentation-security/browser-results",
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  reporter: "list",
  use: {
    channel: process.env.CI ? undefined : "chrome",
    headless: true,
    trace: "off",
    screenshot: "off",
  },
  projects: modes.map(({ name, port }) => ({
    name,
    use: { baseURL: `http://127.0.0.1:${port}` },
  })),
  webServer: modes.map(({ port, demo }) => ({
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/admin/icon-192.png`,
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:9/unavailable",
      AUTH_SECRET: randomBytes(48).toString("hex"),
      DEMO_MODE: demo,
      CLIENT_DEMO: "false",
      OFFICIAL_PRESENTATION: "false",
      STAGING_MODE: "false",
      SITE_URL: "https://presentation-security.example.test",
      ADMIN_URL: "",
      TRUST_PROXY: "false",
      MEDIA_STORAGE: "local",
      MEDIA_LOCAL_DIR: ".local/presentation-security/unused-uploads",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  })),
});
