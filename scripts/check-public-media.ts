import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { mediaRegistry } from "../src/lib/media-readiness-policy";
import { auditPublicMedia } from "../src/lib/public-media-audit";

async function main() {
  const manifest = await readFile("docs/media/asset-manifest.json");
  const readiness = await readFile(
    "docs/media/media-04-publication-readiness.json",
    "utf8",
  );
  const registry = mediaRegistry(
    JSON.parse(readiness),
    JSON.parse(manifest.toString("utf8")),
    createHash("sha256").update(manifest).digest("hex"),
  );
  const blocked = await auditPublicMedia("public", registry);
  if (process.argv.includes("--built"))
    blocked.push(
      ...(await auditPublicMedia(
        process.argv.includes("--client-review")
          ? ".next-client-review/static"
          : ".next/static",
        registry,
      )),
    );
  if (blocked.length)
    throw new Error(
      `${blocked.length} blocked media file(s) found in public/. Remove through a reviewed, separate action before building.`,
    );
  console.log(
    `Public media audit passed: ${registry.assets.length} registered assets checked; no blocked copies found${process.argv.includes("--built") ? ` in public/ or ${process.argv.includes("--client-review") ? ".next-client-review" : ".next"}/static/` : " in public/"}.`,
  );
}
main().catch(() => {
  console.error(
    "Public media audit failed. Check the readiness files and public/ for blocked assets; no files were changed.",
  );
  process.exitCode = 1;
});
