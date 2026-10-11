"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { authConfigured, COOKIE_NAME } from "@/lib/auth";
import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  tokenHash,
  SESSION_MS,
} from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { operationalFailure } from "@/lib/operational-log";
let dummy: Promise<string> | undefined;
export async function loginAdmin(_state: { error: string }, form: FormData) {
  try {
    if (!authConfigured())
      return { error: "L’accès administrateur doit être configuré." };
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const h = await headers();
    const identity =
      process.env.TRUST_PROXY === "true"
        ? (h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown")
        : "shared";
    if (
      !(await rateLimit("login-account", email, 8, 900000)) ||
      !(await rateLimit("login-origin", identity, 100, 900000))
    )
      return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
    const parsed = z
      .object({
        email: z.email().max(254),
        password: z.string().min(1).max(256),
      })
      .safeParse({ email, password: form.get("password") });
    const failure = { error: "Email ou mot de passe incorrect." };
    if (!parsed.success) return failure;
    const user = await db.adminUser.findUnique({ where: { email } });
    dummy ??= hashPassword(newSessionToken());
    if (
      !(await verifyPassword(
        parsed.data.password,
        user?.passwordHash ?? (await dummy),
      )) ||
      !user?.active
    )
      return failure;
    const token = newSessionToken();
    const old = (await cookies()).get(COOKIE_NAME)?.value;
    await db.$transaction(async (tx) => {
      if (old)
        await tx.adminSession.deleteMany({
          where: { tokenHash: tokenHash(old) },
        });
      await tx.adminSession.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      await tx.rateLimit.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      await tx.adminSession.create({
        data: {
          tokenHash: tokenHash(token),
          adminId: user.id,
          expiresAt: new Date(Date.now() + SESSION_MS),
        },
      });
      await tx.adminUser.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          ...(!user.passwordHash.startsWith("$argon2id$")
            ? { passwordHash: await hashPassword(parsed.data.password) }
            : {}),
        },
      });
    });
    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MS / 1000,
    });
  } catch {
    operationalFailure("login");
    return { error: "Service indisponible. Réessayez dans quelques instants." };
  }
  redirect("/admin");
}
export async function logoutAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token)
    await db.adminSession.deleteMany({
      where: { tokenHash: tokenHash(token) },
    });
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}
