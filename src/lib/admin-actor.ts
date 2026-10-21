import type { Prisma } from "@prisma/client";
import { BusinessError } from "./bookings";
import { can, type Permission } from "./permissions";

/** Re-read the actor in the write transaction; a request's role can be stale. */
export async function requireActiveActor(
  tx: Prisma.TransactionClient,
  adminId: string,
  permission: Permission,
) {
  const actor = await tx.adminUser.findUnique({
    where: { id: adminId },
    select: { active: true, role: true },
  });
  if (!actor?.active || !can(actor.role, permission))
    throw new BusinessError("Accès non autorisé.", 403);
}
