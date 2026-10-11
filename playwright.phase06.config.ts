import { defineConfig } from "@playwright/test";
import phase05 from "./playwright.phase05.config";
import { phase05DatabaseUrl } from "./tests/phase05-browser/database";
export default defineConfig({
  ...phase05,
  testDir: "./tests/phase06-browser",
  globalSetup: "./tests/phase05-browser/setup.ts",
  outputDir: ".local/phase06/browser-results",
  webServer: [
    ...(Array.isArray(phase05.webServer) ? phase05.webServer : []),
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3114",
      url: "http://127.0.0.1:3114/api/health",
      env: {
        DATABASE_URL: phase05DatabaseUrl(),
        AUTH_SECRET:
          "phase05-isolated-browser-only-not-production-00000000000000000",
        DEMO_MODE: "true",
        SITE_URL: "",
        ADMIN_URL: "",
        TRUST_PROXY: "false",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      reuseExistingServer: false,
    },
  ],
});
