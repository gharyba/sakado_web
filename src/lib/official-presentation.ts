import "server-only";
import { catalog, verifiedBytes, type Asset } from "./presentation-assets";
import { reviewAuthorized } from "./client-review-policy";
import { remoteReviewAssets } from "./client-review-media";
import { cache } from "react";
import { headers } from "next/headers";
import { presentationAuthorized } from "./official-presentation-policy";
import { companyTeam } from "@/data/confirmed/company";
import type { GalleryPhoto } from "./types";

function dto(asset: Asset, remote = false) {
  return {
    src: `${remote ? "/_client-review/media" : "/dev/presentation-media"}/${asset.key}`,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
  };
}
export const getOfficialPresentation = cache(async () => {
  // No private filesystem access until BOTH request and session checks succeed.
  const requestHeaders = await headers();
  const remote = reviewAuthorized(requestHeaders);
  if (!remote && !presentationAuthorized(requestHeaders)) return null;
  try {
    const assets = remote
      ? await remoteReviewAssets(requestHeaders)
      : await catalog();
    const eligible: Asset[] = [];
    for (const asset of assets) {
      try {
        await verifiedBytes(asset);
        eligible.push(asset);
      } catch {
        /* Slot falls back, never another asset. */
      }
    }
    if (remote && !eligible.length) return null;
    const portraits = companyTeam.map((person) => {
      const expected = ["Ben Beya Mohamed", "Bouzrara Manel"].indexOf(
        person.name,
      );
      const asset = eligible.find(
        (a) => a.slot === `team-${expected}` && a.label === person.name,
      );
      return asset ? dto(asset, remote) : undefined;
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
          ...dto(a, remote),
          fullSrc: dto(full, remote).src,
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
        .map((a) => ({ id: a.slot, label: a.label, ...dto(a, remote) })),
      portraits,
      logo: logo ? dto(logo, remote) : null,
      hero: hero.length
        ? {
            src: dto(hero.at(-1)!, remote).src,
            mobileSrc: dto(hero[0], remote).src,
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
