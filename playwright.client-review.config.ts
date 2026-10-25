import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/client-review-browser",
  outputDir: ".local/secure-client-preview/browser-results",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  reporter: "list",
  use: {
    baseURL: "https://review-validation.trycloudflare.com",
    channel: "chrome",
    headless: true,
    trace: "off",
    screenshot: "off",
  },
});
