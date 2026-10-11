import { spawn } from "node:child_process";
import { createServer } from "node:net";

// Never inherits the project's real DB/secret or targets a database. Refuse any existing listener.
const port = 3120;
await new Promise((done, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(port, "127.0.0.1", () => probe.close(done));
});
const child = spawn(
  process.execPath,
  ["scripts/start.mjs", "--port", String(port)],
  {
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
      DEMO_MODE: "false",
      DATABASE_URL: "",
      AUTH_SECRET: "",
      SITE_URL: "",
      ADMIN_URL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);
let output = "";
child.stdout.on("data", (bytes) => {
  output = (output + bytes).slice(-20000);
});
child.stderr.on("data", (bytes) => {
  output = (output + bytes).slice(-20000);
});
const timeout = setTimeout(() => child.kill(), 20000);
const code = await new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("exit", resolve);
});
clearTimeout(timeout);
if (
  code !== 1 ||
  !output.includes("Production configuration invalid") ||
  !output.includes("DATABASE_URL") ||
  !output.includes("AUTH_SECRET")
) {
  console.error(
    JSON.stringify({
      exitCode: code,
      configurationMarker: output.includes("Production configuration invalid"),
      databaseMarker: output.includes("DATABASE_URL"),
      authMarker: output.includes("AUTH_SECRET"),
    }),
  );
  console.error(
    "Production startup fail-fast check failed (captured output intentionally withheld).",
  );
  process.exitCode = 1;
} else
  console.log(
    "Production startup correctly rejected missing critical settings before readiness.",
  );
