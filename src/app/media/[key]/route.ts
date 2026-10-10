import { NextResponse } from "next/server";
import { db, databaseConfigured } from "@/lib/db";
import { demoEnabled } from "@/lib/content-policy";
import { canUseMediaBytes } from "@/lib/media-readiness";
import { currentAdmin } from "@/lib/auth";
import { storage } from "@/lib/storage";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (
    demoEnabled() ||
    !databaseConfigured() ||
    !/^[0-9a-f-]{36}\.webp$/.test(key)
  )
    return new NextResponse(null, { status: 404 });
  const src = "/media/" + key;
  const image = await db.galleryImage.findFirst({
    where: { src },
    include: { event: true, destination: true },
  });
  if (!image) return new NextResponse(null, { status: 404 });
  const publicParents =
    (!image.event ||
      (image.event.published &&
        image.event.source === "CONFIRMED" &&
        !["DRAFT", "CANCELLED", "ARCHIVED"].includes(image.event.status))) &&
    (!image.destination ||
      (image.destination.published &&
        !image.destination.archived &&
        image.destination.source === "CONFIRMED"));
  const publicGallery =
    image.authorized &&
    image.published &&
    image.source === "CONFIRMED" &&
    publicParents;
  let publicCover = false;
  if (image.authorized && image.source === "CONFIRMED" && publicParents) {
    const [events, places, settings] = await Promise.all([
      db.event.count({
        where: {
          coverImage: src,
          published: true,
          source: "CONFIRMED",
          status: { notIn: ["DRAFT", "CANCELLED", "ARCHIVED"] },
        },
      }),
      db.destination.count({
        where: {
          coverImage: src,
          published: true,
          archived: false,
          source: "CONFIRMED",
        },
      }),
      db.siteSettings.findUnique({ where: { id: "main" } }),
    ]);
    const content = settings?.content as Record<string, unknown> | undefined;
    publicCover =
      events > 0 ||
      places > 0 ||
      content?.logoPath === src ||
      content?.heroImage === src;
  }
  if (!publicGallery && !publicCover && !(await currentAdmin()))
    return new NextResponse(null, { status: 404 });
  try {
    const bytes = await storage().read(key);
    if (!(await canUseMediaBytes(bytes, key)))
      return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
