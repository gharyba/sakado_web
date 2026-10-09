# SAKADO 2.0 — design system

Status: Phase 01 technical foundation implemented, 2026-10-09; remaining art direction is proposed. This document does not approve a brand identity. See [ARCHITECTURE](ARCHITECTURE.md) for content evidence and [MOTION_SYSTEM](MOTION_SYSTEM.md) for animation.

## Reference authority and art direction

The two user-referenced screenshots are primary design references, but neither was attached or identified during this audit. Their composition, typography, image treatment, navigation and transitions must be annotated before visual implementation is approved. Exact matches, approved fonts and brand colors are **TO BE CONFIRMED**. Existing test screenshots are regression evidence only.

Desired experience: cinematic outdoor storytelling with generous image areas, restrained typography, layered depth and a clear reading sequence. Photography must depict authorized Sakado content. Never import unrelated reference copy, logos, partner marks, place names, claims or prices. Existing landscape SVGs and wordmark are temporary. The uploaded hardware diagram is not an approved outdoor visual despite database flags.

For each supplied reference record: file/path, viewport, navigation behavior, grid/gutters, type hierarchy, color samples, crop/focal point, section transition and mobile adaptation. Resolve conflicts through content readability, accessibility and the user's approved direction.

## Existing and proposed tokens

Existing values below come from `src/app/globals.css`. Retain as a provisional implementation palette until reference/brand review. New names are semantic aliases to introduce incrementally, not already-implemented CSS.

| Semantic token        | Existing token / value | Usage                                           |
| --------------------- | ---------------------- | ----------------------------------------------- |
| color-brand           | forest / #163e35       | Primary actions, headings on light surfaces     |
| color-surface-inverse | deep / #102f29         | Cinematic dark sections                         |
| color-accent-muted    | green / #52664f        | Decorative landscape accents                    |
| color-surface         | paper / #faf8f2        | Reading surface                                 |
| color-surface-alt     | sand / #eeece2         | Secondary surface                               |
| color-accent          | amber / #e3b675        | Restrained highlight with dark text             |
| color-text            | ink / #203a32          | Primary reading text                            |
| color-text-muted      | muted / #59645b        | Supporting copy on tested light surfaces        |
| color-border          | line / #d9ded2         | Decorative divisions, not sole control boundary |
| color-focus-light     | proposed #7a4b00       | Focus ring on light surfaces                    |
| color-focus-dark      | amber / #e3b675        | Focus ring on dark surfaces                     |

Proposed feedback colors: success #1f5a3d, error #a12622, warning #805500, information #234f76 on the paper surface. These communicate UI state, not brand approval; pair with text/icon and verify actual rendered contrast. Never use color alone. Verify normal text ≥ 4.5:1, large text ≥ 3:1 and meaningful control/focus boundaries ≥ 3:1 against adjacent colors. Photo overlays must pass at every responsive crop and animation position; otherwise use a solid text panel. Accessibility reference: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Typography

Current body font is Arial/Helvetica/sans-serif; display headings use Georgia/Times New Roman/serif. There are no licensed local font files; `public/fonts.css` is a system-font comment. Keep system fallbacks until approved font families/licenses arrive. If introduced, self-host WOFF2, subset necessary French characters, minimize weights and preload only the critical face. No remote font dependency is required.

| Role            | Proposed size                      | Line height / limits                                          |
| --------------- | ---------------------------------- | ------------------------------------------------------------- |
| Hero display    | clamp(2.75rem, 6vw, 6.5rem)        | 1.03–1.1; readable line breaks, no fixed-height text clipping |
| Page title      | clamp(2.25rem, 4.5vw, 4.5rem)      | 1.1; one h1 per page                                          |
| Section heading | clamp(1.875rem, 3.3vw, 3.5rem)     | 1.15                                                          |
| Card heading    | 1.25–1.5rem                        | 1.3                                                           |
| Body            | 1rem; editorial lead up to 1.25rem | 1.6; 60–68ch measure                                          |
| Caption/support | 0.875rem                           | 1.5; no critical copy in tiny type                            |
| Eyebrow         | 0.75–0.875rem                      | 1.4; modest tracking, short uppercase labels only             |
| Controls        | at least 0.875rem; inputs 1rem     | 1.4–1.5                                                       |

Use relative units and fluid scaling; do not lock browser zoom. Do not split text into animated character spans that damage reading order. French accents, long titles and punctuation must wrap without overflow. Dates/currency come from formatting services, not CSS or animation code.

## Spacing, grids and responsive behavior

Base spacing scale in rem: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8 (4–128px at the default root size). Component gaps generally 0.75–1.5rem; section padding clamp(3rem, 7vw, 7rem). Keep narrative whitespace distinct from decorative scroll duration.

| Width       | Layout rules                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| 320–699px   | 1 content column, 4-column conceptual grid, 20px gutters; compact menu; stacked story/gallery; no pinning |
| 700–899px   | 8-column grid, 24px gutters; 2-card layouts; static story remains default                                 |
| 900–1199px  | 12-column grid, 32px gutters; 2–3-card layouts; nav expands only if links fit                             |
| 1200–1499px | 12-column grid, 48px gutters; max content width 1280px                                                    |
| ≥1500px     | Same readable max width; full-bleed media may expand; do not widen prose                                  |

These consolidate existing 700/900/1200/1500px breakpoints. The current 360px exception is a regression case, not a separate design language. Test 320, 390, 768, 1024, 1440 and 1920px, portrait/landscape and zoom. Container width is the lesser of 1280px and viewport minus gutters. Keep horizontal scrolling local to intentional galleries/marquees, never the document body.

Hero: stable minimum height using small viewport units with a content-driven fallback, approximately 80svh desktop; mobile height must expand for text and browser chrome. Never clip translated French text to a full-screen box. Respect safe-area insets. Header target height 72–88px desktop, 64–72px mobile; anchors use matching scroll-margin. Keep header dimensions stable during transparency transitions.

## Components and interaction states

- Buttons/links: consistent primary, secondary and text treatments; minimum 44×44px target; visible hover, focus, pressed, busy and disabled states. Link navigates; button performs an action. Icon-only controls require names.
- Cards: image with reserved aspect ratio, heading, concise truthful metadata and one clear primary link. Avoid nested interactive elements. Whole-card interactions must work on keyboard and touch.
- Media: hero wide crop, activities approximately 4:5, events 3:2, gallery mixed ratios within a stable grid, Instagram existing 4:5. Store focal points and dimensions; never crop faces or meaningful subjects accidentally.
- Navigation: solid baseline; transparent over approved hero only when contrast passes; solid on menu/focus or beyond hero threshold. Focus and skip links remain above decorative layers.
- Dialogs: named native dialog, visible close, Escape, focus containment/restoration and scroll position preservation. Baseline links still work when JS fails.
- Forms/admin: persistent labels, instructions, inline field errors and error summary; preserve input on errors; feedback announced politely. Dense admin tables reflow or use named local scroll regions. Cinematic effects do not belong in CMS forms.
- State coverage: empty, loading, success, validation error, permission denied, unavailable database/media, draft/preview and long content. Unknown prices/dates remain absent or explicitly pending; never substitute zero for unknown.
- Partners/metrics: only approved names/logos and substantiated counts. Hide unavailable optional rows. Empty photo collections do not justify stock images presented as real Sakado adventures.

Proposed radius scale: 4px controls, 8px cards, 12px dialogs; retain square/full-bleed cinematic sections. Shadows are subtle elevation indicators, not contrast substitutes. Stacking order: base 0, decorative layers 1–3, content 10, header 40, skip link 60; native modal top layer. Avoid transforms on ancestors that break sticky positioning.

## Design acceptance

Phase 01 implementation is namespaced and opt-in: `src/styles/tokens.css`, `src/styles/primitives.css`, and server-compatible `Container`, `Section`, `Button`, `ButtonLink`, `MediaFrame` in `src/components/ui/foundation.tsx`. The new neutral engineering palette uses canvas #f5f4f0, surface #ffffff, muted surface #e9e8e2, ink/dark #252b2e, muted text #555e62, border #747c80, focus #765000 and inverse focus #f1c982. Legacy forest/paper/amber values and existing public/admin screens remain preserved.

The implemented `--s-*` tokens cover the documented system fonts/fluid type, rem spacing, 1280px container/65ch reading measure, 700/900/1200px gutter changes, fluid section spacing, 4/8/12px radii, two subtle elevation shadows, duration/easing and stacking. Namespaced `s-*` classes include display/title/heading/lead/caption/eyebrow, stack and wrapping cluster. Sections have default/muted/dark tones and compact spacing; buttons/links have primary/secondary/text variants, focus/pressed/disabled/busy treatments and 44px targets. Media frames reserve landscape 3:2, portrait 4:5, wide 16:9 or square space. Callers supply semantic headings, real actions, intrinsic image dimensions, sizes and meaningful alt text. No official font/photo/logo was introduced.

Root layout imports these styles without replacing existing selectors. Forced global smooth scrolling was removed. `/dev/motion` demonstrates the primitives separately from the homepage; browser reflow checks cover 320/390/768/1024/1440/1920px. See [PHASE_01](PHASE_01.md) for implementation and validation evidence.

Before visual sign-off: annotate both supplied references; confirm brand assets; compare desktop/mobile static compositions; verify all ten section positions and approved content; audit contrast, crop, long text, keyboard, zoom and reduced motion. No claimed pixel match is possible until the actual references are available. Shared tokens must style both old and new sections without regressing existing admin screens. Final approval includes empty states, not just a populated mockup.
