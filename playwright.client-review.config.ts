import { defineConfig } from "@playwright/test";
if (process.env.CLIENT_REVIEW_TEST_TLS !== "loopback")
  throw Error(
    "Use npm run test:client-review with its exclusive loopback TLS fixture.",
  );
const origin =
  process.env.CLIENT_REVIEW_TEST_ORIGIN ??
  "https://review-validation.trycloudflare.com";
export default defineConfig({
  testDir: "./tests/client-review-browser",
  outputDir: ".local/secure-client-preview/browser-results",
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  reporter: "list",
  use: {
    baseURL: origin,
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        `--host-resolver-rules=MAP ${new URL(origin).hostname} 127.0.0.1`,
        "--no-proxy-server",
      ],
    },
    channel: "chrome",
    headless: true,
    trace: "off",
    screenshot: "off",
  },
});
