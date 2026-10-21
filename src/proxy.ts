import { NextResponse, type NextRequest } from "next/server";
import { stagingEnabled } from "./lib/staging-policy";
import { demoEnabled } from "./lib/content-policy";
import {
  clientDemoEnabled,
  clientDemoHeaders,
  clientDemoRequestAllowed,
} from "./lib/client-demo-policy";
export function proxy(request: NextRequest) {
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
