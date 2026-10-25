import path from "node:path";
import { readReviewConfig } from "../src/lib/client-review-media";
import {
  verifyPresentationDirectory,
  writePresentationRuntime,
} from "./presentation-runtime.mjs";
async function main() {
  if (process.argv.length !== 2) throw Error("Unexpected options");
  const directory = path.resolve(".local/client-review");
  await verifyPresentationDirectory(directory);
  const config = await readReviewConfig();
  await writePresentationRuntime(
    directory,
    "catalog.json",
    JSON.stringify({ ...config, revoked: true }, null, 2),
  );
  console.log(
    "Client review revoked. Requests now fail closed; a running preview will shut down on its next configuration check. Stop the owned Cloudflare tunnel too.",
  );
}
main().catch(() => {
  console.error(
    "Client review revocation could not be verified; stop its owned preview and Cloudflare processes. No settings printed.",
  );
  process.exitCode = 1;
});
