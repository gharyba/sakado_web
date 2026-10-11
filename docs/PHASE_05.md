# Website Phase 05 — adventure discovery and registration

Prepared 2026-10-11 on `feat/phase05`, based on merged Phase 04 commit `d7af1cf`. No automatic commit, merge, push or deployment is authorized. Stop after this phase.

## Discovery and scope

The existing PostgreSQL schema already supports events, lifecycle and registration states, deadlines, categories, destinations, capacity/pricing, meeting instructions, a multi-day program, inclusions/exclusions/equipment, recap, gallery and Instagram associations. Booking already supports private participant details, unique references/idempotency keys, status/payment labels, serializable capacity checks, audit logs and admin management. OWNER/ADMIN/EDITOR permissions are preserved. No new models or migration files are needed.

The existing public loader excludes drafts, cancelled and archived events. This phase preserves that explicit visibility policy: cancelled event URLs remain 404; reopening previously shared cancelled pages requires a separate business decision. Published completed events remain accessible and appear in past adventures. Historical SQLite/deferred-CMS claims and old phase stop points do not describe this implementation.

## Public routes and rendering

- `/events`: upcoming public events sorted by start/slug, labeled demo examples only in demo mode; GET activity/destination filters derived from actual eligible records. The open filter includes open requests and waitlists, explicitly labeled. Ongoing events appear separately and cannot register. Unknown filter values produce a useful empty state.
- `/adventures`: completed, non-demo public events sorted newest first, with actual category/destination filters. Links retain the canonical `/events/[slug]` detail route; completed events are never removed just because registration ended.
- `/events/[slug]`: gated image or existing labeled SVG, practical facts, actual program/inclusions/equipment/meeting/deadline/conditions/recap, eligible registration form, approved gallery and published event-associated Instagram. Related events use destination/category matches, then current eligibility/start/slug as deterministic tie breakers, limited to three. No empty decorative media sections.
- `/destinations/[slug]`: existing public destination relationship; upcoming, ongoing and completed events grouped separately. No new destinations invented.
- `/api/registrations`: existing public POST endpoint, same-origin and bounded JSON, honeypot/rate limits, server schema and transactional eligibility. No public participant lookup.
- Existing admin event/create/edit/registrations and registration detail routes are reused without permission or auth changes. Admin can manage all required program, price, capacity, publication and associations already supported by the CMS.

Server-rendered `AdventureListing`, `EventCard` and `EventSummary` use existing CSS tokens and static business information. No animation library, scroll listeners, motion ownership or homepage section was added. The existing hero/navigation/gallery/motion remain separate. Event hero uses `next/image`, `loading="eager"`, `fetchPriority="high"` and responsive sizes; cards remain lazy. Media stays unoptimized where previously required by the safe local-serving architecture.

## Availability and registration

`registrationAvailability` is shared by the public mapper and booking transaction. A request requires published CONFIRMED content, derived UPCOMING lifecycle, a future non-null start, OPEN/FEW_PLACES/WAITLIST_ONLY, opening time reached, deadline not reached, and confirmed price/capacity. Zero price is distinct from missing price. Lifecycle completes at the exact end boundary. Pending, confirmed and completed bookings consume capacity; cancelled and waitlist records do not. This preserves the existing reservation rule rather than switching to confirmed-only accounting.

Public counts follow `showAvailability`: capacity, remaining and confirmed count are null when hidden, and the form uses only the public 1–100 bound. The server always checks actual capacity, including when counts are hidden. Waitlist requests remain WAITLIST and do not consume seats or imply a guaranteed place. No automatic waitlist promotion was added.

The form collects existing required fields only. Edit → review → submit → reference/status confirmation, without an account or payment. Inputs stay mounted to preserve values; field errors have `aria-invalid`/`aria-describedby`, linked summary, and focus. Review and confirmation receive focus. Repeated submission is locked while in flight. The same idempotency key persists after a lost response. The server binds retries to all normalized request fields and returns the existing status/reference; changed intent conflicts rather than silently overwriting the request.

Without JavaScript, the page remains readable and offers an always-visible server-rendered contact alternative. Form controls remain disabled until hydration; registration review/submission requires JavaScript. The native form also declares POST, so participant values never fall back to URL query parameters. Client messages are safe fixed text; server errors never echo raw validation values/Prisma diagnostics. All mutations and pricing calculations remain server-side. The client review total is explicitly indicative; the server charges nothing and recomputes the stored total using Prisma Decimal.

Production with a configured failing database is not silently turned into demo content. Unconfigured registration returns 503; configured database failures return a safe error. Demo mode returns 409 before database access. Submission availability can change after rendering and is always rechecked in the transaction.

## Media, SEO, privacy and business decisions

Phase 04 media gates run before cover/gallery DTO mapping, Instagram previews, metadata and JSON-LD. All 17 MEDIA-04 assets remain BLOCKED and all 85 approval fields PENDING REVIEW. No signed evidence/private files, originals, CMS records or imported Instagram rows are edited. Only synthetic fixture records in a fresh test cluster may change. Existing hardware upload remains unchanged.

Metadata retains canonical and noindex policy; an approved selected cover may override OpenGraph/Twitter image. JSON-LD uses stored name, description, dates, location and organizer settings only, requires a configured HTTPS origin and non-demo facts, and escapes `<`. No fabricated offers, availability, addresses, ratings, certifications or reviews. `/adventures` joins the sitemap when the existing production indexing prerequisites hold.

**TO BE CONFIRMED before operational launch:** official events/dates/prices/equipment/copy; authorized photography/branding; cancellation/refund/deposit/payment rules; staff confirmation and waitlist handling; public participant-count policy; legal entity, official contact/privacy notices; hosting/privacy clearance, durable external media, Linux and Hostinger staging validation. Current payment-status labels remain manual CMS bookkeeping, not online payment.

## Validation and isolation

`npm run test:phase05` never reads the original PostgreSQL config or writes `.env`. It creates a NEW persistent disposable cluster in `.local/phase05/postgres-<random>` on loopback 55435 with random credentials in child process environment, creates only `sakado_test`, runs existing capacity integration assertions, then dedicated Playwright tests. Occupied port → refuse, never reuse. The browser setup verifies the actual PostgreSQL `data_directory` against the marker before invoking the existing destructive fixture helper. Existing reviewed migrations apply only to this new database. The owned process is stopped in `finally`; test files remain ignored for inspection and can be removed later by an explicitly scoped cleanup. Do not run the original `.env`-driven fixture commands for Phase 05.

Focused unit coverage includes upcoming/past partitions, deterministic filters/relations, lifecycle boundaries, every unavailable registration state, waitlist/seat calculations, explicit public DTO mapping, hidden counts, safe validation and factual schema. Existing media-readiness/demo/Instagram/navigation/motion/security unit tests remain part of `npm test`.

Local Chrome automation is not a screen-reader audit, Linux run, real-device field test or Hostinger staging validation. The test configuration uses public and `/admin` paths on one loopback host (`ADMIN_URL` empty); it must not redirect the public homepage to a dedicated admin root. Production host routing and auth are unchanged.

## Executed validation

| Check                     | Result                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run typecheck`       | PASS: Next route type generation and strict TypeScript                                          |
| `npm run lint`            | PASS                                                                                            |
| `npm test`                | PASS: 39 tests (32 existing + 7 focused Phase 05 tests)                                         |
| `npm run build`           | PASS: Prisma Client generation, Next 16 production build and pre/post-build public media audits |
| `npm run test:phase05`    | PASS: 18 PostgreSQL integration assertions + 21 production Chrome browser cases                 |
| `npm run test:phase04`    | PASS: 7 cases                                                                                   |
| `npm run test:navigation` | PASS: 10 cases                                                                                  |
| `npm run test:hero`       | PASS: 9 development/production cases                                                            |
| `npm run test:motion`     | PASS: 8 development/production cases                                                            |
| Total browser cases       | 55 passed                                                                                       |

The capacity race submits ten concurrent requests to an event with three places: exactly three pending reservations succeed, all excess requests fail, and occupied capacity remains three. Existing integration assertions verify retries, cancellation/reopening, waitlist exclusion, original unit-price preservation and owner protection. Browser coverage verifies actual POST validation, excessive counts, deadlines/closed/cancelled states, a saved-response loss followed by an idempotent retry, and a single resulting booking.

The complete authenticated browser workflow creates a private event through the existing CMS, adds its program, publishes/features it, discovers it from the **public homepage in a separate anonymous browser context**, reviews/submits a registration, and verifies/manages that saved participant in admin. Public HTML contains no participant email/phone, and anonymous exports are denied. Existing Instagram admin publication/homepage selection controls are exercised on synthetic records only, verified in the homepage marquee, gallery and event association, and restored to private. No original imported Instagram records are used as mutable fixtures.

All six widths (375, 390, 430, 768, 1024, 1440) pass overflow checks for discovery, detail, review form and past adventures under reduced motion. Screenshots are saved under `.local/phase05/screenshots/`; desktop listing/detail and mobile hero/review/past screenshots were visually inspected. Scoped axe WCAG 2 A/AA and WCAG 2.1 AA checks pass for the new main-content listing, detail, field errors and review state. Keyboard focus/errors, values retained after failures, no-JavaScript fallback, and no browser page/hydration exceptions are covered. This is **PARTIALLY IMPLEMENTED accessibility certification**: real screen-reader and device testing remain outstanding.

Demo `/`, `/events`, representative demo detail and `/adventures` return 200 with deliberately unreachable PostgreSQL; registration returns 409 without DB access. A configured non-demo failing database returns 500 and safe public responses, rather than fabricated/demo content. Expected server-side Prisma diagnostics appear only in that deliberately failing test server's console. The runner explicitly propagates test failure exit codes after stopping its owned cluster. Validation-owned ports and test DB service are stopped after completion.

The first browser passes exposed ambiguous test selectors (Next route announcer vs form alert, Organization vs Event JSON-LD, nested select text), a fieldset assertion unsupported by Playwright, and dedicated-admin host misconfiguration. These were corrected and the complete Phase 05 suite then passed; no failing cases were skipped or reclassified as success. Stable explicit labels and a server-rendered contact fallback also improve the implementation.

## Performance and safety evidence

No dependencies installed or upgraded; package-lock is unchanged. The current aggregate production JavaScript is 932,246 raw bytes across 31 files, compared with the recorded Phase 04 aggregate of 924,108 bytes (+8,138). This aggregate is not a visitor's route transfer size. Local initial-route resource measurements sum fetched files and their individual gzip estimates:

| Route               | JS resources | Raw bytes | Gzip estimate |
| ------------------- | ------------ | --------- | ------------- |
| Public homepage     | 11           | 500,409   | 151,919       |
| Events list         | 10           | 488,648   | 147,802       |
| Open fixture detail | 12           | 611,158   | 183,757       |

Homepage JS matches the recorded Phase 04 measurement exactly. Detail includes the existing gallery/Instagram clients and the registration validation/review component; no prior per-event baseline was measured, so no per-event before/after claim is made. New static CSS uses existing tokens. The existing warm hero scroll regression at 4× Chrome CPU records median 8.3 ms / p95 8.5 ms frames, zero >50 ms frames and no long tasks in that sample; it is not a real-device performance guarantee. Metrics are in ignored `.local/phase05/bundle.json`.

Final invariant checks: 17 original photo SHA-256 values match their recovery baseline; all 16 protected schema/migration/media-documentation files match the Phase 05 starting snapshot. The hardware upload hash is unchanged. Unit readiness checks verify 17 BLOCKED / 85 PENDING REVIEW; Git contains no media-library files, uploads or real `.env` files. `SAKADO-MEDIA/private/` and `.local/phase05/` remain ignored. No private evidence was opened/copied/modified, and no original database service was started or targeted. Real-database row counts were not freshly queried in this phase; the 45-URL source regression passes and original records were excluded from every test connection. No new backup or production restore is claimed.

## File inventory

Modified (18): `AGENTS.md`, `docs/ARCHITECTURE.md`, `package.json`; `src/app/(public)/events/page.tsx`, `events/[slug]/page.tsx`, `destinations/[slug]/page.tsx`; `src/app/api/registrations/route.ts`, `src/app/layout.tsx`, `src/app/sitemap.ts`; `src/components/event-card.tsx`, `registration-form.tsx`; `src/lib/admin-validation.ts`, `bookings.ts`, `content.ts`, `event-policy.ts`, `format.ts`, `types.ts`; `tests/browser/admin.spec.ts` (adapted existing workflow test to the review step).

Created (14): this document; `src/app/(public)/adventures/page.tsx`; `src/components/adventure-listing.tsx`, `event-summary.tsx`; `src/lib/adventure-discovery.ts`, `event-detail.ts`, `registration-validation.ts`; `src/styles/adventures.css`; `tests/adventures.test.ts`; `scripts/test-phase05.mjs`, `playwright.phase05.config.ts`; `tests/phase05-browser/database.ts`, `setup.ts`, `phase05.spec.ts`.

## Final requested report

| #                             | Status                | Result                                                                                                                                                       |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 · Architecture              | COMPLETE              | Existing App Router/Prisma Event/Booking/CMS/media systems audited and reused                                                                                |
| 2 · Scope                     | COMPLETE              | Discovery, practical storytelling, reviewed registration and past adventures                                                                                 |
| 3 · Modified files            | COMPLETE              | 18, listed above                                                                                                                                             |
| 4 · Created files             | COMPLETE              | 14, listed above                                                                                                                                             |
| 5 · Public routes             | COMPLETE              | `/events`, detail and destination improved; `/adventures` added; sitemap updated                                                                             |
| 6 · Admin routes              | COMPLETE              | Existing routes reused and end-to-end verified; no admin route/auth rewrite                                                                                  |
| 7 · Models                    | COMPLETE              | No Prisma changes required                                                                                                                                   |
| 8 · Migrations                | COMPLETE              | None created; existing migrations applied only in disposable test cluster                                                                                    |
| 9 · Listing                   | COMPLETE              | Actual category/destination/open/waitlist filters, chronology, statuses and empty states                                                                     |
| 10 · Detail                   | COMPLETE              | Program, facts, instructions, gated memories, practical CTA and deterministic relations                                                                      |
| 11 · Registration             | COMPLETE              | Review, field errors/focus, safe POST, accurate status/reference, saved admin request                                                                        |
| 12 · Capacity                 | COMPLETE              | Shared eligibility and existing serializable reservations; concurrent race verified                                                                          |
| 13 · Past adventures          | COMPLETE              | Completed public events retained, recap/memories supported, no registration                                                                                  |
| 14 · Destinations             | COMPLETE              | Existing public associations and upcoming/ongoing/past groupings                                                                                             |
| 15 · Instagram/media          | COMPLETE              | Existing systems reused; synthetic publication/admin/marquee/gallery association regression passed                                                           |
| 16 · Media readiness          | COMPLETE              | Gates preserved; 17 blocked / 85 pending; original hashes unchanged                                                                                          |
| 17 · Demo                     | COMPLETE              | Unavailable DB tolerated only in explicit demo mode; registrations disabled                                                                                  |
| 18 · Accessibility            | PARTIALLY IMPLEMENTED | Scoped automated/keyboard/no-JS/reduced-motion checks pass; full screen-reader audit outstanding                                                             |
| 19 · Responsive               | COMPLETE              | Six required widths, no overflow, screenshots inspected; physical-device testing not claimed                                                                 |
| 20 · Unit tests               | COMPLETE              | 39 pass                                                                                                                                                      |
| 21 · Browser tests            | COMPLETE              | 55 pass; plus 18 DB integration assertions                                                                                                                   |
| 22 · TypeScript               | COMPLETE              | PASS                                                                                                                                                         |
| 23 · ESLint                   | COMPLETE              | PASS                                                                                                                                                         |
| 24 · Production build         | COMPLETE              | PASS, including both media audits                                                                                                                            |
| 25 · Limitations              | PARTIALLY IMPLEMENTED | JS-dependent registration with contact fallback; cancelled URLs keep existing 404 policy; scaling and physical-device/screen-reader verification outstanding |
| 26 · Client/release decisions | BLOCKED               | Actual content/rights, operational policies, official contacts/privacy and deployment-readiness gates await humans                                           |
| 27 · Additional integrations  | NOT STARTED           | Payments/accounts/CRM/sync/deployment intentionally outside scope                                                                                            |

The branch is ready for human code/visual review, not public launch. Exact next step: review the uncommitted diff and screenshots, then confirm official event content and operational/privacy policies in a separately authorized task. Do not begin Phase 06 or integrate blocked photography automatically.

## Intentionally outside scope

No payments, deposits, SMS/WhatsApp API, customer accounts, CRM, Instagram synchronization, complex recommendations, new animation engine, schema migration, real content approval, private evidence work, deployment, merge or push. Unbounded legacy event/bookings reads remain a future scaling consideration; this phase does not introduce a pagination/data-aggregation migration.
