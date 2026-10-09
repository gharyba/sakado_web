import "server-only";
import { cookies } from "next/headers";
import { redirect, forbidden } from "next/navigation";
import { db, databaseConfigured } from "./db";
import { tokenHash } from "./security";
import { can, type Permission } from "./permissions";
export const COOKIE_NAME = "sakado_admin_session";
export function authConfigured() {
  return databaseConfigured() && (process.env.AUTH_SECRET?.length ?? 0) >= 32;
}
export async function currentAdmin() {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[a-zA-Z0-9_-]{43}$/.test(token)) return null;
  const s = await db.adminSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    select: {
      expiresAt: true,
      admin: {
        select: { id: true, name: true, email: true, role: true, active: true },
      },
    },
  });
  return s && s.expiresAt > new Date() && s.admin.active ? s.admin : null;
}
export async function requireAdmin(permission: Permission = "dashboard") {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  if (!can(user.role, permission)) forbidden();
  return user;
}
