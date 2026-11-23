import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { safeRead, digest } from "../../scripts/presentation-files.mjs";
import { privatePartnerAssetAllowed } from "./partner-preview-policy";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const reference = z
  .object({
    root: z.enum(["client", "originals", "preview", "library"]),
    relative: z.string().max(240),
    sha256: hash,
  })
  .strict();
const assetSchema = z
  .object({
    key: hash,
    slot: z
      .string()
      .regex(
        /^(team-[0-4]|logo|hero-s(?:08|16)|gallery-(?:[0-9]|1[01])|partner-[0-5])$/,
      ),
    label: z.string().max(200),
    alt: z.string().max(300),
    width: z.number().int().positive().max(2400),
    height: z.number().int().positive().max(5000),
    source: reference,
    derivative: reference,
  })
  .strict();
const schema = z
  .object({ version: z.literal(1), assets: z.array(assetSchema).max(40) })
  .strict();
export type Asset = z.infer<typeof assetSchema>;
async function roots() {
  const manifest = JSON.parse(
    await fs.readFile("docs/media/asset-manifest.json", "utf8"),
  );
  return {
    client: path.resolve(".local/client-demo"),
    preview: path.resolve(".local/client-preview"),
    library: path.resolve("SAKADO-MEDIA"),
    originals: manifest.sourceDirectory as string,
  };
}
export async function verifiedBytes(asset: Asset) {
  if (asset.slot.startsWith("partner-") && !privatePartnerAssetAllowed(asset))
    throw Error("Private partner scope refused");
  if (
    !["client", "originals"].includes(asset.source.root) ||
    !["preview", "library"].includes(asset.derivative.root) ||
    !asset.derivative.relative.endsWith(".webp")
  )
    throw Error("Private derivative refused");
  const locations = await roots();
  if (
    digest(
      await safeRead(
        locations[asset.source.root],
        asset.source.relative,
        25_000_000,
      ),
    ) !== asset.source.sha256
  )
    throw Error("Private source changed");
  const bytes = await safeRead(
    locations[asset.derivative.root],
    asset.derivative.relative,
  );
  if (
    digest(bytes) !== asset.derivative.sha256 ||
    asset.key !== asset.derivative.sha256
  )
    throw Error("Private derivative changed");
  return bytes;
}
export async function catalog() {
  return schema.parse(
    JSON.parse(
      (
        await safeRead(
          path.resolve(".local/official-presentation"),
          "catalog.json",
          100_000,
        )
      ).toString(),
    ),
  ).assets;
}
