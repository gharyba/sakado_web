/** Private preview is deliberately impossible in production, staging or with a DB. */
export function clientDemoEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    env.NODE_ENV === "development" &&
    env.CLIENT_DEMO === "true" &&
    env.DEMO_MODE === "true" &&
    env.STAGING_MODE !== "true" &&
    !env.DATABASE_URL
  );
}

export function loopbackHost(host: string | null): boolean {
  if (!host || !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host))
    return false;
  try {
    return new URL(`http://${host}`).port !== "0";
  } catch {
    return false;
  }
}

export function clientDemoRequestAllowed(
  headers: Pick<Headers, "get">,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (!clientDemoEnabled(env) || !loopbackHost(headers.get("host")))
    return false;
  if (headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = headers.get("origin");
  return !origin || origin === `http://${headers.get("host")}`;
}

export const clientDemoHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
};
