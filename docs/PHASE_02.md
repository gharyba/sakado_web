# Phase 02 — cinematic navigation

Implemented 2026-10-09 on `feat/phase02-cinematic-navigation`, branched from validated Phase 01 `8d7995b`. Scope is navigation only. Existing hero composition, routes, CMS, authentication, schema, Instagram records and uploads remain preserved. The homepage change is a navigation boundary marker; scoped CSS adds header clearance to its existing content.

## Visual reference and actual branding

The supplied path `design-references/hero-roamly.png` did not exist. The actual supplied file is [sakado-hero.png](../design-references/sakado-hero.png), a 977×795 ROAMLY travel reference, SHA-256 `a2e36d3587e4cd262fd3b5eaf1a3fbf2dded186ab01f61fdb6b745db00a0b09f`. It is a design input outside public assets, not approved Sakado imagery.

The navbar follows its left tracked wordmark, generous vertical/horizontal space, centered lightweight white links and rounded right action. Existing Sakado Brand/configured logo rendering is reused, including its current fallback wordmark. The prominent action is “Nos aventures” → `/events`; no login, booking, reservation, payment or search functionality is invented. Existing amber is retained rather than treating the reference's terracotta as an approved brand color. A soft contrast veil adapts the transparent composition to bright future imagery. Official logo, fonts and final palette remain **TO BE CONFIRMED**; no pixel-match/final-brand approval is claimed.

## Components and integration

| File                                                                             | Responsibility                                                              |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/components/site-header.tsx`                                                 | Server header composition; preserved skip link/demo banner and Brand slot   |
| `src/components/navigation/navigation-shell.tsx`                                 | Client boundary/appearance controller; desktop routes/action                |
| `src/components/navigation/navigation.module.css`                                | Scoped responsive, transparent/surface, focus and modal styling             |
| `src/components/mobile-navigation.tsx`                                           | Accessible native dialog, route/breakpoint/keyboard cleanup, SSR disclosure |
| `src/lib/navigation.ts`                                                          | Verified route configuration, current-route and boundary policies           |
| `src/styles/tokens.css`                                                          | Pill radius and responsive navigation height                                |
| `src/app/(public)/layout.tsx`                                                    | Focusable main target for the preserved skip link                           |
| `src/app/(public)/page.tsx`                                                      | Existing hero receives `data-navigation-hero="dark"` only                   |
| `tests/navigation.test.ts`                                                       | Three pure policy tests                                                     |
| `playwright.navigation.config.ts`, `tests/navigation-browser/navigation.spec.ts` | DB-disabled production Chrome checks                                        |
| `package.json`                                                                   | Adds `test:navigation` script; no dependency changes                        |

`Brand` remains a server-rendered slot, avoiding settings/database code in the browser. Navigation uses only existing routes: `/`, `/experiences`, `/events`, `/destinations`, `/gallery`, `/about`, `/contact`. Nested routes mark their parent link current. The homepage wordmark is the desktop home link; the mobile panel includes an explicit Accueil link. Existing link prefetch policy is retained.

For Phase 03, keep the hero as a direct child of `#main` and opt in with `data-navigation-hero="dark"` only on a contrast-reviewed hero. Reserve `--s-navigation-height` in its content spacing. The existing homepage-only overlay margin is present in SSR, not inserted after hydration. Header height is 80px below 1200px and 104px above; appearance changes never change these dimensions. Other pages remain in normal flow. Missing hero/observer APIs and no JavaScript use the solid presentation. Keyboard focus or an open mobile panel also produces a solid header surface. Do not couple navigation state to the future GSAP hero timeline.

Desktop uses three grid columns at ≥1200px. Tablet uses the menu plus events action at ≥700px. Smaller screens expose the events action inside the menu, preserving space and 44px touch targets. The modal has a name, initial close-button focus, Tab/Shift+Tab cycle, inert background, Escape/backdrop/close actions and focus restoration. Actual route navigation closes immediately; resizing to desktop closes and unlocks scrolling. Scroll-lock compensation preserves existing styles without forcing a scrollbar gutter on overlay-scrollbar browsers. Short landscape panels scroll internally. No-JS/unsupported-dialog browsers retain a keyboard-operable disclosure.

IntersectionObserver changes state at the hero boundary, without scroll polling; ResizeObserver reconnects only when header height changes. CSS handles small transitions, honoring the shared Phase 01 reduced-motion/saved-disable/data/visibility preference. Observers, breakpoint listener, close timer and temporary root styles are cleaned up. No GSAP import, additional animation library or dependency was added.

## Validation evidence

Windows Node 24.19.0, locked Next 16.4.0 / React 19.3.0:

| Check                     | Result                                               |
| ------------------------- | ---------------------------------------------------- |
| `npm run typecheck`       | Pass                                                 |
| `npm run lint`            | Pass                                                 |
| `npm test`                | 22 pass: original 15 + Phase 01's 4 + navigation's 3 |
| `npm run build`           | Pass, Prisma generation and production Next build    |
| `npm run test:navigation` | 10 Chrome tests pass                                 |
| `npm run test:motion`     | 8 Phase 01 Chrome regression tests pass              |

The first restricted unit-test run encountered the known Windows `uv_os_get_passwd ENOMEM` sandbox issue; the unrestricted local retry passed. Browser checks actually ran against a local production server, with explicit empty `DATABASE_URL`, dummy authentication secret and isolated media directory. They never run fixture preparation, database tests, imports or migrations. Build checks also disabled database access. Existing `.env` values were not changed or logged.

Navigation checks cover transparent/scrolled/return states, fixed height/sticky position, all desktop routes/current semantics, mobile focus cycle/Escape/restoration/backdrop, route and breakpoint close, short screens, 320/390/700/768/1024/1199/1200/1440/1920px reflow, saved disable/reduced motion, no-JS and missing-API fallbacks, skip-link focus, and matching server/hydrated header/brand/action geometry at 390/768/1440px. Screenshots at desktop/mobile widths and with the menu open were generated and visually reviewed. No horizontal overflow was found. Scoped axe-core 4.14.0 checks (already in the locked ESLint dependency tree) report no WCAG A/AA rule violations for the navigation in hero, scrolled and open-menu states. White-on-veil contrast also passes a worst-case white-background calculation. This is component coverage, not full-site accessibility certification or screen-reader testing.

Unique initial homepage JavaScript resources were measured with local production Chrome before/after and individually gzip-compressed using Node zlib:

|                   | Raw bytes |           Gzip bytes |
| ----------------- | --------: | -------------------: |
| Phase 01 baseline |   491,112 |              148,326 |
| Phase 02          |   498,972 |              151,372 |
| Increment         | **7,860** | **3,046 (2.97 KiB)** |

This is initial-route JS, not a Lighthouse score, total-site payload or measured Hostinger transfer encoding. Public navigation loads no ScrollTrigger runtime chunk (verified against actual requested hashed JS contents). The Phase 01 optional motion-engine budget exception remains separate. No font/icon/animation dependency was installed. Measurement JSON and screenshots remain in ignored `.local`/test-results artifacts.

No DB writes or service startup were needed. Prisma/auth/API/content-service files and lockfile were not modified. The existing uploaded WebP still hashes to `ac847f45641cb91bc1530bfd938f6dc44b7f1f98900851c9a2b66fa1b02eef37`; no upload or flagged record was altered. Git history is preserved; this phase is committed locally without a remote push or deployment.

## Limitations and exact next step

The navigation foundation is ready for Phase 03. Official brand/hero assets and content decisions, the second visual reference, real-device CPU/scroll profiling, Safari/Firefox and assistive-technology review remain pending. Linux validation, external media storage and actual Hostinger staging remain separate deployment gates. Existing demo artwork is still labeled provisional; it is not the new hero. CMS transactions and database-backed route content were intentionally outside these DB-free frontend checks.

Exact next step, after a separate Phase 03 instruction: implement the cinematic hero as a server-readable marked region using approved assets/content, the Phase 01 motion engine and navigation-height spacing contract; review motion budget and real-device behavior before public integration. **Stop after Phase 02. No Phase 03 work, deployment or GitHub push is included.**
