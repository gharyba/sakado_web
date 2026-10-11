import "server-only";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import {
  authorizeApi,
  sameOrigin,
  jsonError,
  RequestError,
} from "./http-security";
import type { Permission } from "./permissions";
import { BusinessError } from "./bookings";
import { demoEnabled } from "./content-policy";
import { rateLimit } from "./rate-limit";
import { operationalFailure } from "./operational-log";

export async function adminEndpoint(
  request: NextRequest,
  permission: Permission,
  handler: (
    user: NonNullable<Awaited<ReturnType<typeof authorizeApi>>["user"]>,
  ) => Promise<Response>,
  mutation = true,
): Promise<Response> {
  try {
    const auth = await authorizeApi(permission);
    if (auth.response) return auth.response;
    if (mutation) {
      if (!sameOrigin(request)) return jsonError("Origine non autorisée.", 403);
      if (demoEnabled())
        return jsonError(
          "Les modifications sont désactivées en démonstration.",
          409,
        );
      if (!(await rateLimit("admin-mutation", auth.user.id, 300, 900000)))
        return jsonError("Trop de modifications. Réessayez plus tard.", 429);
    }
    return await handler(auth.user);
  } catch (error) {
    if (error instanceof BusinessError || error instanceof RequestError)
      return jsonError(error.message, error.status);
    if (error instanceof SyntaxError)
      return jsonError("Format du programme ou des liens invalide.", 400);
    if (error instanceof ZodError) {
      const response = jsonError("Vérifiez les champs du formulaire.", 400);
      return Response.json(
        {
          error: "Vérifiez les champs du formulaire.",
          fields: Object.fromEntries(
            error.issues
              .filter((i) => typeof i.path[0] === "string")
              .map((i) => [String(i.path[0]), "Vérifiez ce champ."]),
          ),
        },
        { status: 400, headers: response.headers },
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return jsonError("Ce lien ou cet e-mail existe déjà.", 409);
      if (error.code === "P2025") return jsonError("Élément introuvable.", 404);
      if (error.code === "P2003")
        return jsonError(
          "La relation demandée est introuvable ou utilisée.",
          409,
        );
      if (error.code === "P2034")
        return jsonError(
          "Modification concurrente. Rechargez puis réessayez.",
          409,
        );
    }
    operationalFailure("admin");
    return jsonError(
      "Service indisponible. Réessayez dans quelques instants.",
      503,
    );
  }
}
