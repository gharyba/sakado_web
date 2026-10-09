import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security";
import { createInterface } from "node:readline/promises";
async function main() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
    throw Error("AUTH_SECRET must contain at least 32 random characters.");
  const db = new PrismaClient();
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (await db.adminUser.count({ where: { role: "OWNER", active: true } }))
      throw Error(
        "An active owner already exists. Use the owner-only Users page.",
      );
    const name = (
      process.env.ADMIN_NAME || (await rl.question("Owner name: "))
    ).trim();
    const email = (
      process.env.ADMIN_EMAIL || (await rl.question("Owner email: "))
    )
      .trim()
      .toLowerCase();
    // Supply the password through a process environment variable or secret manager; never echo it.
    const password = process.env.ADMIN_PASSWORD;
    if (
      name.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !password ||
      password.length < 12 ||
      password.length > 256
    )
      throw Error(
        "Supply a name, valid email and ADMIN_PASSWORD (12–256 characters) through the process environment.",
      );
    await db.$transaction(
      async (tx) => {
        if (
          await tx.adminUser.count({ where: { active: true, role: "OWNER" } })
        )
          throw Error("An owner already exists.");
        const user = await tx.adminUser.create({
          data: {
            name,
            email,
            passwordHash: await hashPassword(password),
            role: "OWNER",
            active: true,
          },
        });
        await tx.auditLog.create({
          data: {
            adminId: user.id,
            action: "INITIAL_OWNER_CREATED",
            entityType: "users",
            entityId: user.id,
          },
        });
      },
      { isolationLevel: "Serializable", timeout: 15000 },
    );
    delete process.env.ADMIN_PASSWORD;
    console.log(
      "Initial owner created. Clear ADMIN_PASSWORD from your shell environment.",
    );
  } finally {
    rl.close();
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Owner creation failed.",
  );
  process.exitCode = 1;
});
