import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  authorizeApi,
  sameOrigin,
  readJson,
  jsonError,
  RequestError,
} from "@/lib/http-security";
import { serializable } from "@/lib/transactions";
import { instagramMediaSchema } from "@/lib/instagram-policy";
import { importInstagramMedia } from "@/lib/instagram-import";
import { id } from "@/lib/admin-validation";
export async function POST(request: NextRequest) {
  const auth = await authorizeApi("gallery");
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return jsonError("Origine non autorisée.", 403);
  try {
    const input = await readJson(request, 60000);
    const result = await serializable(db, async (tx) => {
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
        let result;
        try {
          result = await importInstagramMedia(tx, values);
        } catch (error) {
          throw new RequestError(
            error instanceof Error ? error.message : "Import invalide.",
          );
        }
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
          adminId: auth.user.id,
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
  } catch (error) {
    if (error instanceof RequestError)
      return jsonError(error.message, error.status);
    if (error instanceof ZodError)
      return jsonError(
        "Vérifiez les champs : " + error.issues[0]?.message,
        400,
      );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return jsonError("Cette publication existe déjà.", 409);
      if (error.code === "P2025")
        return jsonError("Publication introuvable.", 404);
      if (error.code === "P2003")
        return jsonError("Sortie ou destination introuvable.", 400);
    }
    return jsonError("Impossible d’enregistrer la publication.", 500);
  }
}
