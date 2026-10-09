# Phase 03 — cinematic parallax hero

Implemented 2026-10-09 on `feat/phase03-cinematic-hero`, branched from validated Phase 02 `22ca885`. Only the homepage hero is replaced; navigation, following sections, routes, CMS/authentication, PostgreSQL schema and Instagram functionality remain unchanged. No database writes, migrations, imports, service startup, push or deployment were performed.

## Reference, content and media

`design-references/hero-roamly.png` was missing. The user explicitly confirmed [design-references/sakado-hero.png](../design-references/sakado-hero.png) as the Phase 03 primary reference. The design follows its full-width scene, white rounded foreground frame, bold left headline, right focal area, pill actions and overlapping lower panel. The reference image itself, ROAMLY content, search fields and partner marks are not website assets or functionality.

Existing settings supply the hero title/tagline; fallbacks remain “Explorez. Respirez. Vivez l’aventure.” and Sakado's confirmed camping/hiking description. Existing `/events` and `/experiences` actions are retained. The lower panel links to experiences, events and contact; no fake destination/date/guest search or booking feature is introduced.

No approved Sakado scenic photograph or independently separated depth assets were identified. The existing `public/images/camp.svg` (1,639 bytes) is used **only in development**, visibly labeled “Illustration de développement · Photo Sakado : TO BE CONFIRMED”. No new photographs, fonts, raster assets or dependencies were downloaded. Production without a selected image renders the same usable composition on a dark surface and skips GSAP entirely. DEMO_MODE cannot enable hero placeholders in production. Other legacy homepage sections retain their existing behavior.

`resolveHeroMedia` accepts only an explicit existing settings media path through the current local-path policy. It does not select from the gallery, touch the flagged hardware record or infer photo approval from publication flags. Owner-reviewed photography, usage rights, official identity/fonts, final crop/focal points and separated layers remain **TO BE CONFIRMED**. The current 70%/50% focal position is a provisional engineering default. A configured image is not independent proof of rights; owner review remains a launch gate.

## Components and modified files

| File                                                | Change                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/components/home/parallax-hero.tsx`             | Server-renderable ParallaxHero, HeroBackground, HeroContent and HeroActions; real discovery panel and MotionToggle |
| `src/components/home/parallax-hero.module.css`      | Scoped viewport/frame/content/panel/caption/responsive styles                                                      |
| `src/lib/hero.ts`                                   | Explicit media selection and development-only illustration policy                                                  |
| `src/app/(public)/page.tsx`                         | Replaces only old hero markup; existing settings/query behavior and all later sections remain                      |
| `src/components/motion/motion.tsx`                  | Optional scale and entrance-opacity configuration                                                                  |
| `src/components/motion/scene.tsx`                   | Optional enabled gate, default true, avoiding unnecessary imports                                                  |
| `src/lib/motion/policy.ts`                          | Bounded text/scale/opacity policy                                                                                  |
| `src/lib/motion/runtime.ts`                         | Text drift/scale support and exact owned-target style cleanup                                                      |
| `tests/hero.test.ts`                                | Three focused media/motion policy tests                                                                            |
| `playwright.hero.config.ts`, `tests/hero-browser/*` | Independent DB-disabled development/production Chrome suite                                                        |
| `package.json`                                      | Adds `test:hero`; dependencies and lockfile unchanged                                                              |
| `AGENTS.md`, architecture/design/motion documents   | Phase 03 contracts, evidence and stop point                                                                        |
| `docs/qa/phase03/*`                                 | Reviewed desktop/tablet/mobile screenshots and local scroll sample                                                 |

Server-rendered headings, description and links do not wait for animation. The client scene only enhances DOM using the existing shared preference/runtime; it imports no settings/database/auth services. The outer section remains a direct child of `#main`, marked `data-navigation-hero="dark"`, reserving `--s-navigation-height` before the frame. Phase 02 observers and navbar source files are unchanged.

The scene has a content-driven 100svh minimum, never a clipped full-screen text box. Desktop frame uses 40px corners/4px white border; tablet 32px; mobile 28px/3px. The lower navigation pill overlaps its bottom edge in normal flow. Controls are at least 44px. Mobile adapts typography/actions, keeps the development caption in flow and expands for long copy. There is no horizontal overflow, heavy blur, snap scrolling, pin spacer or replacement of following sections.

One Next Image spans the background and extends behind the navbar. It is preloaded with fill/sizes and reserved scene geometry; `priority` is not used for the new hero because Next 16 deprecates it. Local raster media can use Next optimization; `/media` and SVG remain unoptimized to preserve existing authorization semantics. Load/error/size/font changes use the existing batched ScrollTrigger refresh lifecycle. Image failure retains the dark surface, readable copy and working links.

## Motion behavior

Only one scenic plane moves; the frame is a stable transparent window onto it, not an independently moving duplicate photograph. Genuine midground/foreground image separation is deferred until approved layers exist.

| Mode                               | Behavior                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Desktop ≥1200px, fine pointer      | Background travels −32→+32px and scales 1→1.035 over the section's native scroll interval    |
| Tablet 700–1199px                  | 40% travel: −12.8→+12.8px, scale 1→1.014                                                     |
| Semantic copy                      | Entrance opacity 0.65→1 and ≤10px; separate scroll drift 0→−10px/opacity 1→0.94, −4px tablet |
| Mobile/coarse pointer              | No parallax, scale or copy scroll drift; short opacity-only entrance                         |
| Reduced/off/save-data/hidden/no JS | Static readable layout; all essential actions preserved                                      |
| Production with no selected media  | Scene disabled; no runtime import or image placeholder                                       |

The image has 64px vertical overscan; scroll uses direct bounded progress, with no wheel interception or custom application scroll loop. CTAs, frame, lower panel and preference controls never move/fade or depend on completion. Scene cleanup reverts scoped GSAP/matchMedia/ScrollTriggers, observers/listeners/timers and exact original styles on owned targets. Browser coverage caught and fixed entrance styles surviving resize/disable; skipped interactive targets are not restored or otherwise modified.

## Validation and reviewed screenshots

Windows Node 24.19.0, locked Next 16.4.0/React 19.3.0/GSAP 3.15.0, repository plain CSS conventions (no Tailwind conversion):

| Command                   | Result                                                        |
| ------------------------- | ------------------------------------------------------------- |
| `npm run typecheck`       | Pass                                                          |
| `npm run lint`            | Pass                                                          |
| `npm test`                | 25 pass: original 15 + Phase 01's 4 + Phase 02's 3 + hero's 3 |
| `npm run build`           | Pass: Prisma Client generation and production Next build      |
| `npm run test:hero`       | 9 Chrome checks pass                                          |
| `npm run test:navigation` | 10 Chrome regression checks pass                              |
| `npm run test:motion`     | 8 Phase 01 Chrome regression checks pass                      |

Browser tests actually ran against temporary loopback servers with **empty DATABASE_URL**, dummy AUTH_SECRET and isolated media directory. Build checks also disabled database access. No fixture preparation, DB test, migration or import was run. `.env` values were not changed or logged. The uploaded WebP checksum remains `ac847f45641cb91bc1530bfd938f6dc44b7f1f98900851c9a2b66fa1b02eef37`.

Hero coverage: image loading, actual native-scroll transform changes, responsive focal crop, stable CTA geometry, header transparency/boundary/height, preference persistence/live reduced motion, exact style restoration and skipped interactive targets, long copy, no JS, failed image, repeated route cleanup/listener counts, and production asset/engine exclusion. No hydration/page errors were observed. Reflow covers 320/375/768/1440/1920px; mobile CTA remains within the tested first viewport. Scoped axe-core 4.14.0 reports no WCAG A/AA rule violations for the desktop hero. Existing navigation checks cover its own desktop/mobile focus and scoped accessibility. This is not full-site or assistive-technology certification.

The six screenshots below were generated and visually inspected. Development images contain an explicitly labeled illustration, not approved Sakado photography. Production captures use the current asset-free composition. They are QA artifacts outside public assets.

| Viewport | Development                                        | Production without selected media                 |
| -------- | -------------------------------------------------- | ------------------------------------------------- |
| 1440×900 | [Desktop](qa/phase03/hero-desktop-development.png) | [Desktop](qa/phase03/hero-desktop-production.png) |
| 768×1024 | [Tablet](qa/phase03/hero-tablet-development.png)   | [Tablet](qa/phase03/hero-tablet-production.png)   |
| 375×812  | [Mobile](qa/phase03/hero-mobile-development.png)   | [Mobile](qa/phase03/hero-mobile-production.png)   |

## Bundle and performance evidence

Initial homepage production JS was measured in fresh Chrome before/after, summing unique requested scripts individually compressed with Node zlib:

|                             | Raw bytes |         Gzip bytes |
| --------------------------- | --------: | -----------------: |
| Phase 02 baseline           |   498,972 |            151,372 |
| Phase 03, no selected media |   499,848 |            151,750 |
| Increment                   |   **876** | **378 (0.37 KiB)** |

The optional production GSAP/ScrollTrigger/runtime chunk measures **117,492 raw / 45,539 gzip bytes (44.47 KiB)**. It is lazy and absent from the measured asset-free production homepage, verified against actual requested hashed JS contents. When selected media and preferences allow enhancement, this additional chunk is expected; the arithmetic base-plus-runtime estimate is 197,289 gzip bytes (192.67 KiB), not a measured production-with-approved-photo transfer. The earlier 30 KiB incremental motion target remains an explicit exception. Photo sizes, caching, optimization, LCP and real-device budgets must be measured after approved assets arrive. No dependencies were installed.

[Scroll sample](qa/phase03/scroll-profile.json): warm development Chrome, 4× CPU throttle, existing 1.6KB SVG, 90 programmatic native-scroll/rAF samples. Median callback interval 8.3ms; p95 8.5ms; 0 intervals over 50ms and 0 observed long tasks. CDP ScriptDuration delta was 121.372ms across the sample, including all page/test scripting. These are callback/task observations on a desktop host, not measured presented frames, a 120fps claim, midrange-phone proof, motion-only CPU attribution, or production-photo certification. No Lighthouse/Core Web Vitals claim is made.

## Limits and exact next step

The component/motion foundation is ready for a separately specified Phase 04. Final photographic fidelity is limited by absent approved assets; no genuine multi-plane scene is claimed. Official photo rights, cropped/focal variants, separated artwork, final brand typography/palette and launch copy review remain **TO BE CONFIRMED**. Production photo delivery/optimization, Safari/Firefox, assistive technology, mobile hardware performance, Linux validation, durable external storage and Hostinger staging remain separate gates. Existing CMS transactions/database-backed content were not certified by these DB-free frontend checks.

Exact next step: supply/select an approved Sakado hero photograph through the existing settings workflow, review crops/contrast and production payload on the saved desktop/tablet/mobile compositions, then provide the Phase 04 scope. Do not substitute the hardware upload or reference screenshot. Stop here: **no Phase 04 implementation, GitHub push or deployment is included.**
