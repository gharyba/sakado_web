import { spawn } from "node:child_process";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

// Only an explicit shell flag/argument selects the demo; legacy .env defaults cannot.
const demo =
  process.env.DEMO_MODE === "true" || process.argv.includes("--demo");
loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
if (
  process.env.NODE_ENV === "production" ||
  process.env.STAGING_MODE === "true"
)
  throw new Error(
    "Local development is not a staging or production deployment.",
  );
if (!demo) {
  let database;
  try {
    database = new URL(process.env.DATABASE_URL ?? "");
  } catch {
    throw new Error(
      "Configure the existing local PostgreSQL database, or use npm run dev:demo.",
    );
  }
  if (
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(database.hostname)
  )
    throw new Error("Local development refuses a non-loopback database.");
}
console.log(
  demo
    ? "Company demo: PostgreSQL disabled."
    : "Official application: existing local PostgreSQL; admin at /admin.",
);
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3000",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      DEMO_MODE: String(demo),
      DATABASE_URL: demo ? "" : process.env.DATABASE_URL,
      CLIENT_DEMO: "false",
      CLIENT_DEMO_DIRECTORY: "",
      SITE_URL: "",
      ADMIN_URL: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
);
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
