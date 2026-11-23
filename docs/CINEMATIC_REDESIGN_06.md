# Cinematic Redesign 06 — Floating Memories

## Initial state and preserved work

On 24 October 2026, the checkout was `feat/cinematic-redesign-05` at `809fa76`, with Redesign 05 still uncommitted. Local `main` and the cached `origin/main` reference were also at `809fa76`. The recent history included the Zod security and lazy-image readiness fixes. The working tree also contained the user's additional `scripts/local-postgres.mjs` edits. No Redesign 05 commit or merge was present locally, and no visual approval is inferred from its implementation report. The explicit Redesign 06 brief authorizes this gallery work.

Before branching, all ten changed/untracked files were copied into ignored `.local/redesign06-recovery/20261024-pre06/`, with a SHA-256 manifest, tracked patch and Git status. Every copied file was checksum-verified, and all ten working files matched again after `git switch -c feat/cinematic-redesign-06`. Eight prior files remain byte-identical. The other two shared files receive the gallery-specific browser assertion and trace changes described below. The user's PostgreSQL launcher and all Team source/report files were preserved unchanged.

No staging, commit, push, merge, deployment, dependency update, business-data write or media approval change was performed. Next.js 16.4.1, GSAP 3.15.0 and locked Zod 4.6.6 remain in place. No new package was installed.

## Reference interpretation

The named `20261024-1145-27.3593674.mp4` was not available in the session attachments and was not inspected. The live [IEEE FSS reference gallery](https://cs-fss.ieee.tn/#gallery) was visually inspected, including its surrounding photographs and a transition. The written brief supplies the interaction requirements. This implementation uses original geometry and SAKADO's existing image delivery; no reference code, text, branding or photographs were copied.

## Shared component and integration

`Gallery` now selects `FloatingMemories` for cinematic photographs. The official homepage, `/gallery` and `PresentationGallery` all use that component. The homepage uses its existing six-item preview limit and a shorter scene. The full protected gallery retains all twelve catalog photographs. The authorized presentation shows its private selection in the gallery position without an additional empty public-gallery box above it.

Existing noncinematic galleries and explicit demo illustrations retain their established grid/viewer behavior. This preserves the Phase 04 illustration-based lazy-image readiness tests without editing their helper or assertions. No unrelated homepage section was reordered or redesigned.

The new editorial headline is “Nos aventures en images.” with “Des instants vécus, des souvenirs à partager.” The existing settings do not provide dedicated editable photo-gallery heading fields; no CMS schema or settings contract was invented. `galleryPreview`, CMS photo captions, categories, eligibility and ordering remain authoritative.

## Spatial geometry and navigation

The scene has CSS perspective and a `preserve-3d` rig. Every photographic panel has a stable media ID and a calculated `translate3d`, `rotateY`, `rotateX` and `rotateZ`. The active panel is front-facing at `z = 0`; surrounding panels recede in depth and take different vertical positions. The controls live outside the rotating rig.

For `n` images, angular pitch is `2π / min(n, 8)`. Each relative offset samples the same orbit:

```text
θ = relativeOffset × angularPitch
x = radius × sin(θ)
z = depth × (cos(θ) − 1)
y = rise × [−0.45 × (1 − cos(θ)) + 0.35 × sin(2θ)]
```

Orientation follows the same angle, with maximum yaw 32°, pitch 7° and roll 4°. The shared phase advances or reverses for every mounted panel together. This is a coordinated 3D orbit, not horizontal translation of a row. Browser tests inspect nonzero depth/yaw during the transition and a front-facing settled destination.

The resting render window is at most seven panels on desktop/tablet and five on mobile. A direct secondary selection temporarily unions the old and destination windows: at most ten desktop panels or seven mobile panels. Distant entering/exiting panels fade at the rear window boundary. Offsets unwrap against the journey midpoint so backward selection and last/first transitions do not suddenly reinsert a panel on the wrong side. A single photograph has no rotation; two photographs use opposing positions on the same simplified orbit. Zero photos render an honest empty state with no invented photo panels.

An immediate ref lock rejects additional requests during a transition, and Previous/Next/Open controls are disabled while it settles. There is no competing timeline or automatic rotation. Counter, caption, active ID and accessible current-photo state commit together at completion. Desktop single-step movement lasts 0.92 seconds with `power2.inOut`; longer secondary selection is bounded to 1.25 seconds. Mobile/coarse-pointer transitions last 0.48 seconds. Motion off, save-data or reduced motion select the destination immediately.

GSAP is imported only when interactive motion is requested. One scoped context owns the numeric phase tween; no React state or layout reads occur in its frame callback. Cleanup cancels the context and restores the canonical destination pose after GSAP reversion callbacks. Async imports cannot restart a disposed instance. There is no autoplay, custom perpetual frame loop, wheel interception, pinning or extra ScrollTrigger. Existing page introduction motion remains separate from selection.

## Responsive behavior and accessibility

The scene scales its radius, depth, perspective and panel dimensions at tablet/mobile breakpoints. Mobile has fewer surrounding panels, smaller physical travel/depth, shorter transitions and vertically reflowing controls. `touch-action: pan-y` preserves native vertical scrolling. A swipe requires more than 45 px horizontally and a horizontal distance greater than 1.4 times its vertical distance. Vertical gestures leave selection unchanged.

The carousel has labeled Previous/Next buttons, scoped Left/Right keyboard navigation, visible focus, an active-photo status/counter, real image alternatives and native image links. Adjacent visible panels support pointer selection; farther overlapping panels remain selectable by keyboard. The native modal viewer supports Escape, a close control, focus containment and restoration to its opener. It uses the same authorized full derivative URL and reports unavailable images without trapping navigation.

All photo links remain available through “Parcourir toutes les photos”, rendered in server HTML. Without JavaScript, those links open the media directly through its normal authorization route. Slow loading reserves the same scene space; resource and decode failures show a labeled fallback and disable opening that failed photo. Navigation to another photo remains available. Filtering or changed media identity remounts the local selection safely. System reduced motion always wins over MotionToggle.

The section adds no blue/violet gradient or isolated black band. It keeps the inherited site background, existing type/color tokens and a diffused forest-green glow. The inherited global environment currently includes navy tones; this phase does not repaint unrelated sections.

## Media, database and security boundaries

The existing `getGallery()` still enforces confirmed/published/authorized records, parent visibility, public media readiness and stored order. The component does not select private files or grant publication. With no eligible public photographs, the homepage and `/gallery` show the public-safe fallback.

The existing `getOfficialPresentation()` still verifies the local session and each allowed source/derivative hash before returning display DTOs. The gallery and viewer retain its protected `/dev/presentation-media/…` URLs with `unoptimized` image delivery. Access expiry, integrity checks, origin/host restrictions, optimizer denial, no-store responses and production denial were not changed. No private file, token, local source path, rights-holder record or approval evidence was added to public assets or committed source. All 17 media entries remain blocked and 85 approvals remain pending review.

At the initial media check the existing database and preview server were already running, but the preview access-code file was absent. The supported preview launcher was restarted; a fresh authorized session retrieved and decoded all twelve gallery photographs before implementation. An attempted second database start refused the occupied service; no database was initialized or replaced. The user's launcher changes were not modified or represented as repaired.

Automated Redesign 06 database checks use `scripts/test-redesign06.mjs`: it refuses an occupied port, creates a fresh ignored PostgreSQL cluster on loopback 55446, generates its own URL, verifies the actual database name/user/data directory, and applies the existing migrations only there. It never targets the existing SAKADO database or uses private images as fixtures. The script overrides the database environment before Prisma's normal environment loading. The DB-free laboratory mode cannot start the production project. Temporary clusters are stopped after validation.

## Validation results

| Check                                                          | Result                                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                            | Passed                                                                                                                          |
| `npm run lint`                                                 | Passed                                                                                                                          |
| `npm test`                                                     | 84/84 passed, including orbit-window and wrap math                                                                              |
| `npm run build`                                                | Passed; 17-asset public media gate and 53 deployment-trace private exclusion gate passed                                        |
| `npm audit --omit=dev --audit-level=high`                      | Passed; zero vulnerabilities                                                                                                    |
| `npm run check:secrets`                                        | Passed                                                                                                                          |
| `node scripts/test-redesign06.mjs`                             | 10/10 passed on a fresh verified disposable database                                                                            |
| `npm run test:phase04`                                         | 9/9 passed; original lazy-image readiness coverage unchanged                                                                    |
| `npm run test:hero`                                            | 9/9 passed                                                                                                                      |
| `npx playwright test --config playwright.redesign04.config.ts` | 8/8 passed                                                                                                                      |
| `npm run test:presentation:security`                           | 6/6 passed                                                                                                                      |
| Read-only authorized private-media review                      | 12/12 distinct photographs decoded through a complete wrap; viewer/Escape/focus return and 1440/1024/768/375 px captures passed |

The gallery suite covers forward/reverse depth, wraparound, rapid requests, pointer and keyboard secondary selection, counter synchronization, viewer focus/Escape, MotionToggle during movement, reduced motion, four widths (1440/1024/768/375), a short viewport, enlarged text, swipe/vertical gestures, zero/one/two/many/filtered photos, slow/broken/undecodable images, no JavaScript, production lab denial, public fallback, Team/history continuity, admin denial and optimizer restrictions. Early development failures exposed cleanup, hit testing, viewer focus and zoom defects; these were corrected before the complete passing run.

The previous full Redesign 05 private suite remains historically **18/20**, with two `chrome-error://chromewebdata/` navigation failures after login. It is not relabeled as passing. That suite is configured against the existing developer database, so it was not rerun as a database-dependent suite under this brief's disposable-database requirement. Its gallery assertions now validate all twelve images by cycling the bounded window; production/session/hash assertions were retained. Failure traces are now retained in its existing ignored output directory for a future authorized run. The narrower read-only protected-media review is not a substitute for that full suite.

Browser results are local Windows Chrome evidence, not a Linux CI or physical mobile-device certification. No browser package or dependency was upgraded.

## Local visual and performance evidence

After the final control reflow refinement, all four responsive/zoom/swipe cases passed again and the production build gates passed again. Final protected captures confirmed the twelve-photo gallery at all four widths and the six-photo homepage at 1440/375 px, with no horizontal overflow. The temporary preview was stopped for handoff; the database service already running before this phase was left alone.

All captures are in ignored `.local/redesign06/`. `lab-1440.png`, `lab-1024.png`, `lab-768.png` and `lab-375.png` use explicitly labeled laboratory illustrations, not production photo records. Protected gallery captures use `private-gallery-*.png` and must stay local. `private-review.json` holds aggregate review/frame observations only. A failed protected review retains its trace there; no private capture belongs in Git or public documentation.

The implementation has bounded mounted image counts, lazy derivative loading and one larger derivative only when its viewer opens. The complete catalog is text links, not full-resolution image elements. There is no permanent `will-change` or additional rendering engine. Local timing samples are observations only; no 60 FPS, Safari, low-end phone or production performance claim is made.

The warm Windows Chrome protected-gallery sample recorded 120 intervals during Next/Previous interaction: median 8.4 ms, p95 24.9 ms and zero intervals over 50 ms. It does not measure cold network latency or qualify a representative physical device.

## Files for this phase

- `src/components/floating-memories.tsx` — reusable interactive gallery and viewer.
- `src/components/floating-memories.module.css` — responsive perspective scene and controls.
- `src/lib/motion/photo-orbit.ts` — pure periodic geometry/window calculations.
- `src/components/gallery.tsx` — opt-in photograph integration, legacy demo/detail compatibility.
- `src/components/company/presentation-gallery.tsx` — retain the shared empty fallback when every protected photograph is unavailable.
- `src/app/(public)/page.tsx` — shared gallery preview and editorial copy.
- `src/app/(public)/gallery/page.tsx` — full shared gallery/public/private selection.
- `src/app/dev/photo-orbit/page.tsx` — development-only, DB-free synthetic laboratory; 404 in production.
- `tests/photo-orbit.test.ts` — window/loop/geometry checks.
- `tests/redesign06-browser/orbit.spec.ts` and `public.spec.ts` — focused behavior/security checks.
- `playwright.redesign06.config.ts` and `scripts/test-redesign06.mjs` — isolated validation.
- `tests/presentation-browser/presentation.spec.ts` — all-twelve-image traversal through the bounded window.
- `playwright.presentation.config.ts` — retain private failure traces locally.
- `docs/CINEMATIC_REDESIGN_06.md` — this record.

Other files still shown by `git status` belong to the preserved Redesign 05/user work listed in the recovery manifest.

## Exact local review procedure and remaining limits

1. In PowerShell, `cd C:\Users\Dell\Desktop\sakado_web`. Use Node 24. If the existing PostgreSQL service on 55432 is already running, leave it running. Otherwise, use a separate terminal with `npm run db:local` to start the existing configured persistent cluster. Do not initialize/reset it or run fixtures.
2. Stop any prior Next development server for this repo through its terminal. Run `npm run dev:presentation`. Open `http://127.0.0.1:3134/dev/presentation`. Privately enter the fresh code from ignored `.local/official-presentation/access-code.txt` within five minutes. The viewing session lasts at most one hour; an expired code requires restarting the supported launcher.
3. Open `http://127.0.0.1:3134/gallery`. Review the actual photographs at 1440, 1024, 768 and 375 px, including a short viewport. Use Previous/Next, last/first wrapping, a visible secondary photo, keyboard Left/Right and mobile swipe. Check the active image/counter, viewer opening, Escape and focus return. Switch MotionToggle off/on and enable system reduced motion.
4. Open the homepage in the same authorized session and review the smaller six-photo composition in its existing gallery position. Review the private screenshots locally; never share the access file or expose this loopback service.
5. To review the official public fallback, stop the protected launcher, run `npm run dev`, and inspect `http://127.0.0.1:3000/gallery` and the homepage. No private photographs are expected there while publication remains blocked.
6. For repeatable checks, stop the development preview first, run `npm run build`, then `node scripts/test-redesign06.mjs`. For the DB-free laboratory only, set `$env:REDESIGN06_LAB_ONLY='true'` and run `npx playwright test --config playwright.redesign06.config.ts`; unset it afterward with `$env:REDESIGN06_LAB_ONLY=$null`.

Human visual approval, the unresolved full private-suite navigation failures, unavailable recording, real-device/Safari/Linux validation and media publication decisions remain separate limits. No Redesign 07 work has begun.
