import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import {
  lifecycle,
  occupied,
  confirmed,
  registrationAvailability,
} from "../src/lib/event-policy";
import {
  upcomingAdventures,
  pastAdventures,
  filterAdventures,
  relatedAdventures,
  registrationMessage,
} from "../src/lib/adventure-discovery";
import {
  mapEventDetails,
  eventStructuredData,
  type PublicEventRow,
} from "../src/lib/event-detail";
import {
  bookingInput,
  registrationErrors,
} from "../src/lib/registration-validation";
import { demoEvents } from "../src/data/demo/content";

const now = new Date("2030-01-01T12:00:00Z");
function row(overrides: Partial<PublicEventRow> = {}): PublicEventRow {
  return {
    id: "event",
    slug: "test-event",
    title: "Fixture",
    shortDescription: "Fixture only",
    description: "Fixture only",
    coverImage: "/images/camp.svg",
    location: "Synthetic place",
    startsAt: new Date("2030-01-10T08:00:00Z"),
    endsAt: new Date("2030-01-11T16:00:00Z"),
    duration: "2 jours",
    difficulty: "Fixture",
    price: new Prisma.Decimal("17.125"),
    currency: "TND",
    capacity: 3,
    status: "UPCOMING",
    registrationStatus: "OPEN",
    registrationOpenAt: null,
    registrationDeadline: null,
    showAvailability: true,
    featured: false,
    meetingTime: null,
    meetingPoint: null,
    recommendations: null,
    conditions: null,
    recap: null,
    version: 0,
    published: true,
    source: "CONFIRMED",
    included: ["Stored inclusion", 17],
    excluded: null,
    equipment: [],
    importantInfo: null,
    cancellationInfo: null,
    categoryId: null,
    destinationId: null,
    createdAt: now,
    updatedAt: now,
    category: null,
    destination: null,
    schedule: [],
    bookings: [],
    ...overrides,
  };
}
const media = { coverImage: null, gallery: [] };
const dto = (overrides: Partial<PublicEventRow> = {}) =>
  mapEventDetails(row(overrides), media, now);
test("upcoming/past partitions use lifecycle and chronology, never active demo registration", () => {
  const future = dto();
  const past = dto({
    id: "past",
    slug: "past",
    startsAt: new Date("2029-01-01"),
    endsAt: null,
  });
  const ongoing = dto({
    id: "ongoing",
    startsAt: new Date("2030-01-01T10:00Z"),
    endsAt: new Date("2030-01-02"),
  });
  assert.deepEqual(
    upcomingAdventures([past, ongoing, future], now).map((event) => event.id),
    ["event"],
  );
  assert.deepEqual(
    pastAdventures([future, past, ongoing]).map((event) => event.id),
    ["past"],
  );
  assert.equal(lifecycle(row({ endsAt: now }), now), "COMPLETED");
  assert.equal(upcomingAdventures(demoEvents, now).length, 3);
  assert.equal(filterAdventures(demoEvents, { open: true }).length, 0);
  assert.ok(
    demoEvents.every((event) =>
      registrationMessage(event).includes("démonstration"),
    ),
  );
});
test("seat accounting preserves pending reservations and excludes cancellations/waitlist", () => {
  const bookings: PublicEventRow["bookings"] = [
    { status: "PENDING", participantCount: 1 },
    { status: "CONFIRMED", participantCount: 1 },
    { status: "COMPLETED", participantCount: 1 },
    { status: "CANCELLED", participantCount: 20 },
    { status: "WAITLIST", participantCount: 30 },
  ];
  assert.equal(occupied(bookings), 3);
  assert.equal(confirmed(bookings), 2);
  assert.equal(registrationAvailability(row(), bookings, now).reason, "FULL");
  assert.equal(
    registrationAvailability(
      row({ registrationStatus: "WAITLIST_ONLY" }),
      bookings,
      now,
    ).reason,
    "WAITLIST",
  );
});
test("registration rejects every closed, private, expired, incomplete and unavailable state", () => {
  for (const status of [
    "DRAFT",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
    "ARCHIVED",
  ] as const)
    assert.equal(dto({ status }).canRegister, false, status);
  for (const registrationStatus of ["CLOSED", "FULL"] as const)
    assert.equal(dto({ registrationStatus }).canRegister, false);
  for (const overrides of [
    { published: false },
    { source: "DEMO" as const },
    { startsAt: null },
    { price: null },
    { capacity: null },
    { capacity: 0 },
    { registrationOpenAt: new Date("2030-01-02") },
    { registrationDeadline: now },
  ])
    assert.equal(dto(overrides).canRegister, false, JSON.stringify(overrides));
  assert.equal(
    dto({ registrationDeadline: now }).registrationReason,
    "DEADLINE",
  );
  assert.equal(
    dto({ registrationOpenAt: now, price: new Prisma.Decimal(0) }).canRegister,
    true,
  );
});
test("explicit public mapping hides private associations, private fields, capacity when disabled, and raw media", () => {
  const privateDestination = {
    id: "hidden",
    slug: "hidden",
    name: "Hidden",
    published: false,
    archived: false,
    source: "CONFIRMED",
  } as PublicEventRow["destination"];
  const result = dto({
    destination: privateDestination,
    showAvailability: false,
    bookings: [{ status: "CONFIRMED", participantCount: 1 }],
    schedule: [
      {
        id: "step",
        eventId: "event",
        day: 1,
        time: "08:00",
        title: "Stored step",
        description: null,
        order: 0,
      },
    ],
  });
  assert.equal(result.destinationSlug, null);
  assert.equal(result.destinationName, null);
  for (const field of [
    "maximumParticipants",
    "availablePlaces",
    "confirmedCount",
  ] as const)
    assert.equal(result[field], null);
  assert.equal(result.coverImage, null);
  assert.deepEqual(result.included, ["Stored inclusion"]);
  assert.equal(result.price, 17.125);
  assert.equal(Object.hasOwn(result, "bookings"), false);
  assert.equal(Object.hasOwn(result.schedule[0], "eventId"), false);
  assert.equal(result.canRegister, true);
});
test("filters and related adventures are deterministic and respect actual associations", () => {
  const base = {
    ...dto(),
    category: "Camping",
    destinationSlug: "fixture",
    destinationName: "Fixture",
  };
  const same = { ...base, id: "same", slug: "same" };
  const category = {
    ...base,
    id: "category",
    slug: "category",
    destinationSlug: "other",
  };
  const unrelated = {
    ...base,
    id: "other",
    category: "Other",
    destinationSlug: "none",
  };
  assert.deepEqual(
    relatedAdventures(base, [unrelated, category, same, base]).map(
      (event) => event.id,
    ),
    ["same", "category"],
  );
  assert.equal(
    filterAdventures([same, category], {
      category: "Camping",
      destination: "fixture",
      open: true,
    }).length,
    1,
  );
  assert.equal(filterAdventures([same], { category: "Unknown" }).length, 0);
});
test("registration validation normalizes safe input and exposes only field messages", () => {
  const valid = {
    eventId: "event",
    firstName: " Test ",
    lastName: "Visitor",
    email: "TEST@example.invalid",
    phone: "+21620000000",
    participantCount: "2",
    notes: "",
    idempotencyKey: randomUUID(),
  };
  const parsed = bookingInput.parse(valid);
  assert.equal(parsed.email, "test@example.invalid");
  assert.equal(parsed.firstName, "Test");
  assert.equal(parsed.notes, null);
  for (const invalid of [
    { email: "bad" },
    { phone: "notphone" },
    { participantCount: 0 },
    { participantCount: -1 },
    { participantCount: 1.5 },
    { participantCount: 101 },
    { notes: "a".repeat(2001) },
  ])
    assert.equal(
      bookingInput.safeParse({ ...valid, ...invalid }).success,
      false,
    );
  const failed = bookingInput.safeParse({
    ...valid,
    email: "private-invalid-email",
    eventId: "",
  });
  assert.ok(!failed.success);
  assert.deepEqual(Object.keys(registrationErrors(failed.error.issues)), [
    "email",
  ]);
  assert.ok(
    !JSON.stringify(registrationErrors(failed.error.issues)).includes(
      "private-invalid-email",
    ),
  );
});
test("structured data contains only stored facts and gated media; demo and missing facts omit schema", () => {
  assert.equal(
    eventStructuredData(demoEvents[0], "https://example.invalid", "Fixture"),
    null,
  );
  assert.equal(eventStructuredData(dto(), null, "Fixture"), null);
  assert.equal(
    eventStructuredData(
      dto({ location: null }),
      "https://example.invalid",
      "Fixture",
    ),
    null,
  );
  const schema = eventStructuredData(
    dto(),
    "https://example.invalid",
    "Fixture",
  )!;
  assert.equal(Object.hasOwn(schema, "image"), false);
  assert.equal(Object.hasOwn(schema, "offers"), false);
  assert.equal(Object.hasOwn(schema, "aggregateRating"), false);
  assert.equal(schema.startDate, "2030-01-10T08:00:00.000Z");
});
