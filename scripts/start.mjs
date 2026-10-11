import { spawn } from "node:child_process";
import nextEnv from "@next/env";
import { productionEnvironmentIssues } from "../src/lib/production-env.ts";

if (process.versions.node.split(".")[0] !== "24") {
  console.error("Node.js 24.x is required.");
  process.exit(1);
}
process.env.NODE_ENV = "production";
const assignedPort = process.env.PORT;
nextEnv.loadEnvConfig(process.cwd(), false);
// Hosting assigns PORT to the process; a .env PORT must not override that contract.
if (assignedPort === undefined) delete process.env.PORT;
else process.env.PORT = assignedPort;
const issues = productionEnvironmentIssues(process.env);
if (issues.length) {
  console.error("Production configuration invalid: " + issues.join(" "));
  process.exit(1);
}
const args = process.argv.slice(2);
const hostinger = args.includes("--hostinger");
if (args.some((arg) => arg.startsWith("--hostname"))) {
  console.error(
    "Use start:hostinger for managed hosting; local start stays loopback.",
  );
  process.exit(1);
}
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    hostinger ? "0.0.0.0" : "127.0.0.1",
    ...args.filter((arg) => arg !== "--hostinger"),
  ],
  {
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.once("error", () => {
  console.error("Production server could not start.");
  process.exitCode = 1;
});
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
