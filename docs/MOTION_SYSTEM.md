# SAKADO 2.0 — motion system

Status: proposed, 2026-10-09. Motion enhances the server-rendered experience; it never owns business rules. Primary screenshots and exact visual choreography: **TO BE CONFIRMED**.

## Boundaries

Server content services validate/query approved content and supply serializable display props. Components under proposed `src/components/motion/` own element refs, local progress and visual transforms only. They cannot import Prisma, auth, booking, admin mutations or storage services. No scroll event creates a booking, publishes content, sends analytics by default or fetches all records.

There is no installed motion framework. Begin with CSS transforms/transitions, sticky positioning, IntersectionObserver and a small shared requestAnimationFrame coordinator. Add a library only if a measured requirement cannot be met within budgets. CSS perspective satisfies the initial 3D photo-gallery direction without requiring a canvas/WebGL engine.

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

One active frame coordinator for visible scroll scenes, with delta clamping after tab resume. Read layout in a batched measurement phase; write transforms/opacity in a separate phase. Cache bounds with ResizeObserver and resize/orientation handling; do not call getBoundingClientRect for every element on every frame. Use refs/CSS variables for frame updates, not React state on each scroll tick.

Attach passive listeners, pause on document visibility change, detach on unmount and route changes, and cancel scheduled frames. Do not leave all layers permanently promoted with will-change. Pause offscreen video if video is later approved; no autoplay video is in initial scope. Avoid animated blur, large shadows, background-position and layout properties.

The existing Instagram loop reads group width each frame and duplicates groups for looping. Preserve its pause/focus/touch behavior while measuring width outside the hot loop. Duplicate groups must be hidden from assistive navigation and non-focusable; semantic original links must remain discoverable without opening a JS-only modal. This is a hardening requirement, not a claim that all no-JS behavior exists already.

Budget: incremental motion JS ≤ 30 KiB compressed; aim for 60fps with motion scripting ≤ 4ms/frame on a representative mid-range phone and no motion-attributable task >50ms. If traces fail, reduce layers or flatten the effect before adding a heavier engine.

## Accessibility requirements

Any automatically moving content lasting over five seconds alongside other content requires a persistent pause/stop mechanism; hover pause alone is insufficient. See [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide). Also adopt disableable interaction motion as a project requirement, beyond the AA baseline; see [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions).

Pause marquee on focus/hover/pointer interaction; explicit Pause persists until the user resumes. A change in reduced-motion preference stops it immediately. Avoid aria-live on continuously moving content. Do not reorder focus with 3D transforms; focused cards flatten or retain an unobscured focus ring. Dialog close restores focus to the original actionable element, not an aria-hidden duplicate.

## Verification matrix

Test no JS, hydration failure, reduced motion at load and toggled live, site motion-off, save-data fallback, mouse/keyboard/touch, screen reader reading order, 320px width, 200–400% zoom, short landscape viewport, resize/orientation, background/foreground tab, modal open/close, route back/forward and missing images.

Acceptance: the same information and primary actions exist with motion off; no content/CTA is hidden pending scroll; no CLS from scene initialization; no body overflow or trapped scroll; no duplicate focus stops; no hydration warning; no ongoing offscreen work. Capture performance traces and desktop/mobile screenshots with actual approved assets. Reference-driven choreography remains blocked on the two missing visual references, while baseline architecture can proceed.
