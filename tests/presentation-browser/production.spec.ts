import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("production cannot deliver presentation media or enable the private page", async ({
  request,
}) => {
  const assets = JSON.parse(
    readFileSync(".local/official-presentation/catalog.json", "utf8"),
  ).assets;
  for (const route of [
    "/dev/presentation",
    `/dev/presentation-media/${assets[0].key}`,
    "/.local/official-presentation/catalog.json",
  ]) {
    const response = await request.get(route);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain("source-inventory");
  }
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toContain("/dev/presentation-media/");
});

test("production handshake and logout endpoints deny access", async ({
  request,
}) => {
  for (const method of ["POST", "DELETE"]) {
    const response = await request.fetch("/dev/presentation/session", {
      method,
      headers: { Origin: "http://127.0.0.1:3134" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(404);
    expect(response.headers()["set-cookie"]).toBeUndefined();
  }
});
