import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
const database = new URL(process.env.DATABASE_URL ?? "http://invalid");
const owned = process.env.REDESIGN07_CLUSTER_DIR ?? "";
const inside = relative(resolve(".local/redesign07"), resolve(owned));
if (
  database.hostname !== "127.0.0.1" ||
  database.port !== "55447" ||
  database.username !== "redesign07_test" ||
  database.pathname !== "/sakado_redesign07_test" ||
  !owned ||
  inside.startsWith("..") ||
  isAbsolute(inside) ||
  !existsSync(resolve(owned, "PG_VERSION"))
)
  throw Error(
    "Use node scripts/test-redesign07.mjs with its fresh isolated database.",
  );
export default defineConfig({
  testDir: "./tests/redesign07-browser",
  outputDir: ".local/redesign07/browser-results",
  globalSetup: "./tests/redesign07-browser/setup.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  reporter: "list",
  // Form bodies are not recorded in traces/screenshots, including on failure.
  use: {
    baseURL: "http://127.0.0.1:3160",
    channel: "chrome",
    headless: true,
    trace: "off",
    screenshot: "off",
  },
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3160",
    url: "http://127.0.0.1:3160/contact",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL!,
      AUTH_SECRET: process.env.AUTH_SECRET!,
      DEMO_MODE: "false",
      CLIENT_DEMO: "false",
      OFFICIAL_PRESENTATION: "false",
      STAGING_MODE: "false",
      SITE_URL: "https://redesign07.example.test",
      ADMIN_URL: "",
      TRUST_PROXY: "false",
      CONTACT_EMAIL: "",
      CONTACT_PHONE: "",
      CONTACT_ADDRESS: "",
      WHATSAPP_NUMBER: "",
      MEDIA_STORAGE: "local",
      MEDIA_LOCAL_DIR: ".local/redesign07/unused-uploads",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
