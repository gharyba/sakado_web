# Website Phase 06 — Admin operations and production readiness

Date: 2026-10-11. Branch: `feat/phase06`, starting HEAD `3d14d2b` (merged Phase 05). Changes remain **uncommitted for human review**. No merge, push, deployment, production provisioning or Phase 07 work was performed.

## Scope and discovery

The existing App Router admin already provided dashboard, events, registrations, destinations, gallery, media-readiness, Instagram, messages, site content, settings and user routes. Generic resource POST handlers, dedicated Instagram/upload handlers and a registration CSV endpoint existed. Existing Zod schemas, serializable transaction retries, audit records, media storage/readiness and Phase 05 capacity/idempotency logic were reused.

Authentication already used Argon2id passwords, opaque random tokens stored as hashes, eight-hour server sessions, and Secure/HttpOnly/SameSite=Strict cookies. Login rotates the prior session; logout deletes it. Account changes invalidate sessions. OWNER has all permissions; ADMIN has all except users/settings; EDITOR has dashboard/events/gallery/site/categories. These actual business permissions are preserved, including EDITOR's existing event publication rights. No public registration or invitation-email infrastructure was added.

Existing public/admin error, loading and not-found boundaries, responsive tables, empty states and event/registration filters were retained. CSP, frame restrictions, nosniff, referrer and permissions headers already existed. Instagram uses local authorized previews and external links, not third-party embeds. No security header expansion was necessary; CSP still permits inline scripts/styles. HSTS is deferred until actual HTTPS/domain coverage is verified.

Initial gaps included inconsistent API error handling, service entry points trusting actor permissions, missing admin mutation limits, invalid terminal event transitions, stale registration writes, duplicate submissions, weak form-error associations, CSV formula injection, no automatic PR/main workflow, and no reliable operational start-time configuration failure. Historical manual Linux validation remained unexecuted.

## Implementation

### Authorization, mutations and data boundaries

- `adminEndpoint` checks session, permission, exact origin, demo-write prohibition and a database-backed actor limit inside the error boundary. Missing/null/foreign origins are rejected; forwarded headers do not establish trusted origins. Configured HTTPS origins support a verified reverse proxy without broad origin allowances.
- Transaction services re-read the active actor and actual role. OWNER-only user management and last-owner safeguards are preserved. Authorization applies at APIs and services, independently of navigation visibility.
- `admin-event-policy` rejects active publication of draft/cancelled/archived states, registration on non-upcoming states and implicit reopening of terminal history. An expired upcoming event can be explicitly marked completed or archived. Cancellation unpublishes and closes registration.
- Registration edits accept an expected update timestamp, reject stale writes, and avoid duplicate audit entries on identical normalized changes. Existing serializable capacity checks, pending-seat consumption, waitlist policy and idempotency remain authoritative. Event actions accept existing versions.
- CSV exports are disabled in demo mode to avoid private-data exports/audit writes. Operational exports retain permission checks, private/no-store headers and audit logging; cells are quoted and spreadsheet formula prefixes neutralized, including leading whitespace.
- Media selectors now verify current bytes/readiness rather than relying on a CMS checkbox. All 17 registered assets remain BLOCKED and all 85 source approval axes PENDING REVIEW. No imported Instagram records, original uploads or production data were changed.
- Original code-drawn demo SVGs are now bound to SHA-256 identities. A replacement cannot inherit eligibility from the filename `camp.svg`, `coast.svg` or `trail.svg`. This is technical identity enforcement, not a photographic or brand approval.

### Admin operations and errors

The dashboard adds real unpublished/full-or-few-places counts and the blocked-registry count; sensitive registration indicators remain permission-restricted. Event screens expose deadlines and cover readiness. Existing table filters and actions are reused.

Shared forms provide synchronous submission locks, pending/disabled controls, native browser confirmations for destructive changes, retained values after errors, accessible focused error summaries and field associations. Native confirmation supplies browser-managed modal keyboard/focus behavior; it is not a custom dialog. Mobile navigation exposes state and closes with Escape, restoring toggle focus. Instagram import parsing returns a fixed validation message while database failures reach the shared safe boundary. Error responses use fixed safe messages; database details, credentials and request bodies are not returned.

AuditLog remains the operational action trail. New failure logs contain fixed event/operation names only, without error messages/stacks, tokens or participant payloads. Framework/provider logs still require staging redaction/access/retention review. Existing login, contact, upload and registration rate limits remain; admin mutations gain 300 requests per actor per 15-minute bucket. Database failure fails closed. No vendor dependency or schema was added. Fixed buckets are not a complete abuse-defense or edge-DDoS service; expired bucket cleanup remains an operational policy task.

### Production configuration and health

`productionEnvironmentIssues` validates operational production configuration without printing values. Explicit demo mode remains available but is not an authorization bypass. `scripts/start.mjs` requires Node 24, loads Next environment files, validates settings and exits before spawning Next if invalid. Local start remains loopback; Hostinger start uses its assigned process PORT and binds 0.0.0.0. The small TypeScript policy must be retained in a source release. Direct Next CLI instrumentation is a secondary check; its failed bootstrap can retain a process, so the supported launcher is required for fail-fast behavior. Native Node TypeScript can emit a harmless module-type warning; no package-wide module-format change was made.

`/api/health` is no-store/noindex, runs only SELECT 1 in operational mode and returns a safe 503 when unavailable. Demo mode identifies itself and does not query a database. Health is not a rights, privacy, storage or launch clearance check. See [DEPLOYMENT](DEPLOYMENT.md) for exact environment names, first-owner provisioning, backup, migrations and rollback.

### CI architecture

`.github/workflows/ci.yml` runs on PRs, main pushes and manual dispatch. Read-only permissions, commit-pinned checkout/setup-node actions, Node `.nvmrc`, locked `npm ci`, npm-download-only caching, explicit dummy settings and failure propagation are used. There is no deployment or artifact upload step.

1. **Quality, Tests, Build and Media Safety**: secret guard, Prisma generation, TypeScript, ESLint, units, pre/post media build audits, startup rejection test and Phase 04 browser tests.
2. **PostgreSQL Integration and Admin Workflows**: ephemeral PostgreSQL 16 service, build, integration assertions and Phase 05/06 browser tests.

Before fixtures, CI verifies explicit GitHub/Linux markers, the exact disposable URL/user/database/port and the actual server data directory/version. Local `test:phase06` owns a fresh ignored loopback cluster; legacy fixture commands now refuse unmarked databases. No .env-driven developer database was used. The service image is major-version pinned, not digest pinned. Actual Linux/GitHub execution remains **PENDING**; WSL is not installed and Docker is unavailable. YAML and package command names were checked locally. A prepared workflow is not a passing run. Branch-protection instructions are in [PRODUCTION_READINESS](PRODUCTION_READINESS.md); repository settings were not changed.

## Validation evidence and asset recovery

Local Windows / Node 24 validation:

| Check                                            | Result                                                                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| TypeScript and ESLint                            | PASS, including final illustration gate                                                                                      |
| Unit tests                                       | 46 PASS: preserved earlier tests plus focused operation, environment, CI safety and artwork-identity tests                   |
| PostgreSQL integration                           | 18 assertions PASS on a fresh owned disposable cluster                                                                       |
| Phase 05 browser regression                      | 21 PASS                                                                                                                      |
| Phase 06 browser tests                           | 17 PASS                                                                                                                      |
| Phase 04 browser regression                      | 7 PASS                                                                                                                       |
| Navigation / hero / motion browsers              | 10 / 9 / 8 PASS                                                                                                              |
| Production startup rejection                     | PASS: supported launcher exits 1 before serving when critical values are missing                                             |
| Valid demo launcher / assigned PORT              | PASS, owned process stopped afterward                                                                                        |
| Current working-tree production build            | PASS after explicitly authorized SVG restoration, including pre/post media audits; repeated with unreachable dummy DB inputs |
| Final code build with original committed artwork | PASS: compilation, TypeScript, route generation and pre/post public-media audits in the isolated temporary copy              |
| GitHub Actions / Linux / actual Hostinger        | NOT RUN; requires separate authorized push/environment and staging work                                                      |

Across the phase, all 72 browser cases passed. Phase 04/05/06 and hero suites were rerun with the final artwork gate; the new gate also has focused unit coverage. Authenticated admin screenshots were inspected at 375, 768 and 1440 widths for dashboard, event editing, registrations and media readiness; no horizontal page overflow was detected. Keyboard, mobile Escape, native confirmation, duplicate submissions, scoped axe checks, errors and role restrictions were tested. Existing public accessibility tests passed. This is scoped automation, not a WCAG certification or manual screen-reader/device sign-off. Screenshots and logs stay ignored beneath `.local/phase06`.

During validation, `public/images/camp.svg`, `coast.svg`, and `trail.svg` changed outside this implementation. The replacements were approximately 5.1 MB, 16.7 MB and 16.6 MB and contained VTracer generator metadata; provenance/rights were unverified. The user explicitly instructed restoration of the three original Git versions. Before restoration, each replacement was backed up and checksum-verified under ignored `.local/phase06/replacement-artwork-1791730476279`. The original 1,639 / 765 / 804 byte files were restored byte-for-byte from HEAD and verified. No claim is made about the replacements’ depicted content. Before restoration the hero 4x-CPU profile regressed to median 141.7 ms, p95 283.1 ms, 81/90 frames over 50 ms and long tasks up to 414 ms. The replacement files remain private for separate review, outside the Git diff.

The final media gate rejected the unreviewed replacements as intended. Before user authorization, a separate temporary source copy validated the code with original committed artwork, preserving user changes. Installed locked dependencies were copied into it; this was not a fresh install or Linux run. Its initial dependency-junction attempt failed because Turbopack disallows external junctions; copied dependencies resolved that tool limitation. After the explicitly authorized restoration, the actual repository production build also passed. The gate was never disabled. Future replacement assets still require provenance, governance and performance review.

`npm audit` reports **five HIGH, zero critical**, all in development tooling: braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next. The offered automatic remediation would downgrade the Next lint configuration across major versions; it was not applied. The [primary advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) identifies nested-pattern exhaustion; no patched braces version was reported by the audit. No lockfile/dependency change or force fix was made. Existing install scripts/native dependencies were inspected; real Linux Argon2/Sharp/Prisma compatibility still requires CI.

Integrity checks: all 17 original SHA-256 values and the hardware upload match their protected baselines; 16 protected schema/migration/media documentation files match. Real DB records were not queried for a new count or mutated: preserving the imported 45 records is established by the absence of real-data operations, not a fabricated fresh production audit. Secret scanning is a high-confidence heuristic over tracked and unignored files, not exhaustive history/entropy proof. Private media, .env, uploads, local databases and test artifacts remain ignored and unstaged.

## Final 32-area report

Final verification also reran the isolated build, all 18 integration assertions, all 21 Phase 05 and 17 Phase 06 browser cases, all seven Phase 04 cases and all nine hero cases after the artwork gate. All passed with original committed illustrations. The isolated hero profile measured median 8.3 ms, p95 8.5 ms, zero frames over 50 ms and no long tasks at 4x CPU. This supports the asset-performance concern but does not certify the actual replacement assets or a physical device. Final current-tree TypeScript/ESLint passed; all 46 units passed outside the restricted launcher after two sandbox attempts failed in Node `os.userInfo` before test execution. The earlier actual-tree build correctly failed its media preflight; after user-authorized restoration, the actual-tree build passed, including an explicit dummy-DB rerun. Read-only secret scanning passed across 267 tracked/proposed files; `git diff --check` passed, the index was empty, and private/generated paths remained ignored. Original data was not used by validation.

The media hash/name gate recognizes registered identities and known placeholder replacements; it is not visual recognition of arbitrarily transformed/renamed unknown imagery. Human asset provenance review and controlled release packaging remain necessary. Do not start an old build with subsequently changed public assets to bypass a failed build gate.

COMPLETE means implemented/audited within this local phase, not launch approval.

| #   | Area                        | Classification        | Result                                                                                                                                                                          |
| --- | --------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Existing admin architecture | COMPLETE              | Routes, resource handlers, forms, storage, AuditLog and DTO boundaries reused.                                                                                                  |
| 2   | Existing auth architecture  | COMPLETE              | Argon2id, hashed opaque sessions, expiry/rotation/revocation retained and tested.                                                                                               |
| 3   | Existing role model         | COMPLETE              | Actual OWNER/ADMIN/EDITOR matrix preserved; no new roles.                                                                                                                       |
| 4   | Admin UX                    | COMPLETE              | Real operational counts, deadline/readiness display, accessible errors, busy states and confirmations.                                                                          |
| 5   | Authorization               | COMPLETE              | API permissions plus active actor/role checks inside transaction services.                                                                                                      |
| 6   | Security hardening          | COMPLETE              | Exact-origin validation, demo mutation denial, CSV formula protection, safe errors and secret guard.                                                                            |
| 7   | Registration admin safety   | COMPLETE              | Stale-write rejection/no-op handling with existing serializable capacity enforcement.                                                                                           |
| 8   | Event admin safety          | COMPLETE              | Shared terminal transition policy, cancellation closure, version-aware actions.                                                                                                 |
| 9   | Media protections           | COMPLETE              | 17 BLOCKED / 85 PENDING preserved; bytes checked; demo artwork identities bound. Unreviewed SVG replacements were rejected and restored only after explicit user authorization. |
| 10  | CI workflow                 | PARTIALLY IMPLEMENTED | Created and parsed locally; GITHUB CI EXECUTION PENDING.                                                                                                                        |
| 11  | CI jobs                     | PARTIALLY IMPLEMENTED | Two required jobs prepared; no remote run claimed.                                                                                                                              |
| 12  | PostgreSQL CI               | PARTIALLY IMPLEMENTED | Disposable service and destructive-fixture guards implemented/tested locally; service execution pending.                                                                        |
| 13  | Environment validation      | COMPLETE              | Required operational names checked, supported launcher fail-fast tested, demo preserved.                                                                                        |
| 14  | Security headers            | COMPLETE              | Existing header policy audited/preserved; HSTS deferred to verified HTTPS.                                                                                                      |
| 15  | Rate limiting               | COMPLETE              | Existing limits reused; authenticated admin bucket added, safe DB failure handling.                                                                                             |
| 16  | Logging                     | COMPLETE              | Existing audit trail reused; fixed private failure metadata, safe provisioning errors.                                                                                          |
| 17  | Readiness documentation     | COMPLETE              | This report, deployment update and explicit production checklist.                                                                                                               |
| 18  | Branch protection           | COMPLETE              | UI recommendations documented; applying settings is intentionally not performed.                                                                                                |
| 19  | Dependency audit            | BLOCKED               | Audit executed; five high dev-tool entries await upstream remediation/security decision.                                                                                        |
| 20  | Unit tests                  | COMPLETE              | 46 passing.                                                                                                                                                                     |
| 21  | Integration tests           | COMPLETE              | 18 passing assertions, synthetic isolated data only.                                                                                                                            |
| 22  | Browser tests               | COMPLETE              | 72 passing scoped cases; performance regression separately blocking.                                                                                                            |
| 23  | TypeScript                  | COMPLETE              | Final check passed.                                                                                                                                                             |
| 24  | ESLint                      | COMPLETE              | Final check passed.                                                                                                                                                             |
| 25  | Production build            | COMPLETE              | Actual tree passed after explicitly authorized restoration, including pre/post media audits.                                                                                    |
| 26  | Database schema             | COMPLETE              | Unchanged; no schema work required.                                                                                                                                             |
| 27  | Migration files             | COMPLETE              | None created or applied to real data. Existing migrations only in disposable tests.                                                                                             |
| 28  | Modified files              | COMPLETE              | Inventory below; external SVG replacements are backed up privately; original Git artwork restored.                                                                              |
| 29  | Created files               | COMPLETE              | Inventory below.                                                                                                                                                                |
| 30  | Launch blockers             | BLOCKED               | Rights, privacy, storage, CI/Linux, staging, dependency risk, approved business assets and operational decisions.                                                               |
| 31  | Known limitations           | PARTIALLY IMPLEMENTED | Scoped tests; no real HTTPS/provider/load/restore or screen-reader verification. See checklist.                                                                                 |
| 32  | Intentionally excluded      | NOT STARTED           | Deployment, production resources, payments/messages vendors, new CRM/accounts, automatic media/Instagram approval/sync, Phase 07.                                               |

## Database and next step

No Prisma schema changes, migrations, production DB writes, photograph approvals, new dependencies or original-content edits were made by Phase 06. Fixtures were restricted to verified disposable clusters. The release remains **PUBLIC LAUNCH BLOCKED**.

Exact next step: review the uncommitted Phase 06 diff and obtain separate authorization for a push/PR to execute Linux CI. Require both prepared checks and human approval before merging. Resolve the [production checklist](PRODUCTION_READINESS.md), including dependency risks and privacy/media/storage decisions, before any separately authorized staging/deployment. Do not begin Phase 07 automatically.

## File inventory

The three externally changed SVGs were recovered after explicit user instruction and are no longer in the implementation diff. The local Git diff is authoritative; generated/private outputs are excluded.

### Modified implementation files

- `.env.production.example`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `package.json`
- `playwright.phase04.config.ts`
- `playwright.phase05.config.ts`
- `scripts/create-admin.ts`
- `scripts/test-phase05.mjs`
- `src/app/(public)/contact/actions.ts`
- `src/app/admin/(protected)/events/[id]/page.tsx`
- `src/app/admin/(protected)/events/page.tsx`
- `src/app/admin/(protected)/instagram/page.tsx`
- `src/app/admin/(protected)/page.tsx`
- `src/app/admin/(protected)/registrations/[id]/page.tsx`
- `src/app/admin/(protected)/settings/page.tsx`
- `src/app/admin/(protected)/site/page.tsx`
- `src/app/admin/actions.ts`
- `src/app/api/admin/[resource]/route.ts`
- `src/app/api/admin/exports/route.ts`
- `src/app/api/admin/instagram/route.ts`
- `src/app/api/admin/media/route.ts`
- `src/components/admin/destination-form.tsx`
- `src/components/admin/event-form.tsx`
- `src/components/admin/fields.tsx`
- `src/components/admin/form.tsx`
- `src/components/admin/navigation.tsx`
- `src/lib/admin-mutations.ts`
- `src/lib/admin-validation.ts`
- `src/lib/bookings.ts`
- `src/lib/http-security.ts`
- `src/lib/media-mutation-guard.ts`
- `src/lib/media-readiness.ts`
- `src/lib/public-media-audit.ts`
- `tests/browser/setup.ts`
- `tests/media-readiness.test.ts`
- `tests/phase05-browser/database.ts`
- `tests/test-database.ts`

### Created source and documentation files

- `.github/workflows/ci.yml`
- `docs/PHASE_06.md`
- `docs/PRODUCTION_READINESS.md`
- `playwright.phase06.config.ts`
- `scripts/check-production-startup.mjs`
- `scripts/check-secrets.mjs`
- `scripts/start.mjs`
- `scripts/test-ci.ts`
- `src/app/api/health/route.ts`
- `src/instrumentation.ts`
- `src/lib/admin-endpoint.ts`
- `src/lib/admin-event-policy.ts`
- `src/lib/csv.ts`
- `src/lib/illustration-policy.ts`
- `src/lib/operational-log.ts`
- `src/lib/origin-policy.ts`
- `src/lib/production-env.ts`
- `tests/ci-database-policy.ts`
- `tests/operations.test.ts`
- `tests/phase06-browser/operations.spec.ts`

### Artwork recovery

The three concurrent SVG replacements were backed up with verified checksums under ignored `.local/phase06/replacement-artwork-1791730476279`, then restored byte-for-byte from HEAD after explicit user instruction. They are no longer part of the Git diff.
