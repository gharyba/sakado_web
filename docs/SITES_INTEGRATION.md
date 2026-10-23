# Sites collaboration and Phase 10.1 continuation

Date: 2026-10-23. Scope: local official-application preparation only. **External staging and production launch remain BLOCKED.**

This is the retained earlier continuation report. Its five-entry development audit result is historical: the later [pre-commit security review](PRECOMMIT_SECURITY.md) records the October 23 upstream advisory withdrawal, fresh zero-finding audits and subsequent local security corrections.

## Repository and preservation

The requested `feat/phase10-production-readiness` is not the active checkout. The actual branch is `feat/official-client-presentation`, HEAD `0f8404a051bf9d1f816fc9135d7ec78bb0db0b1c`, with existing presentation, Cinematic Redesigns 00-03 and Phase 10.1 changes. No branch switch, stash, reset, clean, stage or commit was performed.

Before editing, all **365 tracked/non-ignored untracked source files** were copied into the Git-ignored `.local/recovery/phase10-1-sites-20261023-121424-9862b7/source/`. Each source/copy checksum was independently compared. The manifest records branch, HEAD, status and SHA-256 values; working/index patches are retained. `.local/phase10-1-sites-current-run.txt` points to this run. This source snapshot excludes ignored secrets/private media; those are preserved in place and checked separately.

The exact existing loopback PostgreSQL target and data directory were verified before a repeatable-read READ ONLY fingerprint. All 15 table/schema fingerprints and **397 protected file hashes** form the preservation baseline. No fixture, migration, reset, provisioning, source restore or business-data write was performed. All 45 Instagram records remain unpublished/homepage-off. Media approval stays **17 BLOCKED / 85 PENDING REVIEW**. Hero, navy/ivory/gold environment, company history, two permanent team members, CMS, Prisma schema and presentation controls are preserved. Redesign 04 was not started.

The retained current-state custom dump from the earlier October 23 recovery exercise is still 37,145 bytes with SHA-256 `ae666ad5349ab1c0a3cced34e043ab206ac1e6f28648587a0fabab810f8f68fc`. Its directory ACL remains restricted to the current user and SYSTEM without inheritance. This continuation verified its hash/access controls; it did not repeat the restore. Earlier separate-target restore evidence remains in [PHASE_10_1](PHASE_10_1.md). Same-device recovery does not resolve encryption, off-device backups, RPO/RTO, ownership or provider recovery.

## How Sites assisted and integration limits

Read the installed Sites skill and its portable/local preview guidance. The read-only Sites listing returned no connected site and no further page; the repository has no `.openai/hosting.json` binding. No site was created, copied, registered, saved, synchronized or deployed, and no source-repository credential was requested.

Sites' available tools cover its hosted source/version/configuration/deployment lifecycle. They do not provide a direct visual inspection tool for this arbitrary local Next.js checkout. Its documented hosted runtime is Cloudflare Workers with 128 MB per isolate and HTTP external connections, without raw TCP. This official app currently needs a long-running Node 24 Next.js server, Prisma/PostgreSQL connectivity, native Argon2/Sharp and a local filesystem media adapter. Moving it to that runtime would require an explicitly approved architecture change and new validation; neither a static export nor the Sites starter preserves these requirements automatically.

The useful Sites workflow here is **local-only development and representative HTTP/browser validation in the existing repository**. All new implementation is ordinary Node tooling and GitHub workflow YAML that integrates directly with this Next.js project. No framework conversion, replacement CMS/database, extra animation engine, hosting dependency or separate demo was introduced. Sites hosting is not selected as the production target. Future Sites visual suggestions should be translated into small reviewed changes to the existing components, with approved media or existing safe placeholders and the same local browser tests; private catalogs/screenshots must stay local.

## Implemented correction and evidence

### Actual native pixel round trip

`scripts/check-native-runtime.mjs` previously read Sharp metadata after encoding; metadata parsing does not establish that the WebP pixel decoder ran. It now losslessly encodes a generated 3x2 navy image, decodes to raw RGB, and compares **all 18 decoded channel bytes** with the generated source. No original photo is read. Existing Argon2id positive/negative verification and database-disconnected Prisma construction remain.

The JSON output adds Node module ABI, OpenSSL, libvips and a whitelisted libc family/runtime version. Non-Linux reports `not-applicable`; non-glibc Linux is labeled `non-glibc`, without guessing musl. The full Node diagnostic report, environment and filesystem paths are never emitted. Unknown options fail with a fixed message, and `--linux` still refuses Windows. Prisma construction is explicitly not a query-engine test: only the guarded disposable integration job can supply that evidence.

### Reproducible validation context

New `scripts/record-validation-evidence.mjs` runs the native preflight and reads only fixed source/artifact paths plus read-only Git identity/status. It emits current commit/clean-or-unknown state; lock, schema and migration hashes; an observed optional build identifier; and native results. It does not load `.env`, query a database, connect remotely, write files or deploy. Callers may redirect JSON into ignored local evidence. Failed child output and invalid build identifiers are withheld. Environment claims such as `GITHUB_SHA` or `RELEASE_COMMIT` cannot manufacture source identity.

A present build identifier is deliberately labeled **build/source match NOT VERIFIED**. Unknown Git identity remains null. Application tests are not recorded by this check, external staging stays NOT TESTED and launch approval stays false. A dirty source commit is not an immutable release candidate. This is review context, not a replacement for test logs or release evidence.

Both prepared CI jobs and the manual Linux workflow now run `node scripts/record-validation-evidence.mjs --linux` after their existing successful checks and append that context to the GitHub job summary/log. No new external action, upload of private files, test bypass, dispatch or deployment was added. Reviewers must retain the actual run URL and exact ref, inspect every required job and its logs, and bind the candidate/build after separate authorization. The manual workflow still does not supply the integration job. These YAML changes have been parsed locally, **not executed on GitHub**.

## Validation in this continuation

| Check                                        | Result                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Typecheck / lint                             | PASS                                                                                                   |
| Unit suite                                   | **72 PASS**, including the new native argument/privacy/context regressions                             |
| Production build                             | PASS; pre/post public-media checks pass, 52 deployment traces contain no private workspace files       |
| Production missing-configuration startup     | PASS: rejected before readiness                                                                        |
| New context command                          | PASS on Windows x64 / Node 24.19.0 / OpenSSL 3.5.7 / libvips 8.18.7; dirty checkout correctly reported |
| Workflow YAML parse                          | PASS: one context step in each of three jobs                                                           |
| Read-only official production browser suite  | **5 PASS** at desktop/tablet/mobile, navigation/metadata and motion cleanup                            |
| Protected presentation suite                 | **15 PASS**                                                                                            |
| Production dependency audit                  | **0 findings** in the current query                                                                    |
| Full dependency audit                        | **5 high entries**, unchanged development lint chain; no compatible fix established here               |
| Final database/protected-source preservation | PASS: all 15 tables/schema and 397 protected files unchanged                                           |
| Linux / hosted staging / production          | **NOT TESTED**; no usable WSL, Docker or Podman available; no system install or remote dispatch        |

The offline release check still correctly exits 1 / BLOCKED with 128 unresolved checks. Presentation tests emit existing development LCP hints during scripted scroll; those are not controlled performance measurements. The source secret guard initially flagged a synthetic password-shaped URL in the new test; the test now constructs that dummy URL using URL fields, following the existing native-test pattern. The guard itself was preserved.

Logs/context remain in the ignored recovery run. Production audit zero is time-bound and does not clear the development findings or other security gates. The registry's offered Next 14 lint downgrade was not applied. No package/lock changes or root dependency reinstall was needed; the authoritative PostgreSQL process was left running. Under the user's existing maintenance approval, only the verified presentation process tree was temporarily paused for build checks.

## Final handoff

Source comparison against the new snapshot confirms **360 of 365 existing files byte-identical**, exactly five intended edits (the two workflows, native script/test and Phase 10.1 report), three new files, zero missing/unexpected changes and an empty index. All application/design/auth/storage source, package/lock, Prisma schema and existing private assets remain unchanged in this continuation. The new test's synthetic URL adjustment was rechecked with its focused test and the unchanged secret guard.

Reviewed the generated official production desktop (1440px) and phone (375px) captures locally: the navy/ivory/gold frame, text, navigation and responsive controls remain intact. The public frame intentionally has no unapproved photograph. The five browser checks also cover 768px, reduced motion and navigation; this is not physical-device, assistive-technology or field-performance certification. No private capture was uploaded to Sites.

Restored the existing protected presentation at **http://127.0.0.1:3134/dev/presentation** after the maintenance checks. Entry and health returned HTTP 200; the server listens only on 127.0.0.1, and a fresh expiring code file exists locally without disclosure. PostgreSQL remains on its original loopback 55432 process. Runtime logs and local code stay ignored. Use the ignored local code file privately if needed; expiry is unchanged.

## Remaining blockers and exact next steps

1. **Linux/candidate evidence:** after separate approval to review/checkpoint/push and dispatch, run both CI jobs for the exact candidate. Retain summary/logs, SHA, lock hash and actual Linux/OpenSSL/libc results. A Windows pass cannot clear this gate.
2. **Dependency risk:** obtain a verified compatible upstream fix for the development lint chain or an explicit scoped security-owner decision. Keep the production audit and full-risk record visible; no forced downgrade or suppression.
3. **Staging infrastructure:** confirm eligible Hostinger plan/region/runtime/resources, separate hostname, HTTPS/access restriction, approved external PostgreSQL with TLS/pooling/least-privilege roles and dedicated secrets. Provider/account setup and connections need separate authorization.
4. **Durable media/recovery:** select an approved persistent mount or private storage adapter, define retention/purge and coordinated encrypted off-device backups, then prove restart/rebuild/redeploy/restore/rollback behavior on the authorized target. Preserve per-request media authorization and optimizer exclusions.
5. **Hosted security and human acceptance:** verify cookies/origin/proxy/cache/logs/alerts on actual HTTPS staging; assign recovery/incident owners; obtain business/privacy and per-asset human decisions, physical-device and assistive-technology review. S16 source-path reconciliation remains separate from recovered-byte identity and publication rights.

The full blocker matrix remains [PHASE_10_1](PHASE_10_1.md). No readiness flag, approval ledger or release inventory was cleared. All work remains uncommitted; no push, merge, publish or deployment occurred.
