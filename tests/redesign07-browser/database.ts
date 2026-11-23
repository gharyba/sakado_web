import pg from "pg";
import { realpathSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";

/** Recheck actual cluster identity before every synthetic fixture/write assertion. */
export async function withTestDatabase<T>(
  work: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const url = new URL(process.env.DATABASE_URL ?? "http://invalid");
  const owned = process.env.REDESIGN07_CLUSTER_DIR ?? "";
  const child = relative(resolve(".local/redesign07"), resolve(owned));
  if (
    url.hostname !== "127.0.0.1" ||
    url.port !== "55447" ||
    url.username !== "redesign07_test" ||
    url.pathname !== "/sakado_redesign07_test" ||
    !owned ||
    child.startsWith("..") ||
    isAbsolute(child)
  )
    throw Error("Disposable Redesign 07 database required.");
  const client = new pg.Client({ connectionString: url.href });
  await client.connect();
  try {
    const identity = (
      await client.query(
        "SELECT current_database() AS name, current_user AS actor, current_setting('data_directory') AS directory",
      )
    ).rows[0];
    if (
      identity.name !== "sakado_redesign07_test" ||
      identity.actor !== "redesign07_test" ||
      realpathSync(identity.directory) !== realpathSync(owned)
    )
      throw Error("Disposable database identity refused.");
    return await work(client);
  } finally {
    await client.end();
  }
}

export async function messageCount(email: string) {
  return withTestDatabase(async (client) =>
    Number(
      (
        await client.query(
          'SELECT count(*) FROM "ContactMessage" WHERE email=$1',
          [email],
        )
      ).rows[0].count,
    ),
  );
}
