# External staging — Phase 08 runbook

Status on 2026-10-11: **BLOCKED**. The user explicitly confirms no approved staging hostname, runtime verification, dedicated PostgreSQL, persistent storage, access restriction, HTTPS endpoint, staging owner or external deployment. Authorization covers repository preparation only. No Hostinger capability is assumed. `staging.sakado.tn` is a proposed pattern, not an approved or existing target.

## Target and authorization boundary

Internet → valid HTTPS → restricted approved staging hostname → provider reverse proxy → existing Node 24 / Next.js application → dedicated staging PostgreSQL and persistent staging media. Prefer the same application's `/admin`; use ADMIN_URL only after an explicit separate-origin decision. Never reuse local/CI/production credentials, databases, uploaded participant data or signing material. Keep one app instance initially unless shared storage/cache/build behavior is separately validated.

Before an external state change, present a concrete action record and obtain explicit authorization for its exact scope. Repository preparation is not authorization for any row below. Read-only inspection of an already accessible provider session still requires a known approved staging target; do not log in automatically.

| Action                                 | Target / why / expected effect                                                | Reversibility / data risk                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Login or create staging app            | Approved account/app ID; obtain runtime and isolated environment              | Login exposes account privileges; app creation may incur cost. Do not purchase resources           |
| Hostname / DNS / SSL                   | Exact approved staging hostname and records; route restricted HTTPS           | Changes can affect existing traffic; rollback requires original records. Production DNS prohibited |
| Database provisioning / connection     | Exact staging provider/project/database/role; isolate data and verify TLS     | New resources may incur cost; connection must never target production                              |
| Secret provisioning                    | Named staging app/environment variable names only; unique credentials         | Rotation/revocation required if exposed; never disclose values in approval records                 |
| Migrations / owner / synthetic records | Verified staging DB identity and reviewed migration set; enable testing       | Writes change schema/data. Backup/restore and separate authorization required; no real fixtures    |
| Upload / restart / rebuild / redeploy  | Approved app and synthetic object; measure hash persistence                   | Can interrupt service or lose ephemeral files; coordinate staging-only window and backup           |
| Dump / disposable restore / rollback   | Approved staging source and separate restore/app target; prove recoverability | Restricted sensitive backup and availability risk; never overwrite active staging or production    |

Each approval record must contain **ACTION, TARGET, WHY, EXPECTED EFFECT, REVERSIBILITY, DATA RISK**, approved scope/date and a safe authorization reference. Keep provider IDs/credentials and signed evidence private where needed. Approval for one operation does not authorize all later operations.

## Provider questionnaire and evidence

All current external results are **NOT TESTED**; prerequisite availability is **BLOCKED**. These are questions for the actual plan, not claims based on a framework marketing listing.

| Requirement                    | Current result | Evidence required before use                                                                      |
| ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------- |
| Node 24 / Linux native modules | NOT TESTED     | Actual runtime version/platform; clean locked install and Prisma/Argon2/Sharp checks              |
| Persistent Node process        | NOT TESTED     | Start supervision, working directory, idle shutdown and restart behavior                          |
| Installation / build           | NOT TESTED     | npm ci with build dev dependencies; production build output and artifact ID                       |
| Start command / binding / PORT | NOT TESTED     | Accepted npm run start:hostinger command, 0.0.0.0 binding and assigned process PORT               |
| Environment secrets            | NOT TESTED     | Isolated app environment, restricted access/masking/rotation, supported runtime injection         |
| Host / protocol forwarding     | NOT TESTED     | Observed original Host/HTTPS protocol, trusted replacement rather than append of identity headers |
| TLS / redirects                | NOT TESTED     | Valid chain/hostname, HTTP → same approved HTTPS origin, no mixed content                         |
| Request / process / resources  | NOT TESTED     | Upload/body/time limits, CPU/RAM/disk/process quotas and graceful shutdown                        |
| Logs                           | NOT TESTED     | Restricted access, retention/countries and sanitized runtime examples                             |
| Persistent upload directory    | NOT TESTED     | Writable path outside release replacement and verified hashes across every persistence test       |
| Next cache / image optimizer   | NOT TESTED     | Writable cache, image response/cache behavior and resource limits                                 |
| External PostgreSQL            | NOT TESTED     | Outbound DNS/TCP/TLS, allowlists, region, pooler mode and connection limits                       |
| Access restriction             | NOT TESTED     | Unauthenticated external browser denied before app; approved reviewer can reach app               |
| Backup / restore               | NOT TESTED     | Restricted storage, encryption/key custody, retention, separate restore capability                |
| Releases / rollback            | NOT TESTED     | Previous artifact retention, switch procedure, media preservation and candidate return            |
| Monitoring                     | NOT TESTED     | Staging-only probe capability, restricted credentials and alert/incident owner                    |

If durable local storage is unavailable, stop. Present persistent volume or S3-compatible/object-storage options for separate architectural approval; no adapter, resource or media migration is added automatically. Setting an unsupported MEDIA_STORAGE name does not implement storage.

## Configuration and build handoff

Use [.env.staging.example](../.env.staging.example) as an empty names-only template. Next does not load `.env.staging` automatically. Runtime: NODE_ENV=production, DEMO_MODE=false, STAGING_MODE=true, unique DATABASE_URL/AUTH_SECRET, approved HTTPS SITE_URL, optional ADMIN_URL, MEDIA_STORAGE=local and a verified dedicated MEDIA_LOCAL_DIR. Keep TRUST_PROXY=false until justified by measured header replacement/spoof resistance. PORT must be supplied to the process by the platform. One-time ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD are provisioning inputs, not durable runtime settings. Optional contacts remain empty until approved. Do not introduce DIRECT_URL or unsupported storage flags.

Before uploading anything, select the reviewed candidate code commit and retain its artifact/lockfile/schema/migration/media-registry hashes. Verify both named Sakado CI jobs and the separate Linux workflow for that exact commit. A prior green run, a local build or a user report cannot clear this gate for changed code. Do not copy Windows node_modules to Linux.

After separate external authorization: use Node 24, `npm ci --include=dev`, `npm run db:generate`, typecheck/lint/unit checks, and `npm run build`. Preserve the existing pre/post media gates. Use `npm run start:hostinger` with platform PORT; never next dev/static export. Do not put migration, admin creation or fixtures in build/start hooks. Do not bypass startup validation.

## Database identity and migration procedure

1. Obtain a private approved target record: provider project/account/region, host/port/database/user/schema, dedicated staging ownership, TLS parameters and explicit confirmation that it is separate from production/local/CI. An environment-variable name or a hostname containing “staging” is insufficient proof.
2. Authorized operator verifies DNS/TCP/TLS and connects read-only with privately supplied credentials. Inspect `SELECT current_database(), current_user;`, server version and database/schema identity. Match the complete tuple to the approved record; do not copy the connection string into logs/reports. This preparation phase executes no external SQL.
3. Review connection limits and pooler compatibility with Prisma's serializable transactions. Use a reviewed direct/session-capable migration connection where necessary; the existing schema reads DATABASE_URL only. No automated external fixture runner or generic remote reset wrapper is provided.
4. Record migration status **before**. Current repository contains two migrations, inventoried in the release manifest. Unexpected drift/failed migration/unknown target stops work.
5. Before authorized risky writes, create an approved fresh backup and verify separate-target restore evidence under [BACKUP_RESTORE](BACKUP_RESTORE.md). Confirm privacy/backup location and owner.
6. After explicit migration authorization, run `npm run db:generate`, `prisma migrate status`, `npm run db:deploy`, then `prisma migrate status` and a safe Prisma/application schema check. Record count, status and result without URLs/rows. Never migrate dev, reset or db push. A failure stops rollout; preserve migration state and investigate rather than blindly resolve/retry.
7. Provision a staging OWNER only after separate authorization, through the existing `scripts/create-admin.ts` using process-injected staging values and no real .env file. Prefer `node --import tsx scripts/create-admin.ts` in the verified provider environment over the local .env-driven npm shortcut. Verify Argon2id/duplicate denial, then clear provisioning password from both child and provider/shell environment. No credentials in screenshots.

## External smoke and security matrix

All items below are **NOT TESTED externally**. Use synthetic events/destinations/participants and generated nonparticipant imagery only after approved staging writes. Never run test:integration, test:e2e, test:phase05, test:phase06, test:ci or test:staging against external credentials; their fixture setup is disposable-local/CI only.

| Check                    | Required observation                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Restriction and indexing | Provider gate rejects unauthenticated access; authorized browser sees application noindex, robots Disallow:/ and empty sitemap                                                  |
| Public routes            | /, /events, /adventures, authorized synthetic event/destination detail, /contact render without hydration/runtime failures                                                      |
| Admin                    | Login/dashboard/events/registrations/destinations/gallery/Instagram/media-readiness/settings according to actual role; logout/session expiry/role denial                        |
| Registration             | Public synthetic request → server validation → DB → admin visibility/status update; capacity/deadline/idempotency/privacy and invalid/full cases                                |
| Event operations         | Synthetic draft/create/edit/publish/open/confirm/cancel/archive follow current lifecycle; never reopen terminal events implicitly                                               |
| CSV                      | Authorized UTF-8/escaping/formula protection/expected fields; anonymous or wrong role denied. Exports stay private and outside Git                                              |
| Contact                  | Inspect actual handler first; current behavior stores a message, not email delivery. A synthetic submission is an authorized DB write; no delivery claim or third-party contact |
| Instagram                | Only authorized synthetic records exercised; existing 45 imports/canonical URLs/flags untouched. Verify publication/homepage/associations without scraping/download             |
| Origins and cookies      | Correct approved HTTPS Origin succeeds with valid session; wrong/missing Origin rejected. Secure/HttpOnly/SameSite and host scope confirmed; no secret cookie values retained   |
| Proxy trust              | Record original Host/protocol and controlled forwarded-header spoof rejection at the provider. Leave TRUST_PROXY=false unless authorized after proof                            |
| Headers and caches       | CSP, nosniff, referrer, frame and configured permissions policy; no-store/private admin/API/health. Shared caches must never expose another session's content                   |
| Health and failures      | Operational 200 {status:ok}; authorized isolated DB outage 503 {status:unavailable}. Demo 200 is not operational evidence. No stacks/paths/credentials in public/admin failures |
| Image optimization       | Harmless authorized swatch via /media and /_next/image; status/content-type/cache/rights withdrawal behavior recorded. Private media must not enter shared optimizer cache      |
| Logs                     | Restricted startup/health/login/registration/upload/error logs reviewed for URLs/secrets/tokens/passwords/PII/private paths; retain sanitized references only                   |

Known local finding from the Phase 08 failure regression: framework Prisma errors include database address/server stack paths in restricted test output although HTTP responses hide them. Hosted log access, retention and redaction must be inspected; do not infer safe provider logs from a safe public error body.

Do not weaken CSP/origin/auth/media checks to pass smoke. HSTS remains deferred until actual domain/HTTPS coverage is confirmed. A 200 transport status can precede a streaming error; check content and runtime behavior too. Failure/outage tests require a staging-only maintenance window; do not disrupt shared provider services. If authentication needed for a monitor/probe, provision it privately at the provider, never in a URL or committed script.

## Persistence, backup, restore and rollback evidence

Record one generated swatch's approved synthetic object ID and SHA-256, chosen storage path **class** (not sensitive full path), app release/build and timestamps. Fetch through the actual media route. After each separately authorized application restart, process restart, build/restart, provider redeploy and release switch, fetch that same object and compare hash. A different file at the same URL, an empty path, loss or untested lifecycle keeps the corresponding gate unresolved. Do not substitute the successful Phase 07 local test. Remove only the owned synthetic object/record after review; preserve original content.

Use the actual authorized staging source for a full custom pg_dump or a verified provider equivalent; no passwords in shell arguments/history. Store outside Git/web/release root under restricted access. Record format/bytes/SHA, tool versions, snapshot/write window, encryption/key-custody/retention/location-class/owner references. A dump checksum alone is insufficient. Restore to a **separate approved disposable target**, never active staging; compare schema/counts/row fingerprints, migrations and app compatibility, and confirm source unchanged. Delete the disposable target only with explicit authorized scope. See [BACKUP_RESTORE](BACKUP_RESTORE.md).

Switch to the retained previous application artifact only after provider capability/authorization is confirmed. Keep DB unchanged, verify health/public/admin/media hash and return to candidate. Compare current media restrictions in both artifacts; retain proxy access/noindex even if the previous app lacks STAGING_MODE. No automatic downmigration or restoration over current writes. Unsupported rollback is BLOCKED pending a reviewed alternative, not a pass. See [ROLLBACK](ROLLBACK.md).

## Performance, accessibility, devices and monitoring

Capture actual staging page/load/JS/image/LCP observations for home/events/detail/registration/gallery/admin, with device/network/build/time and measured CPU/memory/disk/restarts/timeouts where available. Distinguish unavailable metrics; no fabricated benchmark or arbitrary score target. Physical-device checks are separate from Playwright emulation.

Use the Phase 07 manual checklist: keyboard/focus/forms/errors/dialogs, screen reader, 200% zoom/reflow and reduced motion/MotionToggle. Record actual reviewer alias/date/browser/device/build. Android Chrome, iPhone Safari, Windows Chrome/Firefox/Edge and tablet remain NOT TESTED until performed. Screenshots with synthetic admin information belong only under ignored `.local/phase08/screenshots/`; do not commit HAR, cookies, traces or participant data.

Monitoring is documentation only: approved HTTPS staging `/api/health`, proposed interval 60 seconds subject to provider limits, timeout and retry/alert threshold TO BE CONFIRMED. Owner and escalation are TO BE CONFIRMED. Scope is connectivity, never media/legal/backup clearance. No probe or paid monitoring is configured in this phase.

## Evidence and stop conditions

Use [PHASE08_EVIDENCE](staging/PHASE08_EVIDENCE.md) and [RELEASE_CANDIDATE](RELEASE_CANDIDATE.md). Stop for unknown target identity, production-like/reused credentials, unclear hostname, failed CI, unexpected migration state, unavailable/unverified backup, unknown persistence, secret leak or blocked media exposure. External staging and RC remain BLOCKED until reviewed evidence resolves their actual gates; production retains its independent legal/business/infrastructure approval requirements.
