import { spawn } from "node:child_process";
import { verifyPhase05Cluster } from "../tests/phase05-browser/database";
import { ciDatabaseUrl } from "../tests/ci-database-policy";

async function main() {
  ciDatabaseUrl();
  await verifyPhase05Cluster();
  for (const args of [
    ["--import", "tsx", "tests/database.integration.ts"],
    ["--import", "tsx", "tests/phase10-database.ts"],
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.phase05.config.ts",
    ],
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.phase06.config.ts",
    ],
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.phase10.config.ts",
    ],
  ])
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        stdio: "inherit",
        env: process.env,
      });
      child.once("error", reject);
      child.once("exit", (code) =>
        code === 0 ? resolve() : reject(Error("CI test command failed.")),
      );
    });
}
main().catch(() => {
  console.error("Disposable CI test validation failed.");
  process.exitCode = 1;
});
