# SAKADO 2.0 — Hostinger deployment plan

Phase 10.1 update (2026-10-21): [PHASE_10_1](PHASE_10_1.md) provides the current recovery proof, dependency decision, provider/owner matrix and exact future CI instructions. New `check:native -- --linux` checks Node/native modules without querying a database; only Windows execution is currently verified. Dynamic `/media` and private routes are excluded from the public image optimizer to preserve publication/withdrawal checks. Use direct policy-controlled media and prove provider/CDN cache isolation in staging. Current local backup now includes seven categories; no external persistence/backup or deployment clearance is granted.

Phase 10 update (2026-10-21): see [PHASE_10](PHASE_10.md) for the current official-application audit and local checks. Public Hostinger documentation was rechecked: eligible managed Next.js/Node 24 and external PostgreSQL are documented capabilities, not proof of this account's provisioning. The [managed Node limits](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/) describe one long-running app process, shared resources, 120-second requests and no extra always-running services. Verify actual native dependencies, process PORT/start settings, HTTPS/proxy and approved persistence in separately authorized staging. No persistent upload path, external DB, hostname or access restriction is confirmed; all external tests remain BLOCKED/NOT TESTED. The current Phase 10 CI additions are prepared, not a passing Linux run. No deployment or resource creation was performed.

Phase 08 update (2026-10-11): the user confirms **no external staging environment is provisioned** and authorizes repository preparation only. Historical compatibility references below are not current-plan proof. Read [EXTERNAL_STAGING](EXTERNAL_STAGING.md) and [RELEASE_CANDIDATE](RELEASE_CANDIDATE.md) before any separately authorized external operation. Hostinger capabilities, approved hostname, PostgreSQL, persistent storage, access restriction and HTTPS remain unverified. No external resources, credentials, DNS or deployment are authorized by the preparation files.

Verified 2026-10-09. **User-selected target: managed Node.js Web App hosting**, not VPS. No hosting account was accessed and no deployment was performed. Exact plan entitlement, region, resource ceilings, domain and external service budget are **TO BE CONFIRMED**.

## Compatibility verdict

Phase 01 adds only a lazy frontend GSAP/ScrollTrigger dependency and an isolated motion laboratory, preserving the Node/PostgreSQL/storage topology. Its Windows build and DB-disabled Chrome checks are recorded in [PHASE_01](PHASE_01.md). The laboratory returns 404 in production. These checks do not close the Linux, durable-media or actual Hostinger staging gates below.

**Compatible architecture, conditional on an actual-plan staging proof.** Next.js needs a live Node server for this CMS, cookies, Server Actions, registration endpoints and policy-controlled media. A static export uploaded as static files cannot provide these features.

| Requirement                | Evidence / conclusion                                                                                                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Managed full-stack Next.js | Hostinger currently lists Next.js backend support on eligible Business/Cloud plans. Deployment-managed folders are overwritten, so they must not own durable uploads. [Hostinger deployment guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) |
| Node version               | Hostinger lists 18/20/22/24; select **24.x**, matching local Node 24.19.0. Exact patch availability must be tested. [Node version selection](https://www.hostinger.com/support/how-to-select-the-node-js-version-for-your-application/)                                            |
| Next runtime minimum       | Installed Next 16.4.0 installation guide requires Node ≥20.9; Node 18 is unsuitable despite being offered by the host                                                                                                                                                              |
| Database                   | Hostinger's managed database offering is MySQL; external PostgreSQL is the compatible choice for this existing Prisma schema. [Hostinger database guidance](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/)                     |
| External PostgreSQL        | Hostinger documents connecting Node apps to external PostgreSQL through Supabase; provider choice remains open. [Hostinger external database guide](https://www.hostinger.com/support/connecting-a-supabase-database-to-a-hostinger-node-js-application/)                          |
| Restart/redeployment       | Build/start settings and environment can be reviewed during redeployment; validate every release against the current panel. [Hostinger redeployment guide](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/)                                               |

Older Hostinger articles saying Node always requires VPS conflict with the current managed-app guidance. Use the current product guides above, then verify the actual account. A provider framework listing does not certify this application's native dependencies, image processing, proxy behavior or performance.

Local framework guides read: `node_modules/next/dist/docs/01-app/01-getting-started/{01-installation,05-server-and-client-components,08-caching,16-proxy,17-deploying}.md`, and `02-guides/{self-hosting,caching-without-cache-components}.md`. Consult these installed guides before implementing startup/caching changes.

## Target topology

Hostinger TLS/proxy → one Next.js Node application → external managed PostgreSQL over verified TLS; durable object storage behind the storage adapter/media policy. CMS initially stays at `/admin` on the same origin. A separate ADMIN_URL is optional and requires host/origin/cookie testing; it is not a security boundary by itself.

Start with one application instance and no public-page CDN caching until publication/invalidation semantics are proven. Database sessions and rate limiting already avoid process-local state for active endpoints. Multiple instances later require compatible builds, shared invalidation/storage and Server Action encryption configuration according to the installed self-hosting guide. Never cache admin responses or authenticated media.

Select DB/storage regions close to hosting and target audience after measured latency and privacy review. Do not run `embedded-postgres`, local DB helper scripts or a development server in production. Keep PostgreSQL rather than introduce a separate MySQL schema conversion.

## Build and startup contract

Current scripts:

- build: `npm run build` — pre/post public-media gates, Prisma generation, Next production build and private deployment-trace gate
- start: `node scripts/start.mjs` — Node/environment validation, then loopback Next server
- start:hostinger: `node scripts/start.mjs --hostinger` — validated server on 0.0.0.0 with platform process PORT
- typecheck: `next typegen && tsc --noEmit`
- deploy migrations: `prisma migrate deploy`

Phase 00.5 now declares `engines.node=24.x` in package metadata/lockfile and `24` in `.nvmrc`. The local start command remains loopback; select `npm run start:hostinger` in Hostinger's start-command setting. Use the panel's assigned process-level `PORT`, not a hardcoded public port. Next reads PORT before loading .env, so placing it only in an environment file is insufficient. Verify actual panel routing/binding before deployment. `next typegen` creates the ignored `next-env.d.ts` and route types before checking a clean checkout. No dependency version was upgraded.

Staging build sequence:

1. Clean Linux Node 24 install via `npm ci`, including build-time dev dependencies.
2. `npm run db:generate`, `npm run typecheck`, `npm run lint`, `npm test`.
3. Apply reviewed migrations once through a controlled release job, using a migration identity and only after backup/compatibility checks.
4. `npm run build`; start the resulting Node application using the verified platform command.
5. Run smoke matrix below through public HTTPS, not only localhost.

Do not run migrate-dev, db-push/reset, test fixtures, local-postgres, legacy restructuring or administrator provisioning in every build/start. Do not copy Windows node_modules to Linux: Prisma, argon2 and sharp require compatible runtime artifacts. Do not switch to output:export. Standalone output is optional only if the detected Hostinger deployment contract requires it; do not invent an entry file for the Next preset.

Builds must have only the environment needed for their rendering/generation strategy. Current app is force-dynamic; test actual build behavior rather than assume database access is never needed. Never reuse production credentials for test/build fixtures.

## Environment contract

| Variable                                                          | Current / proposed use                                                                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| DATABASE_URL                                                      | Current Prisma PostgreSQL connection; server-only; verified TLS and bounded pool                                                 |
| AUTH_SECRET                                                       | Current required ≥32-character random secret; HMAC rate-limit keys/auth configuration; not the old SESSION_SECRET                |
| SITE_URL                                                          | Current canonical public HTTPS origin; real domain **TO BE CONFIRMED**                                                           |
| ADMIN_URL                                                         | Current optional admin host; prefer same origin initially                                                                        |
| DEMO_MODE                                                         | Current; false in approved production; true only for explicit demos                                                              |
| MEDIA_STORAGE                                                     | Current accepts local only; implement remote adapter before setting another value                                                |
| MEDIA_LOCAL_DIR                                                   | Current dev/legacy local upload path; not a durable managed deployment directory                                                 |
| TRUST_PROXY                                                       | Current; false unless Hostinger demonstrably replaces/sanitizes forwarded headers                                                |
| CONTACT_EMAIL / CONTACT_PHONE / CONTACT_ADDRESS / WHATSAPP_NUMBER | Current optional fallback settings; use only verified business details                                                           |
| ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD                         | One-time provisioning inputs; never public and remove password after use; inspect provisioning script first                      |
| HOME_V2_ENABLED                                                   | Proposed server-side rollback flag; not implemented                                                                              |
| REGISTRATIONS_ENABLED                                             | Proposed explicit business-release gate; not implemented; default off for 2.0 until approved                                     |
| Storage endpoint/bucket/access credentials                        | Proposed adapter-specific server secrets; finalize names with provider                                                           |
| DIRECT_URL                                                        | Proposed migration connection if runtime pooling requires it; current Prisma schema does not read it until explicitly configured |

Use separate local/test/staging/production databases, storage namespaces and secrets. No `NEXT_PUBLIC_` prefix for sensitive values. Do not commit .env, database dumps, private uploads or credentials. Hostinger's connection wizard does not adapt Prisma schema/code: verify DATABASE_URL actually matches the application's datasource.

For an external PostgreSQL provider, verify reachable IP family, TLS certificate validation, connection limits and pooler mode compatibility with Prisma interactive serializable transactions. Use direct or compatible session connection for migrations. If Supabase is selected, consult [its connection-mode documentation](https://supabase.com/docs/guides/database/connecting-to-postgres); do not assume a public browser API key replaces a server database URL.

## Storage and media release gate

A relative uploads folder inside a build is not durable. Implement external storage per [DATABASE](DATABASE.md), keeping stable `/media/[key]` URLs and checksummed originals. Remote adapter configuration must fail clearly if unavailable.

Initially use the policy gateway for private/revocable media. Only explicitly public approved derivatives may use a CDN. Image optimization can cache transformed copies: test rights withdrawal, parent unpublish and preview isolation before changing current unoptimized image behavior. Never route authenticated media through a public image cache.

Before rollout: copy objects, verify hashes/dimensions/rights references, reconcile DB pointers, restart and redeploy twice, then fetch the same approved public and protected assets. Keep a tested backup outside the application release folders.

## Security, observability and health

Enforce HTTPS/canonical host, Secure HttpOnly host-only session cookies and existing sameSite behavior. Test canonical-origin checks behind the actual proxy. Strict CSP changes must preserve Next.js hydration; external media requires tightly scoped image origins only when chosen. Maintain admin/API private/no-store/noindex; service worker caches only neutral static/offline files.

Proposed endpoints: minimal `/api/health/live` returns process liveness; `/api/health/ready` performs a bounded DB connectivity/schema-readiness check and returns only ready/unavailable, with no credentials or internal topology. Storage write/read verification belongs in deployment smoke tests, not every public health request. Throttle health probes; apply no-store/noindex.

Record release ID, request/correlation ID, route, latency, status and redacted error category. No passwords, session tokens, raw form values, personal data or connection strings. Monitor 5xx rate, p95 response time, DB pool pressure, upload failures, auth anomalies and CPU/RAM. Alert thresholds and on-call owner are **TO BE CONFIRMED**. A proposed initial alert is readiness failing for two minutes or 5xx >1% over five minutes at meaningful traffic.

## Staging smoke and acceptance matrix

| Area                 | Required evidence                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Build/native modules | Clean install/build; Argon2 hash/verify and Sharp decode/encode work on Linux                                |
| Runtime              | HTTPS home and deep routes load; process uses correct port; restart/redeploy succeeds                        |
| Data                 | Correct migrations; 45 canonical Instagram records/IDs/flags preserved; no unintended demo rows              |
| CMS auth             | Login/logout, expiry/disabled user/role denial, hostile origin and oversized-body rejection                  |
| Publication          | Draft/unapproved/withdrawn parents absent from public HTML, DTOs and direct media; no cached private content |
| Upload/storage       | Valid raster persists across redeploy; SVG/malformed/oversized rejected; checksum stable                     |
| Contact              | Persist test inquiry in staging, visible only to authorized admin; no false email claim                      |
| Registration         | Gate disabled unless approved; if enabled, run duplicate/concurrent-capacity checks only on staging fixtures |
| SEO                  | Staging noindex; production canonical/sitemap only approved URLs; no example domain or admin indexability    |
| UX                   | All ten slots; static/no-JS/reduced motion, keyboard, touch, zoom, missing media and mobile layouts          |
| Performance          | Architecture budgets and cold mobile measurements with real approved imagery                                 |
| Recovery             | Restore DB/media into isolated environment; previous compatible app release works                            |

Existing automated DB tests reset local `sakado_test`; do not point them at managed staging/production. Use a specifically prepared disposable fixture environment for remote smoke data.

## Cutover, rollback and backup

1. Establish source-control/release baseline; capture recoverable DB/media backups and old release configuration.
2. Deploy to separate staging origin, with noindex and separate credentials. Do not remove an existing Hostinger website just to add an app; account/domain migration requires a specific backed-up cutover plan.
3. Migrate approved authoritative data with counts/checksums; revoke obsolete sessions rather than copying active development sessions into production. Provision/reconfirm the production owner securely.
4. Apply additive schema, deploy compatible code, run smoke tests, then switch traffic during an agreed release window. Prevent concurrent migration jobs; confirm old/new writers remain compatible.
5. Enable V2 only after content/design/security approval; keep previous release and flag rollback. Remove noindex only on the confirmed production origin.
6. If rollout fails, switch back to the compatible application release. Keep additive DB changes; reconcile new writes before any restore. Do not reset a live DB or delete uploads as rollback.

Proposed RPO ≤24h and RTO ≤4h, daily encrypted DB/media backups plus provider PITR where available; final retention/cost/owner **TO BE CONFIRMED**. Restore drills must include objects and database references together. Schedule expired session/rate-limit cleanup outside request traffic; scheduler availability is a plan-specific check. Deployment backups are not automatically database/object backups.

## What remains unverified

Actual Hostinger entitlement/limits/port/proxy setup, precise Linux compatibility, region/network latency, external DB/storage choice, backup/PITR, domain/TLS, MFA/recovery, approved content and the two reference screenshots. No claim of production readiness is made until the staging matrix passes.

## Phase 00.5 — source control and verified recovery

This section records actions actually performed on 2026-10-09; it supersedes the earlier proposal where implementation status differs. No homepage, CMS/auth behavior or Prisma schema change belongs to this phase. No remote deployment, paid resource, GitHub repository creation or push was performed.

### Local history

No repository or ancestor history existed. Portable Git for Windows 2.56.0.windows.2 was obtained from its official release; its archive SHA-256 matched the release API digest. The tool is outside the project, not a system-wide installation. Local branch: `main`. Approved local author: `SAKADO Local Baseline <baseline@localhost>`; global Git configuration was not changed.

Baseline commit: `0a0c5421b0b69eb1471e0c5f3ef9c4af3557f206`; tag: `phase-00-baseline`. It contains 164 reviewed source/documentation files. Candidate files were checked against actual local secret values and private-key/token patterns without printing secrets; no matches were found. No remote is configured. `.gitignore` excludes real `.env*`, local credentials, private uploads, dumps/archives, SQLite files, generated types/builds, test artifacts and `.local`. Empty `.env.example`/`.env.*.example` templates and checked-in Prisma migration SQL remain included.

Readiness changes are recorded in a subsequent local commit tagged `phase-00-5-safety`, preserving the baseline. `sakado-phase005.bundle` contains both commits and tags and is checked with `git bundle verify`. Recover source by cloning that bundle into a new directory; credentials, database and uploads must be restored separately. Never clone over the existing project.

Recommend a **private GitHub repository** owned by the approved Sakado account, with MFA and reviewed collaborator access. Create/connect/push only after explicit authorization. Do not make backups, dumps, uploads or filled environment files part of the future repository. The prepared Linux workflow uses only manual dispatch, read-only repository permission, immutable action revisions and no persisted checkout credentials; it cannot deploy or push.

### Recovery location and access

All recovery files are outside the Git worktree:

`C:/Users/Dell/SAKADO-backups/2026-10-09-phase00-5-8327b4d3/`

Windows ACL inheritance is disabled on that directory; only the local Dell identity and SYSTEM have explicit full access. This is a local disk recovery copy. Off-device encrypted copies, retention and a second failure domain remain **TO BE CONFIRMED**; do not call it encrypted-at-rest or disaster recovery protection without evidence. Dumps contain personal/authentication data and must not be shared publicly. `.local/phase005-paths.json` is an ignored convenience pointer, not the backup itself.

| File                         | Purpose / verification                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `sakado-baseline.bundle`     | Full baseline Git history; `git bundle verify` passed                                                   |
| `sakado-phase005.bundle`     | Baseline and readiness commits/tags; `git bundle verify` passed                                         |
| `sakado.custom.dump`         | Full logical application-database backup, 36,592 bytes                                                  |
| `sakado.archive-list.txt`    | Archive contents successfully listed by pg_restore                                                      |
| `database-verification.json` | Source/restored table counts, SHA-256 row/schema fingerprints and status reconciliation; no raw rows    |
| `media-inventory.json`       | Upload path, byte count, SHA-256 and verified copy equality                                             |
| `validation-results.json`    | Actual Windows install/generation/type/lint/unit/build/native/startup results; Linux explicitly NOT RUN |
| `final-preservation.json`    | Final original-database row comparison and dump/media checksum verification                             |
| `uploads/`                   | Unmodified uploaded-media copies                                                                        |
| `backup-and-verify.cjs`      | Archived one-time verification implementation; inspect before reusing with a fresh output directory     |
| `tools/`                     | Portable Git/PostgreSQL utilities; no application dependency changes                                    |
| `validation-windows/`        | Disposable source copy for clean installation/build; no real .env, uploads or source database files     |

Dump SHA-256: `229516153dc1bcddbb39156a00220c5c6779104cf38ca25f19be2f7770c76c21`.

### PostgreSQL backup and restore proof

Active local database: `sakado` at `127.0.0.1:55432`, PostgreSQL **18.4**. Credentials were used privately and are not recorded here. PostgreSQL **18.6** pg_dump/pg_restore binaries were downloaded through the EDB archive linked by the PostgreSQL Windows page; the existing server was not replaced or upgraded.

The source connection held a repeatable-read, read-only transaction and exported a snapshot. `pg_dump --format=custom --snapshot=…` used that same snapshot with read-only transaction defaults. It included application schema/data and Prisma migration history. No data-only/table-filtered export was substituted. This backs up the single database, not cluster-wide roles, role passwords, tablespaces or external media. Restore mapped ownership/privileges to the existing local restore role; future recovery to another server needs a separately reviewed role/permission setup. See [PostgreSQL pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html) and [pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html).

The archive was restored with `--single-transaction --exit-on-error --no-owner --no-privileges` into a newly created database named `sakado_restore_20261009_8decf358`. No clean/reset/create operation targeted the original database. Verification compared all **15 tables** (14 application models plus `_prisma_migrations`), every row by sorted SHA-256 fingerprint, and columns/defaults, indexes, constraints and enums. Source and restored fingerprints matched. A subsequent read-only source comparison also matched: `originalUnchanged=true`.

After application validation, a final read-only check again matched all 15 original table fingerprints and the dump/media checksums. The existing local server had stopped during the session interruption; it was temporarily started with read-only defaults for this check and then stopped. Local PostgreSQL is currently stopped; the temporary read-only startup option was not persisted.

All **45** Instagram records remained `published=false`, `showOnHomepage=false`, `mediaType=INSTAGRAM_MEDIA`; every row's full fingerprint was preserved. The unrelated gallery image retained its original publication/authorization flags. The disposable restore database is retained as verification evidence; it contains copied authentication data, must never be configured as the application database, and may be removed only after explicitly verifying its name differs from the authoritative database. No original database changes were used for verification.

For another backup/restore exercise:

1. Identify the source without printing its URI/password. Use a new restricted directory outside Git; never overwrite the only verified dump. Supply libpq variables `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` privately through the process environment, not a full URI in command-line arguments or logs.
2. Use a pg_dump major version compatible with the server. Run a full custom-format dump; for exact comparison, coordinate an exported read-only snapshot as above. Record tool/server versions, SHA-256, size and pg_restore archive-list result.
3. Create a fresh uniquely named disposable database on the verified local server. Reject any target equal to the source. Restore the trusted archive there with exit-on-error/single-transaction; do not use `--clean` or reset the source.
4. Compare all row fingerprints and schema definitions, migrations, Instagram IDs/URLs/flags, and required media references. Store only counts/hashes in the report. Check the original again read-only. Mark the backup verified only if all checks pass.
5. Keep the verified dump and media together. If cleaning up the disposable database, verify its exact name and connections first; never derive a delete target from an unvalidated environment variable.

### Media proof and future migration

The configured storage adapter remains local. The single file is `uploads/879605b7-d54d-4fc7-aca1-42303a26b326.webp`, **264,422 bytes**, SHA-256 `ac847f45641cb91bc1530bfd938f6dc44b7f1f98900851c9a2b66fa1b02eef37`. Its backup copy has the same hash. No original upload was moved, edited, deleted or reclassified. The hardware diagram remains unchanged pending explicit editorial review.

Before managed deployment, choose a provider/region/budget and implement the existing MediaStorage interface against durable private object storage. Copy objects with stable keys, verify hashes, retain `/media/[key]` URLs, enforce current authorization/parent-publication policy, use remote-first/local-fallback reads during transition, test rights withdrawal and restart/redeploy persistence, then retire old copies only after a verified restore and agreed retention. Do not merely change MEDIA_STORAGE: unsupported adapters currently fail. No external storage adapter or resource was created in Phase 00.5.

### Validation evidence and remaining gate

An isolated Windows Node **24.19.0** / npm **11.17.0** source copy was created outside the working project. `npm ci --include=dev --no-audit --no-fund` succeeded: 412 packages installed. No real .env or source uploads/database files were copied. Validation uses an unreachable dummy DATABASE_URL; no migration, import, database fixture or administrator provisioning command runs.

The following checks passed in that clean Windows copy: Prisma Client 6.19.3 generation; `next typegen && tsc --noEmit`; ESLint; **15 unit tests, 0 failures**; Next 16.4.0 production build; Sharp native WebP encoding. A temporary production server using the `start:hostinger` arguments accepted a process-level PORT, returned HTTP 200 for the demo homepage and robots.txt, and kept demo crawling blocked. It ran with database access disabled and was stopped afterward. These are Windows results, not Linux or Hostinger results. Evidence is in the restricted `validation-results.json`. No DB integration/E2E fixtures were run.

Linux execution is **NOT RUN**: WSL is not installed and Docker is unavailable. `.github/workflows/linux-validation.yml` prepares the equivalent Ubuntu 24.04 / Node 24 checks, including native Sharp encoding. It has been parsed locally, but a valid workflow is not a passing run. Executing it requires an approved private GitHub push and manual dispatch, or a separately authorized Linux environment. Do not install an OS, publish the repository or claim Linux compatibility to work around this gate.

Hostinger readiness remains conditional on Linux success, actual-plan port/proxy/TLS/native-module testing, external PostgreSQL, durable media storage, secret provisioning and restore rehearsal in staging. Phase 00.5 establishes recoverability for reversible local work; it does not authorize Phase 01 or deployment. Stop and request the next explicit task.

## Website Phase 04 readiness boundary

This later authorized frontend phase does not deploy. The build now audits public files before compilation and public/generated static assets afterward against the non-sensitive MEDIA-04 registry. Missing/inconsistent registry data fails the build. Include `docs/media/asset-manifest.json` and `docs/media/media-04-publication-readiness.json` in a future reviewed source/release package; Next tracing includes these two files for server runtime reads. Never include `SAKADO-MEDIA` or private evidence. Build dependencies, including the existing tsx and Prisma tools, must remain available during the build stage. Runtime uses server-side JSON reads, not tsx.

Readiness updates require a controlled human-reviewed release and do not publish by themselves. Existing CMS selection/publication remains a separate action. Restart/release processes must preserve the registry files and external media keys. Recheck readiness, license expiry, current parent visibility and privacy/hosting clearance after a rollback; an old release must not restore withdrawn authorization. This phase provides no withdrawal synchronization service across releases. Until one exists, coordinate registry revocation across active and rollback artifacts before serving them. Linux, durable storage, approved hosting regions and authenticated staging checks remain unresolved gates. See [PHASE_04](PHASE_04.md).

## Phase 06 operational release requirements

Phase 06 binds original demo artwork to committed hashes; familiar filenames do not confer authorization. Three concurrent unverified SVG replacements were rejected by the gate, privately backed up with verified checksums, and restored byte-for-byte from HEAD only after explicit user instruction. The actual working-tree production build now passes. Keep the gate enabled, use controlled release packaging and review provenance/performance for future assets.

This phase prepares CI and operational safety; it does **not** deploy. The authoritative launch gates are [PRODUCTION_READINESS](PRODUCTION_READINESS.md). All 17 photographic assets remain BLOCKED, all 85 approvals PENDING REVIEW; public launch remains blocked. No external storage, paid provider, DNS, live database or remote resource was created.

### Configuration and commands

Use locked dependencies on Node **24.x** (`.nvmrc`/engines). Build with development tooling present: `npm ci --include=dev`, `npm run db:generate`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Build contains read-only pre/post public-media audits. Build/CI may deliberately use DEMO_MODE=true and an unreachable dummy DB; this is not operational production validation. No migration runs as a side effect of build or start.

| Environment name                                               | Purpose / requirement                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV                                                       | production in managed runtime                                                                                                                                                                                                                                                      |
| DATABASE_URL                                                   | Required PostgreSQL connection for operational mode; external provider and reviewed TLS parameters required in staging. Never print the value.                                                                                                                                     |
| AUTH_SECRET                                                    | Required unique random secret, at least 32 characters. No placeholders. Rotation also changes rate-limit identity buckets; session-token hashing is independent, so a secret change alone does **not** invalidate existing sessions. Plan explicit session revocation when needed. |
| SITE_URL                                                       | Required HTTPS public origin without a path, query, credentials or fragment. Official hostname TO BE CONFIRMED.                                                                                                                                                                    |
| ADMIN_URL                                                      | Optional HTTPS origin; leave empty to use the public host's /admin. A separate configured host rewrites its / to /admin.                                                                                                                                                           |
| DEMO_MODE                                                      | Explicit false for operational production. Explicit true is safe preview mode, not launch readiness or an auth bypass; admin business mutations/contact/registrations are disabled.                                                                                                |
| TRUST_PROXY                                                    | false until the actual proxy is proven to replace forwarded identity headers; true affects login origin limiting.                                                                                                                                                                  |
| MEDIA_STORAGE                                                  | Only local is implemented. Durable storage remains a blocker; unsupported names fail validation.                                                                                                                                                                                   |
| MEDIA_LOCAL_DIR                                                | Current local upload path. Managed redeployment durability is not assumed.                                                                                                                                                                                                         |
| CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS, WHATSAPP_NUMBER | Optional verified business fallback contacts; do not invent values.                                                                                                                                                                                                                |
| PORT                                                           | Hostinger process-level assigned port. Never place it in a Next .env template.                                                                                                                                                                                                     |
| ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD                        | One-time first-owner provisioning inputs, never retained runtime/client variables.                                                                                                                                                                                                 |

The supported start commands run `scripts/start.mjs`: it loads Next environment files, validates critical settings and exits with code 1 before spawning Next when invalid. Node 24 runs the small erasable TypeScript policy directly; retain `src/lib/production-env.ts` in the release source. `src/instrumentation.ts` also checks configuration at Node server initialization for direct Next CLI use. Direct Next startup can retain a failed bootstrap process after instrumentation throws; use the supported launcher for reliable process failure. Missing/invalid DB URLs, weak/placeholder AUTH_SECRET, missing/non-HTTPS SITE_URL, malformed ADMIN_URL and unsupported modes are rejected. These checks do not connect to a database, prove secret entropy, provision media storage or certify compliance. Explicit demo mode can start without operational credentials; `authConfigured()` and server authorization still apply. Keep preview/staging noindex; never use example.invalid as a live domain.

After reviewed additive SQL and a **fresh verified backup/restore**, use `npm run db:deploy` against the explicitly approved target. Phase 06 creates no migrations. Never migrate reset, db push, seed or run test fixtures on staging/production. Restore tests target a separate disposable DB, never the authoritative one.

Start locally on loopback with `npm run start`; Hostinger uses `npm run start:hostinger` (0.0.0.0, process PORT). Configure HTTPS reverse proxying with preserved original Host and correct origin/protocol forwarding; no broad Server Action allowedOrigins bypass. Validate login/logout and Secure/SameSite=Strict cookies on the actual hosts. Existing CSP, frame denial, nosniff, referrer and permissions headers remain; Instagram uses direct links/local previews, not external embeds. HSTS requires a later verified HTTPS/domain decision. Native Argon2/Sharp/Prisma compatibility must pass real Linux CI and Hostinger staging.

### Health, owner provisioning and rollback

`GET /api/health` is no-store/noindex. Operational mode runs only SELECT 1 and returns `{status:"ok"}` or HTTP 503 `{status:"unavailable"}`; demo reports `{status:"ok",mode:"demo"}` without database access. It exposes no credentials, host paths, counts or stack traces. It is not a media/legal/storage release gate. Assign monitoring/incident ownership and private provider-log access before launch. New operational logs are fixed event/operation metadata; framework logs still need staging review and retention controls.

The existing `npm run admin:create` command is local `.env`-based; **do not run it here against current data**. For later approved managed provisioning without a real .env file, invoke its existing script through the installed tsx loader (`node --import tsx scripts/create-admin.ts`) with privately supplied DATABASE_URL, AUTH_SECRET, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD. It refuses an existing active owner and records the initial owner action. Never echo the password, pass it in shell arguments or store it in Git. Clear the one-time secret afterward; subsequent accounts are managed by OWNER only. No invitation email is sent.

Retain the previous tested release, manifests/readiness registry, dependencies and external object keys. A rollback changes code/config through a reviewed release; it does not restore production DB contents or run destructive schema reversals. Take a separate fresh backup before any additive migration; rehearse restore separately and define incident/rollback ownership. Reconcile rights revocations in both active and rollback registries before serving media. Local uploads cannot serve as the rollback media plan.

### CI and team workflow

`ci.yml` runs on PRs, pushes to main and manual dispatch, with two required jobs: **Quality, Tests, Build and Media Safety**; **PostgreSQL Integration and Admin Workflows**. Locked npm install, Prisma generation, typecheck, lint, units, build/media audits and Phase 04 browser regressions are automated; the integration job builds with safe inputs then runs existing integration plus Phase 05/06 browser suites against a disposable PostgreSQL 16 service. No embedded local PostgreSQL is used in CI. Before destructive fixtures the runner checks explicit GitHub/Linux markers, exact test URL/user/DB/port and the server's actual data directory/version. Local `npm run test:phase06` instead creates a fresh owned cluster. Original .env-driven test commands now refuse an unmarked database.

Only npm package downloads are cached. No secrets, live databases, private media or review evidence are cached/uploaded. Both jobs fail on command failures; no continue-on-error/deployment step. This Phase 06 description originally recorded execution as pending. The user subsequently reported repaired Linux success and supplied run 38156234009; the GitHub connector returned 404, so independent verification remains unresolved. Phase 07 changes have not been pushed or run in GitHub CI. See PRODUCTION_READINESS. No repository settings, merge, commit, push or remote deployment is authorized by these prepared files.

## Phase 07 staging rehearsal and release gates

Read [PHASE_07](PHASE_07.md), [STAGING_READINESS](STAGING_READINESS.md), [DEPLOYMENT_REHEARSAL](DEPLOYMENT_REHEARSAL.md), [BACKUP_RESTORE](BACKUP_RESTORE.md) and [ROLLBACK](ROLLBACK.md). They distinguish local rehearsal evidence from actual infrastructure validation. No remote staging or production deployment has occurred.

The optional supported variable `STAGING_MODE` accepts `true` or `false`. Set it to `true` in dedicated staging with `DEMO_MODE=false`; application responses receive noindex/no-store, robots disallows crawling and sitemap is empty. This does not protect access, disable authenticated writes or authorize media. Use a separate provider/proxy access restriction. `.env.staging.example` contains empty/example values only; it is not automatically loaded by Next. Supply values through the process/provider. Never copy production credentials or participant data into staging.

### BEFORE DEPLOY

- Obtain explicit environment-specific deployment authorization and an available release/incident owner. Record the reviewed immutable source/artifact, lockfile, migration and media registry hashes.
- Independently verify both required GitHub jobs for that exact release; resolve or explicitly accept the development dependency findings through the authorized security owner.
- Confirm dedicated PostgreSQL identity/region/TLS/access, valid unique secrets, HTTPS origins, proxy trust, access restriction, Node 24 and process PORT. Verify country/privacy obligations with qualified reviewers.
- Verify durable storage across restart and provider redeploy; confirm off-device encrypted backups, retention, restricted access and a separately verified restore. Keep rollback artifact and shared media available.
- Review migration status and additive SQL; approve only authorized media/credits. Preserve all current blocked photos. Complete admin provisioning plan, monitoring/alert ownership, accessibility/device checks and business policies.

### DURING DEPLOY

- Stop on any unmet gate. Keep staging access restricted and noindex active independently of application rollback.
- Verify target identity without logging its connection string. Take the approved fresh backup, verify restore evidence and record current migration state.
- Use locked installation and Prisma generation, reviewed `npm run db:deploy`, production build and `npm run start:hostinger` with provider PORT only after staging authorization. Never use migrate dev, reset or db push. Preserve uploads across release replacement.
- Provision the first owner privately with the existing guarded script only when needed; remove provisioning inputs immediately. Do not print credentials.
- Check health, safe logs and security headers. If migration state becomes unclear, stop writes and investigate; do not blindly retry or resolve migration history.

### AFTER DEPLOY

- Run authorized synthetic public/admin/registration smoke tests, role/origin denial, media hash and actual image optimizer checks. Remove only owned test data through approved procedures.
- Verify HTTPS secure cookies, trusted forwarded-header replacement, caching, noindex, rollback and persisted media on the actual platform. Health alone is insufficient.
- Record monitoring/backup ownership, artifact and result evidence; revoke temporary access. Public launch still requires independent legal, content and business approval.

**Stop deployment** for failed CI, unavailable backup, unverified restore, unclear migrations, invalid configuration, inaccessible DB, unknown storage persistence, failed health, blocked media exposure, missing privacy requirements or unavailable operational owner. Local Phase 07 success does not waive these conditions.
