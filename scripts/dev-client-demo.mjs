import { spawn } from "node:child_process";
import path from "node:path";
if (
  process.env.NODE_ENV === "production" ||
  process.env.STAGING_MODE === "true"
)
  throw new Error("Client preview cannot run in production or staging.");
await import("./prepare-client-demo.mjs");
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
      CLIENT_DEMO: "true",
      CLIENT_DEMO_DIRECTORY: path.resolve(".local/client-preview"),
      DEMO_MODE: "true",
      DATABASE_URL: "",
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
