import { realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { PrismaClient } from "@prisma/client";
import { ciDatabaseUrl } from "../ci-database-policy";

export function phase05DatabaseUrl() {
  if (process.env.SAKADO_CI_DATABASE) return ciDatabaseUrl();
  const value = process.env.DATABASE_URL;
  const dir = process.env.PHASE05_TEST_CLUSTER_DIR;
  if (!value || !dir)
    throw Error("Use npm run test:phase05; isolated cluster marker required.");
  const url = new URL(value);
  const root = realpathSync(resolve(".local/phase05")) + sep;
  if (
    url.hostname !== "127.0.0.1" ||
    url.port !== "55435" ||
    url.pathname !== "/sakado_test" ||
    url.username !== "phase05_test" ||
    !realpathSync(dir).startsWith(root) ||
    !resolve(dir).split(sep).pop()?.startsWith("postgres-")
  )
    throw Error("Refusing non-isolated Phase 05 database.");
  return value;
}
export function phase05Db() {
  return new PrismaClient({ datasourceUrl: phase05DatabaseUrl() });
}
export async function verifyPhase05Cluster() {
  const db = phase05Db();
  try {
    const [result] = await db.$queryRawUnsafe<{ data_directory: string }[]>(
      "SHOW data_directory",
    );
    if (process.env.SAKADO_CI_DATABASE) {
      const [server] = await db.$queryRaw<
        { version: number; database: string; username: string }[]
      >`SELECT current_setting('server_version_num')::int AS version, current_database() AS database, current_user AS username`;
      if (
        result.data_directory !== "/var/lib/postgresql/data" ||
        server.version < 160000 ||
        server.version >= 170000 ||
        server.database !== "sakado_test" ||
        server.username !== "sakado_ci"
      )
        throw Error(
          "Connected database does not match the disposable PostgreSQL 16 CI service.",
        );
      return;
    }
    if (
      realpathSync(result.data_directory) !==
      realpathSync(process.env.PHASE05_TEST_CLUSTER_DIR!)
    )
      throw Error("Connected cluster does not match Phase 05 marker.");
  } finally {
    await db.$disconnect();
  }
}
