# Cinematic Redesign 03 — scroll-driven company storytelling

Date: 2026-10-23. Scope: homepage About/company story, official `/about` and the reusable presentation/motion needed for those sections. **Redesign 03 only.** No hero, experiences, gallery, contact, footer, authentication, database or media-approval redesign. All work remains uncommitted; no branch switch, reset, clean, stash, commit, push or deployment occurred.

## Preservation before implementation

Inspected the current dirty worktree, About/story components and their existing diffs, confirmed company history, the shared motion lifecycle, server/client composition guide, protected presentation DTO/delivery, and the Redesign 00–02 reports. Historical reports' 16.4.0/security wording predates the Phase 10.1 patch; current package, lock and installation retain **Next.js 16.4.1**.

Before source edits, copied **all 360 tracked and non-ignored untracked working-tree files** into ignored `.local/recovery/cinematic-redesign-03-20261023-112247-0a423d/source/`. Every source/copy SHA-256 matched, then was independently rechecked. The recovery also includes binary-capable working-tree and index patches, branch/HEAD/status, sizes and hashes in `manifest.json`. Snapshot manifest SHA-256: **`a4457465c16fcd8600030202da93ee429c49f2d6cbfec597fb36ecd4def046f6`**. The original branch is `feat/official-client-presentation`, HEAD `0f8404a051bf9d1f816fc9135d7ec78bb0db0b1c`, with an empty index.

The snapshot covers the complete Git working-source state, including uncommitted official presentation, Redesigns 00–02 and Phase 10.1 work. Ignored PostgreSQL files, secrets and private media were retained in place rather than copied into a source snapshot. A new guarded read-only baseline additionally fingerprints **15 database tables/schema and 397 protected files**, including `.env`, lock/schema, media ledgers, existing private sources/derivatives and the hardware upload. Existing restricted external recovery was retained. This is a local recovery snapshot, not an off-device durability claim.

Final source comparison permits exactly seven existing files to change for this phase; all other pre-existing source files and the recovery copies match their initial hashes. The hero implementation/styles, ambient background, navy theme, private delivery/authentication, Next.js metadata/lock, security workflows and earlier reports remain byte-identical to the snapshot.

## Color decision and continuous environment

The pasted green Midnight Forest swatches differ from the current worktree. The user explicitly selected **the existing navy, ivory and gold** for this phase. The story inherits the established public variables (`--ink`, `--muted`, `--amber`, surface/border tokens); the environment stylesheet was not changed. Transparent section wrappers preserve the continuous page gradient. Bounded photographs and the closing image veil do not introduce full-width canvas color bands or large ivory sections.

## Implemented files

| File                                              | Responsibility                                                                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/company/company-story.tsx`        | New shared server-rendered three-chapter story, confirmed content, bounded eligible photo DTOs, labeled illustration fallback, intact CMS passages and semantic structure                         |
| `src/components/company/company-story.module.css` | Scoped responsive grid, shared sticky visual slot, image overscan/readability veils, masked headline words and wider closing composition                                                          |
| `src/lib/motion/company-story.ts`                 | New scoped GSAP/ScrollTrigger recipe; no business, auth, storage or database imports                                                                                                              |
| `src/lib/motion/runtime.ts`                       | Adds the opt-in recipe under existing scene/matchMedia cleanup; excludes only the new scene from the old timeline recipe to prevent double ownership                                              |
| `src/components/home/about-story.tsx`             | Thin adapter retaining its CMS copy API and delegating to the shared story                                                                                                                        |
| `src/app/(public)/page.tsx`                       | Supplies eligible existing gallery/presentation photos; removes the separate duplicate old timeline from this official route                                                                      |
| `src/app/(public)/about/page.tsx`                 | Reuses the story and existing eligible gallery loader; retains editable About/story/mission/values prose and team/contact presentation                                                            |
| `tests/presentation-browser/story.spec.ts`        | Five new focused read-only story cases, responsive source selection, forward/reverse sampling, geometry, cleanup, history and static fallbacks                                                    |
| `playwright.presentation.config.ts`               | Includes the new tests only in the existing private-development project; production-denial project remains unchanged                                                                              |
| `tests/phase04-browser/phase04.spec.ts`           | Adapts the old single-image check to the actual first-chapter scroll position and checks every new owned target during cleanup                                                                    |
| `tests/hero-browser/production.spec.ts`           | Reconciles stale assertions with the completed hero's accessible heading and independent page atmosphere; keeps static/no-image/native-link checks and explicitly checks development-route denial |
| `docs/CINEMATIC_REDESIGN_03.md`                   | Implementation, evidence, limitations and local review instructions                                                                                                                               |

`CompanyTimeline` and the older DB-disconnected private adapter remain intact. No new package, image asset, API, content fixture or schema change was introduced.

## Confirmed narrative and CMS handling

The three chapter years, titles and texts come directly from `src/data/confirmed/company.ts`, which was not edited:

1. **2017 — Le début d’une aventure:** Mohamed Ben Beya founds Sakado Sfax to share Tunisia's natural richness and authentic outdoor experiences.
2. **2022 — Une passion devient entreprise:** formal company establishment, preserving exploration, sharing and respect for nature.
3. **Aujourd’hui — Vivre la nature autrement:** present outdoor experiences, with the existing confirmed safety, nature, community, discovery and human-connection values.

No milestone, place, award, partner, commercial offering, booking policy or public photography right was invented. Homepage CMS About/story/mission/since-year passages remain readable server HTML. The official About page retains its existing CMS prose. Confirmed milestones remain the same shared facts used by the previous timeline; no CMS/database record was rewritten.

Eligible existing gallery photos illustrate the narrative; they are **not asserted to be archival photographs of 2017 or 2022**. Captions explicitly say that the visuals are illustrative and not historically dated. An additional notice identifies the local private sample as private presentation material.

## Animation architecture and choreography

`MotionScene` still controls lazy engine import, viewport activation, saved preference, reduced motion, save-data, visibility and teardown. The new recipe runs inside that context, with one owner per frame/camera/copy/word/progress target. A scoped nested media context handles the tall/short viewport transition. Initial inline styles and the initial layout attribute are restored exactly on cleanup. No global trigger kill, custom scroll listener, new animation engine, wheel interception or perpetual frame loop was added.

Each chapter contains **one image element**. Its responsive source variants are sizes of that same image, not independent depth planes. Desktop figures occupy one CSS-sticky visual slot and crossfade; the text remains in native chronological document order. The closing figure spans both grid columns and uses a stationary dark veil behind readable copy. No DOM node moving, duplicated photographic plane, GSAP pin spacer, extra scroll-distance spacer or horizontal journey is used.

| Target              | Desktop / fine pointer                                                                    | Tablet / fine pointer                               | Mobile / coarse pointer                                  |
| ------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| Chapter progression | One direct-scrub timeline from list top at 70% viewport to list bottom at 38%             | Same native progression in ordinary flow            | No scrubbed chapter/camera timeline                      |
| Photo transition    | Shared sticky figures crossfade over 0.32 timeline units                                  | Separate in-flow figures brighten from 0.72 opacity | Short 0.28s opacity entrance; no camera/mask travel      |
| Mask                | Bounded 10% lower inset opens to zero                                                     | Bounded in-flow mask                                | Static frame                                             |
| Camera              | Scale 1.045 → 1; alternating horizontal ±10px → 0, y +12 → −10px                          | Scale 1.025 → 1; horizontal ±4px, y +4 → −4px       | Transform none                                           |
| Headline            | Reversible masked words, yPercent 76 → 0, bounded stagger ≤0.2 total timeline units       | Same word progression; shorter copy/camera travel   | Fully readable static title                              |
| Copy                | Noninteractive wrapper y 6px → 0; paragraph emphasis 0.74 → 1                             | y 3px → 0                                           | Static copy                                              |
| Closing             | Wider two-column photograph, gold title, confirmed values and native next-section handoff | Wider in-flow closing frame with readable veil      | Full-width photograph followed by readable vertical copy |

Sticky enhancement requires desktop tier, height at least 800px, and actual list height minus camera height within **min(60vh, 600px)**. The camera is at most 52svh/560px high. Tall text or an unsuitable viewport keeps ordinary flow. Tablet, mobile, coarse pointers, short viewports and static preferences do not receive the shared sticky slot. Camera overscan keeps translated pixels inside the frame. Photographic scale stays within the existing generic 1.05 cap; the completed hero recipe and its separate allowance are unchanged.

## Accessibility and layout behavior

- One story h2 with semantic h3 chapters and a labeled ordered list; explicit list/listitem roles retain semantics with the grid's display-contents layout.
- The complete heading is its accessible name; the decorative split-word spans are aria-hidden to avoid duplicated speech. No live announcements on scroll.
- All content is visible in server HTML. System reduced motion wins; saved motion-off, save-data, hidden pages, failed engine import and no JavaScript leave the vertical readable baseline.
- Controls and the homepage About link sit outside translated/crossfaded copy. Native keyboard, focus, hash/navigation and browser history remain available.
- The same grid rows reserve layout before/after enhancement. At 1440×900 the measured list was **1008px**, unchanged through forward/reverse samples and motion-off cleanup (asserted within 1px).
- At 768px the images stay in flow; at 375px years, images and copy stack vertically, without horizontal overflow. Mobile image cameras remain untransformed.
- Source asset identity and rights checks remain server-side; responsive presentation never decides publication.

## Media, security and data preservation

Only the existing `getGallery` eligibility boundary or authorized `getOfficialPresentation` DTOs supply photos. Private originals/paths/hashes/permission evidence are not passed to the scene. Photos stay behind the existing expiring presentation session and per-request source/derivative checks. Images remain **unoptimized**, so the public Next optimizer does not cache private delivery. Native picture sources select the already existing small derivative below 700px; larger views use the existing larger derivative. No derivatives were generated or copied into public/Git/build output.

If no appropriate eligible image is supplied, the component uses the existing labeled `trail.svg`, `camp.svg` and `coast.svg` illustrations. Missing private slots do not grant permission or manufacture another original. A late private-byte failure remains denied by the unchanged media route; static story text/layout stays readable.

Final guarded read-only comparison matched all **15 database table/schema fingerprints and 397 protected file hashes**. All **45 Instagram records** remain generic, unpublished and homepage-off. All **17 media assets remain BLOCKED**, all **85 review fields PENDING REVIEW**, and publication remains disallowed. `.env`, PostgreSQL configuration, schema, private original/derivative bytes, source/feedback/readiness ledgers and held hardware are unchanged. No migration, fixture, real CMS mutation or approval change ran. The authoritative PostgreSQL service was retained; only the approved presentation pause/restart was needed for build/browser validation.

## Validation results

| Check                                                 | Actual local result                                                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js metadata, lock and installation               | **16.4.1 retained**; package/lock unchanged from snapshot                                                                                                                            |
| TypeScript and ESLint                                 | PASS; final checks on completed source/tests                                                                                                                                         |
| Existing unit suite                                   | **70 PASS**, 0 failed/skipped                                                                                                                                                        |
| Production build                                      | PASS, including final image-parent CSS compatibility correction; pre/post gate checks 17 assets and **52 private deployment traces**                                                 |
| Official presentation suite                           | **15 PASS**: existing 10 plus five new story cases; development photos/session/hash/production-denial behavior retained                                                              |
| Final focused story recheck                           | **5 PASS** after picture positioning correction; responsive small-source selection, no invalid image-parent warning, full-width closing, native reverse/cleanup/history/no-JS checks |
| Phase 04 media/fallback suite                         | **7 PASS** after correcting the single-image test's stale scroll-position assumption                                                                                                 |
| Official production/public suite                      | **5 PASS**: desktop/tablet/mobile reduced-motion load/accessibility, navigation/metadata and story cleanup, exact local DB guard, read-only interactions                             |
| Existing hero suite                                   | **9 PASS** after reconciling the stale production test with completed hero semantics; no hero implementation/style change                                                            |
| Audits                                                | Production **0 findings**. Full audit **5 high development lint-chain findings**, unchanged from Phase 10.1; exit 1 retained, no suppression, forced downgrade or package update     |
| Private/source preservation                           | 15 tables/schema + 397 protected files unchanged; all 360 snapshot copies reverified; only seven intended existing source files differ; branch/HEAD/index preserved                  |
| Formatting, source secret guard and scoped whitespace | PASS (all exit 0)                                                                                                                                                                    |

The broad browser run totals **36 passing cases**; the final affected-story recheck adds five repeat executions. These are local Windows/Chrome checks, not physical-device, screen-reader, Linux or hosted validation.

Initial failures and corrections: the old Phase 04 test centered a taller story then expected the first image to remain opaque; it now samples chapter one's actual timeline position while retaining opacity and expanded cleanup assertions. The older hero production test expected one raw text node and no page-wide GSAP; the completed hero already uses an accessible title and the ambient background has independent motion. The test now checks the correct accessible name and explicit production development-route denial. The application hero was not changed to satisfy it. Native picture sources initially produced a Next Image immediate-parent positioning warning; a positioned picture wrapper corrected it, and the five affected final cases pass without that warning. Existing development LCP hints during scripted scroll remain heuristics, not a cold-load performance measurement.

## Measured observations and limits

Five desktop samples at normalized progress **0.15 → 0.5 → 0.85 → 0.5 → 0.15** verified first/second/third visual activation, wider closing frame (>1.8× the regular frame), forward camera progress and reverse agreement, constant list height and exact style restoration after disable. Viewport height 700px switches to ordinary flow and 900px restores the suitable sticky composition. Both official routes were checked at 1440, 768 and 375px, including image load, no overflow and private URL/path containment. Authenticated no-JavaScript reading was checked on both routes.

The final lazy GSAP/ScrollTrigger/runtime chunk measures **126,167 bytes / 47,989 gzip bytes**. It remains above the original 30 KiB motion budget; this phase does not claim the budget passes. It is lazy and shares the existing engine. At most three story image elements are rendered, with existing small mobile sources, lazy loading and reserved frames. There is no permanent will-change hint, new blur, image export, dependency or scroll-driven React state.

No controlled photographic-story frame-rate, cold-network/CWV, physical mobile or screen-reader benchmark was run. The older hero performance harness measures that separate SVG hero, not this photographic story. Existing source resolution/crop limits and private group-photo composition need human visual review. True independent photographic depth still requires suitable supplied layers and legal authorization; none was synthesized. No external staging or public launch readiness is claimed.

## Visual review

1. Open the running loopback presentation at **http://127.0.0.1:3134/dev/presentation**. Use its freshly generated local code from the ignored `.local/official-presentation/access-code.txt`; the code is never printed here. It normally expires/deletes after five minutes, and an authenticated view lasts one hour. Keep PostgreSQL on its existing verified 55432 service; do not initialize/reset anything.
2. On `/`, scroll naturally past the existing adventures/experiences into **Notre histoire** (`#histoire`). At a suitable desktop viewport, inspect the 2017 → 2022 → Aujourd’hui camera/crossfades and the wide closing handoff, then scroll backward. Hero and other sections retain their completed design.
3. Open `/about` and repeat the shared chapter sequence beneath the intact editable prose. Inspect tablet/phone reflow, shorter viewport fallback, and the MotionToggle and system reduced-motion behavior. Use an authenticated no-JavaScript context for static reading.
4. Ignored review captures live in `.local/redesign03-review/`: home/About at 1440/768/375, desktop closing image and reverse samples. They contain private imagery and must not be copied into public assets, Git or deployment.

Final presentation restart verified: entry and health both HTTP 200, loopback-only 127.0.0.1:3134, expiring code file present without disclosure. The post-restart read-only preservation comparison again matches all 15 tables/schema and 397 protected files.

All changes remain unstaged for review. Stop after Redesign 03; Redesign 04 was not started.
