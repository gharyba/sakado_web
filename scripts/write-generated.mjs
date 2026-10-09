import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, sep } from "node:path";
const root = resolve(".");
const files = JSON.parse(readFileSync(process.argv[2], "utf8"));
for (const [path, content] of Object.entries(files)) {
  const target = resolve(path);
  if (!target.startsWith(root + sep) || target.includes(sep + ".git" + sep))
    throw Error("Invalid workspace target");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}
console.log(`Updated ${Object.keys(files).length} project files.`);
