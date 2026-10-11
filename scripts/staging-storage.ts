import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { localStorage } from "../src/lib/storage";
import { relativeStoragePathSafe } from "../src/lib/staging-policy";

async function main() {
  const folder = process.env.MEDIA_LOCAL_DIR ?? "";
  if (!relativeStoragePathSafe(folder))
    throw Error("Unsafe synthetic storage directory");
  await mkdir(folder, { recursive: true });
  assert.ok(
    realpathSync(folder).startsWith(realpathSync(".local/phase07") + sep),
  );
  const marker = resolve(folder, "synthetic-object.json");
  const hash = (bytes: Buffer) =>
    createHash("sha256").update(bytes).digest("hex");
  if (process.argv[2] === "write") {
    const bytes = await sharp({
      create: { width: 32, height: 24, channels: 3, background: "#163e35" },
    })
      .webp()
      .toBuffer();
    const src = await localStorage.put(bytes);
    await writeFile(marker, JSON.stringify({ src, sha256: hash(bytes) }), {
      flag: "wx",
    });
  } else {
    const record = JSON.parse(await readFile(marker, "utf8"));
    assert.equal(
      hash(await localStorage.read(record.src.slice(7))),
      record.sha256,
    );
    if (process.argv[2] === "remove")
      await localStorage.remove(record.src.slice(7));
    else assert.equal(process.argv[2], "verify");
  }
  console.log("Synthetic storage " + process.argv[2] + " passed.");
}
main().catch(() => {
  console.error("Synthetic storage operation failed safely.");
  process.exitCode = 1;
});
