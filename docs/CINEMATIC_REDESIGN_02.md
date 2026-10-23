# Cinematic Redesign 02 — official immersive hero

Date: 2026-10-22. Implemented on the existing official homepage, on `feat/official-client-presentation` at unchanged HEAD `0f8404a`. All work remains unstaged. No following section, database record, media permission or deployment was changed.

## Preservation and actual asset availability

Before edits, preserved the current tracked binary diff and every non-ignored untracked source file in ignored `.local/recovery/cinematic-redesign-02-20261022-212022/`. Copied sources matched their SHA-256 manifest. This preserves Redesigns 00/01 and the uncommitted official presentation. Existing recovery remains intact; no branch switch, reset or source replacement occurred.

Inspected the existing presentation catalog preparation, available media files and S08/S16 review images. Both selected visuals are flattened square photographs. No separately usable foreground/midground/background cutouts or layered composition files were found in the supplied asset directories. Responsive derivatives are versions of the same photograph, not separate depth planes.

The result uses **one photographic plane**, with camera pan/scale and an independently expanding non-photographic frame. There is no duplicated photograph presented as depth, synthesized scenery or new image publication. S08 remains the default; S16 remains an explicit `--hero=s16` local alternative. The existing server-side selection, expiring viewing capability, hash verification, private delivery/optimizer rules and production denial are unchanged.

## Architecture and visual composition

- `ParallaxHero` still renders navigation integration, CMS/confirmed headline and description, genuine event/experience actions, discovery panel and MotionToggle. It does not replace the homepage or select assets itself.
- The official scene has `data-hero-cinematic`. The existing lazy `MotionScene` and GSAP runtime call the scoped `cinematicHero` recipe inside their matchMedia context. The older private demo retains its previous recipe.
- A decorative, aria-hidden `data-hero-window` contains the photograph and readability veils. This rounded window starts at the existing frame geometry. Its camera has 5rem of vertical and 2rem of horizontal overscan. Cover cropping at 65%/52% fills the window; responsive derivatives and original files are unchanged.
- The frame's absolute visual window expands in place while the content frame retains its natural document geometry. Controls and discovery panel are outside all animated targets. A late opacity transition blends the expanding image back into the shared Midnight Forest environment.
- The existing official section order is retained: manifesto/adventures/experiences still precede About. This is the hero's handoff into that native reading sequence, rather than carrying a pinned photograph directly across those sections into About. No pin, spacer, stacking-context escape or section reorder was introduced.

The headline is split on existing sentence punctuation into masked clauses: “Explorez.”, “Respirez.” and “Vivez l’aventure.” for the current copy. Each clause can wrap naturally on narrow screens. The original full title remains the accessible h1 label; decorative visible clauses are hidden from assistive duplication. CMS copy is not hard-coded or overwritten. All text is visible in server HTML before enhancement.

## Choreography record and current correction

Pre-commit correction (2026-10-23): the original table below recorded clause-based entrance values that do not match the completed implementation. It is retained as the historical written record. The authoritative current entrance is **per word**: desktop/tablet yPercent **90 to 0**, opacity **0.3 to 1**, **0.65s**; mobile yPercent **15 to 0**, **0.3s**. Stagger is `min(0.06, 0.24 / (wordCount - 1))` for more than one word, otherwise zero; total stagger is bounded to **0.24s**. The existing `power3.out` easing and camera/window/copy transitions are unchanged. This documentation correction does not alter motion or rewrite earlier measured samples.

### Originally documented table (historical, entrance row superseded)

| Target                           | Desktop, fine pointer                                                                 | Tablet, fine pointer                                | Mobile/coarse pointer                                  |
| -------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Clause entrance                  | yPercent 105 → 0; opacity 0.3 → 1; 0.9s, 0.12s stagger, power3.out                    | Same readable entrance                              | yPercent 20 → 0; opacity 0.3 → 1; 0.32s, 0.05s stagger |
| Camera, timeline position 0–1    | y −30 → +60px; scale 1.01 → 1.07                                                      | y −12 → +24px; scale 1.01 → 1.025                   | Stationary                                             |
| Window expansion, position 0–0.7 | scaleX 1 → min(1.22, viewport width / window width); scaleY 1 → 1.18; radius 40 → 8px | scaleX capped at 1.08; scaleY 1.06; radius 32 → 8px | Stationary                                             |
| Copy exit, position 0.08–0.8     | y 0 → −64px; opacity 1 → 0.35                                                         | y 0 → −24px; same opacity                           | No scroll exit                                         |
| Window handoff, position 0.7–1   | opacity 1 → 0.45                                                                      | Same                                                | Stationary                                             |

One timeline uses `start: "top top"`, `end: "bottom top"`, `scrub: 0.6`, linear scroll interpolation and invalidation on refresh. Camera, frame and copy share its progress; each target has one owner. The entrance owns the inner word spans and the scroll exit owns their outer copy wrapper. Entrances run only when mounting near the opening (root top ≥ −80px), so restoring a later scroll position does not re-hide the headline.

The hero-specific scale 1.07 is within the requested approximately 1.08 starting range. Generic motion scale limits were not raised. Frame expansion is a separate geometric transition, so its transform compounds with the camera when judging the final crop.

Cleanup uses the existing context/matchMedia lifecycle and exact original inline-style restoration. Resize, reduced motion, saved off, data saving, document visibility, route changes and unmount follow the existing preference policy. No custom scroll listener, perpetual loop, wheel interception, smoothing replacement or animation dependency was added. Missing engine/API, reduced motion and no JavaScript retain static imagery, visible text and working links. No selected production media means the hero scene remains disabled.

## Browser evidence and measured behavior

Local Windows, Node 24.19.0, installed Chrome. Actual official application with the exact verified loopback PostgreSQL target; no fixtures or CMS mutations.

- TypeScript and ESLint PASS; 70 unit tests PASS.
- Production build PASS on identical retry, including the 17-asset public-file audit and all 52 private deployment traces.
- `npm run test:presentation`: 10/10 PASS, including the new coordinated timeline regression, three viewport compositions, two private portraits, keyboard/no-JS/reduced-motion, hero toggle, hash failures, S08 fallback and normal production denial.
- Explicit S16: 2/2 focused tests PASS using `PRESENTATION_TEST_HERO=s16` with the existing presentation test configuration; source selection, reverse scroll, cleanup and settled tablet/mobile captures checked.
- `npm run test:hero`: 9/9 PASS, DB-disconnected. Covers native scrolling, responsive/zoom-style long-copy reflow, static production fallback, no-JS/failed image, ignored interactive targets, exact style cleanup, listener lifecycle and scoped axe checks.

At 1440×900, sampled scroll positions 0 → 250 → 500 → 700 → 250 → 0:

| Measurement             | At top  | At 500px scroll   | After reverse to top |
| ----------------------- | ------- | ----------------- | -------------------- |
| Camera y                | −30px   | +20px             | −30px                |
| Camera scale            | 1.01    | 1.0433            | 1.01                 |
| Window horizontal scale | 1       | 1.0567            | 1                    |
| Copy y / opacity        | 0 / 1   | −42.27px / 0.5707 | 0 / 1                |
| CTA document y          | 599.5px | 599.5px           | 599.5px              |
| Scene height            | 900px   | 900px             | 900px                |

Every sampled position retained camera coverage over all four window edges and zero horizontal overflow. Reduced-motion cleanup restored camera, window, copy and clauses to transform none/opacity 1. Live mobile switching removed the camera and copy scrub. No page errors or hydration errors were observed in the executed suites.

Ignored captures: `.local/hero-redesign-02/s08-{0,500,700}.png`, equivalent S16 captures and S16 `settled-768` / `settled-375` captures. Metrics are stored beside them. Presentation desktop/tablet/mobile and legacy hero accessibility captures remain in their existing ignored test output locations. S08 opening/expansion and settled S16 tablet/mobile images were visually inspected for crop, line readability, frame coverage and control placement. These files contain private imagery and must stay out of Git/public output.

## Performance observations

The actual-photo warm development sample used 120 animation-frame intervals while programmatically scrolling 0 → 600 → 0px, without CPU throttling:

| Sample | Median interval | p95 interval | Intervals >50ms | Observed long tasks | Observed layout shifts |
| ------ | --------------- | ------------ | --------------- | ------------------- | ---------------------- |
| S08    | 8.3ms           | 8.6ms        | 0               | 0                   | 0                      |
| S16    | 8.3ms           | 8.6ms        | 0               | 0                   | 0                      |

The existing SVG hero harness at 4× CPU collected 90 intervals: median 8.5ms, p95 25.2ms, zero intervals >50ms and no observed long tasks; its total sampled script duration was 212.946ms. That is a separate development/SVG measurement, not photographic mobile performance evidence. The recording harness itself drives synthetic scroll; these are warm local observations, not a cold-load benchmark, physical-device result or guarantee of 60fps.

The production lazy runtime/GSAP chunk is 121,404 bytes / **46,825 gzip bytes**. It still exceeds the original 30 KiB budget. The historical report recorded 46,495 gzip bytes; no controlled before/after device benchmark is claimed. Border-radius/opacity and the frame's transformed raster can incur rendering work despite avoiding layout animation. No persistent will-change, blur animation or React scroll updates are used.

## Preserved boundaries and remaining limitations

Final read-only comparison matched all 15 database table/schema fingerprints and 98 protected file hashes. All 45 Instagram records remain unpublished/homepage-off; all 17 library assets remain BLOCKED and all 85 review axes remain PENDING REVIEW. Private media remains absent from public build output and metadata. Existing source/recovery and database service state are preserved after validation.

True independent photographic depth requires supplied, identity-verified layer assets with enough overscan and approved usage evidence. Current square 1440px masters constrain wide-screen fidelity; cover rendering can crop embedded source marks and peripheral composition. The private photographic crop and art direction still require human review. Public fallback remains static until an eligible image is explicitly selected.

Next.js interrupted initial build/development runs with its existing known-vulnerability advisory; identical retries completed. Its security upgrade recommendation remains unresolved, and no locked dependency was changed. Linux, external hosting, physical mobile devices and public publication remain outside this validation.

Changed implementation: `src/components/home/parallax-hero.tsx`, its CSS module, `src/lib/motion/hero.ts` and `runtime.ts`. Updated coverage: `tests/presentation-browser/presentation.spec.ts`, `tests/hero-browser/development.spec.ts` and the shared-hero selector in `tests/phase09b-browser/official.spec.ts`. Documentation: this report and the Motion System cross-reference. No commit, push, deployment or next-section work occurred.
