import { NextRequest, NextResponse } from "next/server";
import { readJson, jsonError } from "@/lib/http-security";
import { adminEndpoint } from "@/lib/admin-endpoint";
import { db } from "@/lib/db";
import { mutate } from "@/lib/admin-mutations";
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
  return adminEndpoint(request, resource as Permission, async (user) => {
    const input = await readJson(request, 250000);
    await guardMediaSelection(resource, input);
    const result = await mutate(db, resource as Permission, input, user);
    revalidatePath("/", "layout");
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  });
}
