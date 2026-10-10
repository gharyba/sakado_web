import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MediaReadinessView } from "../../src/components/admin/media-readiness";
import { mediaRegistry } from "../../src/lib/media-readiness-policy";

async function main() {
  const manifest = await readFile("docs/media/asset-manifest.json");
  const readiness = await readFile(
    "docs/media/media-04-publication-readiness.json",
    "utf8",
  );
  const registry = mediaRegistry(
    JSON.parse(readiness),
    JSON.parse(manifest.toString()),
    createHash("sha256").update(manifest).digest("hex"),
  );
  const html = renderToStaticMarkup(
    createElement(MediaReadinessView, { registry }),
  );
  await mkdir(".local/phase04", { recursive: true });
  await writeFile(".local/phase04/admin-presentation.html", html);
}
main().catch(() => {
  console.error("Unable to render isolated readiness presentation.");
  process.exitCode = 1;
});
