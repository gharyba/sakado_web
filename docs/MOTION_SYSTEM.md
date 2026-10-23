# SAKADO 2.0 — motion system

## Homepage scroll atmosphere and pointer light

The official homepage now mounts a decorative, aria-hidden `AmbientBackground` through the existing `MotionScene`. Its fixed layers sit behind content within the public page's isolated stacking context. The static navy/sapphire/indigo/dusk gradient remains available without JavaScript or when motion is off.

A single document-length ScrollTrigger crossfades three prepainted gradient planes; desktop travel is bounded to 48px total and mobile/coarse pointers receive opacity changes only. Fine-pointer mouse movement retargets two existing GSAP quickTo tweens per light, with a slower gold light trailing the blue halo. No replacement cursor, custom frame loop, wheel interception, animated blur or background-position repaint is added. All decorative layers ignore pointer events.

The shared animation toggle, system reduced motion, save-data and page visibility state control the entire scene. Media-context cleanup removes pointer listeners and the page-size observer, and the existing runtime restores owned inline styles and releases its triggers. This explicitly extends the earlier static public-atmosphere design under the user's scrolling-gradient and mouse-interaction request.

Latest official hero: [Cinematic Redesign 02](CINEMATIC_REDESIGN_02.md) supersedes the original subtle hero recipe only for opt-in `data-hero-cinematic` scenes. Its single photographic camera reaches scale 1.07 under the explicit redesign authorization; the generic Motion scale cap remains 1.05. It reuses this runtime's contexts, responsive cleanup and preference controller. Mobile/coarse pointers retain a short text entrance with no scrubbed camera. No photographic depth layers were supplied.

Status: Phase 01 engine and Phase 03 single-image hero choreography implemented, 2026-10-09. Motion enhances server-rendered content; it never owns business rules. Multi-plane choreography and approved image assets remain **TO BE CONFIRMED**.

## Boundaries

Server content services validate/query approved content and supply serializable display props. Components under proposed `src/components/motion/` own element refs, local progress and visual transforms only. They cannot import Prisma, auth, booking, admin mutations or storage services. No scroll event creates a booking, publishes content, sends analytics by default or fetches all records.

Phase 01 explicitly authorizes GSAP 3.15.0 and its bundled ScrollTrigger. No separate React animation package, smooth-scroll engine or WebGL dependency is added. A client scene dynamically imports the engine only when enabled, motion is allowed and its scope approaches the viewport. Phase 03 mounts a homepage scene but disables it when no hero media is selected; production's current asset-free hero loads no engine. CSS perspective remains the future gallery direction; no gallery was implemented.

## Enhancement levels

| Level                            | Behavior                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Baseline / JS unavailable        | Full readable HTML, static hero/story, linked activity cards, photo grid, original Instagram links, normal page scrolling |
| Reduced motion / user motion off | Baseline layout; no parallax, scrub, tilt, autoplay, smooth scrolling or decorative entrance offsets                      |
| Mobile/coarse pointer/save-data  | Static or minimal opacity transitions; no pointer tilt or pinned story; native swipe/controls                             |
| Capable desktop, motion allowed  | Bounded hero depth, story progression, shallow gallery perspective and existing controlled marquee                        |

Provide a visible “Réduire les animations” preference, persisted locally where storage is available. System reduced-motion always wins; site preference cannot override it to force animation. React to preference changes during a session and release observers/frames immediately. Missing APIs fall back to static content. Content starts visible in server HTML: enhancement must not leave text at opacity zero if JS fails.

## Choreography specifications

Values are initial engineering caps, subject to reference review and profiling.

| Section             | Enhanced behavior                                                                | Caps / fallback                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Navigation          | Transparent-to-solid state from hero sentinel; no height change                  | 160–200ms color/opacity; solid if JS fails or menu/focus requires it                                                        |
| Hero                | Poster/background, optional middle and foreground layers; text remains readable  | Maximum 3 image layers; vertical travel ≤ 80px background, 120px foreground desktop; scale ≤ 1.05; mobile static by default |
| Introduction        | Paragraph/image chapters follow normal DOM order; optional desktop sticky visual | One pinned visual maximum, story wrapper ≤ 200svh; no pin on short viewport, zoom, reduced motion or <900px                 |
| Activities          | Hover/focus emphasis and selectable details with explicit controls               | translateY ≤ 4px, 160–220ms; all content reachable without hover                                                            |
| Events/highlights   | Optional one-time subtle entrance                                                | 12px maximum offset, 240–400ms; information visible in baseline                                                             |
| Photo gallery       | Shallow CSS perspective on image wrappers over semantic links/buttons            | Perspective about 1000px, rotate ≤ ±6°, translateZ ≤ 40px; no auto orbit; flatten for focus/touch/reduced motion            |
| Instagram           | Reuse existing 22px/s scrolling and previous/next/pause                          | At most 16 records; stop when hidden/offscreen/dialog open; manual swipe remains                                            |
| Partners/CTA/footer | Mostly static; optional subtle opacity only                                      | No required reveal and no autoplay logo carousel                                                                            |

For hero scrub, normalized progress is clamped to 0–1 over the section's measured scroll interval. A layer's transform is its configured bounded distance multiplied by that progress, not accumulated wheel deltas. Decorative layers are aria-hidden and pointer-events:none; content and CTA never depend on layer visibility.

Scroll remains native. Never hijack the wheel, synthesize full-page smooth scrolling, force a horizontal journey, trap scroll inside a pin, or make navigation wait for a timeline. Hash navigation, keyboard PageDown, browser back/forward and restored scroll positions must work immediately.

Duration tokens: instant 0ms, fast 160ms, standard 240ms, reveal 400ms. Interaction easing: cubic-bezier(0.2, 0.8, 0.2, 1); scrubbing uses direct progress, no spring overshoot. Stagger ≤ 60ms per item and ≤ 240ms total. Never flash, strobe or repeatedly replay reveals on small scroll movements.

## Runtime lifecycle and performance

ScrollTrigger owns scroll scheduling and cached bounds. There is no component scroll listener or custom continuous requestAnimationFrame loop. React state changes at initialization/preferences, never on scroll ticks. ResizeObserver compares sizes; a shared one-frame refresh coordinator batches invalidations from dimensions, image load/error and font readiness. Direct scrub uses native scroll progress and transform writes, without smoothing or wheel interception. GSAP retains its shared internal scheduling while scenes are mounted; do not claim zero library work offscreen.

Attach passive listeners, pause on document visibility change, detach on unmount and route changes, and cancel scheduled frames. Do not leave all layers permanently promoted with will-change. Pause offscreen video if video is later approved; no autoplay video is in initial scope. Avoid animated blur, large shadows, background-position and layout properties.

The existing Instagram loop reads group width each frame and duplicates groups for looping. Preserve its pause/focus/touch behavior while measuring width outside the hot loop. Duplicate groups must be hidden from assistive navigation and non-focusable; semantic original links must remain discoverable without opening a JS-only modal. This is a hardening requirement, not a claim that all no-JS behavior exists already.

Original budget: incremental motion JS ≤ 30 KiB compressed; aim for 60fps with motion scripting ≤ 4ms/frame on a representative mid-range phone and no motion-attributable task >50ms. Phase 01 measured the production GSAP/ScrollTrigger/runtime chunk at 45,132 gzip bytes (44.1 KiB), exceeding that target. This is an explicit exception following the requested GSAP installation, not a passing budget claim. It is lazy and absent from the existing public homepage. Re-measure and review the budget before public integration; no representative-device frame-rate claim is made.

## Phase 01 API

- `Motion` is server-compatible markup: `effect` is background/foreground/reveal/image/transition/pin; optional numeric `distance` is bounded by `src/lib/motion/policy.ts`. It is engineering configuration, never arbitrary CMS input.
- `MotionScene` wraps server-rendered children with a small client controller. Scope nested scenes separately; use a React key when content revisions change. No business services enter the engine.
- `MotionToggle` supplies a shared local preference. System reduced motion always wins. Storage failure uses session memory; visibility and save-data changes return to static. Include a visible toggle on every future motion-enabled page.

Use positioned, overscanned decorative layers inside clipped media frames for background/foreground/transition. These effects require aria-hidden=true and no interactive descendants. Keep prose/actions outside translated layers. Reveals exclude interactive descendants, start once on entry and do not pre-hide waiting content. Images use a shallow desktop clip/translation/opacity; mobile uses opacity alone. Already-entered reveals do not repeat on breakpoint changes within a mounted scene.

Responsive policy: <700px or coarse pointer uses opacity reveals with no depth/pin; 700–1199px uses 40% capped travel without pin; ≥1200px/fine pointer permits full bounded effects. Pin requires viewport height ≥700px, a panel ≤65% of viewport height and no focusable descendants. It uses pinSpacing=true and lasts at most 60vh/600px. Keep panel dimensions stable, reserve image space, remount after content revisions, and never nest pins or transform their ancestors. Caps: background 80px, foreground 120px, reveal/image 12px, transition 24px; reveal 240ms mobile/400ms otherwise.

The runtime uses scoped gsap.context and gsap.matchMedia; cleanup reverts owned timelines, triggers, pin spacers and inline styles, disconnects observers/listeners and ignores pending imports/font callbacks. The last scene cancels pending refresh and disables the global engine only if no other triggers remain. Preference subscriptions attach once and remove listeners after the last consumer; motion-off/hidden/reduced states revert scenes to readable static content. No killAll or global scroll hijacking is used. Sources: [GSAP matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [React integration](https://gsap.com/resources/React/).

The development-only `/dev/motion` route shows all six effects using abstract shapes and the existing placeholder trail SVG. It reads no database, is not linked in production navigation and returns 404 in production, with noindex/noarchive metadata/headers. The guarded route may remain in build artifacts; it is not a confidential-content boundary. See [PHASE_01](PHASE_01.md) for reproduction commands, actual checks and remaining limitations.

## Accessibility requirements

Any automatically moving content lasting over five seconds alongside other content requires a persistent pause/stop mechanism; hover pause alone is insufficient. See [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide). Also adopt disableable interaction motion as a project requirement, beyond the AA baseline; see [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions).

Pause marquee on focus/hover/pointer interaction; explicit Pause persists until the user resumes. A change in reduced-motion preference stops it immediately. Avoid aria-live on continuously moving content. Do not reorder focus with 3D transforms; focused cards flatten or retain an unobscured focus ring. Dialog close restores focus to the original actionable element, not an aria-hidden duplicate.

## Verification matrix

Test no JS, hydration failure, reduced motion at load and toggled live, site motion-off, save-data fallback, mouse/keyboard/touch, screen reader reading order, 320px width, 200–400% zoom, short landscape viewport, resize/orientation, background/foreground tab, modal open/close, route back/forward and missing images.

Acceptance: the same information and primary actions exist with motion off; no content/CTA is hidden pending scroll; no CLS from scene initialization; no body overflow or trapped scroll; no duplicate focus stops; no hydration warning; no ongoing offscreen work. Capture performance traces and desktop/mobile screenshots with actual approved assets. Reference-driven choreography remains blocked on the two missing visual references, while baseline architecture can proceed.

## Phase 02 navigation lifecycle

The navbar deliberately does not import the GSAP runtime. CSS handles 240ms surface/color/veil transitions and a 160ms mobile panel opacity/8px entrance/exit. No blur, global smooth scrolling, scroll handlers or animation frame loop is added. IntersectionObserver watches the marked homepage hero with a header-height root margin; ResizeObserver reconnects only on a height change. Both disconnect on route changes/unmount. Native dialog events handle keyboard containment, Escape, backdrop close and restoration; a single breakpoint listener closes an open modal on desktop. Close timers and scroll-lock styles are cleaned up on close/unmount, and route navigation closes immediately.

`useMotionPreference` is reused without modifying its shared subscriptions. Reduced motion, user disable, save-data, pending initialization and hidden documents disable navigation transitions, including button transitions. The native disclosure is the server/no-JS/unsupported-dialog fallback and has matching geometry to the enhanced control. There is no ongoing or decorative automatic animation requiring a new pause control. Chrome checks cover saved preferences, reduced motion, focus, responsive reflow, API fallbacks and server/hydrated geometry. The travel reference is now available for navigation; hero choreography and the second reference remain pending. See [PHASE_02](PHASE_02.md).

## Phase 03 hero and API additions

`MotionScene enabled={false}` keeps static HTML and avoids importing the engine. Defaults preserve existing scenes. `Motion` now accepts optional bounded `scale` and `initialOpacity`; omitted values preserve earlier behavior. A new `text` effect permits semantic, noninteractive copy to drift at most 12px with opacity no lower than 0.94. It rejects controls/interactive descendants. Background/foreground/transition remain decoration-only and require aria-hidden. One owner per transform; nested reveal/text effects use different wrappers, never the same target.

The hero uses one image plane: background distance 64px (−32 to +32) and scale 1→1.035 on desktop; tablet uses 40% travel and scale 1→1.014. Semantic text drifts 0→−10px (−4px tablet), opacity 1→0.94, with a separate one-time 0.65→1 / 10px entrance. Mobile/coarse pointers remove scroll-linked transforms and scale; entrance is opacity-only for 240ms. Reduced motion/user disable/save-data/hidden states restore static presentation. CTAs, frame geometry, lower panel and MotionToggle are never revealed, translated or animation-gated. Overscan prevents exposed edges; there is no pin, extra scroll spacer, duplicate scenic layer or global scroll interception. Independent midground/foreground parallax is deferred until suitable approved layers exist.

Hero browser tests exposed delayed fromTo start styles surviving media/preference cleanup. The runtime now remembers exact initial inline styles only for targets it actually animates and restores them after context reversion, including error/unmount paths. Ignored interactive targets remain untouched; once-revealed text stays readable after breakpoint changes. Scoped snapshots are released on teardown, avoiding global saved-style registries. This supplements the existing [GSAP context](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/) lifecycle; there is no global killAll or business-side effect.

The production optional GSAP/ScrollTrigger/runtime chunk now measures 45,539 gzip bytes (44.47 KiB), still an explicit exception to the 30 KiB motion target. It is absent from the current production initial load without a selected hero image. Development-only placeholder tests and a warm desktop Chrome/4x CPU sample are not real-device or approved-photo certification. See [PHASE_03](PHASE_03.md) for measured payloads, reproduction, screenshots and limits.

## Website Phase 04 additions

About uses the existing scene/reveal/image lifecycle with readable CMS paragraphs. Only the image wrapper receives the image reveal; the overlapping stamp, copy and link remain separate. Optional desktop sticky art requires a ready scene, width ≥1200px and height ≥750px; reduced motion/disabled preference returns it to ordinary flow. No extra pin spacer or scroll loop is added.

`MotionSurface` exposes the shared preference as a CSS attribute for activity arrows. Cinematic Gallery is opt-in on homepage and gallery only: perspective 1000px, image rotation ±5° desktop / ±3° tablet, hover Z 16px. Focused links flatten, touch/mobile stay flat, and disabled/system-reduced preferences remove depth/transitions. The interactive anchor and caption never move. No-JS links retain image access; native dialog close restores focus. `/gallery` includes MotionToggle, while homepage reuses its existing toggle. See [PHASE_04](PHASE_04.md) for actual validation and photographic-content limitations.

## Private client cinematic profile — 2026-10-12

The separately authorized client preview opts into `MotionScene cinematic`. Ordinary scenes retain the original durations, 40% tablet intensity and opacity-only mobile reveals. This profile adds presentation recipes through the same GSAP context/matchMedia lifecycle, not a second engine or scroll system. See [CINEMATIC_DEMO_MOTION](CINEMATIC_DEMO_MOTION.md) for implementation and validation.

`Motion choreography` accepts opening/scene/portrait/copy/partner; `delay` is engineering configuration in seconds, clamped to 0–0.24 (0–0.12 on touch). Recipes use power3.out, 1.1s opening, 0.85s scene image, 0.72s portrait, 0.6s copy and 0.38s partner entrances. Touch uses 0.28s. Images open a shallow inset mask (12% desktop, 6% tablet, 2% touch) and settle from scale ≤1.04 (1.01 touch). The hero uses 1.025 entrance scale on an inner wrapper, separate from its existing bounded background scrub. Do not compose multiple animation owners on one target. This is an explicit private-preview exception to the original 400ms reveal duration, requested for a slower cinematic presentation; global scale caps remain 1–1.05.

Cinematic fine-pointer tablet motion uses 55% capped travel/scale delta. Mobile/coarse pointers still receive no parallax, text drift, timeline scrub or continuous scale. Reduced motion, saved off, save-data, missing APIs/chunk and no JS keep the same readable static server content. The only animated blur is ≤2px on the opening headline and a small CSS logo entrance; no image blur or scroll-linked filter. Static 6px backdrop blur is limited to the small story stamp on capable desktop/tablet; unsupported browsers get its opaque fallback. Navigation state and layout still use the original observer/CSS system.

The three milestone labels remain anchored outside their animated prose. An opt-in `data-story-timeline` scene applies a scrubbed decorative progress line and readable 0.82–1 prose emphasis, with a 1% maximum expansion of the final milestone. There is no pin, spacer, added scroll distance or hidden milestone. Timeline styles are remembered and reverted alongside ordinary Motion targets.

Gallery entrances use the existing image primitive with a three-image concurrency budget. Entries outside the viewport or beyond that budget stay visible and skip their optional entrance; they are not hidden or queued. Four decorative inner image wrappers drift by 6–12px total desktop travel with varied signs. CSS hover depth, scroll drift and image mask/scale each own a distinct wrapper. The anchor/plus control never moves; keyboard focus flattens the visual depth. No extra rAF loop, wheel interception, persistent will-change or scroll listener was added. One-time entry geometry checks and the existing batched image/font/resize refresh are retained.

Photo entrances wait for their actual image load; team copy shares the portrait's image-readiness scope. Waiting/failed/offscreen images leave content visible. Temporary load/error listeners are removed after completion or preference/media/unmount cleanup, and late callbacks cannot restart a disposed scene. The final milestone's opacity/translation/scale share one tween so nested fromTo snapshots cannot restore a stale transform when motion is disabled.

The GSAP/runtime production chunk measured 46,495 gzip bytes after this extension, versus 45,539 before (+956 bytes). It remains lazy and above the original 30 KiB target; this is not a claim that the budget now passes. Private photos/review files remain excluded from all deployment traces; enabling this profile does not grant any public media permission.
