import test from "node:test";
import assert from "node:assert/strict";
import urls from "../src/data/instagram-media.json";
import {
  normalizeInstagramUrl,
  normalizeInstagramImport,
  instagramMediaSchema,
  mediaPage,
  HOMEPAGE_MEDIA_LIMIT,
} from "../src/lib/instagram-policy";
test("all 45 supplied posts are normalized, unique and generic", () => {
  assert.equal(urls.length, 45);
  const result = normalizeInstagramImport(urls);
  assert.equal(result.length, 45);
  assert.ok(result.every((url) => !url.includes("?") && url.endsWith("/")));
  assert.equal(HOMEPAGE_MEDIA_LIMIT, 16);
  assert.equal(
    instagramMediaSchema.parse({ instagramUrl: urls[0] }).mediaType,
    "INSTAGRAM_MEDIA",
  );
});
test("Instagram URL validation rejects foreign domains and non-media paths", () => {
  for (const value of [
    "http://www.instagram.com/p/abc/",
    "https://www.instagram.com.evil.test/p/abc/",
    "https://evil.test/p/abc/",
    "https://user@www.instagram.com/p/abc/",
    "https://www.instagram.com:8443/p/abc/",
    "https://www.instagram.com/sakado_sfax/",
    "javascript:alert(1)",
    "https://www.instagram.com/p/abc/embed/",
    "https://www.instagram.com/p/a%2Fb/",
  ])
    assert.equal(normalizeInstagramUrl(value), null, value);
  assert.equal(
    normalizeInstagramUrl("https://instagram.com/reel/Ab_-12/?hl=fr#x"),
    "https://www.instagram.com/reel/Ab_-12/",
  );
});
test("imports normalize duplicate variants and reject the entire invalid batch", () => {
  assert.deepEqual(normalizeInstagramImport([urls[0], urls[0].split("?")[0]]), [
    normalizeInstagramUrl(urls[0]),
  ]);
  assert.throws(() =>
    normalizeInstagramImport([urls[0], "https://evil.test/p/a/"]),
  );
  assert.throws(() => normalizeInstagramImport([]));
  assert.throws(() => normalizeInstagramImport(Array(101).fill(urls[0])));
});
test("preview paths, ordering and pagination stay bounded", () => {
  assert.equal(
    instagramMediaSchema.safeParse({
      instagramUrl: urls[0],
      previewImage: "https://evil.test/image.jpg",
    }).success,
    false,
  );
  assert.equal(
    instagramMediaSchema.safeParse({ instagramUrl: urls[0], displayOrder: -1 })
      .success,
    false,
  );
  assert.equal(
    instagramMediaSchema.safeParse({ instagramUrl: urls[0], mediaType: "HTML" })
      .success,
    false,
  );
  assert.equal(
    instagramMediaSchema.parse({ instagramUrl: urls[0] }).published,
    false,
  );
  for (const value of [undefined, "-1", "0", "NaN", "Infinity", "1.5"])
    assert.equal(mediaPage(value), 1);
  assert.equal(mediaPage("999999"), 10000);
});
