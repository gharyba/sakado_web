import assert from "node:assert/strict";
import { phase05Db, verifyPhase05Cluster } from "./phase05-browser/database";
import { requireActiveActor } from "../src/lib/admin-actor";
import { serializable } from "../src/lib/transactions";
import { importInstagramMedia } from "../src/lib/instagram-import";
import urls from "../src/data/instagram-media.json";

async function main() {
  await verifyPhase05Cluster();
  const db = phase05Db();
  try {
    const owner = await db.adminUser.findFirstOrThrow({
      where: { role: "OWNER" },
    });
    const actor = await db.adminUser.create({
      data: {
        email: "phase10-actor@example.invalid",
        name: "Synthetic actor",
        passwordHash: owner.passwordHash,
        role: "OWNER",
      },
    });
    await serializable(db, (tx) => requireActiveActor(tx, actor.id, "users"));
    // The identity captured at request entry still says OWNER. The DB now says EDITOR.
    await db.adminUser.update({
      where: { id: actor.id },
      data: { role: "EDITOR" },
    });
    await assert.rejects(
      serializable(db, (tx) => requireActiveActor(tx, actor.id, "users")),
      { status: 403 },
    );
    await serializable(db, (tx) => requireActiveActor(tx, actor.id, "gallery"));
    await db.adminUser.update({
      where: { id: actor.id },
      data: { active: false },
    });
    const count = await db.auditLog.count();
    await assert.rejects(
      serializable(db, async (tx) => {
        await requireActiveActor(tx, actor.id, "gallery");
        await tx.auditLog.create({
          data: {
            adminId: actor.id,
            action: "MUST_NOT_WRITE",
            entityType: "test",
            entityId: actor.id,
          },
        });
      }),
      { status: 403 },
    );
    assert.equal(await db.auditLog.count(), count);
    await assert.rejects(
      serializable(db, (tx) =>
        requireActiveActor(tx, "missing-actor", "gallery"),
      ),
      { status: 403 },
    );
    // Public canonical URLs only, copied into this disposable cluster; no source DB writes.
    const first = await serializable(db, (tx) =>
      importInstagramMedia(tx, urls),
    );
    const repeated = await serializable(db, (tx) =>
      importInstagramMedia(tx, urls),
    );
    assert.equal(first.imported, 45);
    assert.equal(repeated.imported, 0);
    assert.equal(repeated.duplicates, 45);
    assert.equal(
      await db.instagramMedia.count({
        where: {
          published: false,
          showOnHomepage: false,
          mediaType: "INSTAGRAM_MEDIA",
        },
      }),
      45,
    );
    console.log(
      "Phase 10 transaction actor checks passed: active, changed role, existing editor rights, inactive, missing and no unauthorized write. Instagram import is idempotent and all 45 synthetic imports remain private.",
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error("Phase 10 isolated actor validation failed.");
  process.exitCode = 1;
});
