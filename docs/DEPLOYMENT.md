# SAKADO 2.0 — Hostinger deployment plan

Verified 2026-10-09. **User-selected target: managed Node.js Web App hosting**, not VPS. No hosting account was accessed and no deployment was performed. Exact plan entitlement, region, resource ceilings, domain and external service budget are **TO BE CONFIRMED**.

## Compatibility verdict

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

- build: `prisma generate && next build`
- start: `next start --hostname 127.0.0.1`
- deploy migrations: `prisma migrate deploy`

Proposed Phase 1 changes: declare Node 24 compatibility in package metadata, keep lockfile-based installs, and configure a hosting-appropriate start binding. Managed hosting may require `0.0.0.0`; current loopback binding must not be assumed reachable. Use the panel's assigned port/PORT mechanism, not a hardcoded public port. Candidate start command is `node node_modules/next/dist/bin/next start --hostname 0.0.0.0`, relying on the platform's verified PORT configuration. Confirm actual settings before deployment; no script was changed by this audit.

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
| ADMIN_EMAIL / ADMIN_PASSWORD                                      | One-time provisioning inputs; never public and remove password after use; inspect provisioning script first                      |
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
