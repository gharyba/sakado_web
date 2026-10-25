import { lstat, realpath, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { verifyPresentationDirectory } from "../../scripts/presentation-runtime.mjs";

/** Playwright force-kills web servers on Windows, bypassing the launcher's exit handler. */
export default async function cleanupPresentationCode() {
  const directory = resolve(".local/official-presentation");
  try {
    if ((await realpath(directory)) !== directory)
      throw Error("Unexpected presentation directory");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  await verifyPresentationDirectory(directory);
  const code = join(directory, "access-code.txt");
  try {
    const entry = await lstat(code);
    if (!entry.isFile() || entry.isSymbolicLink())
      throw Error("Unexpected presentation code file");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  await rm(code);
}
