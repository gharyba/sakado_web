import { defineConfig } from "@playwright/test";
import official from "./playwright.phase09b.config";

// Read-only official checks. Inherits the exact local DB identity/data-directory guard.
export default defineConfig({
  ...official,
  testDir: "./tests/phase10-browser",
  testMatch: "public.spec.ts",
  outputDir: ".local/phase10/public-results",
  projects: [
    { name: "official-production", use: { baseURL: "http://127.0.0.1:3151" } },
  ],
  webServer: Array.isArray(official.webServer)
    ? official.webServer.filter((server) =>
        server.command.includes("next start"),
      )
    : [],
});
