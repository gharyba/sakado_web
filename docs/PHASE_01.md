# Phase 01 — frontend foundation and motion engine

Date: 2026-10-09. Local branch: `feat/phase01-motion-foundation`, based on safety commit `2558bb2` and baseline `0a0c542`. This is an incremental frontend foundation, not a homepage rebuild. No remote push/deployment, schema change, auth rewrite, upload operation, Instagram import/publication or database mutation was performed. PostgreSQL was not needed or started. Verified Phase 00.5 recovery files remain outside Git at the documented restricted location.

## Implemented files and contracts

| Path                                               | Responsibility                                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| src/styles/tokens.css                              | Provisional neutral palette, typography, rem spacing, gutters, containers, radius, shadow, motion and stacking tokens |
| src/styles/primitives.css                          | Namespaced opt-in layout/type/control/media CSS; no legacy/admin selector replacement                                 |
| src/components/ui/foundation.tsx                   | Server-compatible Container, Section, Button, ButtonLink and MediaFrame                                               |
| src/components/motion/motion.tsx                   | Server-compatible presentation markers; typed effect and bounded optional distance                                    |
| src/components/motion/scene.tsx                    | SSR-safe lazy client initialization, scoped lifecycle and cancelled pending import                                    |
| src/components/motion/preference.tsx               | Shared system/user/save-data/visibility preferences and visible MotionToggle                                          |
| src/lib/motion/policy.ts                           | Pure breakpoint, travel-cap, pin-safety and demo-gate policy                                                          |
| src/lib/motion/runtime.ts                          | GSAP context/matchMedia/ScrollTrigger, refresh coordination and owned cleanup                                         |
| src/app/dev/motion/                                | Isolated SSR demonstration and scoped laboratory CSS                                                                  |
| playwright.motion.config.ts; tests/motion-browser/ | Independent DB-disabled Chrome checks; no fixture preparation                                                         |
| tests/motion.test.ts                               | Four focused policy tests                                                                                             |

Root layout imports the token/primitives files; global forced smooth scrolling is removed. next.config.ts adds private/no-store and noindex headers for /dev paths. No public navigation change is made. Package metadata/lockfile add only **gsap 3.15.0** (ScrollTrigger is included); existing resolved dependency versions are unchanged. `test:motion` runs only the isolated browser suite.

## Integration example

```tsx
import { Motion } from "@/components/motion/motion";
import { MotionScene } from "@/components/motion/scene";
import { MotionToggle } from "@/components/motion/preference";
import { Container, Section } from "@/components/ui/foundation";

// Remains a server component. Fetch approved content outside motion utilities.
export function ApprovedStory({ heading }: { heading: string }) {
  return (
    <Section className="s-foundation">
      <Container>
        <MotionToggle />
        <MotionScene>
          <Motion effect="reveal">
            <h2 className="s-heading">{heading}</h2>
          </Motion>
        </MotionScene>
      </Container>
    </Section>
  );
}
```

Keep prose, controls and semantic reading order independent from depth layers. Background/foreground/transition are decoration-only (aria-hidden, no focusable descendants); put them in a positioned, clipped media frame with enough overscan. A reveal target must not contain controls. Pin only a short stable noninteractive panel; no nested pins or transformed pin ancestors. Use scene keys for changed content revisions. See [MOTION_SYSTEM](MOTION_SYSTEM.md) for exact caps and cleanup.

No scroll hijacking, global smooth-scroll engine, automatic looping animation, CMS animation code or business mutation is introduced. Reduced motion, user disable, save-data and hidden tabs use static content. Mobile/coarse input uses short opacity reveals only; tablet reduces travel and removes pinning. CSS starts visible, including when JavaScript or an optional animation chunk fails.

## Demonstration and validation

Run `npm run dev`, then visit `http://127.0.0.1:3000/dev/motion`. The route is available only when NODE_ENV=development. It returns 404 in production regardless of DEMO_MODE; no secret or public flag unlocks it. Abstract shapes and the existing trail SVG are technical placeholders, not approved Sakado assets. It is not linked in the public navigation or sitemap.

Validation commands:

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run test:motion
```

The browser suite requires installed Chrome and a current production build. It starts only temporary loopback dev/production servers on 3102/3103, using empty DATABASE_URL to disable existing DB reads, dummy AUTH_SECRET, demo mode and isolated media directory. It does not call existing fixture preparation, imports, migrations, provisioning or database tests. Build checks used an unreachable dummy database URL. Existing .env, uploads and recovery artifacts were preserved. The initial browser readiness probe used a dummy URL that still enabled DB reads; it was corrected to empty DATABASE_URL without changing application behavior or contacting the original database.

Final Windows Node 24 validation: typecheck, ESLint, **19 unit tests (15 existing + 4 new)**, production build and **8 Chrome browser tests** pass. Browser coverage: scroll transform changes, pin spacing/cleanup, disable persistence and live reduced-motion changes, resizing/short viewport, route leave/return, 320–1920px overflow, no-JS reading/anchors, coarse pointer/keyboard, save-data changes, blocked-storage session fallback and production 404/no navigation entry. Screenshots at 390/1440px are retained under ignored test-results and visually inspected. The initial restricted test process hit a Windows user-environment ENOMEM error; rerunning outside that restriction passed. Linux/browser-on-Linux validation was not performed.

## Limitations and next step

- GSAP/ScrollTrigger/runtime production chunk measured **45,132 bytes gzip (44.1 KiB)**, above the audit's 30 KiB incremental target. This explicit exception reflects the requested GSAP dependency. Re-measure the final bundle and review/optimize before integrating publicly; existing public routes do not load the motion engine.
- No representative mobile CPU/frame-time trace, full assistive-technology audit or full-site accessibility/performance certification is claimed. Chrome functional tests are not real-device profiling. GSAP uses shared internal scheduling while scenes are mounted; no custom perpetual scroll loop was added.
- The two primary reference screenshots, official identity/assets, content and final choreography remain **TO BE CONFIRMED**. The neutral laboratory is not final art direction.
- Existing CMS/auth/Instagram behavior was preserved; this phase's DB-free browser suite does not certify all CMS transactions. Linux, durable media and actual Hostinger staging remain separate gates.

Foundation is ready for a separately specified Phase 02, subject to visual inputs and motion-budget review before public integration. Exact next step: review this laboratory and supply the Phase 02 scope plus primary references/approved assets. Stop here; do not build the real hero/gallery/homepage or start Phase 02 automatically.
