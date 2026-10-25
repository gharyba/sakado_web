import path from "node:path";
import { safeRead } from "../../scripts/presentation-files.mjs";
import { reviewAuthorized } from "./client-review-policy";
import {
  reviewConfigSchema,
  reviewConfigValid,
  assetRemotelyGranted,
} from "./client-review-grants";
import { catalog, verifiedBytes } from "./presentation-assets";

export async function readReviewConfig() {
  return reviewConfigSchema.parse(
    JSON.parse(
      (
        await safeRead(
          path.resolve(".local/client-review"),
          "catalog.json",
          100_000,
        )
      ).toString(),
    ),
  );
}
export async function remoteReviewAssets(headers: Pick<Headers, "get">) {
  if (!reviewAuthorized(headers)) return [];
  try {
    const config = await readReviewConfig();
    if (!reviewConfigValid(config, process.env.CLIENT_REVIEW_AUDIENCE_HASH!))
      return [];
    // No local asset catalog/original is read when there are no remote grants.
    if (!config.grants.length) return [];
    return (await catalog()).filter((asset) =>
      assetRemotelyGranted(config, asset),
    );
  } catch {
    return [];
  }
}
export async function readRemoteReviewImage(
  headers: Pick<Headers, "get">,
  key: string,
) {
  if (!reviewAuthorized(headers) || !/^[a-f0-9]{64}$/.test(key)) return null;
  try {
    const asset = (await remoteReviewAssets(headers)).find(
      (asset) => asset.key === key,
    );
    return asset ? await verifiedBytes(asset) : null;
  } catch {
    return null;
  }
}
