import "server-only";
import { createHmac } from "node:crypto";
import { db } from "./db";
import { serializable } from "./transactions";
export async function rateLimit(
  scope: string,
  identity: string,
  max: number,
  windowMs: number,
) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return false;
  const bucket = Math.floor(Date.now() / windowMs);
  const key = createHmac("sha256", secret)
    .update(scope + ":" + identity + ":" + bucket)
    .digest("hex");
  return serializable(db, async (tx) => {
    const c = await tx.rateLimit.findUnique({ where: { key } });
    if (c && c.count >= max) return false;
    await tx.rateLimit.upsert({
      where: { key },
      create: { key, expiresAt: new Date((bucket + 1) * windowMs) },
      update: { count: { increment: 1 } },
    });
    return true;
  });
}
