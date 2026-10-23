import { test, expect } from "@playwright/test";

const key = "0".repeat(64);
const forged = `${Date.now() + 60_000}.${"1".repeat(48)}.${"2".repeat(64)}`;
const identity = {
  Host: "127.0.0.1:3134",
  Origin: "http://127.0.0.1:3134",
  Cookie: `sakado_local_presentation=${forged}`,
};
test("production refuses page and private bytes even with a forged loopback identity", async ({
  request,
}) => {
  for (const route of [
    "/dev/presentation",
    `/dev/presentation-media/${key}`,
    "/.local/official-presentation/catalog.json",
    "/.local/official-presentation/access-code.txt",
  ]) {
    const response = await request.get(route, { headers: identity });
    expect(response.status()).toBe(404);
    expect(response.headers()["set-cookie"]).toBeUndefined();
    expect(response.headers()["content-type"] ?? "").not.toContain(
      "image/webp",
    );
  }
});
test("production POST and DELETE never issue a viewing cookie or redirect", async ({
  request,
}) => {
  for (const method of ["POST", "DELETE"]) {
    const response = await request.fetch("/dev/presentation/session", {
      method,
      headers: identity,
      ...(method === "POST"
        ? { form: { code: "synthetic-invalid-code" } }
        : {}),
      maxRedirects: 0,
    });
    expect(response.status()).toBe(404);
    expect(response.headers()["set-cookie"]).toBeUndefined();
    expect(response.headers().location).toBeUndefined();
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
});
test("production optimizer refuses private presentation paths", async ({
  request,
}) => {
  const response = await request.get(
    `/_next/image?url=${encodeURIComponent(`/dev/presentation-media/${key}`)}&w=640&q=75`,
    { headers: identity },
  );
  expect(response.status()).toBe(400);
});
