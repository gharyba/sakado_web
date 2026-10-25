# Cinematic Redesign 08.1 — GSAP lifecycle stability

Date: 2026-10-25. Branch: `feat/cinematic-redesign-08`. Baseline HEAD: `59a10b284833c655d38a903c4682290bf3f39947`; work remains uncommitted.

## Scope and current conclusion

The application-owned scene and Company Story media-query subscriptions now have explicit native listener cleanup. Thirty complete route tours passed in both protected development and public production: their query counts remained constant. The animation recipes, timings, positions, geometry, artwork and styles were not changed.

This is **not a claim that all GSAP native listener retention or long-session memory risks are resolved**. A separate GSAP 3.15.0 ScrollTrigger orientation subscription accumulates when its global engine is disabled and re-enabled. That library behavior is reproduced independently below and remains for technical review. Finite heap measurements do not establish bounded memory.

## Preservation and environment

The existing 14 uncommitted Redesign 08 files were copied and SHA-256 verified before this investigation in ignored `.local/redesign08-1/prechange/`. The interrupted `media-context.ts` and its five unit tests were reviewed and retained. The only edits to existing application files in this correction are the factory import and call in `runtime.ts` and `company-story.ts`.

The installed architecture/motion documentation and Next.js client-boundary guidance were consulted. Runtime: Windows, Node 24.19.0, installed Next 16.4.1, GSAP 3.15.0, desktop Chrome through Playwright. Native checks ran outside the restricted agent sandbox; no `os.userInfo()` shim, ACL relaxation, dependency change or skipped security gate was introduced.

The user-owned presentation server initially occupied 3134. The isolated harness refused startup; it was not terminated or reused. Public-only checks proceeded separately. Later an independent port check established that 3134 was free. Test servers then used the existing exclusive-port checks and cleaned up only their own processes. The existing PostgreSQL service on loopback 55432 remains running.

No database fixtures, migrations, CMS writes, contact submissions, media approvals or original asset edits were used. Read-only fingerprint comparison and final preservation verification are recorded with the final validation results below.

## Root cause and ownership investigation

`MotionScene` already disconnects its intersection observer, ignores an import that resolves after disposal, calls the scene disposer, and reverts on preference changes/unmount. `mountScene` already disposes its observers/load listeners, calls `media.revert()` and `context.revert()`, restores original inline styles and releases unused ScrollTrigger work. Company Story already reverts its nested media context. A missing React effect cleanup was not demonstrated.

The retained scene callbacks originate in the installed GSAP core `MatchMedia.add` implementation (`node_modules/gsap/src/gsap-core.js`, around lines 2974–2997). Each condition creates a native `MediaQueryList` and registers `_onMediaChange`. `MatchMedia.revert()`/`kill()` removes its contexts from GSAP's active media registry and reverts animations, but does not explicitly unregister those native callbacks. Consequently a reverted context is not evidence that its native query subscription was removed.

An isolated blank-page library control, without React, application routes or private assets, registered and reverted 30 matching GSAP contexts. Results: **30 cleanup callbacks executed, zero remaining target tweens, 30 query objects and 30 native callbacks after explicit GC**. This separates confirmed subscription retention from a claim that GSAP retains the old animated targets.

### Before correction

A production baseline ran 30 tours through `/about` → `/gallery` → `/contact` → `/`, activating the same homepage motion scopes each time. This fuller activation deliberately covers more scopes than the partial tour in Redesign 08.

| Tour | Desktop query callbacks | Tablet query callbacks | Tall-story callbacks | All DOM event listeners | Detached scene roots |
| ---- | ----------------------: | ---------------------: | -------------------: | ----------------------: | -------------------: |
| 0    |                       8 |                      7 |                    1 |                     482 |                    0 |
| 1    |                      16 |                     15 |                    2 |                     560 |                    0 |
| 5    |                      48 |                     47 |                    6 |                     756 |                    0 |
| 10   |                      88 |                     87 |                   11 |                    1001 |                    0 |
| 20   |                     168 |                    167 |                   21 |                    1491 |                    0 |
| 30   |                     248 |                    247 |                   31 |                    1981 |                    0 |

The other scene condition queries show the same corresponding growth. Each public tour adds 49 scene-related callbacks. Motion-off and system reduced motion did not release them. The stabilization assertion failed as expected; this was recorded as a real baseline failure rather than retried to obtain a pass.

## Minimal correction

`createMediaContext()` explicitly owns native query subscriptions while GSAP continues to own scoped animations and their reversion. It:

- Creates conditions from native query matches, with the existing unconditional `all` behavior.
- Reverts the preceding scoped GSAP context before rebuilding changed conditions; ignores notifications that do not change conditions.
- Removes each modern or legacy native listener with the original callback identity on disposal.
- Handles inactive conditions, nested owners, repeated disposal and partial setup failures.
- Leaves unrelated contexts and animations running; there is no global `killAll`, global `matchMedia` patch or replacement animation engine.

`mountScene` and the nested Company Story media owner now use this helper. Their existing setup functions and cleanup recipes remain unchanged. The helper is deliberately limited to the API those two callers use; it is not a replacement for every GSAP MatchMedia API or its global events.

Five meaningful unit tests verify rebuild/revert behavior, redundant notifications, independent ownership, inactive/failed setup, nested disposal, and legacy callback identity. No new dependency was installed.

## Repeated navigation after correction

The repository test harness is `playwright.redesign08-1.config.ts` with `tests/redesign08-1-browser/lifecycle.spec.ts`. It inherits exact verified-local-database and presentation guards. Its browser-only instrumentation observes native listener registration/removal before application startup, keeps weak references to scene roots/query objects, and records Chrome DevTools metrics after explicit GC. No application instrumentation hook is shipped.

Each project completed **30 tours / 120 client-side route transitions**, with consistent activation of homepage scenes, followed by motion-off, resume and live system reduced motion.

| Mode                  | Tours 0 / 1 / 5 / 10 / 20 / 30: desktop callbacks | Tablet callbacks | Tall callbacks | Detached roots after warmup |
| --------------------- | ------------------------------------------------- | ---------------- | -------------- | --------------------------- |
| Public production     | 8 / 8 / 8 / 8 / 8 / 8                             | 7 throughout     | 1 throughout   | 0                           |
| Protected development | 9 / 9 / 9 / 9 / 9 / 9                             | 8 throughout     | 1 throughout   | 5, stable                   |

All other scene condition callbacks also remained constant. On motion-off/reduced motion the scene tablet/coarse/short/tall callbacks are zero; only the mounted navigation breakpoint, shared reduced-motion preference, protected gallery's mobile watcher where applicable, and library orientation subscriptions remain. These active consumers must not be treated as stale scene listeners.

### Development detached-node control

The first corrected run passed production but failed an overstrict assertion requiring zero detached roots in development: five roots remained from the first homepage. Their count did not increase through tour 30. A separate five-tour protected control temporarily used the original two `gsap.matchMedia()` calls and automatically restored the exact current source in `finally`. It reproduced the same five retained roots at tours 1 and 5, as well as stale scene queries after motion-off (desktop callbacks 54).

The final assertion therefore requires zero detached scene roots in production and **no increase over warmed-up retention in development**, while independently requiring stable scene callbacks and their removal on motion-off. It does not relabel the development nodes as collected. Four of the retained scene roots have no transformed/opacity-styled descendants; the generic root has six, which alone does not establish active GSAP ownership. The precise retaining path of these pre-existing development roots has not been proven by a heap retaining-path analysis. Unit ownership checks and motion regression tests establish animation cleanup within their executed scope; DOM reachability alone cannot establish an active animation leak.

### Memory observations and limits

Final post-GC `JSHeapUsedSize`, bytes:

| Mode                  |     Tour 0 |     Tour 1 |     Tour 5 |    Tour 10 |    Tour 20 |    Tour 30 |
| --------------------- | ---------: | ---------: | ---------: | ---------: | ---------: | ---------: |
| Public production     |  6,945,536 |  8,919,780 |  9,475,452 |  9,840,296 | 10,228,672 | 10,603,008 |
| Protected development | 20,570,988 | 45,332,728 | 45,117,356 | 47,686,648 | 48,640,124 | 48,142,048 |

Public DOM nodes stabilize at 2177 and event listeners at 511 after tour 1; protected nodes stabilize at 4441 and event listeners at 987. Native scene query object counts match their constant callback counts. These are materially stronger lifecycle observations than an assertion based only on heap size.

Production heap still drifts upward. Development includes compilation/HMR and route caches; both modes include browser/framework caches, allocation timing and the test's growing weak-reference/registration metadata. Explicit GC and a 30-tour finite sample cannot prove a plateau, isolate every allocation or guarantee bounded memory. No artificial heap threshold was used to turn these observations into a memory pass.

## Remaining ScrollTrigger library retention

Installed `ScrollTrigger.enable()` creates an internal `gsap.matchMedia().add("(orientation: portrait)", ...)` owner around line 1376 of `node_modules/gsap/src/ScrollTrigger.js`. Disabling/re-enabling the engine registers another internal orientation query. The application route soak keeps this count at one, but motion-off/resume raises it to two.

A separate blank-page ScrollTrigger-only control ran ten disable/enable cycles with **zero ScrollTriggers throughout**: orientation callbacks increased from **1 to 11**, and 11 query objects remained after GC. This is confirmed library subscription accumulation, independently of scene ownership or React. It is not justified to describe all persistent callbacks as necessary, nor to claim this correction removes every duplicate GSAP callback.

No global listener interception, installed-library patch, dependency upgrade or removal of the existing engine-disable behavior was added to conceal it. Such approaches need a separate reviewed decision because they affect shared ScrollTrigger lifecycle or the locked dependency. The focused application-owned correction is ready for review; repeated engine toggles and longer sessions remain an explicit lifecycle risk.

## Validation results

| Check                                                | Result                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| Full unit suite                                      | PASS, 91/91 (86 existing + five ownership tests); no skips  |
| ESLint                                               | PASS                                                        |
| 30-tour protected development + public production    | PASS, 2/2                                                   |
| Motion browser suite                                 | PASS, 8/8                                                   |
| Hero browser suite                                   | PASS, 9/9                                                   |
| Approved gallery motion laboratory                   | PASS, 9/9; DB-disconnected lab only                         |
| Partners / Footer / signature browser suite          | PASS, 9/9                                                   |
| Contact reverse-scroll / field focus / preferences   | PASS, 1/1; read-only selected case, no form submit          |
| Production private-media security                    | PASS, 8/8                                                   |
| Protected presentation and production denial         | PASS, 27/27                                                 |
| Cross-page responsive/accessibility/hydration checks | PASS, 18/18                                                 |
| Final TypeScript                                     | PASS                                                        |
| Final production build + media gates                 | PASS; 17 registered assets and 53 private deployment traces |

The protected suite verifies the existing coin at 0°, 90°, 180°, 270° and 360°, reverse scrolling, breakpoint/reduced-motion behavior, Story/Team geometry and exact style restoration, presentation session/media denial and six protected partner marks at 1440/1024/768/375px. Gallery regressions preserve its existing pointer/keyboard/modal and static fallbacks. No human visual approval is inferred from automated assertions or captures.

The isolated baseline fails and five-tour legacy control failure are intentional diagnostic outcomes, not successful regressions. The initial corrected 30-tour attempt was 1/2 because of the pre-existing five development roots; the legacy control established the basis for the revised warmed-up retention assertion, and the final 30-tour run is 2/2. A Contact wrapper initially failed before launching a server because Playwright resolved its relative command from `.local/redesign08-1`; setting that ignored wrapper's server `cwd` to the repository fixed the harness. The selected Contact case then passed without application changes. All these logs are retained separately.

In total, **91/91 relevant browser cases passed** across the final runs above. This is a scoped rerun, not a claim to have repeated all 164 historical Redesign 08 cases or the destructive database-fixture suites. The broad cross-page suite covers ten routes at 375, 390, 768, 1024, 1440 and 1920px, plus 320px enlarged text, automated accessibility, hydration and scrolling observations. No Safari, physical-device, Linux or field-memory certification is inferred.

Browser commands exited normally and their own server teardown completed; no forced successful exit or skipped cleanup was introduced. Independent native port inspection after the browser runs showed their application ports released, with the existing PostgreSQL process still listening on 55432. Viewing-code cleanup belongs to the protected harness; the public-only config deliberately omits it to avoid touching a user-owned presentation session.

The final read-only snapshot is byte-identical to the pre-investigation snapshot: **all 15 database table fingerprints/counts unchanged**, including 45 Instagram records with zero published and zero homepage flags. All **14 pre-existing Redesign 08 file hashes remain identical**. `git diff --check` passes. The final production artifact passes both public-file and private deployment-trace gates; all 17 BLOCKED assets and 85 PENDING REVIEW axes retain their restrictions.

Full command logs and exit-status JSON are ignored under `.local/redesign08-1/`: `unit-final`, `lint-final`, `typecheck-final`, `build-final`, `route-tours-final`, `motion`, `hero`, `orbit`, `partners-footer`, `contact-reverse-final`, `media-security`, `presentation`, and `cross-page-final`. The earlier failing Contact launch remains in `contact-reverse`; the aggregate first-batch result correctly remains nonzero for that launch failure. Baseline/control observations are in `before`, `legacy-private-control`, `library-probe.json` and `orientation-probe.json`; final 30-tour measurements are in `after/<project>/observations.json`. The initial corrected run is preserved separately in `after-initial`.

## Files changed in 08.1

- `src/lib/motion/media-context.ts` — explicit scoped native subscription owner, retained from the interrupted implementation.
- `src/lib/motion/runtime.ts` — import/use the helper; animation recipes unchanged.
- `src/lib/motion/company-story.ts` — import/use the helper for nested story conditions.
- `tests/media-context.test.ts` — five lifecycle tests, retained from the interrupted implementation.
- `playwright.redesign08-1.config.ts` — read-only protected/public lifecycle harness, including public-only mode when the presentation port is occupied.
- `tests/redesign08-1-browser/lifecycle.spec.ts` — 30-tour query/DOM/heap observations, preference cleanup and stabilization assertions.
- `docs/CINEMATIC_REDESIGN_08_1.md` — this report.

Ignored `.local/redesign08-1/` helpers retain logs, controls and measurements; private runtime catalogs, viewing codes and screenshots remain ignored. Existing Redesign 08 changes are separate preserved work. No package/lockfile, schema, permission rule, original media, artwork, stylesheet or animation recipe changed in 08.1.

Stop for technical review. No commit, push, merge, deployment or further redesign is authorized or performed.
