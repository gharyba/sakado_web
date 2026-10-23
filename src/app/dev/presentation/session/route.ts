import { NextResponse } from "next/server";
import {
  accessCodeValid,
  createPresentationSession,
  presentationCookie,
  presentationHeaders,
  presentationRequestAllowed,
  presentationCookieValue,
  revokePresentationSession,
} from "@/lib/official-presentation-policy";
let attempts = 0,
  windowStart = 0;
export async function POST(request: Request) {
  const deny = (status = 404) =>
    new Response(null, { status, headers: presentationHeaders });
  if (
    !presentationRequestAllowed(request.headers) ||
    request.headers.get("origin") !== process.env.PRESENTATION_ORIGIN
  )
    return deny();
  if (Date.now() - windowStart > 60_000) {
    windowStart = Date.now();
    attempts = 0;
  }
  if (++attempts > 10) return deny(429);
  if (
    !request.headers
      .get("content-type")
      ?.startsWith("application/x-www-form-urlencoded")
  )
    return deny(400);
  // Stream a bounded body; Content-Length is not trusted.
  const reader = request.body?.getReader();
  if (!reader) return deny(400);
  let body = "",
    size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) {
        await reader.cancel();
        return deny(400);
      }
      body += new TextDecoder().decode(value);
    }
  } catch {
    return deny(400);
  }
  const code = new URLSearchParams(body).get("code") ?? "";
  if (!accessCodeValid(code)) return deny(403);
  const response = NextResponse.redirect(
    new URL("/", process.env.PRESENTATION_ORIGIN),
    303,
  );
  for (const [k, v] of Object.entries(presentationHeaders))
    response.headers.set(k, v);
  response.cookies.set(presentationCookie, createPresentationSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    expires: new Date(Number(process.env.PRESENTATION_STARTED) + 60 * 60_000),
  });
  return response;
}
export async function DELETE(request: Request) {
  if (
    !presentationRequestAllowed(request.headers) ||
    request.headers.get("origin") !== process.env.PRESENTATION_ORIGIN
  )
    return new Response(null, { status: 404, headers: presentationHeaders });
  revokePresentationSession(presentationCookieValue(request.headers));
  const response = new NextResponse(null, {
    status: 204,
    headers: presentationHeaders,
  });
  response.cookies.set(presentationCookie, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: 0,
  });
  return response;
}
