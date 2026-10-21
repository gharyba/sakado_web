import { Client } from "pg";
import { realpathSync } from "node:fs";

export default async function verifyLocal() {
  // The config already pins host, database, port and local credentials.
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  try {
    await db.connect();
    await db.query("BEGIN READ ONLY");
    const {
      rows: [identity],
    } = await db.query(
      "SELECT current_database() AS db,inet_server_port() AS port,current_setting('data_directory') AS directory",
    );
    if (
      identity.db !== "sakado" ||
      identity.port !== 55432 ||
      realpathSync(identity.directory) !== realpathSync(".local/postgres")
    )
      throw new Error("Unexpected database identity; no tests run.");
    const {
      rows: [counts],
    } = await db.query(
      'SELECT (SELECT count(*) FROM "EventCategory" WHERE enabled AND source=\'CONFIRMED\')::int AS categories,(SELECT count(*) FROM "InstagramMedia" WHERE NOT published AND NOT "showOnHomepage")::int AS instagram',
    );
    if (counts.categories < 7 || counts.instagram !== 45)
      throw new Error("Unexpected local content baseline; no tests run.");
    await db.query("ROLLBACK");
  } finally {
    await db.end();
  }
}
