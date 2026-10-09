import argon2 from "argon2";
import {
  createHash,
  randomBytes,
  scrypt as legacyScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
export const SESSION_MS = 8 * 60 * 60 * 1000;
export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}
export async function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("$argon2id$")) {
    try {
      return await argon2.verify(stored, password);
    } catch {
      return false;
    }
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const key = (await promisify(legacyScrypt)(password, salt, 64)) as Buffer;
  return timingSafeEqual(key, Buffer.from(hash, "hex"));
}
export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
const buckets = new Map<string, { count: number; resetAt: number }>();
export function allowRequest(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
) {
  for (const [id, item] of buckets) if (item.resetAt <= now) buckets.delete(id);
  const bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size > 5000) return false;
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}
