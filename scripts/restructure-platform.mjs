import { mkdirSync, renameSync, existsSync, copyFileSync } from "node:fs";
import { resolve, sep } from "node:path";
const root = resolve(".");
function move(from, to) {
  const a = resolve(from),
    b = resolve(to);
  if (!a.startsWith(root + sep) || !b.startsWith(root + sep))
    throw Error("Path outside workspace");
  if (existsSync(b)) throw Error("Target already exists: " + to);
  renameSync(a, b);
}
mkdirSync("prisma/legacy-sqlite", { recursive: true });
copyFileSync("prisma/schema.prisma", "prisma/legacy-sqlite/schema.prisma");
move("prisma/migrations", "prisma/legacy-sqlite/migrations");
mkdirSync("src/app/(public)", { recursive: true });
for (const name of [
  "page.tsx",
  "about",
  "contact",
  "destinations",
  "events",
  "experiences",
  "gallery",
  "privacy",
])
  move("src/app/" + name, "src/app/(public)/" + name);
mkdirSync("src/app/admin/(protected)", { recursive: true });
move("src/app/admin/page.tsx", "src/app/admin/(protected)/page.tsx");
