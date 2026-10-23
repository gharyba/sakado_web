import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categories,
  renderDiscovery,
  renderEmptyAdventures,
} from "./redesign04/render";

test("discovery preserves zero, one, seven and additional CMS categories without limiting or sorting", async () => {
  for (const count of [0, 1, 7, 9]) {
    const items = categories(count).reverse();
    const before = JSON.stringify(items);
    const html = await renderDiscovery(items);
    assert.equal(JSON.stringify(items), before);
    assert.deepEqual(
      [...html.matchAll(/data-experience="([^"]+)"/g)].map((m) => m[1]),
      items.map((c) => c.slug),
    );
    for (const item of items)
      assert.ok(html.includes(`href="/experiences#${item.slug}"`));
    assert.equal((html.match(/<li>/g) ?? []).length, count);
    assert.equal((html.match(/data-experience-arrow/g) ?? []).length, count);
    assert.equal(
      html.includes(
        "Les expériences seront publiées après confirmation par Sakado.",
      ),
      count === 0,
    );
    assert.doesNotMatch(
      html,
      /<img|<script|\/dev\/presentation-media|SAKADO-MEDIA/,
    );
  }
});
test("icons follow slugs through CMS reordering and unknown slugs use a neutral fallback", async () => {
  const { experienceIcon } =
    await import("../src/components/experience-category");
  const expected = ["trail", "tent", "compass", "sun", "pin", "trail", "sun"];
  assert.deepEqual(
    categories().map((c) => experienceIcon(c.slug)),
    expected,
  );
  assert.equal(experienceIcon("unknown-category"), "compass");
  assert.equal(experienceIcon("__proto__"), "compass");
  const items = categories().reverse();
  const html = await renderDiscovery(items);
  assert.deepEqual(
    [...html.matchAll(/data-experience-icon="([^"]+)"/g)].map((m) => m[1]),
    [...expected].reverse(),
  );
});
test("server output has labeled native links, decorative numbering and complete escaped French copy", async () => {
  const items = categories(1);
  items[0].name = "Randonnée à l’horizon & découverte";
  items[0].description =
    "Une très longue description française sans troncature. ".repeat(25) +
    "<script>synthetic</script>";
  const html = await renderDiscovery(items);
  assert.ok(html.includes(items[0].name.replace("&", "&amp;")));
  assert.ok(html.includes("&lt;script&gt;synthetic&lt;/script&gt;"));
  assert.equal((html.match(/sans troncature/g) ?? []).length, 25);
  assert.match(html, /aria-labelledby="experience-title-synthetic-0"/);
  assert.match(html, /aria-describedby="experience-description-synthetic-0"/);
  assert.match(html, /aria-hidden="true"[^>]*><span class="number">01/);
  assert.doesNotMatch(html, /<button|<img|style="[^"]*(?:height|opacity)/);
});
test("missing description does not produce a dangling accessible description", async () => {
  const items = categories(1);
  items[0].description = null;
  const html = await renderDiscovery(items);
  assert.doesNotMatch(html, /aria-describedby|experience-description-/);
  assert.ok(html.includes(items[0].name));
});
test("empty upcoming adventures retain truthful copy, native event/contact links and no fabricated event", async () => {
  const html = await renderEmptyAdventures();
  assert.match(html, /Les prochaines aventures seront annoncées ici\./);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /href="\/events"/);
  assert.match(html, /Contactez Sakado pour en savoir plus\./);
  assert.doesNotMatch(html, /event-card|<img|disponible|réserver/i);
});
