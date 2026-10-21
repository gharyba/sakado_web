import { defineConfig } from "@playwright/test";
import phase05 from "./playwright.phase05.config";

// Only the guarded fresh-cluster runner supplies the required database marker.
export default defineConfig({
  ...phase05,
  testDir: "./tests/phase10-browser",
  testMatch: "security.spec.ts",
  outputDir: ".local/phase10/browser-results",
});
