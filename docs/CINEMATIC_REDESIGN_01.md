# Cinematic Redesign 01 — Midnight Forest environment

Date: 2026-10-22. This background correction supersedes flat dark fills and separate colored section blocks as the public visual direction.

## Continuous atmosphere

`src/styles/forest-environment.css` defines the public environment on `.s-company-site`, imported by the public layout. Its background spans the entire page, including the footer. The five-layer composition combines a long vertical forest gradient, a faint diagonal wash and three large elliptical glows. The glows belong to the page rather than individual sections, so content height changes do not create rectangular section edges.

The vertical base travels through near-black forest `#07110F`, deep pine `#0B1714`, dark moss `#10201B`, intermediate `#0D1B17`, then near-black forest again. Low-opacity shadow/atmosphere glows use `#163126` and `#1C3A2C`, positioned near 18%/16%, 84%/40% and 45%/83%. Tonal stops interpolate continuously; the image does not repeat or use fixed background attachment.

Manifesto, experiences, destination surround, team, community/social, Instagram surround, contact CTA and footer use transparent backgrounds. The About area and gallery continue the same canvas. Cards, timeline panels, portrait placeholders, filters and contact fields retain local dark surfaces, restrained borders and shadows. These bounded content surfaces do not paint full-width section backgrounds.

The hero background and shade have a stationary alpha mask fading from 55% to the bottom. This exposes the actual shared page gradient beneath the scenic image, instead of trying to match a section-end color. Only decorative planes are masked; text, focus rings, links and MotionToggle retain their opacity. Existing image selection, responsive containment and GSAP animation ownership are preserved.

## Text and controls

Scoped public variables use Warm Ivory `#F4EFE4` for primary text, Muted Sage `#B6C5B5` for secondary text and Antique Gold `#D7B77B` for accents/focus/CTA surfaces. CTA text uses near-black forest. No new copper wash is introduced. Public forms use dark controls with visible borders and the native dark color scheme.

As a conservative palette check against the strongest atmospheric swatch `#1C3A2C`, ivory has 10.83:1 contrast, sage 6.89:1 and gold 6.47:1. These checks cover these flat palette combinations; they are not a certification of every photographic crop, image caption or UI state. Existing photographic veils and readable content panels remain in place.

The scope is the official public layout, including its authorized local presentation. The older DB-disconnected private client adapter retains its separate layout. Admin styling and business logic are outside these selectors. No additional dependencies, animation engine, scroll listener, animated filter or oversized ambient DOM layer were added.

## Executed validation

- `npm run typecheck`, `npm run lint`: PASS.
- `npm test`: 70/70 PASS.
- `npm run build`: PASS on identical retry; 17-asset public audit and 52 private deployment traces PASS. The first run was interrupted by the existing Next.js security advisory reminder. Next.js recommends upgrading the affected locked version; dependencies were not changed by this styling task.
- Local Chrome production review: 15 route/viewport combinations, using the verified PostgreSQL application with both demo flags false. Homepage, About, Experiences, Gallery and Contact checked at 1440×900, 768×1024 and 375×812. All checked section backgrounds were transparent, the root retained the layered gradient, images loaded after scrolling into view, and horizontal overflow was absent.
- Full-page desktop/tablet/mobile captures and the tablet contact form were visually inspected: no hard horizontal section fill boundaries or background rendering artifacts observed. The atmosphere gradually lightens through the middle and returns to darker forest near the footer. Checks are local Chrome viewport emulations, not physical-device/display or cross-browser certification.
- `npm run test:presentation`: 9/9 PASS on identical retry after the advisory interrupted the first development-server launch. Existing checks cover S08, two identity-mapped portraits, gallery, desktop/tablet/mobile reflow, hero/MotionToggle lifecycle, reduced motion, keyboard/no-JS, hash fallback, optimizer refusal and production denial. The photographic hero capture was also inspected.
- Final read-only preservation comparison: all 15 table/schema fingerprints and 98 protected file hashes unchanged, including all 45 unpublished/homepage-off Instagram records and the media permission inputs. All 17 library assets remain BLOCKED and all 85 axes PENDING REVIEW.

Review captures and the temporary read-only review script/results remain ignored in `.local/gradient-review/`; presentation captures remain in their existing ignored audit directory. No private photograph was copied into public assets or this report. Local validation servers were stopped after review.

## Changed files and review boundary

- `src/app/(public)/layout.tsx`: imports the public environment stylesheet.
- `src/styles/forest-environment.css`: shared gradient, scoped public colors, transparent section wrappers and elevated surfaces.
- `src/components/home/parallax-hero.module.css`: blends decorative hero planes into the global canvas.
- `docs/CINEMATIC_REDESIGN_01.md`: this specification and validation record.

No database writes, media approvals, section restructuring, Git staging/commit/push or deployment occurred. Existing uncommitted work and the verified Redesign 00 recovery snapshot remain retained. Next step: review the local gradient treatment before authorizing further section design.
