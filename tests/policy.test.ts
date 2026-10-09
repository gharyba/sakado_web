import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoEnabled,
  publicOrigin,
  whatsappLink,
  approvedImagePath,
  safeSocialUrl,
} from "../src/lib/content-policy";
import { contactSchema } from "../src/lib/contact-validation";
import { demoEvents, demoExperiences } from "../src/data/demo/content";
import { dateLabel, priceLabel, statusLabels } from "../src/lib/format";
test("demo content is opt-in and cannot be enabled by an ambiguous value", () => {
  assert.equal(demoEnabled({}), false);
  assert.equal(demoEnabled({ DEMO_MODE: "false" }), false);
  assert.equal(demoEnabled({ DEMO_MODE: "true" }), true);
});
test("canonical URLs require an explicit HTTPS origin", () => {
  assert.equal(publicOrigin("http://localhost:3000"), null);
  assert.equal(publicOrigin("not-a-domain"), null);
  assert.equal(publicOrigin("https://user:secret@example.com"), null);
  assert.equal(publicOrigin("https://example.com/path"), "https://example.com");
});
test("WhatsApp never links to missing or malformed numbers", () => {
  assert.equal(whatsappLink(null), null);
  assert.equal(whatsappLink("demo"), null);
  assert.equal(whatsappLink("+12345678901"), "https://wa.me/12345678901");
});
test("only reviewed local media paths are accepted", () => {
  assert.equal(approvedImagePath("https://instagram.com/a.jpg"), null);
  assert.equal(approvedImagePath("/images/../secret.png"), null);
  assert.equal(approvedImagePath("/images/camp.svg"), "/images/camp.svg");
  assert.equal(safeSocialUrl("javascript:alert(1)"), false);
});
test("demo events never invent operational data", () => {
  for (const event of demoEvents) {
    assert.equal(event.demo, true);
    for (const key of [
      "location",
      "startsAt",
      "endsAt",
      "price",
      "availablePlaces",
      "meetingPoint",
    ] as const)
      assert.equal(event[key], null);
    assert.equal(event.status, "COMING_SOON");
    assert.ok(event.schedule.every((item) => item.time === null));
  }
  assert.ok(demoExperiences.some((item) => !item.enabled));
});
test("missing dates and zero price are handled distinctly", () => {
  assert.equal(dateLabel(null), "Date à confirmer");
  assert.equal(priceLabel(null, "TND"), "Tarif à confirmer");
  assert.notEqual(priceLabel(0, "TND"), "Tarif à confirmer");
  assert.equal(Object.keys(statusLabels).length, 5);
});
test("contact validation rejects malformed and oversized input", () => {
  const valid = {
    name: "Test Visitor",
    email: "test@example.com",
    phone: "",
    subject: "general",
    message: "A test message for Sakado.",
  };
  assert.equal(contactSchema.safeParse(valid).success, true);
  assert.equal(
    contactSchema.safeParse({ ...valid, email: "bad-email" }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, subject: "unknown" }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, message: "a".repeat(5001) }).success,
    false,
  );
});
