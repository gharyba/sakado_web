import { NextResponse, type NextRequest } from "next/server";
import { stagingEnabled } from "./lib/staging-policy";
import { demoEnabled } from "./lib/content-policy";
import { presentationHeaders } from "./lib/official-presentation-policy";
import {
  reviewAuthorized,
  reviewHeaders,
  reviewPathAllowed,
} from "./lib/client-review-policy";
import {
  clientDemoEnabled,
  clientDemoHeaders,
  clientDemoRequestAllowed,
} from "./lib/client-demo-policy";
export function proxy(request: NextRequest) {
  if (process.env.CLIENT_REVIEW === "true") {
    if (
      !reviewAuthorized(request.headers) ||
      !reviewPathAllowed(request.nextUrl.pathname, request.method)
    )
      return new NextResponse(null, { status: 404, headers: reviewHeaders });
    return NextResponse.next({ headers: reviewHeaders });
  }
  if (clientDemoEnabled()) {
    if (!clientDemoRequestAllowed(request.headers))
      return new NextResponse(null, {
        status: 404,
        headers: clientDemoHeaders,
      });
    return NextResponse.next({ headers: clientDemoHeaders });
  }
  const path = request.nextUrl.pathname;
  const adminHost = process.env.ADMIN_URL
    ? new URL(process.env.ADMIN_URL).host
    : null;
  const siteHost = process.env.SITE_URL
    ? new URL(process.env.SITE_URL).host
    : null;
  const dedicated =
    adminHost &&
    siteHost &&
    adminHost !== siteHost &&
    request.headers.get("host") === adminHost;
  const rewrite =
    dedicated && path === "/" ? new URL("/admin", request.url) : null;
  const response = rewrite
    ? NextResponse.rewrite(rewrite)
    : NextResponse.next();
  if (
    process.env.OFFICIAL_PRESENTATION === "true" &&
    process.env.NODE_ENV === "development"
  ) {
    for (const [key, value] of Object.entries(presentationHeaders))
      response.headers.set(key, value);
  }
  if (
    demoEnabled() ||
    stagingEnabled() ||
    dedicated ||
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/api/admin/")
  ) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
