import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { verifyNgrokReviewReady } from "./client-review-ngrok-preflight";
import { readReviewConfig } from "../src/lib/client-review-media";
import {
  reviewAudience,
  reviewConfigValid,
} from "../src/lib/client-review-grants";
import { safeRead } from "./presentation-files.mjs";

async function main() {
  if (process.argv.length !== 2) throw Error("Unexpected tunnel arguments");
  // Refuse an existing agent. It may belong to the independent user test.
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () => reject(Error("Existing ngrok agent preserved")));
    probe.listen(4040, "127.0.0.1", () => probe.close(() => resolve()));
  });
  const verified = await verifyNgrokReviewReady();
  // Policy is validated again after the active application-control checks.
  const config = await readReviewConfig();
  if (reviewAudience(config) !== verified.audience)
    throw Error("Review changed during preflight");
  console.log(
    "Local controls and exact Google OAuth policy verified. Starting only the configured ngrok endpoint with inspection disabled.",
  );
  const child = spawn(
    process.env.NGROK_EXECUTABLE || "ngrok",
    [
      "http",
      "http://127.0.0.1:3144",
      "--url",
      verified.origin,
      "--traffic-policy-file",
      verified.policyFile,
      "--inspect=false",
      "--log=stdout",
      "--log-format=json",
      "--log-level=warn",
    ],
    { stdio: "inherit", windowsHide: true },
  );
  let stopping = false;
  const stop = () => {
    if (!stopping) {
      stopping = true;
      child.kill("SIGTERM");
    }
  };
  const monitor = setInterval(() => {
    try {
      process.kill(Number(verified.lock), 0);
    } catch {
      stop();
      return;
    }
    void Promise.all([
      readReviewConfig(),
      safeRead(path.resolve(".local/client-review"), "run.lock", 100),
    ])
      .then(([current, lock]) => {
        if (
          !reviewConfigValid(current, verified.audience) ||
          lock.toString() !== verified.lock
        )
          stop();
      })
      .catch(stop);
  }, 1000);
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, stop);
  if (process.connected)
    process.on("message", (message) => {
      if (message === "STOP_NGROK_REVIEW") stop();
    });
  await new Promise<void>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", () => {
      if (!stopping)
        reject(Error("Protected ngrok endpoint failed; no fallback permitted"));
      else resolve();
    });
  }).finally(() => {
    clearInterval(monitor);
  });
  if (process.connected) process.disconnect();
  console.log(
    "Owned ngrok endpoint stopped. Revoke/stop the review server separately; PostgreSQL was not touched.",
  );
}
main().catch(() => {
  console.error(
    "Protected ngrok sharing refused or stopped with an error. Existing processes were not reused or terminated; no unprotected fallback was started.",
  );
  if (process.connected) process.disconnect();
  process.exitCode = 1;
});
