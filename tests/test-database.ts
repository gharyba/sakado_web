import { PrismaClient } from "@prisma/client";
export function testDatabaseUrl() {
  if (!process.env.DATABASE_URL) throw Error("DATABASE_URL required.");
  const url = new URL(process.env.DATABASE_URL);
  if (!["localhost", "127.0.0.1"].includes(url.hostname))
    throw Error("Automated tests require a local database.");
  url.pathname = "/sakado_test";
  return url.toString();
}
export function testDb() {
  return new PrismaClient({ datasourceUrl: testDatabaseUrl() });
}
