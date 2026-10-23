# Pre-commit security corrections and final review

Date: 2026-10-23. Branch: `feat/official-client-presentation`. HEAD remains `0f8404a051bf9d1f816fc9135d7ec78bb0db0b1c`. **No staging, commit, push, merge, publish or deployment.**

## Verdict and scope

**SAFE TO COMMIT as reviewed local source checkpoints**, subject to the user's separate checkpoint authorization and selective staging described below. This verdict is not production readiness or authorization to commit. External release remains blocked. The completed Cinematic Redesigns 00-03, navy/ivory/gold environment, CMS, PostgreSQL/Prisma schema and existing media rights controls are preserved.

Before edits, all **368 source files** were copied and independently checksum-verified under ignored `.local/recovery/precommit-security-20261023-151956-cbd8a5/source/`. The manifest and binary/index patches retain the original worktree. A guarded READ ONLY transaction established the 15-table/schema baseline and 397 protected file hashes. Previous source/database recovery remains retained. `.local/precommit-security-current-run.txt` points to this run and its test logs.

## Security corrections

### Windows runtime material

The launcher delegates runtime writes to `scripts/presentation-runtime.mjs`. Before any code/catalog write, the helper rejects links/reparse paths, verifies current ownership, and rejects unexpected explicit grants or deny rules. It establishes an exact owner/SYSTEM-only DACL, disables inheritance and re-reads the ACL to verify both required full-control entries, inheritance/propagation flags and absence of other entries. Every runtime write repeats verification. Missing/unavailable permission tooling or verification failure stops startup with a fixed error; captured account/path diagnostics are withheld. Unix still requires current ownership and 0700, with new files at 0600.

The Windows child uses its own bundled PowerShell modules instead of inheriting a PS7/user module path. Only owner/DACL changes are persisted; no audit/SACL privilege is requested. Existing safe directories remain reusable. Unexpected explicit permissions are refused rather than silently removed. Synthetic tests verify initial establishment/reuse, a pre-existing inheritable Everyone grant, a later broadened grant, and refusal before an access-code file is written.

### Viewing-session logout and replay

Tokens now have a random per-session nonce and a versioned HMAC. A bounded process-local registry stores only token hashes, expiry and a run fingerprint. Authorization requires the signature, exact run/expiry and active registry entry. Logout revokes that entry before expiring the distinct HttpOnly/SameSite=Strict cookie. Replaying a copied logged-out token fails, while a second viewer remains valid. The existing five-minute access-code and one-hour run deadlines remain. Restart revokes the run; legacy tokens cannot grant access.

This deliberately remains a single-process loopback presentation capability. It is not a production/multi-instance session design. CMS authentication, permissions, active-actor checks, database tables and public media eligibility are unchanged. Production policy still refuses presentation mode; authentication remains in the provider and media reader, not merely Proxy. Dynamic/private URLs remain excluded from the public image optimizer. No private original or derivative was published.

## Regression coverage

- `tests/presentation-runtime.test.ts`: three runtime permission tests; both Windows-specific unsafe-grant regressions actually executed here, not skipped.
- `tests/presentation-session.test.ts`: actual POST/DELETE handlers with synthetic Request/Response data; mismatched Origin, oversized declared/streamed bodies, no-cookie denial, valid handshake cookie attributes, ten-attempt window/429/recovery, unique viewers, logout/copy replay revocation, unaffected second viewer, and production denial with an otherwise valid synthetic token. No database or photographs.
- `tests/official-presentation.test.ts`: adds actual `scripts/start.mjs` refusal with presentation mode enabled under both operational and demo production selections.
- `tests/presentation-security-browser/production.spec.ts` and its new configuration: six real production HTTP cases across operational and demo modes, forged loopback identity/cookie, private page/bytes/catalog/code-file denial, POST/DELETE denial without cookie issuance/redirect and optimizer refusal. Uses only an unreachable dummy database, no local configuration, fixtures or private assets. Prepared CI quality now runs this suite after browser installation. No workflow was dispatched.
- Existing protected presentation browser suite: adds logout/replayed-cookie denial, derivative-hash mismatch with restoration, and production POST/DELETE denial. Temporary ignored catalog edits are restored in finally blocks; originals are never modified.

## Documentation and formatting

Repaired eleven encoding sequences in `docs/PHASE_10_1.md`, including the historical text's punctuation, without changing historical facts. Redesign 02 now distinguishes its originally documented clause entrance from the actual current per-word values (90/15 yPercent, 0.65/0.3 seconds, total stagger at most 0.24 seconds). Its historical table and measured samples remain. The original presentation report explicitly identifies the five-portrait results/catalog mapping as historical and identifies the two current permanent team members.

Formatted exactly the nine files identified in the review plus new/edited security files and their reports. All modified/untracked files now pass Prettier. The six code files that received formatting only have equivalent emitted syntax trees compared with the snapshot; insignificant trivia/trailing commas do not count as behavior changes. No redesign recipe or visual stylesheet was altered.

## Executed validation

All results below were executed in this correction on Windows x64 / Node 24.19.0.

| Check                                                       | Result                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| TypeScript                                                  | PASS                                                                                                   |
| ESLint                                                      | PASS                                                                                                   |
| Full unit suite, final tests                                | **77 PASS**, zero failed/skipped                                                                       |
| Production build                                            | PASS; 17-asset pre/post gate and 52 private deployment traces pass                                     |
| Synthetic production HTTP suite                             | **6 PASS**, operational and demo production, dummy DB/no photographs                                   |
| Protected official presentation suite                       | **18 PASS**, including existing cinematic/responsive/no-JS/reduced-motion tests and new security cases |
| Official production/public suite                            | **5 PASS**, read-only desktop/tablet/mobile, navigation and motion cleanup                             |
| Existing Phase 04 CI browser gate                           | **7 PASS**, DB-disconnected media/fallback/gallery/keyboard checks                                     |
| Total browser cases                                         | **36 PASS** across the four suites                                                                     |
| Missing-configuration production startup                    | PASS; rejected before readiness                                                                        |
| Production presentation flag startup                        | PASS in the unit suite, both production selections                                                     |
| Full and production dependency audits                       | Both **0 findings**, both exit 0; lock unchanged                                                       |
| Workflow structure / formatting / whitespace / secret guard | PASS                                                                                                   |
| Database/media preservation                                 | All **15 tables/schema** and **397 protected files** unchanged                                         |
| Release-evidence consistency                                | Expected exit 1 / **BLOCKED**, 128 unresolved checks                                                   |

Initial corrections during validation: Windows PowerShell inherited an incompatible module path, and its Set-Acl cmdlet attempted an unrelated audit privilege on directory reuse; bundled-module isolation and direct owner/DACL persistence resolved both. TypeScript rejected a direct test assignment to NODE_ENV; the test now patches/restores its environment through the existing object interface. Final executed runs pass. Development LCP hints during scripted scrolling and NO_COLOR warnings remain visible; no new performance certification is claimed.

## Current dependency status and remaining release gates

The earlier five high development entries are retained in dated reports as historical observations. Fresh full and production audits both report zero findings because [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) was withdrawn upstream on October 23, 2026. GitHub states it is not practically exploitable. Next remains pinned to 16.4.1 and braces remains 3.0.3; this correction did not update dependencies, force a downgrade or suppress an audit. Zero reported findings is time-bound and is not a security guarantee.

No blocking source defect remains from this pre-commit review. Still unresolved for deployment: exact-candidate Linux/native/query execution and remote CI; actual hosting/HTTPS/proxy/cookie/cache/log/alert proof; external PostgreSQL/TLS/pooling/roles; durable private media and coordinated off-device/encrypted recovery; provider rollback; business/privacy/media approvals; physical-device and assistive-technology review. All 17 assets remain BLOCKED, all 85 review fields PENDING REVIEW, and all 45 Instagram records remain private. Release inventory was not cleared. Linux CI is prepared, not a passing run; Windows-specific ACL tests intentionally skip on non-Windows runners.

## Exact recommended checkpoint structure

Use **two independently reviewed checkpoints**, retaining the integrated presentation/design work together. Do not use a blanket add.

### A. Phase 10.1 dependency, recovery and native evidence

- `package-lock.json` and only the Next.js 16.4.1 dependency hunk of `package.json`.
- `scripts/check-native-runtime.mjs`, `scripts/record-validation-evidence.mjs`, `tests/native-runtime.test.ts`, `tests/validation-context.test.ts`.
- Native/audit/evidence changes in both workflows. **Exclude the new synthetic-presentation browser step from this checkpoint**, because its script/configuration and security policies belong in B.
- Recovery/deployment/readiness documentation and earlier Phase 10.1/Sites evidence. Use hunk selection to retain the later pre-commit correction/cross-reference sections for B where they refer to its new report.

### B. Official presentation, Redesigns 00-03 and pre-commit hardening

- All presentation routes, policies/providers, launcher/catalog/runtime helpers and declarations, security/unit/browser tests and both presentation browser configurations.
- Package script hunks for `dev:presentation`, `test:presentation` and `test:presentation:security`, plus the matching CI synthetic-denial step.
- The two-member source correction and associated expectations; shared public/page/company/hero/ambient/word/theme/runtime changes; all redesign and presentation reports, Motion System and AGENTS changes.
- Documentation/format corrections, subsequent audit-status notes and this pre-commit report.

Homepage, public layout, hero and motion runtime span several phases. Their final integrated state is tested; mechanically splitting those files by redesign number would risk incomplete imports and broken checkpoints. If finer historical checkpoints are desired, reconstruct them separately from verified recovery snapshots after specific authorization, without overwriting this worktree. Do not split package metadata from its lock or CI steps from their referenced scripts. Each staged checkpoint needs its own review/validation when staging is authorized; the executions above validate the complete current worktree.

## Final preservation and handoff

Final complete inventory: **40 modified tracked files and 40 untracked files**, all reviewed source/documentation/tests. Against the new 368-file snapshot, **348 existing files are byte-identical**, exactly **20 intended existing files changed**, **seven new files** were added, and nothing is missing. The proposed source set is 375 files. No unrelated edits, binary media, credentials, dump, private runtime file or linked file is included. The index is empty; branch and HEAD are unchanged. Existing ignored files remain ignored. The final secret guard, full proposed-file formatting and whitespace checks pass.

Post-test and post-restart READ ONLY comparisons match all 15 original table/schema fingerprints and 397 protected files. The package lock, Prisma schema, real environment, private sources/derivatives, readiness/feedback ledgers and held hardware remain unchanged. All 45 Instagram records retain private flags; 17/85 media holds remain.

The presentation was restored at **http://127.0.0.1:3134/dev/presentation**. Exact directory permissions verified; entry and health returned HTTP 200; the fresh expiring code file was present without disclosure. Both presentation and the original PostgreSQL service remain loopback-only. The database process was retained throughout. Logs and private runtime material remain ignored. Stop here for user review; no staging, commit, push, merge or deployment occurred.
