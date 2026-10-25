import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { presentationAuthorized } from "./official-presentation-policy";
import { safeRead, digest } from "../../scripts/presentation-files.mjs";
import { companyTeam } from "@/data/confirmed/company";
import type { GalleryPhoto } from "./types";
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
type Asset = z.infer<typeof assetSchema>;
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
async function verifiedBytes(asset: Asset) {
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
async function catalog() {
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
function dto(asset: Asset) {
  return {
    src: `/dev/presentation-media/${asset.key}`,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
  };
}
export const getOfficialPresentation = cache(async () => {
  // No private filesystem access until BOTH request and session checks succeed.
  if (!presentationAuthorized(await headers())) return null;
  try {
    const assets = await catalog();
    const eligible: Asset[] = [];
    for (const asset of assets) {
      try {
        await verifiedBytes(asset);
        eligible.push(asset);
      } catch {
        /* Slot falls back, never another asset. */
      }
    }
    const portraits = companyTeam.map((person) => {
      const expected = ["Ben Beya Mohamed", "Bouzrara Manel"].indexOf(
        person.name,
      );
      const asset = eligible.find(
        (a) => a.slot === `team-${expected}` && a.label === person.name,
      );
      return asset ? dto(asset) : undefined;
    });
    const logo = eligible.find((a) => a.slot === "logo");
    const hero = eligible
      .filter(
        (a) =>
          a.slot ===
          `hero-${process.env.PRESENTATION_HERO === "s16" ? "s16" : "s08"}`,
      )
      .sort((a, b) => a.width - b.width);
    const gallery: GalleryPhoto[] = eligible
      .filter((a) => a.slot.startsWith("gallery-"))
      .filter((a, i, all) => all.findIndex((b) => b.slot === a.slot) === i)
      .map((a) => {
        const full = eligible
          .filter((b) => b.slot === a.slot)
          .sort((a, b) => b.width - a.width)[0];
        return {
          id: `private-presentation-${a.slot}`,
          ...dto(a),
          fullSrc: dto(full).src,
          caption: a.alt,
          category: null,
          demo: false,
        };
      });
    return {
      partners: eligible
        .filter((a) => /^partner-[0-5]$/.test(a.slot))
        .filter((a, i, all) => all.findIndex((b) => b.slot === a.slot) === i)
        .sort((a, b) => Number(a.slot.slice(8)) - Number(b.slot.slice(8)))
        .map((a) => ({ id: a.slot, label: a.label, ...dto(a) })),
      portraits,
      logo: logo ? dto(logo) : null,
      hero: hero.length
        ? {
            src: dto(hero.at(-1)!).src,
            mobileSrc: dto(hero[0]).src,
            placeholder: false,
            privatePresentation: true,
          }
        : null,
      gallery,
    };
  } catch {
    return null;
  }
});
export async function readOfficialPresentationImage(
  request: Request,
  key: string,
) {
  if (!presentationAuthorized(request.headers) || !/^[a-f0-9]{64}$/.test(key))
    return null;
  try {
    const asset = (await catalog()).find((a) => a.key === key);
    return asset ? await verifiedBytes(asset) : null;
  } catch {
    return null;
  }
}
