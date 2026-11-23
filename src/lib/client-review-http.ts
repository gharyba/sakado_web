import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createReviewSession,
  reviewCodeValid,
  reviewCookie,
  reviewCookieValue,
  reviewHeaders,
  reviewPathAllowed,
  reviewProof,
  reviewRequestAllowed,
  reviewSessionValid,
  revokeReviewSession,
} from "./client-review-policy";
import { reviewConfigValid, type ReviewConfig } from "./client-review-grants";

type Options = {
  config: () => Promise<ReviewConfig>;
  media: (headers: Headers, key: string) => Promise<Buffer | null>;
  next: (request: IncomingMessage, response: ServerResponse) => Promise<void>;
};
const login = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Revue privée SAKADO</title><main><h1>Revue privée du site officiel</h1><p>Accès temporaire, en lecture seule. Les médias sans autorisation de revue à distance restent indisponibles.</p><form method="post" action="/_client-review/session"><label for="code">Code de revue privée</label><input id="code" name="code" type="password" autocomplete="off" required maxlength="100"><button>Ouvrir le site officiel</button></form><p>Code valable cinq minutes. Session limitée à trente minutes, dans une revue d’une heure maximum.</p></main></html>`;
export function createReviewHandler(options: Options) {
  let attempts = 0,
    windowStart = 0;
  return async (request: IncomingMessage, response: ServerResponse) => {
    const finish = (status: number, body?: string | Buffer, type?: string) => {
      response.writeHead(status, {
        ...reviewHeaders,
        ...(type ? { "Content-Type": type } : {}),
      });
      response.end(request.method === "HEAD" ? undefined : body);
    };
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers))
        if (value)
          headers.set(key, Array.isArray(value) ? value.join(",") : value);
      // Only this loopback ingress is trusted; email/identity forwarding headers grant nothing.
      if (
        !["127.0.0.1", "::ffff:127.0.0.1"].includes(
          request.socket.remoteAddress ?? "",
        ) ||
        !reviewRequestAllowed(headers)
      )
        return finish(404);
      const config = await options.config();
      if (!reviewConfigValid(config, process.env.CLIENT_REVIEW_AUDIENCE_HASH!))
        return finish(404);
      const raw = request.url ?? "";
      if (
        !raw.startsWith("/") ||
        raw.startsWith("//") ||
        raw.split("?")[0].includes("%") ||
        raw.includes("\\")
      )
        return finish(404);
      const url = new URL(raw, process.env.CLIENT_REVIEW_ORIGIN);
      const method = request.method ?? "GET";
      if (
        url.pathname === "/_client-review" &&
        ["GET", "HEAD"].includes(method)
      )
        return finish(200, login, "text/html; charset=utf-8");
      const token = reviewCookieValue(headers);
      if (url.pathname === "/_client-review/session") {
        if (
          headers.get("origin") !== process.env.CLIENT_REVIEW_ORIGIN ||
          !["same-origin", "none", null].includes(headers.get("sec-fetch-site"))
        )
          return finish(404);
        if (method === "DELETE") {
          revokeReviewSession(token);
          response.setHeader(
            "Set-Cookie",
            `${reviewCookie}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
          );
          return finish(204);
        }
        if (method !== "POST") return finish(404);
        if (Date.now() - windowStart > 60_000) {
          attempts = 0;
          windowStart = Date.now();
        }
        if (++attempts > 10) return finish(429);
        if (
          !headers
            .get("content-type")
            ?.startsWith("application/x-www-form-urlencoded")
        )
          return finish(400);
        let size = 0;
        const parts: Buffer[] = [];
        for await (const part of request.iterator({ destroyOnReturn: false })) {
          const bytes = Buffer.from(part);
          size += bytes.length;
          if (size > 1024) {
            request.resume();
            return finish(400);
          }
          parts.push(bytes);
        }
        const code =
          new URLSearchParams(Buffer.concat(parts).toString()).get("code") ??
          "";
        if (!reviewCodeValid(code)) return finish(403);
        const session = createReviewSession();
        response.setHeader(
          "Set-Cookie",
          `${reviewCookie}=${session.token}; Path=/; Expires=${new Date(session.expires).toUTCString()}; HttpOnly; Secure; SameSite=Strict`,
        );
        response.setHeader("Location", process.env.CLIENT_REVIEW_ORIGIN + "/");
        return finish(303);
      }
      if (!reviewSessionValid(token)) {
        if (
          ["GET", "HEAD"].includes(method) &&
          reviewPathAllowed(url.pathname, method)
        ) {
          response.setHeader(
            "Location",
            process.env.CLIENT_REVIEW_ORIGIN + "/_client-review",
          );
          return finish(303);
        }
        return finish(404);
      }
      if (
        !["same-origin", "none", null].includes(
          headers.get("sec-fetch-site"),
        ) ||
        headers.has("next-action")
      )
        return finish(404);
      headers.set("x-sakado-review-proof", reviewProof(token!));
      const media = /^\/_client-review\/media\/([a-f0-9]{64})$/.exec(
        url.pathname,
      );
      if (media && ["GET", "HEAD"].includes(method)) {
        const bytes = await options.media(headers, media[1]);
        return finish(
          bytes ? 200 : 404,
          bytes ?? undefined,
          bytes ? "image/webp" : undefined,
        );
      }
      if (!reviewPathAllowed(url.pathname, method)) return finish(404);
      // Never forward CMS credentials or an inbound purported authorization proof.
      delete request.headers.authorization;
      request.headers.cookie = `${reviewCookie}=${token}`;
      request.headers["x-sakado-review-proof"] = headers.get(
        "x-sakado-review-proof",
      )!;
      // Next otherwise infers HTTP from this private loopback hop. The external
      // origin was checked above; no arbitrary forwarded host/protocol is trusted.
      request.headers["x-forwarded-proto"] = "https";
      request.headers["x-forwarded-host"] = new URL(
        process.env.CLIENT_REVIEW_ORIGIN!,
      ).host;
      for (const [key, value] of Object.entries(reviewHeaders))
        response.setHeader(key, value);
      await options.next(request, response);
    } catch {
      if (!response.headersSent) finish(404);
      else response.end();
    }
  };
}
