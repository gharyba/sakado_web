import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--typecheck"))
  throw Error("Unexpected build option");
const nextEnv = await readFile("next-env.d.ts").catch(() => null);
const env = {
  ...process.env,
  CLIENT_REVIEW_ARTIFACT: "true",
  CLIENT_REVIEW: "false",
  OFFICIAL_PRESENTATION: "false",
  DEMO_MODE: "false",
  CLIENT_DEMO: "false",
  STAGING_MODE: "false",
  SITE_URL: "https://review-build.example.test",
  ADMIN_URL: "",
  AUTH_SECRET: randomBytes(48).toString("hex"),
};
async function run(command) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, command, {
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", resolve);
  });
  if (code !== 0) throw Error("Isolated review validation failed");
}
try {
  await run(["--import", "tsx", "scripts/check-public-media.ts"]);
  if (args.includes("--typecheck")) {
    await run(["node_modules/next/dist/bin/next", "typegen"]);
    await run([
      "node_modules/typescript/bin/tsc",
      "--noEmit",
      "-p",
      "tsconfig.client-review.json",
    ]);
  } else {
    await run(["node_modules/next/dist/bin/next", "build"]);
    await run([
      "--import",
      "tsx",
      "scripts/check-public-media.ts",
      "--built",
      "--client-review",
    ]);
    await run(["scripts/check-client-demo-build.mjs", "--client-review"]);
  }
} finally {
  if (nextEnv) await writeFile("next-env.d.ts", nextEnv);
}
