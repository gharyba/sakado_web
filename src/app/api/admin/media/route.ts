import { adminEndpoint } from "@/lib/admin-endpoint";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, readBounded, RequestError } from "@/lib/http-security";
import { normalizeImage, storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { canUseMediaBytes } from "@/lib/media-readiness";
import { requireActiveActor } from "@/lib/admin-actor";
import { serializable } from "@/lib/transactions";
export async function POST(request: NextRequest) {
  return adminEndpoint(request, "gallery", async (user) => {
    if (Number(request.headers.get("content-length") ?? 0) > 11 * 1024 * 1024)
      return jsonError("Image trop volumineuse.", 413);
    if (!(await rateLimit("upload", user.id, 60, 3600000)))
      return jsonError("Trop de fichiers. Réessayez plus tard.", 429);
    const bytes = await readBounded(request, 11 * 1024 * 1024);
    const form = await new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    })
      .formData()
      .catch(() => {
        throw new RequestError("Formulaire de fichier invalide.");
      });
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Choisissez une photo.", 400);
    const alt = String(form.get("alt") ?? "").trim();
    if (alt.length < 2 || alt.length > 300)
      return jsonError("Décrivez la photo (2 à 300 caractères).", 400);
    if (
      !(await canUseMediaBytes(
        new Uint8Array(await file.arrayBuffer()),
        file.name,
      ))
    )
      return jsonError(
        "Photo bloquée : validation humaine des droits requise avant import.",
        409,
      );
    const optimized = await normalizeImage(file).catch(() => {
      throw new RequestError(
        "Image JPEG, PNG ou WebP invalide (10 Mo maximum).",
      );
    });
    if (!(await canUseMediaBytes(optimized, file.name)))
      return jsonError(
        "Cette version optimisée doit être validée avant import.",
        409,
      );
    const src = await storage().put(optimized);
    try {
      await serializable(db, async (tx) => {
        await requireActiveActor(tx, user.id, "gallery");
        const row = await tx.galleryImage.create({
          data: {
            src,
            alt,
            authorized: form.get("authorized") === "on",
            source: "CONFIRMED",
          },
        });
        await tx.auditLog.create({
          data: {
            adminId: user.id,
            action: "GALLERY_UPLOADED",
            entityType: "gallery",
            entityId: row.id,
          },
        });
      });
    } catch (error) {
      await storage().remove(src.split("/").pop()!);
      throw error;
    }
    return NextResponse.json(
      {
        message:
          "Photo ajoutée à la galerie privée. Vérifiez les autorisations avant publication.",
        redirect: "/admin/gallery",
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  });
}
