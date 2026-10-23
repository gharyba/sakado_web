import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

type Environment = Record<string, string | undefined>;
export const presentationCookie = "sakado_local_presentation";
export const presentationHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
};
export function presentationEnabled(
  env: Environment = process.env,
  now = Date.now(),
) {
  try {
    const db = new URL(env.DATABASE_URL ?? "");
    const started = Number(env.PRESENTATION_STARTED);
    return (
      env.NODE_ENV === "development" &&
      env.OFFICIAL_PRESENTATION === "true" &&
      env.DEMO_MODE === "false" &&
      env.CLIENT_DEMO === "false" &&
      env.STAGING_MODE === "false" &&
      env.PRESENTATION_DATABASE_VERIFIED === "true" &&
      env.PRESENTATION_ORIGIN === "http://127.0.0.1:3134" &&
      /^[a-f0-9]{96}$/.test(env.PRESENTATION_SECRET ?? "") &&
      /^[a-f0-9]{64}$/.test(env.PRESENTATION_CODE_HASH ?? "") &&
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
export function presentationRequestAllowed(
  headers: Pick<Headers, "get">,
  env: Environment = process.env,
) {
  return (
    presentationEnabled(env) &&
    headers.get("host") === "127.0.0.1:3134" &&
    !headers.get("forwarded") &&
    (!headers.get("x-forwarded-host") ||
      headers.get("x-forwarded-host") === headers.get("host")) &&
    (!headers.get("sec-fetch-site") ||
      ["same-origin", "none"].includes(headers.get("sec-fetch-site")!)) &&
    (!headers.get("origin") ||
      headers.get("origin") === env.PRESENTATION_ORIGIN)
  );
}
function equal(a: string, b: string) {
  return (
    a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}
export function accessCodeValid(
  code: string,
  env: Environment = process.env,
  now = Date.now(),
) {
  return (
    presentationEnabled(env, now) &&
    now < Number(env.PRESENTATION_STARTED) + 5 * 60_000 &&
    code.length <= 100 &&
    equal(
      createHash("sha256").update(code).digest("hex"),
      env.PRESENTATION_CODE_HASH!,
    )
  );
}
type ViewingSession = { expires: number; run: string };
// Shared across Next server bundles/HMR in this single-process, loopback-only mode.
// No CMS sessions, database writes or cross-process production assumptions.
const localState = globalThis as typeof globalThis & {
  __sakadoPresentationSessionsV2?: Map<string, ViewingSession>;
};
function sessions(now: number) {
  const store = (localState.__sakadoPresentationSessionsV2 ??= new Map());
  for (const [key, session] of store)
    if (session.expires <= now) store.delete(key);
  return store;
}
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const runIdentity = (env: Environment) =>
  tokenHash(`${env.PRESENTATION_SECRET}:${env.PRESENTATION_STARTED}`);
export function createPresentationSession(env: Environment = process.env) {
  if (!presentationEnabled(env)) throw Error("Presentation disabled");
  const expires = String(Number(env.PRESENTATION_STARTED) + 60 * 60_000);
  const nonce = randomBytes(24).toString("hex");
  const signature = createHmac("sha256", env.PRESENTATION_SECRET!)
    .update(`presentation-v2:${expires}:${nonce}`)
    .digest("hex");
  const token = `${expires}.${nonce}.${signature}`;
  const store = sessions(Date.now());
  if (store.size >= 256) throw Error("Presentation session limit reached");
  store.set(tokenHash(token), {
    expires: Number(expires),
    run: runIdentity(env),
  });
  return token;
}
export function presentationSessionValid(
  token: string | undefined,
  env: Environment = process.env,
  now = Date.now(),
) {
  if (
    !presentationEnabled(env, now) ||
    !token ||
    !/^\d{13}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(token)
  )
    return false;
  const [expires, nonce, signature] = token.split(".");
  if (
    Number(expires) !== Number(env.PRESENTATION_STARTED) + 60 * 60_000 ||
    Number(expires) <= now
  )
    return false;
  if (
    !equal(
      signature,
      createHmac("sha256", env.PRESENTATION_SECRET!)
        .update(`presentation-v2:${expires}:${nonce}`)
        .digest("hex"),
    )
  )
    return false;
  const session = sessions(now).get(tokenHash(token));
  return (
    session?.expires === Number(expires) && session.run === runIdentity(env)
  );
}
export function revokePresentationSession(
  token: string | undefined,
  env: Environment = process.env,
) {
  if (!presentationSessionValid(token, env)) return false;
  return sessions(Date.now()).delete(tokenHash(token!));
}
export function presentationCookieValue(headers: Pick<Headers, "get">) {
  return headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(presentationCookie + "="))
    ?.slice(presentationCookie.length + 1);
}
export function presentationAuthorized(headers: Pick<Headers, "get">) {
  return (
    presentationRequestAllowed(headers) &&
    presentationSessionValid(presentationCookieValue(headers))
  );
}
