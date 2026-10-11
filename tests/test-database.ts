import { PrismaClient } from "@prisma/client";
import { phase05DatabaseUrl } from "./phase05-browser/database";
export function testDatabaseUrl() {
  return phase05DatabaseUrl();
}
export function testDb() {
  return new PrismaClient({ datasourceUrl: testDatabaseUrl() });
}
