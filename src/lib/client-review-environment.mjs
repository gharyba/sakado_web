export const reviewCookie = "__Host-sakado_review";
export const reviewHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};
export function reviewOrigin(value) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:trycloudflare\.com|ngrok-free\.dev)$/.test(
        url.hostname,
      ) &&
      !url.port &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      value === url.origin
      ? url.origin
      : null;
  } catch {
    return null;
  }
}
export function clientReviewEnabled(env = process.env, now = Date.now()) {
  try {
    const db = new URL(env.DATABASE_URL ?? "");
    const started = Number(env.CLIENT_REVIEW_STARTED);
    return (
      env.CLIENT_REVIEW === "true" &&
      env.NODE_ENV === "production" &&
      env.CLIENT_REVIEW_ARTIFACT === "true" &&
      env.DEMO_MODE === "false" &&
      env.CLIENT_DEMO === "false" &&
      env.OFFICIAL_PRESENTATION === "false" &&
      env.STAGING_MODE === "false" &&
      env.CLIENT_REVIEW_DATABASE_VERIFIED === "true" &&
      Boolean(reviewOrigin(env.CLIENT_REVIEW_ORIGIN)) &&
      (env.CLIENT_REVIEW_ORIGIN?.endsWith(".ngrok-free.dev")
        ? env.CLIENT_REVIEW_PROVIDER === "ngrok" &&
          env.CLIENT_REVIEW_BOUND_ORIGIN === env.CLIENT_REVIEW_ORIGIN
        : !env.CLIENT_REVIEW_PROVIDER ||
          env.CLIENT_REVIEW_PROVIDER === "cloudflare") &&
      env.SITE_URL === env.CLIENT_REVIEW_ORIGIN &&
      env.ADMIN_URL === env.CLIENT_REVIEW_ORIGIN &&
      env.TRUST_PROXY === "false" &&
      /^[a-f0-9]{96}$/.test(env.CLIENT_REVIEW_SECRET ?? "") &&
      /^[a-f0-9]{64}$/.test(env.CLIENT_REVIEW_CODE_HASH ?? "") &&
      /^[a-f0-9]{64}$/.test(env.CLIENT_REVIEW_AUDIENCE_HASH ?? "") &&
      started <= now &&
      started > now - 60 * 60_000 &&
      ["postgres:", "postgresql:"].includes(db.protocol) &&
      db.hostname === "127.0.0.1" &&
      db.port === "55432" &&
      db.pathname === "/sakado"
    );
  } catch {
    return false;
  }
}
export function reviewRequestAllowed(headers, env = process.env) {
  const origin = reviewOrigin(env.CLIENT_REVIEW_ORIGIN);
  return (
    clientReviewEnabled(env) &&
    !!origin &&
    headers.get("host") === new URL(origin).host &&
    !headers.get("forwarded") &&
    (!headers.get("x-forwarded-host") ||
      headers.get("x-forwarded-host") === new URL(origin).host) &&
    (!headers.get("x-forwarded-proto") ||
      headers.get("x-forwarded-proto") === "https") &&
    (!headers.get("origin") || headers.get("origin") === origin)
  );
}
export function reviewPathAllowed(path, method = "GET") {
  if (
    !["GET", "HEAD"].includes(method) ||
    path.includes("%") ||
    path.includes("\\") ||
    path.includes("//")
  )
    return false;
  return (
    [
      "/",
      "/about",
      "/experiences",
      "/events",
      "/destinations",
      "/adventures",
      "/gallery",
      "/contact",
      "/privacy",
      "/icon.svg",
      "/favicon.ico",
    ].includes(path) ||
    /^\/(?:events|destinations|adventures)\/[a-z0-9][a-z0-9-]{0,160}$/.test(
      path,
    ) ||
    (/^\/(?:_next\/static|images)\/[a-zA-Z0-9_./-]+$/.test(path) &&
      !path.split("/").includes(".."))
  );
}
