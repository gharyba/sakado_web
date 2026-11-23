import { defineConfig } from "@playwright/test";
import presentation from "./playwright.presentation.config";

const publicOnly = process.env.LIFECYCLE_PUBLIC_ONLY === "true";
// Reuse the verified existing-local-DB/read-only guards and protected teardown.
export default defineConfig({
  ...presentation,
  testDir: "./tests/redesign08-1-browser",
  outputDir: ".local/redesign08-1/browser-results",
  timeout: 600000,
  globalTeardown: publicOnly ? undefined : presentation.globalTeardown,
  webServer:
    publicOnly && Array.isArray(presentation.webServer)
      ? presentation.webServer.filter((server) =>
          server.command.includes("next start"),
        )
      : presentation.webServer,
  projects: [
    { name: "official-private-development" },
    {
      name: "official-public-production",
      use: { baseURL: "http://127.0.0.1:3135" },
    },
  ].filter(
    (project) => !publicOnly || project.name === "official-public-production",
  ),
});
