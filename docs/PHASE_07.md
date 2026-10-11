# Website Phase 07 — staging readiness and operational rehearsal

Date: 2026-10-11. Branch: `feat/phase07`; starting commit `26ae178947bf7ce983345bc4913e4e8a15ddbb1d`. Changes remain uncommitted for human review. No remote deployment, DNS, Git push/merge, real database connection, schema change or media publication was performed.

**PARTIAL overall: local staging rehearsal completed; external staging and public launch BLOCKED.** Local Windows evidence, reported GitHub/Linux evidence and actual hosting evidence are separate. No Phase 08 work is authorized by this result.

## Discovery and resulting change

The existing application is a single Next.js App Router Node service with React/server content, Prisma/PostgreSQL, role-based CMS and opaque sessions. Installed Node is 24.19.0; locked application versions remain unchanged. `npm start` uses the existing validated loopback launcher; `start:hostinger` selects 0.0.0.0 and process PORT. There are two existing PostgreSQL migrations, a guarded first-owner script, a minimal read-only health route and one local filesystem media adapter. Existing CI already covers quality/build/media and isolated PostgreSQL/admin workflows; it was preserved.

The principal gaps were indexable operational staging, no reproducible deployment/restore/rollback rehearsal and unproven managed storage/proxy assumptions. Existing startup validation was reused. This phase adds explicit staging noindex, a build-required launcher check, an empty staging environment inventory, offline artifact/configuration preflight and a fresh-cluster synthetic rehearsal. It does not substitute a second CMS, authentication system, storage adapter or migration strategy.

Discovery risks remain: release-relative uploads can disappear, the external DB/provider and regions are undecided, a backward-incompatible schema can prevent app rollback, local backups are not disaster recovery, and legal/operational approval cannot be inferred from successful tests. The implementation followed discovery, runbook/environment boundaries, isolated rehearsals, then validation. See [STAGING_READINESS](STAGING_READINESS.md), [DEPLOYMENT_REHEARSAL](DEPLOYMENT_REHEARSAL.md), [BACKUP_RESTORE](BACKUP_RESTORE.md), [ROLLBACK](ROLLBACK.md) and [DEPLOYMENT](DEPLOYMENT.md).

## Executed evidence and limits

The safe machine reports live in ignored `.local/phase07/`. They contain hashes/counts/statuses, not connection strings, passwords or signed personal evidence. `reports/preflight.json` includes package-lock/schema/migration/public-file hashes and build ID. Its source state explicitly allows uncommitted changes; it does not claim a validated release commit or infer test success.

The successful controlled rehearsal uses a newly generated owned PostgreSQL cluster, ephemeral synthetic credentials, a generated 32×24 colour swatch, one synthetic event and first owner. It verifies the exact database/user/loopback URL and actual data directory before mutation/restore operations. It never takes a target DATABASE_URL or loads real database settings. The restore database is separate and dropped after success. Synthetic storage is removed; the owned cluster is stopped with cleanup status recorded and its port verified free. A port conflict is a stop condition, never permission to reuse or kill another service. Final tooling uses loopback 55438/3127; an occupied 55437 service was preserved.

Fourteen steps cover guarded setup, offline preflight, existing migrations, first-owner/duplicate denial, generated storage, operational startup/noindex/headers, restart/image optimization, failed storage without publication effects, custom backup, separate restore, previous-release switch, invalid startup, DB outage/demo health and owned test cleanup. All 15 public tables (including migration history), sorted row hashes and schema columns/indexes/constraints/enums are compared on restore. The source fingerprint is unchanged. Booking/Instagram/contact tables in this small backup are empty; their workflows are covered by the separate disposable Phase 05/06 suites, not claimed as populated backup evidence.

Rollback uses an independently built local copy of starting HEAD with copied locked installed dependencies, not a new npm installation or managed-platform deployment. It switches to a different build ID against the same owned DB/shared synthetic storage, verifies health/event/media hash and returns to the candidate without reverting data. The previous Phase 06 release lacks the new staging flag, so external proxy access/noindex protection must survive app rollback independently.

| Validation                                   | Result     | Scope                                                                                                                                          |
| -------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript / ESLint / unit tests             | COMPLETE   | Local checks; 49 units including 3 focused staging/guard tests                                                                                 |
| Production build / public media audit        | COMPLETE   | Dummy unavailable DB + explicit demo build; real production-mode startup then uses the owned synthetic DB                                      |
| Phase 06 runner                              | COMPLETE   | 18 PostgreSQL integration assertions; 21 Phase 05 and 17 Phase 06 browser cases, fresh isolated cluster                                        |
| Phase 04 regression                          | COMPLETE   | 7 DB-disabled browser cases; 45 browser cases total across Phase 04–06                                                                         |
| Startup validator                            | COMPLETE   | Existing production-env smoke plus expanded rehearsal matrix: invalid secrets/DB/site/demo/storage/staging, hostname override and absent build |
| Staging rehearsal                            | COMPLETE   | 14 local production-build checks; details and report below                                                                                     |
| Dependency audit                             | PARTIAL    | 5 high development lint-tool findings, 0 runtime findings with omit-dev; no forced changes; authorized remediation/risk decision unresolved    |
| New clean dependency installation            | NOT TESTED | Existing locked installation reused; npm ci remains the documented deployment/CI requirement                                                   |
| New Phase 07 Linux/GitHub execution          | NOT TESTED | Changes not pushed; no local Linux runtime used                                                                                                |
| Actual Hostinger / HTTPS / public production | NOT TESTED | No remote account, deployment or infrastructure commands                                                                                       |

The user reports repaired Linux CI success and supplied [run 38156234009](https://github.com/gharyba/sakado_web/actions/runs/38156234009). Connected GitHub job/run tools returned 404. No independent conclusion about its jobs, exact commit or legacy workflow can be recorded from that response. Phase 07 itself has no remote run.

Static public inventory has 9 small files, no >2 MiB file, detected exact duplicate or backup archive. Current production-build bundle estimates: `/` 500,409 raw / 151,919 gzip JS bytes; `/events` 488,648 / 147,802; synthetic event detail 611,158 / 183,757. These are aggregate script-file estimates, not transfer sizes, Core Web Vitals, Lighthouse certification or real-phone performance. Real approved photography, slow-network and physical-device profiling remain pending. No new dependencies were installed.

## Exact 40-area completion report

Statuses below describe their stated scope only.

| #   | Area                                       | Status     | Result / remaining evidence                                                                                        |
| --- | ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Current deployment architecture discovered | COMPLETE   | Single Next Node service, existing CMS/auth, Prisma/PostgreSQL and local storage                                   |
| 2   | Node/runtime assumptions                   | PARTIAL    | Node 24 local build/start passed; actual provider/native-module runtime unverified                                 |
| 3   | Hostinger assumptions                      | PARTIAL    | Source/start/PORT inspected; provider persistence/TLS/proxy/outbound DB require verification                       |
| 4   | Staging architecture defined               | COMPLETE   | Dedicated DB/secrets/storage, HTTPS/access restriction, same app architecture documented                           |
| 5   | Environment changes                        | COMPLETE   | STAGING_MODE, blank staging example, existing production validator reused                                          |
| 6   | Database deployment procedure              | COMPLETE   | Reviewed existing migrate deploy after target/TLS/backup verification; no reset/db push                            |
| 7   | Prisma migration readiness                 | PARTIAL    | Both existing migrations apply and Prisma works in fresh owned cluster; actual target untested                     |
| 8   | Backup procedure                           | COMPLETE   | Custom pg_dump, private credential channel, checksum/encryption/access/retention requirements                      |
| 9   | Backup rehearsal result                    | COMPLETE   | Nonempty synthetic custom archive, SHA-256 and table-of-contents verified                                          |
| 10  | Restore procedure                          | COMPLETE   | Separate disposable target, identity guards, schema/rows/app checks, cleanup                                       |
| 11  | Restore rehearsal result                   | COMPLETE   | 15-table schema/row comparison and application smoke passed; source unchanged                                      |
| 12  | Rollback procedure                         | COMPLETE   | Application artifact switch separated from data restore; no automatic downmigration                                |
| 13  | Rollback rehearsal result                  | PARTIAL    | Two local builds/shared synthetic storage passed; managed rollback/HTTPS/atomic switch untested                    |
| 14  | Media storage architecture                 | COMPLETE   | Existing local adapter audited; dedicated path requirements documented                                             |
| 15  | Persistent-storage status                  | BLOCKED    | Local restart/release-switch hashes pass; Hostinger redeploy/durable external storage unknown                      |
| 16  | Health validation                          | COMPLETE   | Operational DB success, outage 503 safe body, explicit demo 200; not release clearance                             |
| 17  | Admin provisioning rehearsal               | COMPLETE   | Actual first-owner script/Argon2 verification/duplicate rejection on owned synthetic DB                            |
| 18  | Public smoke-test result                   | COMPLETE   | Public discovery/detail/contact routes, sitemap/robots, image optimization and Phase 04/05 regressions             |
| 19  | Admin smoke-test result                    | COMPLETE   | Phase 06 role/session/origin/mutation/export regressions; anonymous export denied                                  |
| 20  | Registration workflow result               | COMPLETE   | Existing isolated integration/browser coverage of capacity/retry/idempotency/waitlist/admin changes                |
| 21  | Security validation                        | PARTIAL    | Existing security headers/guards preserved and local negative checks passed; external TLS/proxy remains            |
| 22  | Secret scan result                         | COMPLETE   | Project heuristic guard passes; not exhaustive Git-history or entropy certification                                |
| 23  | Dependency audit result                    | PARTIAL    | 5 high dev-tool findings; 0 runtime findings; security decision remains                                            |
| 24  | Accessibility staging checklist status     | PARTIAL    | Checklist and existing automated coverage; manual screen-reader/zoom/authenticated staging pending                 |
| 25  | Physical-device status                     | NOT TESTED | No real iOS/Android hardware used                                                                                  |
| 26  | CI regression status                       | PARTIAL    | Workflows unchanged; reported Linux run supplied, connector 404; new Phase 07 CI not executed                      |
| 27  | TypeScript result                          | COMPLETE   | npm run typecheck passes                                                                                           |
| 28  | ESLint result                              | COMPLETE   | npm run lint passes                                                                                                |
| 29  | Unit test result                           | COMPLETE   | 49 pass                                                                                                            |
| 30  | Integration test result                    | COMPLETE   | 18 assertions through guarded fresh-cluster Phase 06 runner                                                        |
| 31  | Browser/regression test result             | COMPLETE   | 45 Phase 04–06 browser cases; no claim of manual/device validation                                                 |
| 32  | Production build result                    | COMPLETE   | Local Next production build and before/after public-file gates pass                                                |
| 33  | Files modified                             | COMPLETE   | Explicit inventory below; unrelated runtime/business/media/workflow files preserved                                |
| 34  | Files created                              | COMPLETE   | Explicit inventory below; all private rehearsal outputs ignored                                                    |
| 35  | Database schema changes                    | COMPLETE   | None; Prisma schema hash unchanged                                                                                 |
| 36  | Migration files created                    | COMPLETE   | None; two existing migration hashes unchanged                                                                      |
| 37  | Launch blockers remaining                  | BLOCKED    | Media/legal/privacy/provider/storage/recovery/owners/policies/device/security gates remain                         |
| 38  | Hostinger questions remaining              | BLOCKED    | Runtime, PORT, external DB, persistence, cache, TLS/proxy, secrets, rollback, backup and monitoring                |
| 39  | Human decisions remaining                  | BLOCKED    | Infrastructure/regions/legal/media/business policies/security risk/operational owners and deployment authorization |
| 40  | Final staging-readiness classification     | PARTIAL    | Local rehearsal completed; external staging and public launch BLOCKED                                              |

## Outstanding actions and exact next step

Review the uncommitted Phase 07 diff and evidence first. Then an authorized owner must independently inspect the supplied CI run and obtain Hostinger answers/dedicated staging resource, country/privacy, persistent-storage and recovery decisions. Any future external deployment needs separate explicit authorization. Do not promote blocked images or infer launch approval from this rehearsal. No Phase 08 work begins automatically.

## Final local evidence and file inventory

Integrity verification passed for 30 protected tracked files, all 17 original source SHA-256 values and the flagged hardware-upload hash. The media registry remains 17 BLOCKED / 85 PENDING REVIEW. Private paths remain ignored, branch/HEAD are unchanged, the Git index is empty and diff whitespace checks pass. The project secret guard passed across 278 tracked/proposed source files; no matched values were printed. Restricted-shell unit execution initially failed in Node's OS user lookup before tests loaded; the authorized local rerun passed all 49 tests.

Database-outage checks return safe health 503 and session-bearing admin API 503 responses. Public event rendering exposes no Prisma/connection details; streaming can commit HTTP 200 before the existing error boundary, so transport status alone is not a success check. No production error UI was rewritten. Framework/provider log custody and redaction remain staging-review obligations.

<!-- FINAL INVENTORY -->

Final successful report: `.local/phase07/run-64b626d5f6b7b881/rehearsal-report.json`. Candidate build `vrz3zRnfQXRGuunsJAiKF`; previous build `NPfalKZcjio473747ks4w`. Synthetic custom backup: 35516 bytes, SHA-256 `261e33a3b95be2bca8f8b590fb60146d0cb153ec3226adce9b3dc12940437f5c`; restore schema SHA-256 `af9e20d0eef53929b954882e7ab866fcb45c1240b1239f6f95bec38ccfaaaf6d`. Generated media SHA-256 `1762ee58f6df5bf213ba84fcf33786a95bf18550c1c697339346acb8e13c4e06`. Image optimizer: HTTP 200, image/webp. Cleanup: {"application":"PASS","databaseClients":"PASS","ownedCluster":"PASS"}.

Modified files:

- `.env.production.example`
- `AGENTS.md`
- `docs/DEPLOYMENT.md`
- `docs/PRODUCTION_READINESS.md`
- `package.json`
- `scripts/start.mjs`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/lib/production-env.ts`
- `src/proxy.ts`

Created files:

- `.env.staging.example`
- `docs/BACKUP_RESTORE.md`
- `docs/DEPLOYMENT_REHEARSAL.md`
- `docs/PHASE_07.md`
- `docs/ROLLBACK.md`
- `docs/STAGING_READINESS.md`
- `scripts/rehearse-deployment.mjs`
- `scripts/rehearse-staging.mjs`
- `scripts/staging-storage.ts`
- `src/lib/staging-policy.ts`
- `tests/staging.test.ts`
