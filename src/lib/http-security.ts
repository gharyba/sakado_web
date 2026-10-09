import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "./auth";
import { can, type Permission } from "./permissions";
export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return (
      parsed.host === request.headers.get("host") &&
      ["http:", "https:"].includes(parsed.protocol)
    );
  } catch {
    return false;
  }
}
export function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function readBounded(request: NextRequest, max: number) {
  if (Number(request.headers.get("content-length") ?? 0) > max)
    throw new RequestError("Demande trop volumineuse.", 413);
  if (!request.body) throw new RequestError("Demande vide.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        await reader.cancel();
        throw new RequestError("Demande trop volumineuse.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
export async function readJson(request: NextRequest, max: number) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new RequestError("Format JSON requis.", 415);
  let input: unknown;
  try {
    input = JSON.parse((await readBounded(request, max)).toString("utf8"));
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError("Demande JSON invalide.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new RequestError("Demande invalide.");
  return input as Record<string, unknown>;
}
export async function authorizeApi(permission: Permission) {
  const user = await currentAdmin();
  if (!user) return { response: jsonError("Authentification requise.", 401) };
  if (!can(user.role, permission))
    return { response: jsonError("Accès non autorisé.", 403) };
  return { user };
}
