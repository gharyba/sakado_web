import { mkdir, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const datasource = process.env.DATABASE_URL;
if (!datasource?.startsWith("file:"))
  throw new Error(
    "Set DATABASE_URL to a SQLite file URL before running migrations.",
  );
const target = resolve("prisma", datasource.slice(5));
await mkdir(dirname(target), { recursive: true });
// Append mode creates missing files without truncating an existing database.
const file = await open(target, "a");
await file.close();
