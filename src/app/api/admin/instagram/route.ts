import { adminEndpoint } from "@/lib/admin-endpoint";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { readJson, RequestError } from "@/lib/http-security";
import { serializable } from "@/lib/transactions";
import {
  instagramMediaSchema,
  normalizeInstagramImport,
} from "@/lib/instagram-policy";
import { importInstagramMedia } from "@/lib/instagram-import";
import { id } from "@/lib/admin-validation";
import { mediaSelectionAllowed } from "@/lib/media-readiness";
import { requireActiveActor } from "@/lib/admin-actor";
export async function POST(request: NextRequest) {
  return adminEndpoint(request, "gallery", async (user) => {
    const input = await readJson(request, 60000);
    if (
      (input.intent ?? "save") === "save" &&
      !(await mediaSelectionAllowed(input.previewImage))
    )
      throw new RequestError(
        "Aperçu bloqué : autorisation de publication requise.",
        409,
      );
    const result = await serializable(db, async (tx) => {
      await requireActiveActor(tx, user.id, "gallery");
      const intent = String(input.intent ?? "save");
      let entityId = "bulk";
      let message = "Publication enregistrée.";
      if (intent === "import") {
        if (typeof input.urls !== "string")
          throw new RequestError("Liste de liens requise.");
        const values = input.urls
          .split(/\r?\n/)
          .map((v) => v.trim())
          .filter(Boolean);
        try {
          normalizeInstagramImport(values);
        } catch {
          throw new RequestError("Liste de liens Instagram invalide.");
        }
        // Database failures reach the shared safe boundary, never a public parser error.
        const result = await importInstagramMedia(tx, values);
        message =
          result.imported +
          " publication(s) importée(s), " +
          result.duplicates +
          " doublon(s). Les nouvelles publications restent privées.";
      } else if (intent === "delete") {
        entityId = id.parse(input.id);
        await tx.instagramMedia.delete({ where: { id: entityId } });
        message =
          "Publication retirée de Sakado. Le contenu Instagram est conservé.";
      } else if (intent === "save") {
        const data = instagramMediaSchema.parse(input);
        if (
          data.previewImage &&
          !(await tx.galleryImage.findFirst({
            where: { src: data.previewImage, authorized: true },
          }))
        )
          throw new RequestError(
            "Choisissez une photo autorisée dans la galerie.",
          );
        const row = input.id
          ? await tx.instagramMedia.update({
              where: { id: id.parse(input.id) },
              data,
            })
          : await tx.instagramMedia.create({ data });
        entityId = row.id;
      } else throw new RequestError("Action inconnue.");
      await tx.auditLog.create({
        data: {
          adminId: user.id,
          action: "INSTAGRAM_" + intent.toUpperCase(),
          entityType: "instagram",
          entityId,
        },
      });
      return { message };
    });
    revalidatePath("/", "layout");
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  });
}
