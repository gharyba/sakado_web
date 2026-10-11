# Website Phase 08 — repository preparation for external staging

Date: 2026-10-11. Branch: `feat/phase08`. Clean starting HEAD: `f623b7ff45d1984d5ca308f4b7dd77afa215fe98` (Phase 07 merge). Phase 07 implementation commit `a2dd300` is preserved. No branch/history/index changes are made; this phase remains uncommitted for human review.

**Final target classification: EXTERNAL STAGING BLOCKED. RC BLOCKED. PUBLIC PRODUCTION BLOCKED.** This is repository preparation, not completion of external validation. The user expressly confirms no resources/endpoint and prohibits deployment, resource creation, DNS changes or production connections. No provider login, external SQL/migration/admin creation, media upload, restart, tag or release occurs.

## Discovery and available evidence

The existing Node 24 / Next.js App Router / React / Prisma PostgreSQL architecture, CMS, authentication, media adapter and Phase 07 guards are retained. Local Node is 24.19.0; provider version remains unknown. `start:hostinger` uses the existing validated launcher, 0.0.0.0 and process PORT. Only MEDIA_STORAGE=local is implemented; provider persistence is unproven. Two existing migrations are recorded by hash in the release inventory. No Prisma schema or migration changes are needed.

Read Phase 07, STAGING_READINESS, DEPLOYMENT_REHEARSAL, BACKUP_RESTORE, ROLLBACK, DEPLOYMENT, PRODUCTION_READINESS, environment examples, runtime/configuration/schema/workflows and actual storage/origin/health/admin/rehearsal code. Relevant installed Next self-hosting and environment guides were consulted. The original contact action stores a DB message; it does not send email. Existing isolated test entry points require their own local/CI identity and actual data-directory verification before fixtures; they must never target external staging.

Phase 07 reports 14 local synthetic rehearsal steps, verified separate restore and application rollback, 49 units, 18 integration assertions and 45 browser cases. Its safe ignored report remains available locally. These are historical local evidence, not this phase's external results. The supplied older GitHub run 38156234009 remains user-reported with prior connector 404; merging Phase 07 proves history, not candidate-specific green CI or an external deployment. No new GitHub workflow is triggered here.

## User-confirmed requirements and authorization

The user confirms: staging hostname NOT CONFIRMED; Hostinger Node 24 NOT VERIFIED; dedicated staging PostgreSQL NOT PROVISIONED/CONFIRMED; persistent storage NOT VERIFIED; access restriction NOT CONFIGURED/CONFIRMED; HTTPS NOT AVAILABLE; external staging admin NOT PROVISIONED; deployment NOT PERFORMED. This information is **user-reported**, not provider inspection. No provider entitlement, region, hostname or storage guarantee is invented.

Required before external work: approved isolated target/account/hostname; actual Node/native-module/build/start/PORT contract; dedicated PostgreSQL identity/TLS/pooling/limits/region; dedicated persistent upload path; provider access restriction; HTTPS/proxy/header/cookie verification; private unique secrets; authorized migration/admin/test/backup/restore/rollback windows and operational owners. NODE_ENV=production, DEMO_MODE=false, STAGING_MODE=true; TRUST_PROXY remains false until measured and approved. See [EXTERNAL_STAGING](EXTERNAL_STAGING.md).

Resource creation, provider login/settings, DNS/subdomain/SSL, secret provisioning, application upload, remote migrations/admin/test writes, restart/redeploy, external dump/restore/rollback all require separate explicit scope approval. No such approval is requested merely to finish local preparation. All future action records must state ACTION/TARGET/WHY/EXPECTED EFFECT/REVERSIBILITY/DATA RISK.

## Preparation delivered

- Preserved the staging template's empty secrets and supported variable names; added the explicit unprovisioned/authorization boundary.
- Added the external execution runbook: provider questions, target identity, guarded operator procedure, HTTPS/proxy/origin/cookie/cache/security checks, synthetic public/admin/registration/Instagram/contact workflows, storage lifecycle hashes, separate-target recovery and rollback.
- Added safe evidence custody/manual review/persistence templates and draft cumulative release notes.
- Added a pending non-secret release manifest with base commit, artifact/migration hashes, null unverified candidate/runtime/host/provider and 31 unresolved gates. It preserves the 17/85 media snapshot and does not change source media approvals.
- Added the offline `check:release` consistency validator and four focused unit tests. It binds reviewed evidence to actual clean candidate HEAD, deployed build, exact artifacts/media counts, CI/external scope and human reviewer/date/reference. It does not independently prove a provider claim or authorize publication/tagging. Default exit 1 is expected while blocked. Optional private reviewed receipts avoid commit self-reference; see [RELEASE_CANDIDATE](RELEASE_CANDIDATE.md).
- Updated deployment/readiness guidance and AGENTS without clearing any production gate. No new dependency, workflow/deployment job, storage adapter, UI/CMS/auth behavior or database change.

## Validation boundaries

Applicable local checks and final integrity results are recorded below after execution. Any fresh local integration/browser checks use only the existing owned disposable runner or DB-disabled configuration. Standalone .env-driven fixture commands are intentionally not used. Existing CI files and Phase 07 runner/guards remain byte-identical; no Linux/provider runtime is available in this phase.

External performance, image optimization, health, logs, headers, origin/cookies, manual accessibility and physical devices are NOT TESTED. No staging screenshot is fabricated. No new backup/restore/redeploy/rollback is claimed externally. A future authorized monitor can probe the approved staging health endpoint; no URL/owner/resource exists to configure now.

Local log-review finding: the deliberate unavailable-database browser regression kept raw diagnostics out of HTTP responses, but Next/Prisma framework output included the failed database address and server filesystem stack paths. Those raw logs are not copied into committed reports. Fixed application operational-error messages remained minimal. Provider log access/retention/redaction and framework diagnostics remain an unresolved external log/privacy gate; no claim of sanitized hosted logs is made and no broad logging rewrite is introduced.

The current dependency audit still has five high development lint-chain entries and zero runtime findings with omit-dev. The suggested fix changes eslint-config-next to 14.2.35 and is marked semver-major; no nonbreaking fix is offered by this result. No force fix, downgrade, package install or lockfile change is applied. Remediation or an authorized risk decision remains unresolved.

## Exact 41-area report

All external results remain BLOCKED or NOT TESTED. PARTIAL below describes local preparation only.

| #   | Area                          | Status     | Evidence / next requirement                                                        |
| --- | ----------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| 1   | External staging provider     | BLOCKED    | Hostinger target intended; no actual app/plan verified or provisioned              |
| 2   | Staging hostname              | BLOCKED    | No approved hostname; proposed pattern is not a real target                        |
| 3   | Runtime validation            | NOT TESTED | No external runtime; existing local runtime contract preserved                     |
| 4   | Node version                  | PARTIAL    | Local 24.19.0, target 24.x; external version unknown                               |
| 5   | Environment validation        | PARTIAL    | Empty template/validator retained; no remote variables provisioned                 |
| 6   | HTTPS result                  | NOT TESTED | No external endpoint/certificate/redirect proof                                    |
| 7   | Proxy result                  | NOT TESTED | No actual Host/protocol/header replacement/spoof evidence                          |
| 8   | TRUST_PROXY status            | PARTIAL    | False in template; no remote environment or permission to enable                   |
| 9   | Database provider/status      | BLOCKED    | Dedicated staging provider/project/database not confirmed                          |
| 10  | PostgreSQL connectivity       | NOT TESTED | No external connection performed                                                   |
| 11  | Migration result              | NOT TESTED | Two existing migrations inventoried; no external deploy/status                     |
| 12  | Staging admin result          | BLOCKED    | No external OWNER provisioned; existing method documented                          |
| 13  | Public smoke result           | NOT TESTED | External matrix prepared, no endpoint                                              |
| 14  | Admin smoke result            | NOT TESTED | No external login/role/dashboard test                                              |
| 15  | Registration E2E result       | NOT TESTED | External synthetic workflow requires approved app/DB/admin                         |
| 16  | Media safety result           | PARTIAL    | Local gate/snapshot preserved; no external site exists to inspect                  |
| 17  | Storage persistence result    | BLOCKED    | No verified dedicated persistent path                                              |
| 18  | Restart persistence result    | NOT TESTED | Same-object hash ledger prepared                                                   |
| 19  | Redeploy persistence result   | NOT TESTED | No provider redeploy/release switch authorized or performed                        |
| 20  | Backup result                 | BLOCKED    | No external source/backup store/owner; historical local evidence retained          |
| 21  | Restore rehearsal result      | NOT TESTED | External separate disposable restore target unavailable                            |
| 22  | Rollback result               | NOT TESTED | Provider version-switch capability unknown                                         |
| 23  | Health result                 | NOT TESTED | No external /api/health; no monitor configured                                     |
| 24  | Security headers              | NOT TESTED | Actual external/cache responses unavailable                                        |
| 25  | Origin/security validation    | NOT TESTED | Actual HTTPS/proxy/session checks pending; guards unchanged                        |
| 26  | Log/privacy validation        | NOT TESTED | No provider logs/regions/retention evidence; no legal conclusion                   |
| 27  | Secret scan                   | COMPLETE   | Executed local project guard; heuristic, not exhaustive history certification      |
| 28  | Dependency audit              | PARTIAL    | 5 high dev findings, 0 runtime; security decision unresolved                       |
| 29  | Performance findings          | NOT TESTED | No external measurements or invented benchmark                                     |
| 30  | Accessibility result          | NOT TESTED | Manual external checklist prepared; no screen-reader certification                 |
| 31  | Physical-device result        | NOT TESTED | No actual mobile/tablet hardware; emulation is separate                            |
| 32  | GitHub CI result              | NOT TESTED | New changes uncommitted/unpushed; no candidate-specific run                        |
| 33  | Linux validation result       | NOT TESTED | No new Linux execution; older user-reported run not reused as proof                |
| 34  | Files modified                | COMPLETE   | Final inventory below; no unrelated behavior changes                               |
| 35  | Files created                 | COMPLETE   | Final inventory below; private outputs ignored                                     |
| 36  | Schema changes                | COMPLETE   | None; source schema hash preserved                                                 |
| 37  | Migration changes             | COMPLETE   | None; two original migration hashes preserved                                      |
| 38  | Remaining staging blockers    | BLOCKED    | Host/plan/runtime/DB/storage/restriction/TLS/secrets/owners/authorization          |
| 39  | Remaining production blockers | BLOCKED    | Media/legal/privacy/policies/production infrastructure/recovery/monitoring/go-live |
| 40  | RC readiness                  | BLOCKED    | No external evidence, candidate ID/build or green candidate CI; no tag             |
| 41  | Final classification          | BLOCKED    | EXTERNAL STAGING BLOCKED; repository preparation delivered                         |

## Exact next step

Human review of this uncommitted preparation diff, followed by confirmation of the approved isolated Hostinger app/hostname/Node contract, dedicated PostgreSQL, persistent storage and access restriction. Only then prepare a concrete external action record for explicit authorization. No production connection, provider change, RC tag or Phase 09 begins automatically.

## Final local evidence and file inventory

| Executed check                                      | Local result | Scope                                                                                                         |
| --------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| npm run typecheck                                   | COMPLETE     | Next type generation and strict TypeScript                                                                    |
| npm run lint                                        | COMPLETE     | Existing ESLint checks                                                                                        |
| npm test                                            | COMPLETE     | 53 units, including 4 focused release-evidence tests                                                          |
| npm run build                                       | COMPLETE     | Dummy unavailable DB/demo inputs, Prisma generation and pre/post public-media gates                           |
| npm run test:production-env                         | COMPLETE     | Missing critical settings fail before service startup                                                         |
| npm run test:phase06                                | COMPLETE     | Fresh owned PostgreSQL cluster: 18 integration assertions, 21 Phase 05 + 17 Phase 06 browser cases            |
| npm run test:phase04                                | COMPLETE     | 7 DB-disabled browser cases; 45 browser cases total in this phase                                             |
| npm run check:release                               | COMPLETE     | Negative validation: expected exit 1 / BLOCKED, 127 unresolved consistency checks; no RC cleared              |
| check:release --reviewed-evidence without a receipt | COMPLETE     | Expected safe exit 1; no values echoed and no fallback to approval                                            |
| npm run check:secrets                               | COMPLETE     | Guard passed across 287 tracked/proposed files; heuristic, not exhaustive history proof                       |
| npm audit / omit-dev                                | PARTIAL      | 5 high development lint-chain findings / 0 runtime; no dependency changes                                     |
| Source/media/Git integrity                          | COMPLETE     | 273 protected tracked files, all 17 source photos and hardware upload hash unchanged; 17 BLOCKED / 85 pending |
| Clean npm installation / new Linux CI               | NOT TESTED   | Existing locked installation reused; no workflow triggered or pushed candidate                                |
| External/provider/manual device checks              | NOT TESTED   | No approved resources/endpoint; no remote action performed                                                    |

Integration was executed through the guarded fresh-cluster Phase 06 runner; standalone .env-driven test:integration/test:e2e and external fixtures were not invoked. No schema or new migration was created; only the owned synthetic test database received its existing migrations. Phase 07 backup/restore/rollback is retained as historical proof rather than unnecessarily rerun for offline tooling changes.

Git remains on the starting branch/HEAD with an empty index. Private media/evidence, .local receipts/screenshots/backups, .env and uploads are ignored and untracked; diff whitespace checks pass. No CI workflow, existing application source/style, public asset, original media document, Prisma file or Phase 07 script changed. Final inventory follows.

<!-- FILE INVENTORY -->

Modified files:

- `.env.staging.example`
- `AGENTS.md`
- `docs/DEPLOYMENT.md`
- `docs/PRODUCTION_READINESS.md`
- `package.json`

Created files:

- `docs/EXTERNAL_STAGING.md`
- `docs/PHASE_08.md`
- `docs/RELEASE_CANDIDATE.md`
- `docs/RELEASE_CANDIDATE_1.md`
- `docs/release/release-candidate.json`
- `docs/staging/PHASE08_EVIDENCE.md`
- `scripts/check-release-evidence.ts`
- `scripts/lib/release-evidence.ts`
- `tests/release-evidence.test.ts`
