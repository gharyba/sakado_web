import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { bytesEligible, type MediaRegistry } from "./media-readiness-policy";

/** Static files bypass route handlers. Reject known blocked copies before building. */
export async function auditPublicMedia(
  root: string,
  registry: MediaRegistry,
): Promise<string[]> {
  if (!registry.valid)
    throw new Error("Media readiness registry is missing or inconsistent.");
  const blocked: string[] = [];
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink())
        throw new Error("Public media audit rejects symbolic links.");
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        const hash = createHash("sha256")
          .update(await readFile(path))
          .digest("hex");
        if (!bytesEligible(registry, hash, entry.name)) blocked.push(path);
      }
    }
  }
  await visit(root);
  return blocked;
}
