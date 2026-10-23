import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { POST, DELETE } from "../src/app/dev/presentation/session/route";
import {
  presentationCookie,
  presentationSessionValid,
} from "../src/lib/official-presentation-policy";

test("session endpoint bounds bodies, limits attempts and revokes only the logged-out capability", async () => {
  let now = Date.now();
  const clock = mock.method(Date, "now", () => now);
  const code = randomBytes(24).toString("base64url");
  const patch = {
    NODE_ENV: "development",
    OFFICIAL_PRESENTATION: "true",
    DEMO_MODE: "false",
    CLIENT_DEMO: "false",
    STAGING_MODE: "false",
    DATABASE_URL: "postgresql://validation:dummy@127.0.0.1:55432/sakado",
    PRESENTATION_DATABASE_VERIFIED: "true",
    PRESENTATION_ORIGIN: "http://127.0.0.1:3134",
    PRESENTATION_STARTED: String(now),
    PRESENTATION_SECRET: randomBytes(48).toString("hex"),
    PRESENTATION_CODE_HASH: createHash("sha256").update(code).digest("hex"),
  };
  const before = Object.fromEntries(
    Object.keys(patch).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, patch);
  const request = (
    method: string,
    body?: BodyInit,
    extra: Record<string, string> = {},
  ) =>
    new Request("http://127.0.0.1:3134/dev/presentation/session", {
      method,
      body,
      headers: {
        host: "127.0.0.1:3134",
        origin: "http://127.0.0.1:3134",
        "content-type": "application/x-www-form-urlencoded",
        ...extra,
      },
      ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
    });
  const handshake = async () => {
    const response = await POST(request("POST", new URLSearchParams({ code })));
    assert.equal(response.status, 303);
    assert.match(response.headers.get("cache-control")!, /no-store/);
    const header = response.headers.get("set-cookie")!;
    assert.match(header, /HttpOnly/i);
    assert.match(header, /SameSite=Strict/i);
    return header.split(";")[0].slice(presentationCookie.length + 1);
  };
  try {
    assert.equal(
      (
        await POST(
          request("POST", "code=wrong", { origin: "http://foreign.invalid" }),
        )
      ).status,
      404,
    );
    const oversized = await POST(
      request("POST", "code=" + "x".repeat(1100), { "content-length": "1" }),
    );
    assert.equal(oversized.status, 400);
    assert.equal(oversized.headers.get("set-cookie"), null);
    const streamed = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("code=" + "x".repeat(600)));
        controller.enqueue(new TextEncoder().encode("y".repeat(600)));
        controller.close();
      },
    });
    assert.equal((await POST(request("POST", streamed))).status, 400);
    now += 61_000;
    const first = await handshake();
    const second = await handshake();
    assert.notEqual(first, second);
    assert.equal(presentationSessionValid(first), true);
    assert.equal(
      (
        await DELETE(
          request("DELETE", undefined, {
            cookie: `${presentationCookie}=${first}`,
            origin: "http://foreign.invalid",
          }),
        )
      ).status,
      404,
    );
    assert.equal(presentationSessionValid(first), true);
    const logout = await DELETE(
      request("DELETE", undefined, {
        cookie: `${presentationCookie}=${first}`,
      }),
    );
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get("set-cookie")!, /Max-Age=0/i);
    assert.equal(presentationSessionValid(first), false); // Copied token replay fails too.
    assert.equal(presentationSessionValid(second), true);
    assert.equal((await DELETE(request("DELETE"))).status, 204);
    now += 61_000;
    for (let i = 0; i < 10; i++)
      assert.equal((await POST(request("POST", "code=wrong"))).status, 403);
    const limited = await POST(request("POST", new URLSearchParams({ code })));
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("set-cookie"), null);
    now += 61_000;
    await handshake(); // Bounded attempt window recovers.
    for (const demo of ["false", "true"]) {
      Object.assign(process.env, { NODE_ENV: "production", DEMO_MODE: demo });
      assert.equal(presentationSessionValid(second), false);
      for (const handler of [POST, DELETE]) {
        const response = await handler(
          request(handler === POST ? "POST" : "DELETE", undefined, {
            cookie: `${presentationCookie}=${second}`,
          }),
        );
        assert.equal(response.status, 404);
        assert.equal(response.headers.get("set-cookie"), null);
      }
    }
  } finally {
    clock.mock.restore();
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
