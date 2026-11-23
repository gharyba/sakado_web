# Cinematic Redesign 08 — final integration and quality assurance

Review date: 25 October 2026. Target: the official application and its existing protected local presentation. This report records local Windows evidence, not deployment or publication approval.

## 1. Executive summary

The reference checkout was clean on `feat/cinematic-redesign-08`, at `59a10b284833c655d38a903c4682290bf3f39947` (`59a10b2`). The reference commit exists and contains Redesigns 05–07.2 and the floating coin implementation. No reset, Git staging, commit, push, merge, deployment, dependency change, schema change or persistent database migration was performed.

Corrections are limited to shared color consistency and text reflow. The global file named `forest-environment.css` still declared a navy/blue/purple theme. Its color values and the existing ambient gradients now use the Midnight Forest values already present in Partners, Contact and Footer. Gradient geometry, section composition and animation timing remain intact. Enlarged hero words and the public footer wordmark can now wrap within their existing containers.

The final coin flip has implementation and rendered-angle evidence, but explicit human visual approval was not established. It remains unchanged and requires review. Private photographs and the six partner marks remain private; all 17 library assets remain BLOCKED and all 85 source approval fields remain PENDING REVIEW.

The final listed suites pass 86 unit cases and 164 browser cases. This is not an unrestricted cleanup or production-readiness clearance: a measured GSAP native media-query retention issue remains unresolved, alongside the external infrastructure, rights and human-approval gates described below.

## 2. Scope and baseline

Read the architecture, design/motion/database contracts, official presentation guide, previous cinematic reports through the 07.2 correction addendum, production/staging readiness material, relevant installed Next.js CSS guidance, test configurations and guarded fixture runners. Local runtime is Node 24.19.0 on Windows x64; the locked application uses Next.js 16.4.1 and GSAP 3.15.0.

The working tree was clean before work. The official persistent PostgreSQL cluster was started only through the existing guarded helper: existing `PG_VERSION`, free loopback port, exact database/user and actual data-directory identity are checked. No initialization, seed, migration, credential or `.env` edit targets that cluster. Before/after table counts and row fingerprints are recorded in READ ONLY transactions; row payloads are not exported.

New screenshots, browser traces, measurement JSON and logs stay under ignored `.local/redesign08/`. Original private media paths, access codes, credentials and participant payloads are excluded from this report and Git.

At handoff, all 15 persistent table counts/fingerprints match the pre-audit READ ONLY snapshot; all 45 imported Instagram records retain `published=false` and `showOnHomepage=false`. The owned PostgreSQL helper and QA servers are stopped, their ports are closed, and the temporary presentation access-code file is absent. The schema, lockfile, media registry, gallery/motion implementation, company membership and signature artwork also compare unchanged against the reference commit.

## 3. Full-site quality review

The new read-only audit covers `/`, `/about`, `/experiences`, `/events`, `/destinations`, `/adventures`, `/gallery`, `/gallery?view=instagram`, `/contact` and `/privacy`, both in official production mode and the protected development presentation. It checks HTTP success, one main landmark, one accessible h1, navigation, the signature mail link, horizontal reflow and hydration/runtime errors. Empty official event/destination collections remain honest; no business listings were invented. Demonstration detail routes are exercised separately by the historical DB-disconnected suite.

Existing hero composition/camera/headline, company narrative, discovery cards, two permanent team members, orbital gallery, partner band, Contact form and handwritten SVG remain in their established components. Only four application CSS files change. The gallery implementation, 3D geometry, selection logic, signature artwork, logo artwork, business services and authorization code are byte-unchanged from the reference commit.

## 4. Visual inconsistencies and corrections

| Finding                                                                                                     | Evidence                                                                                                                                                                     | Correction                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global navy/purple contradicted the specified Midnight Forest and the local Partners/Contact/Footer palette | Reference `forest-environment.css` explicitly called itself “Deep navy” and used `#080e1b`, `#0c172b`, `#242449`, `#30283e`; ambient planes also used blue/violet RGB values | Reuse existing night `#07110f`, pine `#0b1714`, moss `#10201b`, forest `#163126`, sage `#b2beb4`, ivory `#f2efe6`, gold `#c9a675`; retain existing gradient positions/stops and motion owners |
| Public document width reached 366px at a 320px viewport with 200% text                                      | Baseline `text-reflow.json` identified the footer Brand text span; hero inline word spans also exceeded their line boxes                                                     | Allow the footer wordmark span to shrink/wrap; cap hero word spans to the line width and allow emergency word wrapping                                                                        |
| Initial audit section screenshots captured lazy partner images before decoding                              | Screenshot showed reserved neutral supports while dedicated media checks could load the marks                                                                                | Test capture now scrolls each image into view, waits for actual dimensions and `decode()`, then captures; application lazy loading is preserved                                               |

Reviewed protected desktop/mobile captures show the existing composition on the continuous forest background, all six native-color partner marks and the unchanged signature. Blue sea/sky in supplied photography is image content, not an unintended page-background palette. No section was redesigned.

## 5. Animation findings

Source review finds scoped GSAP contexts and media queries, explicit observer/listener cleanup, one hero timeline with separate outer translation/scale and inner coin rotation, one gallery phase tween, and no autonomous gallery/coin loop. Contact controls stay outside translated copy; the gallery controls stay outside its 3D rig. No new animation owner, pin or scroll interception was added.

Existing browser coverage checks forward/reverse hero, story, team, gallery and coin behavior; breakpoint/preference cleanup; mobile simplification; native route navigation; and no JavaScript fallbacks. The coin still completes its 360° turn during the first 55% of the existing movement timeline. It is decorative, hidden from assistive technology, and noninteractive; keyboard navigation cannot be trapped by it.

The new route-cycle measurement returns to the same homepage after About/Gallery/Contact tours. Global window/document scroll, resize, pointer and preference listener counts are identical across all three settled cycles in both modes. A separate native MediaQueryList retention issue is established below; global listener stability alone cannot certify the complete lifecycle.

## 6. Responsive results

All ten reviewed routes are checked at 375, 390, 768, 1024, 1440 and 1920px in public and protected modes. The audit asserts document width does not exceed the viewport and captures each route. The additional 320px/200% text regression passes after the reflow correction. Existing suites cover mobile dialog keyboard/focus restoration, touch/swipe, gallery controls, partner aspect ratio, no JavaScript and reduced motion.

The emblem's initial placement and movement are preserved. Its mobile proximity to the primary hero action is included in the pending visual review; it has `pointer-events: none` and does not block activation. Physical iOS/Android browsers, Safari, screen readers and an actual browser zoom/device matrix were not certified by these desktop-emulated results.

## 7. Performance measurements

Measured locally in desktop Chrome at 1440×900. Public measurements use the production build and actual official read services with blocked photographs absent. Protected measurements use the official development presentation; they are not production-photo benchmarks. No Lighthouse/PageSpeed score or field Core Web Vitals score is claimed.

| Observation                                          | Official public production | Protected development                                  |
| ---------------------------------------------------- | -------------------------- | ------------------------------------------------------ |
| Warm synthetic forward/reverse scroll                | 180 frame intervals        | 180 frame intervals                                    |
| Median / p95 interval                                | 8.3 / 8.5ms                | 8.3 / 16.6ms                                           |
| Intervals above 50ms / observed long tasks           | 0 / none during sample     | 0 / none during sample                                 |
| Layout-shift sum during this warm sample             | 0                          | 0                                                      |
| Homepage script decoded-body bytes                   | 649,365                    | 484,065                                                |
| Script transfer bytes observed                       | 211,884                    | 7,200; most scripts already cached after private login |
| GC-observed JS heap before / after three route tours | 4.75 / 7.37MB              | 19.10 / 45.19MB                                        |
| DOM node count before / after                        | 2,042 / 2,088              | 2,561 / 2,563                                          |

All 36 emitted static JavaScript files total 1,039,672 bytes, or 340,779 bytes when each is gzip-compressed locally. This is the whole build's static JavaScript, not the initial route transfer budget. GSAP remains imported through the existing lazy motion architecture; no dependency or client boundary was expanded. System fonts require no new font download. Existing reserved image dimensions, bounded gallery mount window and private unoptimized delivery remain intact.

**Unresolved lifecycle risk:** total listener counts rose by 24 on each animated route tour after warmup (488 → 512 → 536 in production). With system reduced motion, they flattened at 416 across all three tours. A test-only WeakRef diagnostic, sampled after garbage collection, confirms that each tour retains four additional MediaQueryList objects for each of the six scene queries. Global scroll/pointer listeners remain fixed. The installed GSAP 3.15.0 source (`node_modules/gsap/src/gsap-core.js`, `MatchMedia.add`/`Context.kill`) registers native query listeners while reverting removes the context from its registry without explicitly unregistering those listeners. This matches the measured native-query retention. No growing retained scene-DOM count was established, and heap growth cannot be attributed entirely to this one source.

This is a demonstrated long-session performance/maintenance limitation, not a passing bounded-memory claim. A safe bounded query-ownership solution and a longer production-like soak require focused engine review; the pinned third-party library was not patched or upgraded during this visual-integration QA. No authentication or media boundary depends on this finding.

The existing official production load check also measured single unthrottled loopback loads at 375/768/1440px: LCP 152/160/264ms, CLS 0.00380/0.000241/0.000102, and TTFB 21.4/29.5/32.5ms. These are local reduced-motion observations with no real public photographs, not internet/mobile or field results; INP was not measured.

Evidence: ignored `bundle.json`, frozen `reviewed-performance-production.json` / `reviewed-performance-private.json`, each mode's diagnostic `performance.json` / `performance-static.json`, Phase 10 load measurements and command logs. Warm local measurements cannot establish cold mobile network performance, real-device frame rates or provider capacity.

## 8. Accessibility findings

Full-document axe checks with WCAG A/AA and 2.1 AA tags report no violations across nine reviewed routes in both modes. Automated success is scoped to the available content and cannot replace manual assistive-technology review. Existing tests exercise menu/dialog focus containment and restoration, keyboard gallery navigation/viewer, visible signature focus, `mailto:ygharbi955@gmail.com`, Contact labels/errors/busy state and no JavaScript operation.

Historical tests used raw split-word `textContent`, an outdated portrait label, removed footer selectors and unscoped h2 collections. They now assert the existing accessible hero name, current portrait label and the appropriate page/footer landmarks. No application content was changed to satisfy those selectors.

The stricter screenshot audit initially reported hydration differences containing only `style="caret-color:transparent"` on Contact inputs. That attribute is inserted by Playwright's default caret-hiding screenshot behavior. Using `caret: "initial"` removes that test mutation while retaining hydration warnings as failures. The corrected captures pass.

## 9. Security and backend findings

Reviewed server-side authentication, hashed opaque session lookup, role checks, mutation origin/rate/validation wrapper, media parent/publication checks, request-scoped presentation authorization and file-integrity checks. No business permission or authentication rule changed. Read-only browser checks cover anonymous admin denial, protected presentation isolation, expiry/logout/tampering behavior and production media/optimizer denial. Contact mutation regressions use synthetic records only in a fresh guarded test cluster.

Current npm advisory responses report **zero vulnerabilities for production and for the full locked dependency tree**. This supersedes older reports of five development-tool findings for this checkout; it is an advisory snapshot, not a general security guarantee.

The build's read-only gates retain all 17 BLOCKED assets, 85 PENDING REVIEW fields and private deployment-trace exclusions. The six partner marks are delivered only with the independent local viewing capability; public presentation/media routes fail closed. File presence, successful decoding and CMS flags grant no publication rights.

Production startup validates critical setting names without printing values; operational errors use fixed events. The Prisma client is shared per development process, with normal application-process pooling rather than construction/disconnection on every request. Hosted connection pooling/TLS and provider log redaction remain unverified. Existing CSP still permits inline scripts/styles; nonce-based hardening would require a separate reviewed change. No new injection path or authorization defect was demonstrated by this scoped review.

## 10. Executed tests and failure classification

Full command output and exit status are retained in ignored `.local/redesign08/`. Browser commands run sequentially in the normal Windows environment because earlier agent-sandbox identity/ACL/process restrictions are documented environment failures; no `os.userInfo()` workaround or permission bypass is used.

| Check                                                                  | Current result                                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| TypeScript / ESLint                                                    | PASS                                                                         |
| Unit tests                                                             | 86/86 PASS                                                                   |
| Production build and pre/post media gates                              | PASS; 17 registered assets and 53 deployment traces                          |
| Production / all-dependency npm audits                                 | PASS; zero vulnerabilities in each                                           |
| New cross-page QA                                                      | 18/18 PASS                                                                   |
| Decoded captures, hydration and settled-memory follow-up               | 6/6 PASS                                                                     |
| Navigation                                                             | 10/10 PASS; baseline was 9/10                                                |
| Hero                                                                   | 9/9 PASS                                                                     |
| Motion                                                                 | 8/8 PASS                                                                     |
| Phase 04 media                                                         | 9/9 PASS                                                                     |
| Redesign 04 discovery                                                  | 8/8 PASS                                                                     |
| Redesign 06 gallery                                                    | 10/10 PASS                                                                   |
| Redesign 07 Contact/Footer                                             | 13/13 PASS after correcting the old navy-token expectation                   |
| Partners/signature                                                     | 9/9 PASS                                                                     |
| Production private-presentation denial and safe database-outage health | 8/8 PASS                                                                     |
| Historical Phase 09 company suite                                      | 14/14 PASS; baseline 4/14                                                    |
| Official Phase 09B / Phase 10 public                                   | 16/16 and 5/5 PASS after landmark-scoped selector corrections                |
| Protected presentation including coin                                  | 27/27 PASS                                                                   |
| Native Windows / startup / tracked-secret / artifact-only preflight    | PASS; no Linux, database mutation or deployment is implied                   |
| Reduced-motion memory control / native query diagnostic                | Observations completed; retained-query growth remains an explicit limitation |

Baseline failures were reproduced before corrections: navigation's old ivory color expectation (9/10) and Phase 09's stale selectors plus real enlarged-text reflow defect (4/14). The first new accessibility/reflow run was 3/4, with the public 366px overflow. After correction, the initial full audit was 18/18. An enhanced capture follow-up was 4/6 due to Playwright's caret mutation; its corrected follow-up was 6/6 and the final complete strict audit was 18/18. The first broad batch also produced Contact 12/13 (old navy token), official Phase 09B 14/16 (footer headings included as activities) and Phase 10 public 4/5 (SVG title included as document metadata). The corrected complete suites passed 13/13, 16/16 and 5/5 respectively. The protected presentation completed 27/27 without the earlier historical Chrome-error navigation or teardown hang. No failing test was disabled, and no forced successful exit was added.

One final artifact-only preflight was accidentally invoked inside the restricted agent sandbox and exited 1 when its read-only media-check subprocess could not start `tsx`. A direct diagnostic reproduced `os.userInfo()` → `uv_os_get_passwd ENOMEM` in that sandbox. The same final-artifact preflight exited 0 in the normal Windows runtime, matching the final build media gates. Both outcomes are retained separately (`handoff-artifact-preflight` and `handoff-artifact-preflight-normal`); no runtime workaround or permission relaxation was introduced.

Synthetic gallery/contact runners verify their newly owned database name/user/port/data directory before applying existing migrations or writing fixtures. They never consume the persistent cluster as fixtures. Real-site Contact submissions, admin mutations, imports, production migrations and full business integration fixtures against the existing database are not part of this audit.

## 11. Changed files

- `src/styles/forest-environment.css` — reuse established Midnight Forest color values across the official site.
- `src/components/home/ambient-background.module.css` — match existing ambient planes to the same palette; unchanged geometry/timing.
- `src/components/home/parallax-hero.module.css` — enlarged hero words wrap inside their line boxes.
- `src/components/site-footer.module.css` — public fallback wordmark wraps at extreme text enlargement.
- `tests/navigation-browser/navigation.spec.ts` — current forest canvas and navigation-scoped architecture assertion.
- `tests/phase09-browser/company.spec.ts` — current accessible names and landmark-scoped selectors; reflow assertions retained.
- `tests/phase09b-browser/official.spec.ts` — scope activity headings to the main landmark, excluding footer navigation headings.
- `tests/phase10-browser/public.spec.ts` — inspect the document's `head > title`, excluding the signature SVG title.
- `tests/redesign07-browser/layout.spec.ts` — assert the corrected shared forest night token.
- `tests/presentation-security-browser/production.spec.ts` — prove safe health responses for an unreachable synthetic database and distinguish demo mode.
- `playwright.redesign08.config.ts` — inherits existing verified-local-DB/read-only presentation guards.
- `tests/redesign08-browser/quality.spec.ts` — six-width cross-page, decoded-capture, hydration, accessibility, reflow and measurement coverage.
- `docs/CINEMATIC_REDESIGN_08.md` — this evidence and readiness report.
- `docs/PRODUCTION_READINESS.md` — link the current scoped review and preserve external launch blockers.

Ignored local helpers only orchestrate checks, retain measurements or obtain read-only fingerprints; they are not deployment/application files. No package, lockfile, schema, `.env`, media approval registry or original asset changed.

## 12. Known limitations

The explicit final coin visual approval is still pending. The named SAKADO reference recording and red-outline screenshot were not supplied; the earlier IEEE clip is not evidence of approval. The existing implementation is preserved for human review.

Browser evidence is Windows desktop Chrome with emulated dimensions; no Safari, actual touch device, manual screen reader or field-performance certification is inferred. No public real event/destination detail record was available; synthetic/demo detail coverage is identified separately. Native media-query retention needs a reviewed lifecycle correction and longer production-like observation. Private media cannot be included in a public artifact to improve those measurements.

Linux workflow definitions are present, pinned and use Node 24/dummy or disposable PostgreSQL contracts. No Linux run for this candidate was executed or independently verified here. Historical user-reported CI is not relabeled as this candidate's evidence.

## 13. Production readiness and blockers

| Area                                         | Status                                | Evidence / required next proof                                                                                                                                   |
| -------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local source quality and production artifact | READY within the executed local scope | Passing build, media safety and listed regressions; human diff review remains                                                                                    |
| Managed Node/Next compatibility              | NEEDS VERIFICATION on the actual plan | Hostinger documents Node 24 and Next.js support; account tier, limits, start/build settings and Linux native modules need candidate-specific proof               |
| External PostgreSQL                          | BLOCKED                               | Dedicated provider/region, TLS, credentials, access rules, pooling and connectivity unprovisioned/unverified                                                     |
| Durable media                                | BLOCKED                               | Only the local adapter exists; verified external durable storage or provider mount plus redeploy persistence is required                                         |
| Domains, HTTPS and proxy                     | BLOCKED / NEEDS VERIFICATION          | Approved hostname, TLS termination, forwarding replacement, exact origins, secure cookies and HSTS decision need actual hosting evidence                         |
| Release/recovery                             | BLOCKED                               | Fresh release backup, restricted off-device recovery, retention, restore rehearsal and rollback ownership remain required                                        |
| Linux CI                                     | NEEDS VERIFICATION                    | No independently verified run for `59a10b2` plus this uncommitted patch                                                                                          |
| Media/legal/privacy/operations               | BLOCKED                               | 17 BLOCKED / 85 PENDING REVIEW; partner rights, legal identity/notices, retention/support and launch authorization remain unresolved                             |
| Hosted logging/monitoring and realistic load | NEEDS VERIFICATION                    | Access/redaction/retention, incident owner, native query engine and provider capacity checks required                                                            |
| Long-session animation lifecycle             | NEEDS VERIFICATION / CORRECTION       | Retained GSAP native MediaQueryList objects increase during route tours; global scroll/pointer cleanup passes but bounded long-session memory is not established |

[Hostinger's current Node.js application guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) lists Node 24 and Next.js and states that managed deployment directories are overwritten on deployment. Its [Node.js limits](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/) describe one long-running app process, plan limits and no custom extra services. These documents support compatibility planning; no provider account was changed or tested. The embedded local PostgreSQL cluster is development tooling and is not a proposed hosted database service.

## 14. Client presentation readiness

The authorized presentation uses the official routes/components/settings and verified local PostgreSQL, with both demo flags false. It is a loopback-only review environment with a separately expiring session, not a second website implementation or a publication route. Its guarded checks exercise protected photographs, six partner logos and the existing cinematic sections together.

The technical checks support a limited protected local client review, with the documented native-query retention limitation and pending human approval of the coin/final visual consistency. It does not imply permission to expose the presentation on a LAN, tunnel or external hostname. Access codes and protected screenshots remain private. Public production deployment is not safe to authorize while the infrastructure, lifecycle and rights gates above remain unresolved.

## 15. Recommended next actions

1. Review the uncommitted CSS/test/documentation diff and protected captures, including the unchanged coin and its mobile placement. Record explicit visual approval or specific corrections. Schedule a focused, regression-tested fix for the measured native media-query retention before calling long-session animation cleanup complete.
2. Obtain verified media/partner rights and complete legal/privacy/operational decisions through the existing evidence workflow; preserve blocked defaults until then.
3. Independently verify Linux CI for a reviewed candidate, then separately authorize and provision restricted external staging with its own secrets/database/storage.
4. Rehearse HTTPS/proxy/session behavior, durable-media redeployment, backup/restore/rollback, logging and longer memory/network/device tests on that environment before any production decision.

Stop after this QA/reporting phase. No deployment or following redesign is authorized by these results.
