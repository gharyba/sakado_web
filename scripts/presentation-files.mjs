import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
export const digest = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
// Inspect every path component before opening. No arbitrary absolute paths or links.
export async function safeRead(root, relative, maximum = 5_000_000) {
  if (
    !relative ||
    relative.includes("\\") ||
    path.isAbsolute(relative) ||
    relative.split("/").some((p) => !p || p === "." || p === "..")
  )
    throw Error("Unsafe private path");
  const base = path.resolve(root);
  const segments = base.split(path.sep);
  let current = path.parse(base).root;
  for (const segment of segments
    .filter(Boolean)
    .filter((s) => s !== path.parse(base).root.replace(/[\\/]/g, ""))) {
    current = path.join(current, segment);
    if ((await fs.lstat(current)).isSymbolicLink())
      throw Error("Private link refused");
  }
  current = base;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    if ((await fs.lstat(current)).isSymbolicLink())
      throw Error("Private link refused");
  }
  const stat = await fs.lstat(current);
  if (!stat.isFile() || stat.size > maximum)
    throw Error("Private file refused");
  return fs.readFile(current);
}
export async function preparePresentationCatalog() {
  const index = JSON.parse(
    (await safeRead(".local/client-preview", "index.json")).toString(),
  );
  const inventory = JSON.parse(
    (
      await safeRead(".local/client-preview", "source-inventory.json")
    ).toString(),
  );
  const manifest = JSON.parse(
    await fs.readFile("docs/media/asset-manifest.json", "utf8"),
  );
  const assets = [];
  const names = [
    "Ben Beya Mohamed",
    "Bouzrara Manel",
    "Aladin Jemni",
    "Jad Tagougui",
    "Ayoub Hamza",
  ];
  async function addVerifiedItem(item, partner = false) {
    if (
      item.slot.startsWith("team-") &&
      item.label !== names[Number(item.slot.slice(5))]
    )
      throw Error("Portrait identity mismatch");
    const sourceHash = item.variants[0].key.split("-")[0];
    const source = inventory.find((s) => s.sha256 === sourceHash);
    if (!source) throw Error("Private source missing");
    if (partner && !/^partners\/[^/\\\0]+\.png$/i.test(source.source))
      throw Error("Private partner source scope refused");
    const original = await safeRead(
      ".local/client-demo",
      source.source,
      25_000_000,
    );
    if (digest(original) !== sourceHash) throw Error("Private source changed");
    for (const variant of item.variants) {
      if (
        partner &&
        (!/^[a-f0-9]{64}-480$/.test(variant.key) ||
          variant.width > 480 ||
          variant.height > 480)
      )
        throw Error("Private partner derivative refused");
      const relative = variant.key + ".webp";
      const bytes = await safeRead(".local/client-preview", relative);
      if (bytes.length !== variant.bytes)
        throw Error("Derivative size mismatch");
      const expected = await sharp(original, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({
          width: Number(variant.key.split("-").at(-1)),
          withoutEnlargement: true,
        })
        .webp({ quality: 84 })
        .toBuffer();
      if (!bytes.equals(expected))
        throw Error("Prepared derivative does not match its verified source");
      assets.push({
        slot: item.slot === "hero" ? "hero-s16" : item.slot,
        label: item.label,
        alt: item.alt,
        width: variant.width,
        height: variant.height,
        source: { root: "client", relative: source.source, sha256: sourceHash },
        derivative: { root: "preview", relative, sha256: digest(bytes) },
      });
    }
  }
  for (const item of index.assets.filter((a) =>
    /^(team-[0-4]|logo|hero|gallery-(?:[0-9]|1[01]))$/.test(a.slot),
  ))
    await addVerifiedItem(item);
  for (const item of index.assets.filter((a) =>
    /^partner-[0-5]$/.test(a.slot),
  )) {
    try {
      await addVerifiedItem(item, true);
    } catch {
      console.warn(
        "A private partner slot is unavailable; its logo is omitted.",
      );
    }
  }
  // Existing recorded derivatives only; never generate, copy or substitute originals.
  const s08 = manifest.assets.find((a) => a.id === "S08");
  try {
    if (
      digest(
        await safeRead(manifest.sourceDirectory, s08.filename, 25_000_000),
      ) !== s08.sha256
    )
      throw Error();
    for (const width of [768, 1440]) {
      const d = s08.derivatives.find(
        (d) =>
          d.format === "webp" &&
          d.width === width &&
          d.sourceSha256 === s08.sha256 &&
          d.crop === null,
      );
      if (
        !d ||
        digest(await safeRead("SAKADO-MEDIA", d.relativePath)) !== d.sha256
      )
        throw Error();
      assets.push({
        slot: "hero-s08",
        label: "S08",
        alt: "Photographie panoramique Sakado — aperçu privé",
        width: d.width,
        height: d.height,
        source: {
          root: "originals",
          relative: s08.filename,
          sha256: s08.sha256,
        },
        derivative: {
          root: "library",
          relative: d.relativePath,
          sha256: d.sha256,
        },
      });
    }
  } catch {
    console.warn(
      "S08 unavailable or changed; its presentation slot will remain a placeholder.",
    );
  }
  for (const a of assets) a.key = a.derivative.sha256;
  return { version: 1, assets };
}
