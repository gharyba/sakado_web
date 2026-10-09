import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
const tables = [
  "AdminUser",
  "EventCategory",
  "Destination",
  "Event",
  "EventScheduleItem",
  "GalleryImage",
  "ContactMessage",
  "SiteSettings",
  "SocialLink",
];
mkdirSync(".local", { recursive: true });
if (existsSync(".local/legacy-export.json"))
  throw new Error("Legacy export already exists; it will not be overwritten.");
const sqlite = new DatabaseSync("prisma/dev.db", { readOnly: true });
const records = Object.fromEntries(
  tables.map((table) => [
    table,
    sqlite.prepare(`SELECT * FROM "${table}"`).all(),
  ]),
);
writeFileSync(".local/legacy-export.json", JSON.stringify(records, null, 2));
copyFileSync("prisma/dev.db", ".local/legacy-sakado.db");
copyFileSync(".env", ".local/legacy.env");
sqlite.close();
console.log(
  "Legacy records preserved:",
  Object.fromEntries(
    Object.entries(records).map(([name, rows]) => [name, rows.length]),
  ),
);
