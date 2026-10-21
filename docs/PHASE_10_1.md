# Phase 10.1 — staging blockers and recovery validation

Date: 2026-10-21. Official application first. **External staging and public launch remain BLOCKED.** This phase authorizes local preparation and isolated validation only; no cloud resources, deployment, DNS, workflow dispatch, production credentials, main merge, Git staging/commit/push or media publication.

## A. Executive summary and source checkpoint

Verified a clean `feat/phase10-production-readiness` at `32b8e04aff6291b7b3ab392ecec379558dd76ed9`. It preserves Phase 09/09B commits `82bbb64` / `a17aeaf`. The local origin tracking ref matched; a noninteractive, read-only `git ls-remote` independently confirmed the same remote feature-branch SHA. GitHub connector commit/Actions reads returned 404; this does not negate the verified Git ref, and does not verify CI success.

Created the previously absent `feat/phase10-1-staging-blockers` from that clean checkpoint. Saved all **332 tracked files** with SHA-256 in a new ignored `.local/phase10-1/recovery-*` snapshot. Changes remain uncommitted for human review. [PHASE_10](PHASE_10.md) is retained as historical evidence; its uncommitted/unstaged wording describes its execution time, not the subsequently pushed checkpoint.

Concrete progress:

- Created and independently compared a **fresh current-state database backup/restore**, including seven categories and all 45 Instagram records, without altering the original database.
- Located a byte-identical **S16 recovery copy** in an existing ignored private-media folder. The manifest's original path is still missing; no file was moved/copied and no approval/path record was rewritten.
- Added a Node/native-module preflight and prepared its Linux CI execution. Windows execution is verified; Linux/Hostinger are not.
- Reproduced an existing **withdrawn-image optimizer cache bypass** with a generated swatch in a disposable database; restricted optimizer inputs to public static paths and added regression/rehearsal coverage. No real media was used.
- Re-audited the five development-chain findings. No published compatible fix for their underlying advisory was established; versions/lockfile remain unchanged, with no suppression or forced downgrade.

Labels below distinguish **VERIFIED LOCAL**, **PREPARED / NOT TESTED**, **REQUIRES HUMAN REVIEW**, and **BLOCKED**. No local result is a provider, legal or launch clearance.

## B. Current database recovery

Verified the exact existing local target before reading it: loopback 127.0.0.1:55432, database `sakado`, credentials matching the ignored local configuration, actual `.local/postgres` directory, PostgreSQL major 18. No remote/source URL or credential is reproduced. Both applied migration checksums matched repository SQL; read-only migration status and schema diff passed with no drift.

Adapted the previously inspected guarded Phase 09B process into a new ignored script/output location; did not rerun or overwrite its old outputs. Source reads used a repeatable-read **READ ONLY** transaction and exported snapshot. Full custom `pg_dump` used that snapshot and read-only connection defaults. PostgreSQL 18.6 dump/restore tools were used against the existing 18.4 server; no server upgrade occurred.

| Recovery evidence          | Actual result                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Private recovery directory | `C:/Users/Dell/SAKADO-backups/2026-10-21-phase10-1-fe6d4ea9/` — outside Git/web/release roots                                |
| Access                     | Inheritance disabled; only the current local owner and SYSTEM granted access                                                 |
| Dump                       | `sakado.custom.dump`, **37,145 bytes**, custom format; archive listing and restore succeeded                                 |
| SHA-256                    | `1b741044cd8e10b4b8008671ded3766cec8bcf98312eb91ba0d39dcd16d6f9e5`                                                           |
| Restore target             | Newly created `sakado_restore_10_1_20261021_cc29a3bb`; separate database, never the authoritative database                   |
| Restore operation          | Single transaction, exit on error, no owner/privilege restoration; no clean/reset operation on source                        |
| Comparison                 | All **15 tables**, sorted row fingerprints/counts, columns/defaults, indexes, constraints, enums and migration history match |
| Categories                 | Exactly seven enabled CONFIRMED categories, names/order match the shared confirmed company source; restored rows match       |
| Instagram                  | All 45 generic records remain unpublished/homepage-off; complete row fingerprints preserve IDs, URLs and other fields        |
| Source preservation        | Re-fingerprinted unchanged after restore; final regression preservation check also required                                  |

The restore target is retained, disconnected and never configured as the app DB. It contains copied authentication data and must remain private; no personal/authentication row payloads were printed or committed. No deletion/cleanup of original or historical recovery data was performed. The dump backs up this database, not cluster-wide roles/passwords/tablespaces, external media or encryption keys. Historical dumps remain intact.

Restricted report/script/archive inventory reside beside the dump. Ignored `.local/phase10-1/backup-location.txt` is a pointer, not the backup. P10-05's stale-local-snapshot problem is resolved **locally**. Off-device protection, encryption/key custody, retention, ownership, RPO/RTO, regular scheduling and provider restore remain unverified; the entire operational recovery gate is not cleared. Repeat a fresh approved snapshot before later risky writes if source state changes.

## C. Dependency investigation

Fresh `npm audit --json`: **five high** package findings. `npm audit --omit=dev --json`: **zero findings**. This is one underlying advisory propagated through five packages, not five independent exploits. All five locked entries are marked development dependencies:

| Package                  | Installed/locked | Relationship                                     |
| ------------------------ | ---------------- | ------------------------------------------------ |
| eslint-config-next       | 16.4.0           | Direct dev dependency; propagates plugin finding |
| @next/eslint-plugin-next | 16.4.0           | Transitive; pins fast-glob 3.3.1                 |
| fast-glob                | 3.3.1            | Transitive glob tooling                          |
| micromatch               | 4.0.8            | Transitive pattern processing                    |
| braces                   | 3.0.3            | Underlying affected package                      |

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), reviewed on 2026-10-21, describes recursive pattern processing that can exhaust the stack and lists no patched version. Registry metadata also listed 3.0.3 as the highest braces release checked. `eslint-config-next` / plugin **16.4.1 and 16.4.2** still pin the same fast-glob path; those patch updates do not establish a remediation. npm suggests a downgrade to eslint-config-next 14.2.35; it was not applied. No `audit fix`, force update, override, vendored patch, advisory exception or dependency installation was performed. **Package-lock remains byte-identical.**

Reachability review: the installed plugin's `get-root-dirs` passes `settings.next.rootDir` patterns to fast-glob; the repository config does not set that option and runs the fixed `eslint .` command. No application route/service imports these packages or accepts HTTP input as a lint/glob pattern. This bounds observed exposure to development/build tooling; it is not proof that every possible tool invocation is unreachable or safe. Untrusted repository/config changes still require review. The server build can include installed dev tools; zero production-only audit findings is not a guarantee that every installed module is absent from the host.

P10-06 remains **UNRESOLVED** pending a verified upstream-compatible fix or explicit, scoped security-owner risk decision. Continue full audit reporting; do not relabel the full audit as green. Registry/audit/tree evidence stays ignored under `.local/phase10-1/`.

## D. Linux, CI and native dependencies

Actual environment: Windows x64, Node 24.19.0. `wsl --list --quiet` reports WSL not installed; no Docker/Podman executable found. No Linux machine/container was installed, rented or accessed. Current Linux runtime validation is **NOT TESTED**. No workflow was dispatched or remote setting changed.

`npm run check:native` now performs an in-memory Sharp WebP encode/decode, Argon2id hash/correct-and-incorrect-password verification, and Prisma Client construction/disconnect using an explicit unreachable dummy datasource. It loads no .env, sends no query, writes no file and prints only safe runtime/module metadata. `--linux` additionally rejects non-Linux execution; Node major 24 is required. Local preflight and its supplied-database/non-disclosure/platform regression passed. **Prisma construction does not prove query-engine connectivity**; the guarded database integration suite supplies that separate proof.

Prepared workflows retain pinned actions, read-only repository permission, disabled persisted checkout credentials, Node 24 via `.nvmrc`, locked `npm ci --include=dev`, fixed non-production inputs and no deployment job:

| Coverage                             | Sakado CI                                                 | Separate Linux workflow                            |
| ------------------------------------ | --------------------------------------------------------- | -------------------------------------------------- |
| Prisma generation                    | Explicit quality step / build                             | Explicit step                                      |
| Node/native preflight                | Added to both quality and integration jobs with `--linux` | Replaces the narrower Sharp-only probe             |
| TypeScript, ESLint, units            | Quality job                                               | Explicit steps                                     |
| Build/public and private-media gates | Existing build command                                    | Existing build command                             |
| Browser and security                 | Phase 04 media suite; Phase 05/06/10 isolated suites      | Not included; both CI jobs are required separately |
| Actual Prisma engine/DB/CMS          | Integration job's disposable PostgreSQL 16 service        | Deliberately no connection/fixtures                |

The Linux DB guard still requires explicit GitHub/Linux markers, exact loopback test database/user/port, expected server version and actual service data directory **before migrations or fixture deletion**. Local runner creates a fresh owned cluster and validates its directory; real local/staging/production DBs are refused. No guard was weakened. Do not spoof CI variables locally or point any fixture entry point at external credentials.

After separate authorization for source checkpoint/push and workflow execution:

1. Select the reviewed immutable commit for this branch, including any later fixes; confirm a clean tree and record lockfile/build/media-registry hashes. Existing Phase 10 SHA does not validate this new diff.
2. Run **Sakado CI** (`ci.yml`) and **Linux Node 24 validation** (`linux-validation.yml`) against that exact approved ref. Feature-branch pushes alone do not trigger ci.yml's main-only push filter; a PR or authorized manual dispatch is needed. Example future operator commands: `gh workflow run ci.yml --ref feat/phase10-1-staging-blockers` and `gh workflow run linux-validation.yml --ref feat/phase10-1-staging-blockers`. These were **not executed** here.
3. Record run URLs, exact head SHA, Linux/Node/architecture, native preflight output and both named job conclusions. Review private failure diagnostics; no credential/token/trace uploads. A historical green run does not cover a changed commit.
4. In separately authorized Hostinger staging, repeat locked Linux installation and native/actual DB checks on its architecture/libc/OpenSSL/runtime. Do not upload Windows node_modules. Prisma generation/query engine, Sharp binaries/encoding and Argon2 native loading need actual-platform proof.

## E. Hosting readiness matrix and owner inputs

Published primary documentation was rechecked; it is general product evidence, **not evidence for the owner's account**:

- Eligible managed backend Next.js and GitHub builds: [Hostinger deployment guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).
- Node 24 offered: [version selection](https://www.hostinger.com/support/how-to-select-the-node-js-version-for-your-application/).
- External PostgreSQL documented, with provider-specific IP/pooler considerations: [external PostgreSQL guide](https://www.hostinger.com/support/connecting-a-supabase-database-to-a-hostinger-node-js-application/).
- Managed limits include shared resources, one long-running app process, 120-second requests and no extra Docker/Redis/always-running workers: [Node limits](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/). An external DB/media service is the compatible design inference; no provider is selected.

| Requirement                      | Current status                                  | Exact non-secret evidence/decision needed                                                                                                              | Owner                        |
| -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Plan eligibility / Node 24 Linux | Published capability; actual account NOT TESTED | Plan name, region, approved staging app identity, runtime/arch/libc/version and resource limits                                                        | Hosting owner                |
| Next server / PORT               | Launcher implemented locally                    | Accepted build/start commands, assigned process PORT, working directory/supervision and restart behavior                                               | Hosting/operator             |
| External PostgreSQL / TLS        | BLOCKED                                         | Approved dedicated provider/project/region/DB identity, certificate-verifying TLS mode, allowlist and IP reachability; no credential values in reports | DB/privacy owners            |
| Pooling / connections            | BLOCKED                                         | Limits, pooler mode and Prisma interactive serializable compatibility; approved direct/session migration path                                          | DB/operator                  |
| Staging secrets / admin          | BLOCKED                                         | Separate secret-injection/access/rotation/provisioning plan; no production reuse                                                                       | Security/authorized owner    |
| HTTPS / DNS / access             | BLOCKED                                         | Approved hostname, TLS chain/redirect design and provider/proxy access restriction independent of noindex                                              | Hosting/security owner       |
| Media persistence                | BLOCKED                                         | Approved persistent mount proof or separately authorized private external adapter; countries/cost/access review                                        | Hosting/media/privacy owners |
| Logging / monitoring             | BLOCKED                                         | Restricted log access, redaction/retention/location, health/5xx/resource alerts and escalation owner                                                   | Operations/privacy owners    |
| Backups                          | Fresh LOCAL proof; external BLOCKED             | Backup/restore owner, RPO/RTO, encryption/off-device retention and separately approved target restore                                                  | DB/media owners              |
| Rollback                         | Strategy prepared; provider NOT TESTED          | Retained compatible artifact/config, release switch, rights reconciliation, cache and shared-media continuity                                          | Release/incident owner       |

All owner identities and details above are **TO BE CONFIRMED**. Do not send passwords, connection strings, cookies or private signed evidence in a reply/report. No provider login/resources/DNS/remote database connection occurred. No MySQL conversion is proposed.

Use existing `.env.staging.example` names only: production NODE_ENV, operational DEMO_MODE=false, STAGING_MODE=true, DATABASE_URL, AUTH_SECRET, approved HTTPS SITE_URL, optional ADMIN_URL, TRUST_PROXY=false and the implemented local media settings if persistence is proven. Platform PORT is process-injected. One-time admin provisioning inputs remain private and require separate authorization. No new storage flags or automatic migrations were introduced. Build with `npm run build`; use `npm run start:hostinger`, not dev/static export. Never hook fixtures/admin provisioning/migrations into build/start.

## F. Media storage architecture and recommendation

| Stage               | Current verified implementation / limitation                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upload              | Authenticated gallery permission + exact origin + demo-write denial/rate limits; bounded multipart; transactional active-actor recheck                                                                                                                                            |
| Validation          | JPEG/PNG/WebP extension/MIME/decoded format; 10 MiB file/11 MiB request caps, 40 MP decode cap; resize within 2400px; rotate/normalize WebP and remove private metadata                                                                                                           |
| Write path          | Only local adapter: MEDIA_LOCAL_DIR or relative uploads; UUID.webp with exclusive write. Local managed release paths are not proven durable                                                                                                                                       |
| Metadata            | GalleryImage row and audit log in serializable transaction. DB failure removes only the newly generated object                                                                                                                                                                    |
| Private/public read | /media requires DB identity/publication/authorization/parent visibility or authenticated admin, then content hash/readiness checks; responses private/no-store                                                                                                                    |
| Covers/previews     | DTO selection and media-mutation guards enforce the existing registry; private input is not promoted to permission by file existence                                                                                                                                              |
| Withdrawal          | Publication/rights/parent changes control future direct reads; the optimizer restriction below prevents a separately cached dynamic copy                                                                                                                                          |
| Deletion            | Reference checks precede row deletion. Existing CMS delete does **not** erase the file; storage.remove is used for failed-upload cleanup only. Orphans remain unreadable through /media without a row, but retention/purge remains a human-policy and implementation prerequisite |
| Recovery            | DB dump is separate from object backup. Historical hardware copy/checksum remains intact; no new media migration, garbage collection or original deletion performed                                                                                                               |

Existing `MediaStorage.put/read/remove` is already a usable server-side abstraction; adding a speculative provider/flag or rewriting it is unnecessary. Recommendation, conditional on owner authorization: retain stable /media UUID keys and server-side policy-controlled proxy reads; select private durable object storage with region/privacy review if Hostinger cannot prove a persistent path outside release replacement. A verified persistent mount is an alternative only if restart/build/redeploy/release-switch/restore hashes and access/backup behavior pass on the actual plan.

Before any adapter work: approve provider/countries/budget/security ownership; specify key/metadata/hash mapping, namespace separation, server-only secrets, TLS/timeouts/size limits, failure cleanup, object inventory/restore, rights withdrawal, reference-aware retention/purge and cache invalidation. Keep the bucket private; do not replace per-request decisions with public permanent URLs. Short-lived signed URLs still have revocation/TTL implications and need explicit review. Database and object recovery must be coordinated. Any schema/outbox/purge changes require separately reviewed scope. No originals or private library were migrated.

### Confirmed local optimizer correction

Before the fix, a generated swatch was published in a new disposable test cluster. Direct /media returned 200, then 404 after withdrawal. The same /_next/image URL returned **200 while published and 200 after withdrawal**, from its independently cached rendition. This reproduced a real existing publication/cache boundary problem; no person/photo/official data was used. Restricted evidence: `.local/phase10-1/cache-before-fix.log`.

`next.config.ts` now permits optimization only for `/images/**`, the two existing static admin icons and `/_next/static/media/**`, with no query strings on the source URL. Dynamic `/media`, private preview, admin API and other route paths are not allowed inputs. Existing dynamic images already use unoptimized delivery through the guarded route. No CSP/cookie/role/publication rule was loosened. The installed Next Image guide documents localPatterns and 400 rejection; its optimizer validates inputs before serving cache entries. Existing cache files are not deleted or treated as source media.

The new regression requires optimizer **400 before and after withdrawal**, while direct publication/withdrawal still works. The local storage rehearsal now tests dynamic optimizer rejection and verifies optimization of an allowed public static icon. The corrected regression and 13-step local rehearsal passed as recorded in section I; this corrects application behavior but does not certify provider/CDN caches.

## G. Hosted security validation plan

Keep current Secure/HttpOnly/SameSite=Strict production sessions, exact Origin/Host/protocol matching, server authorization, bounded bodies, HMAC/DB rate limits, no-store admin/media responses, frame/nosniff/referrer/permissions headers and existing CSP. `TRUST_PROXY=false` remains the default until trusted replacement of forwarded identity headers is measured. The installed Next Server Action origin protections remain; no broad allowedOrigins/CORS exception, HSTS or nonce-CSP change was added.

After separate staging authorization and an independently restricted HTTPS target, use only approved synthetic accounts/objects to verify:

1. Anonymous external access is denied before the app. Authorized pages remain noindex; robots disallows and sitemap is empty. Verify this through rollback too.
2. Real HTTPS login/logout/expiry/inactive-account/role revocation; inspect cookie **flags only**, not exported values. Test expected OWNER/ADMIN/EDITOR denial with legitimate synthetic logins.
3. Valid exact origin succeeds; missing/foreign origin fails. Verify Host/protocol forwarding and controlled header-spoof rejection. Do not weaken checks to accommodate a misconfigured proxy.
4. Two separate sessions cannot see each other's private responses through provider caches. Check admin/API/media no-store, dynamic optimizer rejection and absence of private source/evidence routes. Confirm withdrawal through the actual CDN/proxy path.
5. Validate provider body/time limits, normal upload failures, graceful restart, database pooling and safe 503 responses. Any outage/failure test needs a staging-only approved window, never shared production disruption.
6. Inspect restricted logs for connection details, stack paths, credentials/tokens/form PII; review log access, retention and redaction. Health supplies connectivity only. Assign alarms/escalation and backup/recovery ownership.
7. Assess actual domain/HTTPS/HSTS coverage and CSP compatibility separately. Inline script/style allowance remains documented; a speculative nonce change could break rendering/caching. No assertion of hosted compliance/security is made.

See [EXTERNAL_STAGING](EXTERNAL_STAGING.md) and [ROLLBACK](ROLLBACK.md). All external checks remain NOT TESTED.

## H. Media, S16 and human decisions

Fresh manifest/readiness review: **17 BLOCKED**, **85 PENDING REVIEW**, publicationAllowed=false. Sixteen originals still match their recorded source hashes; the legacy hardware file/record is unchanged and remains withheld by identity. No logo/portrait/photo publication approval is inferred.

S16: the manifest source path is absent. A bounded metadata/size/hash search across seven known Sakado source, project-media/preview and authorized recovery roots located **one exact match**, 385,514 bytes, SHA-256 `fa704c6624742c913a995ff3dcbee5cdb7b6d53ea948a63437ca68ed3465df29`. Its location is kept in ignored `.local/phase10-1/s16-search.json`; the bytes remain in the existing private folder. No unrelated user folders were searched, links were not followed, and no photo/evidence payload was uploaded. All 17 identities can therefore be accounted for across the recorded source set and the recovered copy; the source directory itself still contains only 16 matching originals. Human-controlled recovery/path reconciliation and durable backup remain outstanding. No curatorial/rights/publication status changed.

Human verification checklist:

- Authorized owner verifies actual login/logout/CMS using private credentials; no real administrator was provisioned/reset or impersonated here. OWNER manages users/settings; ADMIN cannot manage those; EDITOR retains existing events/gallery/site/categories/dashboard scope. Changes need a separate business decision.
- Owner approves actual scheduled events/destinations and business contacts. Seven categories are confirmed concepts, not approved dated/priced/available outings.
- Approve registration opening, pending seat holds, waitlist/cancellation/payment-status practices, contact handling, data retention and withdrawal routes; current contact stores messages, not verified email delivery. No gateway/bookable offering is invented.
- Qualified reviewers decide copyright, credits, participant/legal basis, minor safeguards, cross-border/privacy and explicit public publication. Supplied logos/team photos/private-demo acceptance are not legal evidence.
- Human reviewers test physical iOS/Android/tablet/desktop, keyboard/200% reflow, screen readers and real networks. Existing local axe/viewport/lab performance results are not device or field-CWV certification.

## I. Executed checks and limits

Evidence lives in ignored `.local/phase10-1/` or the restricted backup directory; no dumps, personal records, cookies, private photos or traces are committed. Executed results below are local evidence only; the interrupted/expected-failure cache reproduction is distinguished from the passing corrected run.

| Check                                               | Result / scope                                                                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source branch/ref/snapshot                          | VERIFIED LOCAL and remote ref verified read-only; 332 tracked source files captured                                                                                                    |
| Fresh DB dump/restore                               | PASS, 15 table/schema comparisons, seven categories, 45 unchanged Instagram rows, source unchanged                                                                                     |
| Migration status / schema diff                      | PASS, read-only; no drift or migration execution on source                                                                                                                             |
| Full / production dependency audits                 | Expected full exit 1: five high dev-chain findings; production exit 0: zero findings                                                                                                   |
| Native preflight / guard test                       | PASS on Windows Node 24; rejects false Linux flag, ignores supplied datasource and prints no credentials                                                                               |
| TypeScript / lint / units                           | Typecheck and lint PASS; **65 unit tests PASS**, including the new native preflight boundary test                                                                                      |
| Build / media gates                                 | PASS including 17 registered-asset audits and 49 private deployment traces; no blocked/private workspace copies distributed                                                            |
| Cache reproduction                                  | Expected failing new assertion against previous build: optimizer 200 after direct withdrawal 404; isolated synthetic data only                                                         |
| Fixed auth/publication/capacity/browser regressions | PASS: 18 database integration assertions plus actor/import checks, **21 Phase 05**, **17 Phase 06**, **4 Phase 10** browser tests. Corrected optimizer returned 400/400                |
| Local storage/backup rehearsal                      | PASS: 13 owned-cluster rehearsal steps, static-icon optimizer 200/dynamic-media 400, restart/hash, synthetic backup/restore and cleanup. Provider rebuild/redeploy/rollback NOT TESTED |
| Official/public/private-demo regression             | Official PostgreSQL-backed **14 PASS**, public production **5 PASS**; private-demo **42 PASS**. No fixtures or real-data submissions against official DB                               |
| Preservation                                        | PASS: all 15 source tables/schema, approval ledger, 16 recorded-source originals, recovered S16 copy and hardware unchanged; protected schema/config/lockfile hashes unchanged         |
| Offline release evidence                            | Expected exit 1 / BLOCKED; 127 unresolved candidate/evidence checks. No RC manifest was fabricated or approvals cleared                                                                |
| Linux / GitHub Actions / Hostinger                  | NOT RUN here; no Linux environment and no dispatch/deploy authorization. Prepared workflow is not a passing run                                                                        |

The new optional rollback-artifact optimizer assertion is PREPARED / NOT TESTED: no previous artifact was supplied with `--rollback-dir`, so rollback remains NOT TESTED. It must reject legacy artifacts that reintroduce the cache bypass. The other 13 rehearsal steps passed; that is not a managed redeploy or application artifact-switch proof.

No clean `npm ci` reinstall was performed locally: dependency versions/lockfile did not change and current installed modules were audited. Future Linux/Hostinger verification must use locked clean installation. Baseline Phase 10 counts are historical, not substituted for tests in this phase. No external rollback or new field performance claim is made.

Final source verification: all 332 checkpoint files remain present; **319 byte-identical, 13 intended edits, zero unexpected changes**, plus three new files (`docs/PHASE_10_1.md`, native script and its test). No files are staged. Schema, lockfile, real environment file, media manifests/feedback/readiness ledger and all source-table hashes remain unchanged. The complete private-preview suite passed 42 tests, the official suite 14 and public production suite five; together with the 42 guarded Phase 05/06/10 cases, **103 browser tests passed**. Secret guard and diff whitespace checks passed. Original media was not altered. The official app is restored at **http://127.0.0.1:3000**, operational health/home return ok/200, and the original PostgreSQL service remains on loopback 55432.

## J. Remaining blocker matrix

| ID / severity   | Previous status                                | Current status and evidence                                                        | Exact remaining requirement / responsible party                                                                                        | Blocks                                                                                     |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P10-01 Critical | Unprovisioned/unverified host                  | BLOCKED; published capability rechecked, no account access                         | Approved plan/region/runtime/hostname/access/HTTPS and separate deploy scope; hosting/security owner                                   | External staging and launch                                                                |
| P10-02 Critical | External PostgreSQL unverified                 | BLOCKED; local current recovery does not prove external DB                         | Dedicated target/TLS/pooling/permissions, provider recovery and approved migration/provisioning; DB/privacy owner                      | External staging and launch                                                                |
| P10-03 Critical | Only local storage                             | BLOCKED externally; current pipeline mapped, optimizer correction locally testable | Durable mount proof or approved adapter/provider/regions, retention/purge and coordinated object recovery; hosting/media/privacy owner | Staging uploads and publication/launch                                                     |
| P10-04 High     | 17/85 approvals pending                        | UNCHANGED: all BLOCKED/PENDING                                                     | Private evidence and explicit qualified human copyright/participant/minor/credit/publication decisions; authorized representative      | Authentic-media publication/launch; synthetic restricted staging still needs authorization |
| P10-05 High     | Backup predates categories                     | Fresh LOCAL backup/restore VERIFIED; operational gate PARTIAL                      | Off-device/encryption/retention/RPO/RTO/owner and actual provider restore; DB/media/incident owners                                    | Risky future writes and external release recovery                                          |
| P10-06 High     | Five dev dependency findings                   | UNRESOLVED; audit and compatible patch investigation completed                     | Verified upstream fix or explicit scoped security risk decision; security owner                                                        | Required release/security acceptance                                                       |
| P10-07 High     | Uncommitted source and missing CI              | Phase 10 commit/push VERIFIED; new diff uncommitted, Linux NOT TESTED              | Human checkpoint/push and exact-candidate CI/native/service evidence after separate approval; reviewer/release owner                   | External staging release candidate                                                         |
| P10-08 High     | Hosted auth/proxy/cache/logs untested          | Local optimizer-withdrawal hole reproduced/corrected; external gate BLOCKED        | Actual HTTPS cookies/origin/proxy/cache/log/alert validation; hosting/security/operator                                                | External staging acceptance and launch                                                     |
| P10-09 High     | Business/privacy incomplete                    | REQUIRES HUMAN REVIEW; no invented records/policies                                | Staff/role/content/contact/registration/retention/legal decisions; business/privacy owner                                              | Operational real-content launch                                                            |
| P10-10 Medium   | S16 could not be located/hashed                | Exact private recovery copy VERIFIED; recorded source path still absent            | Authorized path reconciliation and durable private recovery; media custodian; rights still under P10-04                                | S16 source reconciliation; publication independently blocked                               |
| P10-11 Medium   | Real-device/screen-reader/network tests absent | REQUIRES HUMAN REVIEW; local regressions are bounded evidence                      | Approved physical-device/assistive-tech/network review; QA/client reviewers                                                            | Quality sign-off for launch                                                                |
| P10-12 Medium   | Domain/HSTS/CSP review absent                  | UNCHANGED; no speculative security changes                                         | Actual HTTPS/domain/proxy and nonce/cache compatibility assessment; security/hosting owner                                             | Hosted hardening/release sign-off                                                          |

Owner assignments are roles only; actual responsible people and approvals are TO BE CONFIRMED. No unresolved gate is cleared by file presence, recovered bytes, a health response or a local restore.

## K. Next authorized actions

Safe next work within local preparation: review this diff and restricted recovery evidence, inspect the retained restore read-only, review dependency mitigation/upstream availability, and collect non-secret owner decisions. Preserve all original/approval records and the new recovery artifact.

Separate explicit approval is still required for Git staging/commit/push, remote workflow dispatch, PR/merge/tag, provider login/resources, DNS/HTTPS changes, external database connection/writes/migrations/admin provisioning, a specific storage provider/adapter or media migration, production credential changes and any deployment. Actual permission evidence and human publication decisions remain mandatory before public photos. This phase does not start a new website phase or grant staging/production readiness.
