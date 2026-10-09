import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync(".local/legacy-export.json", "utf8"));
if (Object.values(data).some((rows) => rows.length))
  throw Error(
    "Legacy records exist. Import and verify them before switching the application.",
  );
console.log(
  "Verified: legacy application database contains no records; no data import is necessary.",
);
