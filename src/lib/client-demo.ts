import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  clientDemoEnabled,
  clientDemoRequestAllowed,
} from "./client-demo-policy";

const indexSchema = z
  .object({
    version: z.literal(1),
    assets: z
      .array(
        z
          .object({
            slot: z
              .string()
              .regex(
                /^(hero|logo|team-[0-4]|gallery-\d{1,2}|partner-\d{1,2})$/,
              ),
            label: z.string().max(200),
            alt: z.string().max(300),
            width: z.number().int().positive(),
            height: z.number().int().positive(),
            variants: z
              .array(
                z
                  .object({
                    key: z
                      .string()
                      .regex(/^[a-f0-9]{64}-(240|480|750|900|1440|1800)$/),
                    width: z.number().int().positive(),
                    height: z.number().int().positive(),
                    bytes: z.number().int().positive(),
                  })
                  .strict(),
              )
              .min(1)
              .max(2),
          })
          .strict(),
      )
      .max(40),
  })
  .strict();
export type ClientDemoAssets = z.infer<typeof indexSchema>["assets"];

async function privateDirectory() {
  // A runtime-only location keeps Next's output tracer away from private files.
  // It is still restricted to this exact workspace location, never arbitrary storage.
  const directory = process.env.CLIENT_DEMO_DIRECTORY;
  if (
    !directory ||
    directory !== path.resolve(process.cwd(), ".local/client-preview")
  )
    throw new Error(
      "Run npm run dev:client to configure the private preview directory.",
    );
  for (const item of [path.dirname(directory), directory])
    if ((await fs.lstat(item)).isSymbolicLink())
      throw new Error("Private media link refused.");
  return directory;
}
export const clientDemoActive = cache(async () =>
  clientDemoRequestAllowed(await headers()),
);
export async function readClientDemoIndex() {
  if (!clientDemoEnabled()) throw new Error("Private preview is disabled.");
  const directory = await privateDirectory();
  const filename = path.join(directory, "index.json");
  if ((await fs.lstat(filename)).isSymbolicLink())
    throw new Error("Private index link refused.");
  const data = await fs.readFile(filename, "utf8");
  if (data.length > 100_000) throw new Error("Private index too large.");
  return indexSchema.parse(JSON.parse(data)).assets;
}
export const getClientDemoAssets = cache(async () => {
  if (!(await clientDemoActive())) return null;
  return readClientDemoIndex();
});
export function clientAsset(assets: ClientDemoAssets, slot: string) {
  const asset = assets.find((item) => item.slot === slot);
  if (!asset)
    throw new Error(
      "Private preview asset is missing; run npm run dev:client.",
    );
  return {
    ...asset,
    src: `/dev/client-media/${asset.variants[0].key}`,
    fullSrc: `/dev/client-media/${asset.variants.at(-1)!.key}`,
  };
}
export async function readClientDemoImage(key: string) {
  const assets = await readClientDemoIndex();
  if (
    !assets.some((asset) =>
      asset.variants.some((variant) => variant.key === key),
    )
  )
    return null;
  const filename = path.join(await privateDirectory(), `${key}.webp`);
  const stat = await fs.lstat(filename);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 5_000_000)
    return null;
  return fs.readFile(filename);
}
