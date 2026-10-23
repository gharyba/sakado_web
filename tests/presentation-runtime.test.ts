import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  securePresentationDirectory,
  verifyPresentationDirectory,
  writePresentationRuntime,
} from "../scripts/presentation-runtime.mjs";

async function fixture(run: (directory: string) => Promise<void>) {
  const parent = path.resolve(".local/presentation-acl-tests");
  await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(path.join(parent, "run-"));
  try {
    await run(directory);
  } finally {
    assert.equal(path.dirname(directory), parent);
    await rm(directory, { recursive: true, force: true });
  }
}
test("private runtime establishes and re-verifies permissions before synthetic writes", async () => {
  await fixture(async (directory) => {
    await securePresentationDirectory(directory);
    await verifyPresentationDirectory(directory);
    await writePresentationRuntime(
      directory,
      "access-code.txt",
      "synthetic-only",
    );
    assert.ok((await stat(path.join(directory, "access-code.txt"))).isFile());
    await securePresentationDirectory(directory); // Existing safe directory remains usable.
  });
});
test(
  "Windows runtime refuses a pre-existing unexpected inheritable explicit grant",
  { skip: process.platform !== "win32" },
  async () => {
    await fixture(async (directory) => {
      execFileSync("icacls", [directory, "/grant", "*S-1-1-0:(OI)(CI)R"], {
        stdio: "ignore",
        windowsHide: true,
      });
      await assert.rejects(
        securePresentationDirectory(directory),
        /permissions could not be verified/,
      );
      await assert.rejects(
        writePresentationRuntime(
          directory,
          "access-code.txt",
          "synthetic-only",
        ),
      );
      await assert.rejects(stat(path.join(directory, "access-code.txt")), {
        code: "ENOENT",
      });
    });
  },
);
test(
  "Windows runtime detects permissions broadened after initial validation",
  { skip: process.platform !== "win32" },
  async () => {
    await fixture(async (directory) => {
      await securePresentationDirectory(directory);
      execFileSync("icacls", [directory, "/grant", "*S-1-1-0:(OI)(CI)R"], {
        stdio: "ignore",
        windowsHide: true,
      });
      await assert.rejects(verifyPresentationDirectory(directory));
      await assert.rejects(
        writePresentationRuntime(
          directory,
          "access-code.txt",
          "synthetic-only",
        ),
      );
      await assert.rejects(stat(path.join(directory, "access-code.txt")), {
        code: "ENOENT",
      });
    });
  },
);
