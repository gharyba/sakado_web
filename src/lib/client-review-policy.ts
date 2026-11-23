import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  clientReviewEnabled,
  reviewCookie,
  reviewRequestAllowed,
  type Environment,
  type HeaderBag,
} from "./client-review-environment.mjs";
export * from "./client-review-environment.mjs";
export const reviewHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
type Session = { expires: number; run: string };
const shared = globalThis as typeof globalThis & {
  __sakadoRemoteReviewSessions?: Map<string, Session>;
};
function sessions(now: number) {
  const store = (shared.__sakadoRemoteReviewSessions ??= new Map());
  for (const [key, session] of store)
    if (session.expires <= now) store.delete(key);
  return store;
}
const run = (env: Environment) =>
  reviewHash(`${env.CLIENT_REVIEW_SECRET}:${env.CLIENT_REVIEW_STARTED}`);
export function createReviewSession(
  env: Environment = process.env,
  now = Date.now(),
) {
  if (!clientReviewEnabled(env, now)) throw Error("Client review disabled");
  const store = sessions(now);
  if (store.size >= 64) throw Error("Client review session limit");
  const token = randomBytes(32).toString("hex");
  const expires = Math.min(
    now + 30 * 60_000,
    Number(env.CLIENT_REVIEW_STARTED) + 60 * 60_000,
  );
  store.set(reviewHash(token), { expires, run: run(env) });
  return { token, expires };
}
export function reviewSessionValid(
  token: string | undefined,
  env: Environment = process.env,
  now = Date.now(),
) {
  if (!clientReviewEnabled(env, now) || !token || !/^[a-f0-9]{64}$/.test(token))
    return false;
  const session = sessions(now).get(reviewHash(token));
  return !!session && session.expires > now && session.run === run(env);
}
export function revokeReviewSession(token: string | undefined) {
  if (token) sessions(Date.now()).delete(reviewHash(token));
}
export function clearReviewSessions() {
  sessions(Date.now()).clear();
}
export function reviewCookieValue(headers: HeaderBag) {
  const values =
    headers
      .get("cookie")
      ?.split(";")
      .map((value) => value.trim())
      .filter((value) => value.startsWith(reviewCookie + "=")) ?? [];
  return values.length === 1
    ? values[0].slice(reviewCookie.length + 1)
    : undefined;
}
const equal = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function reviewCodeValid(
  code: string,
  env: Environment = process.env,
  now = Date.now(),
) {
  return (
    clientReviewEnabled(env, now) &&
    now < Number(env.CLIENT_REVIEW_STARTED) + 5 * 60_000 &&
    code.length <= 100 &&
    equal(reviewHash(code), env.CLIENT_REVIEW_CODE_HASH!)
  );
}
export function reviewProof(
  token: string,
  env: Environment = process.env,
  now = Date.now(),
) {
  return `${now}.${createHmac("sha256", env.CLIENT_REVIEW_SECRET!).update(`${now}:${token}:${env.CLIENT_REVIEW_ORIGIN}`).digest("hex")}`;
}
export function reviewAuthorized(
  headers: HeaderBag,
  env: Environment = process.env,
  now = Date.now(),
) {
  const token = reviewCookieValue(headers);
  if (
    !reviewRequestAllowed(headers, env) ||
    !reviewSessionValid(token, env, now)
  )
    return false;
  const proof = headers.get("x-sakado-review-proof") ?? "";
  const [stamp] = proof.split(".");
  return (
    /^\d{13}\.[a-f0-9]{64}$/.test(proof) &&
    Number(stamp) <= now &&
    now - Number(stamp) < 10_000 &&
    equal(proof, reviewProof(token!, env, Number(stamp)))
  );
}
