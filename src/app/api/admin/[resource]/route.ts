import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import {
  authorizeApi,
  sameOrigin,
  jsonError,
  readJson,
  RequestError,
} from "@/lib/http-security";
import { db } from "@/lib/db";
import { mutate } from "@/lib/admin-mutations";
import { BusinessError } from "@/lib/bookings";
import type { Permission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { guardMediaSelection } from "@/lib/media-mutation-guard";
const resources: Permission[] = [
  "events",
  "bookings",
  "destinations",
  "categories",
  "gallery",
  "messages",
  "site",
  "settings",
  "users",
];
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!resources.includes(resource as Permission))
    return jsonError("Fonction introuvable.", 404);
  const auth = await authorizeApi(resource as Permission);
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return jsonError("Origine non autorisée.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 250000)
    return jsonError("Demande trop volumineuse.", 413);
  try {
    const input = await readJson(request, 250000);
    await guardMediaSelection(resource, input);
    const result = await mutate(db, resource as Permission, input, auth.user);
    revalidatePath("/", "layout");
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof RequestError)
      return jsonError(error.message, error.status);
    if (error instanceof SyntaxError)
      return jsonError("Format du programme ou des liens invalide.", 400);
    if (error instanceof ZodError)
      return jsonError(
        "Vérifiez le champ " +
          error.issues[0]?.path.join(".") +
          " : " +
          error.issues[0]?.message,
        400,
      );
    if (error instanceof BusinessError)
      return jsonError(error.message, error.status);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return jsonError("Ce lien ou cet e-mail existe déjà.", 409);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return jsonError("Élément introuvable.", 404);
    return jsonError("Impossible d’enregistrer les modifications.", 500);
  }
}
