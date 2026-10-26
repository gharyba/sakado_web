import { request } from "node:http";
import path from "node:path";
import { safeRead } from "./presentation-files.mjs";
import { verifyPresentationDirectory } from "./presentation-runtime.mjs";
import { readReviewConfig } from "../src/lib/client-review-media";
import {
  reviewAudience,
  reviewConfigValid,
} from "../src/lib/client-review-grants";
import { reviewCookie } from "../src/lib/client-review-policy";

export async function verifyNgrokReviewReady() {
  const directory = path.resolve(".local/client-review");
  await verifyPresentationDirectory(directory);
  const config = await readReviewConfig();
  if (!config.transport || !reviewConfigValid(config, reviewAudience(config)))
    throw Error("Active pinned ngrok configuration required");
  const origin = config.transport.origin;
  const lock = (await safeRead(directory, "run.lock", 100)).toString();
  if (!/^[1-9][0-9]*$/.test(lock)) throw Error("Owned preview lock required");
  // Signal 0 probes liveness; it never terminates the preview.
  process.kill(Number(lock), 0);
  const send = (
    pathname: string,
    method = "GET",
    headers: Record<string, string> = {},
    body = "",
  ) =>
    new Promise<{
      status: number;
      headers: import("node:http").IncomingHttpHeaders;
    }>((resolve, reject) => {
      const req = request(
        {
          host: "127.0.0.1",
          port: 3144,
          path: pathname,
          method,
          headers: { host: new URL(origin).host, ...headers },
        },
        (res) => {
          res.resume();
          res.once("end", () =>
            resolve({ status: res.statusCode!, headers: res.headers }),
          );
        },
      );
      req.setTimeout(5000, () => req.destroy());
      req.on("error", reject);
      req.end(body);
    });
  const need = (value: unknown) => {
    if (!value) throw Error("Local review access-control preflight failed");
  };
  need((await send("/_client-review")).status === 200);
  const anonymous = await send("/");
  need(
    anonymous.status === 303 &&
      anonymous.headers.location === origin + "/_client-review",
  );
  need(
    (
      await send("/_client-review/media/" + "a".repeat(64), "GET", {
        "Ngrok-Auth-User-Email": config.allowedEmails[0],
      })
    ).status === 404,
  );
  need(
    (await send("/_client-review", "GET", { host: "127.0.0.1:3144" }))
      .status === 404,
  );
  need(
    (
      await send("/_client-review/session", "POST", {
        origin: "https://invalid.example.test",
      })
    ).status === 404,
  );
  const code = (await safeRead(directory, "access-code.txt", 100))
    .toString()
    .trim();
  const opened = await send(
    "/_client-review/session",
    "POST",
    { origin, "content-type": "application/x-www-form-urlencoded" },
    new URLSearchParams({ code }).toString(),
  );
  need(opened.status === 303 && opened.headers.location === origin + "/");
  const setCookie = opened.headers["set-cookie"]?.[0] ?? "";
  need(
    setCookie.startsWith(reviewCookie + "=") &&
      /; HttpOnly; Secure; SameSite=Strict/.test(setCookie) &&
      !/; Domain=/i.test(setCookie),
  );
  const cookie = setCookie.split(";")[0];
  try {
    const page = await send("/", "GET", { cookie });
    need(
      page.status === 200 &&
        page.headers["cache-control"]?.includes("no-store"),
    );
    for (const pathname of [
      "/admin",
      "/api/admin/exports",
      "/dev/presentation",
      "/_client-review/media/" + "a".repeat(64),
    ])
      need((await send(pathname, "GET", { cookie })).status === 404);
    need(
      (await send("/api/contact", "POST", { cookie, origin })).status === 404,
    );
  } finally {
    need(
      (await send("/_client-review/session", "DELETE", { cookie, origin }))
        .status === 204,
    );
  }
  need((await send("/", "GET", { cookie })).status === 303);
  return {
    origin,
    policyFile: path.join(directory, "ngrok-traffic-policy.json"),
    audience: reviewAudience(config),
    lock,
  };
}
