import fs from "node:fs/promises";
import path from "node:path";

const privateRoots = [".local", "SAKADO-MEDIA"].map((name) =>
  path.resolve(name),
);
let count = 0;
async function inspect(filename) {
  const trace = JSON.parse(await fs.readFile(filename, "utf8"));
  if (!Array.isArray(trace.files)) throw new Error("Invalid build trace.");
  count++;
  for (const file of trace.files) {
    const resolved = path.resolve(path.dirname(filename), file);
    if (
      privateRoots.some(
        (root) => resolved === root || resolved.startsWith(root + path.sep),
      )
    )
      throw new Error(
        "Private local files found in deployment traces. Do not distribute this build.",
      );
  }
}
async function visit(directory) {
  for (const item of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) await visit(filename);
    else if (item.isFile() && item.name.endsWith(".nft.json"))
      await inspect(filename);
  }
}
const artifact = process.argv.includes("--client-review")
  ? ".next-client-review"
  : ".next";
await visit(path.join(artifact, "server"));
for (const name of await fs.readdir(artifact))
  if (name.endsWith(".nft.json")) await inspect(path.join(artifact, name));
if (!count) throw new Error("No production deployment traces found.");
console.log(
  `Private demo build gate passed: ${count} deployment traces contain no private workspace files.`,
);
