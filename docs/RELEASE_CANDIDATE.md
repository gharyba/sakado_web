# Release candidate evidence and decision

Status: **BLOCKED**. `v1.0.0-rc.1` is a proposed label only. No RC tag, GitHub release or deployment has been created. External staging does not exist yet; repository preparation is not external validation or public-launch approval.

## Inventory and offline check

[release-candidate.json](release/release-candidate.json) is a strict, non-secret pending inventory. It records the inspected base commit, target Node, null candidate/build/external runtime/origin/provider, source artifact hashes, two migration hashes, the unchanged 17 BLOCKED / 85 PENDING REVIEW snapshot and 31 unresolved evidence gates. Every external item is BLOCKED or NOT TESTED. It does not inherit COMPLETE from Phase 07 local rehearsals or old GitHub runs.

`npm run check:release` is entirely offline: it reads this inventory, current source hashes, media counts and read-only Git metadata. It never loads .env, connects to a database/provider, migrates, starts a server, changes records, writes approvals, tags or deploys. Set SAKADO_GIT_PATH only if Git is not on PATH; this selects the executable for read-only Git commands, not a deployment target. Node 24 is required.

**Exit 1 is expected now.** Missing candidate/build, dirty source, unresolved evidence, wrong scope, missing human review, mismatched commit/build/artifact/media counts, malformed records and future-dated reviews are blocking. Do not suppress the exit to call the RC ready or add this intentionally blocked gate as an unconditional passing CI job. Existing CI workflows are preserved.

The checker validates consistency of assertions supplied by humans. Even COMPLETE means only that the recorded metadata is consistent; it does not independently authenticate a provider response, verify a signature or authorize tagging. Qualified reviewers must inspect the underlying private evidence and CI records. No status changes because a file happens to exist or an automated test succeeds.

## Avoiding commit/evidence circularity

After future human review/commit authorization, select an immutable candidate source commit, obtain CI and external build evidence for that commit, and keep its checkout clean. Do not try to write a commit's own SHA into a file inside that same commit.

Create a local ignored copy of the inventory at `.local/phase08/release-candidate-evidence.json` only after actual testing. Populate candidateCommit, candidateBuildId, actual external Node/platform/approved staging origin, safe provider reference and reviewed evidence metadata. Do not include credentials, cookie values, private paths, full names, original media, raw logs or personal documents. Use:

```text
npm run check:release -- --reviewed-evidence
```

This explicit flag reads only that fixed ignored file, rejects symlinks/outside-root targets and oversized input, and still compares the candidate to current clean HEAD and actual artifacts. Default mode always reads the checked-in pending inventory. File existence never switches modes automatically. The result grants no external authority and never creates a tag. Private signed media evidence stays in the existing ignored governance directory, not in this release receipt.

## Required receipt semantics

Each gate has exactly status, scope, candidateCommit, buildId, evidenceRef, reviewerRef and reviewedUtc. Status is COMPLETE/PARTIAL/BLOCKED/NOT TESTED. Safe evidence/reviewer IDs are lowercase hyphenated identifiers; dates are UTC ISO strings; source/artifact hashes use full SHA values. No free-text payloads, URLs with credentials/queries, secret fields or extra keys are accepted.

- ciQuality, ciIntegration and linuxValidation require GITHUB_CI evidence for the exact candidate commit. Review both named Sakado jobs and the separate Linux workflow; a successful job on another SHA does not qualify.
- All other gates require EXTERNAL_STAGING evidence for the same candidate commit **and deployed build ID**. Local builds, Playwright emulation and Phase 07 restore reports are separate supporting evidence.
- Target isolation, environment/access restriction, HTTPS/proxy/cookies/origin, DB/migrations/admin, public/admin/registration, media safety and each storage lifecycle must be actually checked.
- Backup and restore must reference the authorized external staging source plus a separate disposable restore target. Rollback must preserve DB/media and return to the candidate. A provider limitation remains unresolved pending an approved alternative, not silently NOT APPLICABLE.
- Logs/privacy/security headers/cache, image optimization/performance, manual accessibility, physical-device review, staging monitoring ownership and the dependency-risk decision require actual scoped evidence. The pending inventory deliberately remains conservative; no unavailable check is automatically waived.

See [EXTERNAL_STAGING](EXTERNAL_STAGING.md) for the execution matrix and [PHASE08_EVIDENCE](staging/PHASE08_EVIDENCE.md) for custody. If the candidate code, migrations, media registry, provider configuration or runtime changes, reassess the affected evidence rather than copying earlier receipts.

## Human decision

Only after actual external gates, current CI, backup/restore, persistence, rollback and all required reviews pass may an authorized reviewer declare **RELEASE CANDIDATE READY FOR HUMAN TAGGING**. Tag/release creation still needs separate explicit instruction. Public launch always remains blocked in this phase: the media/legal/privacy/business/production-resource/recovery/monitoring/final-go-live gates are independent. See [PRODUCTION_READINESS](PRODUCTION_READINESS.md).
