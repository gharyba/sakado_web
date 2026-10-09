import { NextRequest, NextResponse } from "next/server";
import { authorizeApi, sameOrigin, jsonError, readBounded, RequestError } from "@/lib/http-security";
import { normalizeImage, storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(request: NextRequest) {
  const auth = await authorizeApi("gallery");
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return jsonError("Origine non autorisée.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 11 * 1024 * 1024)
    return jsonError("Image trop volumineuse.", 413);
  if (!(await rateLimit("upload", auth.user.id, 60, 3600000)))
    return jsonError("Trop de fichiers. Réessayez plus tard.", 429);
  try {
    const bytes = await readBounded(request, 11 * 1024 * 1024);
    const form = await new Response(new Uint8Array(bytes), { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Choisissez une photo.", 400);
    const alt = String(form.get("alt") ?? "").trim();
    if (alt.length < 2 || alt.length > 300)
      return jsonError("Décrivez la photo (2 à 300 caractères).", 400);
    const optimized = await normalizeImage(file);
    const src = await storage().put(optimized);
    try {
      await db.$transaction(async (tx) => {
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
            adminId: auth.user.id,
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
        message: "Photo ajoutée. Vous pouvez maintenant la publier.",
        redirect: "/admin/gallery",
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof RequestError) return jsonError(error.message, error.status);
    return jsonError(
      "Image refusée. Utilisez un JPEG, PNG ou WebP valide de 10 Mo maximum.",
      400,
    );
  }
}
