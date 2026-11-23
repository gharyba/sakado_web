import { defineConfig } from "@playwright/test";
import presentation from "./playwright.presentation.config";

// Exact existing-local-DB guard and read-only presentation setup; no fixtures.
export default defineConfig({
  ...presentation,
  testDir: "./tests/redesign08-browser",
  outputDir: ".local/redesign08/browser-results",
  timeout: 120000,
  projects: [
    { name: "official-private-development" },
    {
      name: "official-public-production",
      use: { baseURL: "http://127.0.0.1:3135" },
    },
  ],
});
