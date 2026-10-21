# Phase 09B — official application integration

Date: 2026-10-21. The official SAKADO application is the primary development target. Phase 09 and all earlier uncommitted private-preview/motion work are preserved on `demo/client-preview`, HEAD `0e2c147`. No Git staging, commit, push, schema migration, external connection or deployment is included.

## Preservation and recovery

Before editing, reviewed the existing tracked diff, untracked source, Phase 09 report and relevant architecture/design/motion/database/deployment guidance. The uncommitted tree includes earlier private media adapters, carousel/ShapeGrid and cinematic refinements; these are retained rather than attributed entirely to Phase 09B.

Created a non-destructive source recovery snapshot at `.local/phase09b/recovery-2026-10-21T07-57-23-789Z/`: **319 files copied and SHA-256 verified**, plus the prior Git diff, status and manifest. This covers tracked and non-ignored untracked source; it excludes ignored credentials, private original media, database files and build output. `.local/phase09b-before.patch` is an additional tracked diff copy. Restore individual source files only after reviewing subsequent user changes; no reset/checkout/index rewrite or automatic restoration was performed.

## What already worked in official mode

- Confirmed default company text, 2017/2022 timeline and five exact team names/roles were already server-rendered by the normal homepage/About branches without `DEMO_MODE`.
- Existing hero, navigation/mobile dialog, MotionToggle, native scrolling, reduced-motion/static fallbacks, footer improvements and safe initials containers were already reusable.
- Normal event, destination, gallery, settings, Instagram, contact and CMS/auth loaders already used PostgreSQL and enforced existing public DTO/parent/publication conditions. These queries were preserved.
- Missing public logo/portrait permission already selected wordmark and initials. No private photo needs to be copied into `public/` to display confirmed text.

## Changes required

1. **Official startup by default.** `scripts/dev.mjs` now starts the normal app when there is no explicit shell demo selection. It loads existing local configuration, forces `DEMO_MODE=false`/`CLIENT_DEMO=false`, refuses non-loopback PostgreSQL hosts and clears the private directory. Legacy `.env` demo defaults cannot silently select a preview. Local origin overrides use path-based `/admin`; `.env`, production startup and production credentials are unchanged. Staging/production invocations are refused.
2. **Optional previews.** `npm run dev:demo` or an explicit shell `DEMO_MODE=true` selects the database-disconnected company preview. `npm run dev:client` alone selects the separately guarded private photo presentation. The previous implicit private-preview default is intentionally superseded.
3. **Actual CMS categories.** Seven user-confirmed categories were added to the existing local `EventCategory` table, using a guarded serializable `createMany(..., skipDuplicates: true)` operation. First run inserted seven; second inserted zero. Existing rows would not be renamed, re-enabled, reclassified or overwritten. Normal `getExperiences` still queries enabled CONFIRMED CMS rows; it does not use demo fixtures or an invisible parallel fallback catalogue. No import runs on startup/page requests.
4. **Shared company presentation.** Extracted the existing `CompanyTimeline`, `CompanyTeam` and heading into `src/components/company/sections.tsx`. Main routes import them directly. The private preview supplies optional portrait DTOs through its thin `ClientTeam` adapter. Kept the existing shared CSS module/geometry and animation ownership; no duplicated section implementation or new animation library.
5. **Shared responsive polish.** The public wrapper now uses `s-company-site`; Phase 09 category typography/grid/reflow rules apply in normal and demo modes. Footer rules remain shared, including enlarged-text wrapping.
6. **Known unreviewed upload.** The unrelated hardware image still had legacy published/authorized flags. Its known SHA-256 and filename are withheld in the existing byte policy, including direct media URLs and renamed static copies. The file and database row/flags remain unchanged. This is a temporary editorial hold, not a legal conclusion or an alteration of the 17-asset approval ledger.

No fake events, destinations, bookings, prices, dates, metrics or availability were imported. Company settings were absent, so the existing confirmed defaults resolve normally; no SiteSettings row was created or overwritten. Chapters/team remain source-managed because no existing team model/editor exists. A future CMS extension can be proposed separately; no schema change is needed for this integration.

## Database verification and operations

Verified source: PostgreSQL **18.4**, database `sakado`, loopback `127.0.0.1:55432`; actual server data directory matches the existing workspace `.local/postgres`. Credentials were matched privately to the existing local config and never printed. Started the existing cluster without initialization, reset or migration.

Both existing migrations are completed, not rolled back; `prisma migrate status` reports the schema up to date. It did not apply SQL.

Before category insertion, created an access-restricted custom-format dump outside Git at:

`C:/Users/Dell/SAKADO-backups/2026-10-21-phase09b-701f5245/sakado.custom.dump`

- Size: **36,592 bytes**.
- SHA-256: `45df0a72164cab8dd23edd69c30aae1f058d11667bf3c9933a1aac24703d3b7d`.
- `pg_restore --list` succeeded.
- Restored into newly created, separate disposable database `sakado_restore_20261021_7aeb2708`, never the source.
- All **15** table row fingerprints, schema definitions, indexes, constraints, enums and Instagram/gallery flags matched. The source was rechecked unchanged before integration. This is an actually restored/verified backup, not just a dump checksum.
- Backup directory access is restricted to the local owner and SYSTEM. The retained restore contains copied authentication data; keep it private and never use it as the application/staging database. Local backup/ACLs are not proof of off-device backup or encryption at rest.

Then inserted only the seven confirmed category rows. Read-only comparison after official browser checks found **only `public.EventCategory` changed**, with count seven; every other table hash and the schema hash matched the pre-import backup. Existing auth/session/rate-limit/audit/contact/event/destination/gallery records and all 45 Instagram rows were unchanged. Instagram remains unpublished/homepage-off/generic. The hardware row retains its prior flags.

Operations on the source: SELECT/read-only audit/fingerprints, normal read-only page queries, and the seven additive category inserts. Operations outside the source: one new disposable restore database and its restore. No application migration, fixture preparation, account/session creation, login bypass, contact submission or real booking was performed. Guarded import/verification scripts and safe aggregate evidence are ignored under `.local/phase09b/`; actual backups remain outside the repository. The backup restores the pre-category state; do not restore over the source merely to undo content edits. Any real rollback needs a separate reviewed plan.

## Media and content status

- All **17** library assets remain **BLOCKED**, all **85** approval axes **PENDING REVIEW**, `publicationAllowed=false`; source manifests, feedback and approval records unchanged.
- **16 originals match** their recorded SHA-256. **S16 remains missing** from its recorded location; no substitution, reconstruction or identity rewrite.
- Hardware upload bytes match the previous SHA-256; the row/file was not edited. Public rendering/direct access are withheld pending review.
- Supplied private logos, five portraits and partner marks have no independently verified public authorization. Wordmark, initials and safe artwork remain appropriate. Production without explicitly selected hero media stays static and omits the development-only illustration.
- Actual local events/destinations/settings counts were zero. The official site uses honest empty states and the real Instagram link/fallback; demo examples appear only in explicit preview mode. The five team identities and seven categories are the user-confirmed text from Phase 09, not newly invented business claims.

## Validation and visual review

Local Windows / Node 24.19.0 / Next 16.4.0 / installed Chrome. Official mode was tested **first**, with PostgreSQL running and `DEMO_MODE=false`. Its browser configuration pins the existing local database and uses read-only identity checks; it never prepares fixtures, migrates, seeds or authenticates as an existing user. Production-browser origins and random test-server secret are explicitly local test configuration, not provider resources or production credential changes.

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS after removing the now-unused private MotionSurface import |
| `npm test` | 64 PASS: existing tests plus the hardware hold and launcher remote/staging rejection |
| `npm run build` | PASS; public-media pre/post gates and all 49 private deployment traces PASS |
| `npm run test:phase09b` | 14 PASS against actual PostgreSQL in normal development and production server modes |
| `npm run test:phase09` | 14 PASS with the actual PostgreSQL service stopped |
| `npm run dev:demo` startup | PASS while database port 55432 was closed; correct demo health response, seven categories, five members, three chapters, no private images/hydration errors |
| `npm run test:client` | 42 PASS with PostgreSQL stopped; private composition, portraits, carousel, motion, preferences, reflow and production denial preserved |
| Default official launcher smoke | PASS: exact `npm run dev` with the shell demo flag cleared; real DB health, seven categories, five members, three chapters, no preview banner/private images/hydration errors |
| Actual official scroll/admin smoke | PASS: hero transform changes subtly on scroll, protected admin redirects to the enabled existing login; no login submitted |

Official checks cover `/`, `/about`, `/experiences`, `/events`, `/adventures`, `/destinations`, `/gallery`, `/gallery?view=instagram`, `/contact`, `/privacy`; example detail URLs return 404 in normal mode. `/api/health` returns actual database connectivity success without demo mode. Contact UI is enabled with the local database, but no message was submitted. Admin redirects to login; forged session cookies do not grant access; protected API calls return 401. Private source/evidence routes and the hardware URL return 404.

After the disconnected-preview checks, restarted the same existing cluster and repeated the preservation comparison: only the seven categories differ from the verified backup. The default official app is left running on loopback 3000, with PostgreSQL on loopback 55432. No data initialization occurred on restart. The source snapshot comparison found all 319 original source files present, 305 byte-identical and only the 14 intended Phase 09B edits to existing files; new integration/test/report files are additive. No unrelated pre-existing source changes were discarded.

Reviewed official Chrome captures at **1440 × 900, 768 × 1024, 375 × 812**: unchanged cinematic composition, exact timeline/team text, readable navigation/footer and responsive layout. Focused tests find no horizontal overflow/hydration/page errors; reduced motion, Escape/focus restoration, no-JS server rendering and 200% text at 320/360px pass. Screenshots remain ignored under `.local/phase09b/screenshots/`. No screen-reader/real-device certification or Hostinger/Linux/staging pass is claimed. Real authorized photography remains a visual-fidelity limitation.

Startup validation caught a CommonJS/ESM import incompatibility in the new Node launcher; corrected to the installed `@next/env` default export. A new test's NODE_ENV literal typing was corrected before the passing typecheck. No auth/media guard was weakened. Existing development lazy-image LCP suggestions and Playwright NO_COLOR/FORCE_COLOR warnings may appear; they are not concealed or relabeled as production profiling.

## Phase 09B source files

- `scripts/dev.mjs`, `package.json`: official-first local startup and explicit demo/test commands.
- `src/components/company/sections.tsx`: shared server company presentation extracted from existing components.
- `src/components/client-demo/client-home.tsx`: shared heading/timeline and optional private portrait adapter, preserving private presentation.
- `src/app/(public)/page.tsx`, `about/page.tsx`: direct shared company imports; existing normal/private branches preserved.
- `src/app/(public)/layout.tsx`, `src/styles/company.css`: shared public reading/reflow rules.
- `src/lib/media-readiness-policy.ts`, `tests/media-readiness.test.ts`: identity-bound hold for the known unrelated upload; no approval-record edits.
- `tests/development-launcher.test.ts`: remote database and staging/production refusal checks with credential-output protection.
- `playwright.phase09b.config.ts`, `tests/phase09b-browser/*`: real-local read-only official-mode acceptance checks.
- `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/CLIENT_DEMO.md`, historical Phase 09 note and this report: primary-target/startup/recovery instructions.

Other existing uncommitted files are preserved. No lockfile/dependency, Prisma schema/migration, authentication/role implementation, public asset, production credential or media approval ledger change.

## Exact local startup

If PostgreSQL is stopped, run the existing persistent local service in one terminal:

```powershell
cd C:\Users\Dell\Desktop\sakado_web
npm run db:local
```

If the verified service is already running, skip that command; do not initialize another cluster or remove its PID file. In another terminal:

```powershell
cd C:\Users\Dell\Desktop\sakado_web
Remove-Item Env:DEMO_MODE -ErrorAction SilentlyContinue
npm run dev
```

Open **http://127.0.0.1:3000** and **http://127.0.0.1:3000/admin**. Use the existing valid admin login; no account/password was created or reset. The launcher preserves the local DB URL and clears private-preview flags; local SITE_URL/ADMIN_URL overrides do not edit `.env` or operational startup. Use `npm run dev:app` only for deliberate direct Next configuration.

Stop the app before optional previews on the same port:

```powershell
npm run dev:demo
```

The previous explicit `$env:DEMO_MODE='true'; npm run dev` remains supported. The private-photo mode is `npm run dev:client`. Stop previews and clear the shell demo flag before returning to official development. No preview should be exposed through tunnels, proxies or a LAN listener.

## Outstanding requirements

Human review of official content/presentation and authenticated CMS workflow remains. Genuine login/administrative CRUD was not exercised using an existing person's credentials. Obtain public brand/photo/portrait/partner permissions and all applicable participant/minor/credit decisions; locate/hash S16. Supply approved operational events/destinations, contact details and registration policies before enabling real offerings.

Hostinger runtime/region/hostname/HTTPS/access restrictions, external PostgreSQL, durable storage, cross-border/privacy review, secret delivery, release candidate, external restore/rollback and actual staging validation remain BLOCKED/NOT TESTED. Local production-server checks are not remote deployment or legal/media clearance. No deploy, paid resource, DNS change, remote migration, push or commit is authorized. Future features target the main application first; demo is secondary. Stop after Phase 09B.
