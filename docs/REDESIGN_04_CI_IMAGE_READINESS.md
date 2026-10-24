# Redesign 04 CI correction — gallery image readiness

Date: 2026-10-23. Branch: `feat/cinematic-redesign-04`; baseline commit `b772064e46b6b845de9644e6bb5cb33d0cfdb193`. Scope: browser-test synchronization and sanitized diagnostics only. No application, gallery, image-loading, media-security, CMS, auth, database, dependency or workflow change. No staging, commit, push, merge or deployment.

## Failure evidence and root cause

The user reported that PR #10's Linux quality job passed six Phase 04 cases and failed the homepage/gallery case on `complete && naturalWidth > 0`. Remote pull-request head metadata independently matches b772064. The GitHub connector returned 404 for workflow runs and 422 for repository search, so the actual job logs/trace and exact failed image/network timeline could not be retrieved. The passing integration job is user-reported, not independently rerun or verified here.

The verified local defect is a **premature synchronous image-readiness assertion**. The test scrolled the whole gallery, waited only for the first image box to be visible, then immediately evaluated every image. Visibility establishes layout, not resource completion or successful decoding. The actual Gallery uses Next Image's native lazy default; unoptimized SVG delivery does not make loading synchronous. The full gallery can also extend beyond a phone viewport, so gallery-level scrolling is insufficient to explicitly visit every image.

The original unmodified case passed under ordinary local timing with CI=true and Playwright's bundled Chromium. A deterministic request-gated regression then held only the existing public camp/trail/coast SVG responses: the first image box was visible, requests had started, and the former exact readiness predicate returned false. Releasing the responses yielded HTTP 200 and successful readiness/decoding for all images. This verifies the race without arbitrary sleeps or relying on an intermittent local failure. It does not establish a Linux-specific asset defect or identify the exact remote packet timing. No broken/case-mismatched demo asset was found locally.

A separate synthetic 404 regression proves broken resources still fail the helper and their source URL/query marker is absent from its error message. This test catches the expected helper rejection; it does not skip or mark any browser test expected-to-fail.

## Minimal correction

Exactly two source files are proposed:

- `tests/phase04-browser/phase04.spec.ts`: adds a local helper and two deterministic regressions; replaces only the immediate all-images predicate in the affected case.
- `docs/REDESIGN_04_CI_IMAGE_READINESS.md`: this evidence and limitation record. The original Redesign 04 report remains historical and unchanged.

For each gallery image the helper:

1. Scrolls that image into view, preserving native lazy behavior.
2. Polls actual `complete`, `naturalWidth > 0` and `naturalHeight > 0`, with a 10-second bound.
3. Requires successful `decode()`, with a bounded five-second decode deadline and timer cleanup.

It refuses an empty image collection. It does not accept broken/zero-dimension images or convert images to eager loading. Original viewport/routes, heading/layout checks, first-image visibility, gallery control positioning, screenshots, request exclusions and error assertions remain. The original gallery position is restored before capture, with an additional overflow check.

Errors identify route, width and image index. Only the three allowlisted same-origin public demo filenames can be shown; unknown URLs, credentials, private paths and query values are withheld. The decode exception itself is never forwarded. The deterministic success attachment contains only demo basenames/statuses and booleans.

## Preservation

Before editing, copied and independently checksum-verified all 384 source files under ignored `.local/recovery/redesign04-ci-images-20261023-205331-774443/source/`. Manifest/branch/HEAD and private baseline remain in that ignored run. `.local/redesign04-ci-images-current-run.txt` points to it. Existing recovery was retained.

A new guarded repeatable-read READ ONLY comparison covers 15 database tables/schema and 397 protected files. After validation all match; all 45 Instagram rows remain unpublished/homepage-off, and all media approval records/files are unchanged. All 383 other original source files, including Redesigns 00–04, CMS, auth, Prisma/schema, media policies, package/lock and workflows, are byte-identical to baseline. No fixture, migration, seed, database restore or business-data write was executed.

Under the user's prior presentation maintenance approval, only the independently verified three-node presentation process tree was paused for TypeScript/build checks. PostgreSQL remained on its original loopback process. The presentation is restored after final validation with its original loopback/private-code policy; secret values are not printed.

## Executed validation

Windows x64 / Node 24.19.0. Installed the lock-matched Playwright Chromium headless shell into its normal browser cache after the first attempt found it absent; no package/lock change. Phase 04, Redesign 04 and synthetic-denial suites used **CI=true**, bundled Chromium and production builds with dummy unreachable databases. The official read-only suite uses its existing local Chrome configuration and verified local database guard.

| Check                                                   | Result                                                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Original unmodified affected case, ordinary timing      | 1 PASS; not a deterministic unmodified failure                                                                  |
| Controlled delayed-response and synthetic-broken probes | 2 PASS; repeated in the full suite                                                                              |
| Full Phase 04 suite                                     | **9 PASS** (original seven plus two regressions)                                                                |
| Redesign 04 discovery suite                             | **8 PASS**                                                                                                      |
| Synthetic production presentation denial                | **6 PASS**, both operational/demo modes                                                                         |
| Official production/read-only content/auth suite        | **7 PASS**                                                                                                      |
| Unique final browser cases across four suites           | **30 PASS**                                                                                                     |
| Full unit suite                                         | **82 PASS**, no failures/skips                                                                                  |
| TypeScript / ESLint                                     | PASS                                                                                                            |
| Production build                                        | PASS; 17-asset pre/post gate and 52 private deployment traces pass                                              |
| Missing-critical-settings production startup            | PASS; refused before readiness                                                                                  |
| Source secret guard / formatting / whitespace           | PASS; source guard scanned all 385 proposed files, both changed/new files pass formatting, Git whitespace clean |
| Database/schema and protected-file preservation         | 15 table/schema fingerprints and 397 files unchanged                                                            |

All execution logs and sanitized public browser evidence remain ignored in the recovery run and `.local/phase04/browser-results-final/`. Earlier Redesign 04 test totals were not relabeled as newly executed. Existing NO_COLOR warnings remain non-failing.

## Limits and next step

WSL reports not installed; Docker/Podman are unavailable. **Linux was not run locally.** These Windows/bundled-Chromium results are the closest available browser match, not a claim that GitHub Actions is green. After separate commit/push authorization, the exact fix must pass the actual Linux quality job. No workflow rerun or dispatch was requested or performed here.

No public media permission, production infrastructure gate or final client approval is cleared by this test correction. Existing 17 BLOCKED / 85 PENDING REVIEW holds remain. Stop for review without committing, pushing, merging or deploying.

## Final handoff

Final source review confirms exactly one modified tracked test file and one new documentation file; all other 383 original files and all recovery copies remain unchanged. Index is empty, branch remains `feat/cinematic-redesign-04`, and HEAD remains b772064. Post-restart preservation again matches all 15 table/schema fingerprints and 397 protected files. The original PostgreSQL service is retained. The restored presentation is loopback-only on 3134, health returned HTTP 200, and runtime permissions verified without exposing its code.

**SAFE TO COMMIT as a local test-only correction**, with an actual Linux CI rerun still required after separate commit/push authorization. Nothing was staged, committed, pushed, merged or deployed.
