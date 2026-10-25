import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";

// Runner validates the actual new PostgreSQL data directory before any migration.
const database = new URL(process.env.DATABASE_URL ?? "http://invalid");
const labOnly = process.env.REDESIGN06_LAB_ONLY === "true";
const owned = process.env.REDESIGN06_CLUSTER_DIR ?? "";
const inside = relative(resolve(".local/redesign06"), resolve(owned));
if (
  !labOnly &&
  (database.hostname !== "127.0.0.1" ||
    database.port !== "55446" ||
    database.username !== "redesign06_test" ||
    database.pathname !== "/sakado_redesign06_test" ||
    !owned ||
    inside.startsWith("..") ||
    isAbsolute(inside) ||
    !existsSync(resolve(owned, "PG_VERSION")))
)
  throw Error(
    "Use node scripts/test-redesign06.mjs with its fresh isolated database.",
  );
const env = {
  DATABASE_URL: labOnly ? "" : process.env.DATABASE_URL!,
  DEMO_MODE: "false",
  CLIENT_DEMO: "false",
  OFFICIAL_PRESENTATION: "false",
  STAGING_MODE: "false",
  NEXT_TELEMETRY_DISABLED: "1",
  SITE_URL: "https://redesign06.example.test",
  ADMIN_URL: "",
  AUTH_SECRET: process.env.AUTH_SECRET!,
  TRUST_PROXY: "false",
};
export default defineConfig({
  testDir: "./tests/redesign06-browser",
  outputDir: ".local/redesign06/browser-results",
  timeout: 45000,
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: { channel: "chrome", headless: true, trace: "retain-on-failure" },
  projects: [
    {
      name: "orbit-development",
      testMatch: "orbit.spec.ts",
      use: { baseURL: "http://127.0.0.1:3156" },
    },
    {
      name: "public-production",
      testMatch: "public.spec.ts",
      use: { baseURL: "http://127.0.0.1:3157" },
    },
  ].filter((project) => !labOnly || project.name === "orbit-development"),
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3156",
      url: "http://127.0.0.1:3156/dev/photo-orbit",
      env,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3157",
      url: "http://127.0.0.1:3157/gallery",
      env,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ].filter((server) => !labOnly || server.url.includes(":3156/")),
});
