import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { createBooking, BusinessError } from "@/lib/bookings";
import { sameOrigin, jsonError, readJson, RequestError } from "@/lib/http-security";
import { rateLimit } from "@/lib/rate-limit";
import { demoEnabled } from "@/lib/content-policy";
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return jsonError("Origine non autorisée.", 403);
  if (demoEnabled())
    return jsonError(
      "Les inscriptions sont désactivées en démonstration.",
      409,
    );
  if (Number(request.headers.get("content-length") ?? 0) > 20000)
    return jsonError("Demande trop volumineuse.", 413);
  try {
    const input = await readJson(request, 20000);
    if (input.website) return jsonError("Demande refusée.", 400);
    if (
      !(await rateLimit("registration-global", "all", 300, 3600000)) ||
      !(await rateLimit(
        "registration-email",
        String(input.email ?? "").toLowerCase(),
        5,
        900000,
      ))
    )
      return jsonError("Trop de demandes. Réessayez plus tard.", 429);
    const result = await createBooking(db, input);
    return NextResponse.json(result, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof RequestError) return jsonError(error.message, error.status);
    if (error instanceof ZodError)
      return jsonError(
        "Vérifiez vos coordonnées et le nombre de participants.",
        400,
      );
    if (error instanceof BusinessError)
      return jsonError(error.message, error.status);
    return jsonError("Impossible d’enregistrer votre demande. Réessayez.", 500);
  }
}
