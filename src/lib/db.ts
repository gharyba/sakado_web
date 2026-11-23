import "server-only";
import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { prisma: PrismaClient | undefined };
export const db = globalDb.prisma ?? new PrismaClient();
if (
  process.env.NODE_ENV !== "production" ||
  process.env.CLIENT_REVIEW === "true"
)
  globalDb.prisma = db;
export const databaseConfigured = () => Boolean(process.env.DATABASE_URL);
