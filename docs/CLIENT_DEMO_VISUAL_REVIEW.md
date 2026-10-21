# Private client demo — visual review

Reviewed 2026-10-20 against the running loopback preview. Review only: no application fixes, content changes, database operations, approval changes, staging, commits, pushes or deployments. Application work remains on `demo/client-preview`; no new website phase is started.

**Assessment:** suitable for a private client walkthrough, with two corrections recommended before final visual sign-off. The first gallery image's framing is the priority; footer readability is next. This assessment grants no public-media or deployment authorization.

## Findings, in priority order

### 1. Main carousel crop hides embedded credits and cuts the group — high priority

At 1440px and 375px, select photograph **01 / 12**, the mountain/group scene. The primary card uses a fixed 3:2 frame and `object-fit: cover`. This source is approximately 5:4, so the default view removes top/bottom content: the embedded Sakado/Creativas marks visible in the full image disappear, and participants' lower legs/feet are truncated. The full-image dialog preserves them, but that does not correct the first visible framing. The original file is intact; this is a display-crop issue, not evidence that the source was edited.

Recommended next change: preserve the complete central photograph with `contain` or an appropriate per-image frame/focal treatment that retains both people and embedded credits. Keep the existing carousel composition and full-image interaction; no source edit or credit removal is needed.

Evidence: [desktop carousel](../.local/visual-review-2026-10-20/photos-1440.png), [mobile carousel](../.local/visual-review-2026-10-20/photos-375.png), [complete photograph](../.local/visual-review-2026-10-20/first-photo-full.png).

Relevant source: `src/components/client-demo/gallery-carousel.module.css:3`, `:49`, `:78`.

### 2. Footer type is too small for the surrounding design — medium priority

Computed desktop footer links/body are **10px**, with the privacy line at **8px**. Mobile links are **11px**, with privacy at **9px**. The large logo and generous whitespace make the text look even smaller. It is visibly harder to read than the rest of the page, especially on a phone.

Recommended next change: bring primary footer copy/navigation closer to 14px and secondary/legal copy closer to 12px, then recheck wrapping and touch areas. Preserve the footer's existing content, colors and hierarchy. These are design recommendations, not a claim that a particular minimum font size is mandated by an accessibility standard.

Evidence: [desktop footer](../.local/visual-review-2026-10-20/footer-1440.png), [mobile footer](../.local/visual-review-2026-10-20/footer-375.png). Computed sizes are recorded privately in `details.json`.

Relevant source: `src/app/globals.css:891`–footer rules and mobile overrides around `:1898`.

### 3. Partner strip has uneven optical sizing — low-priority polish

The SOPAL and Belle Rose marks occupy much less visible area than FINLOGIK and the circular seals despite sharing a nominal image height. The strip is orderly but its visual weight is uneven. Normalize the displayed optical footprint without distorting or editing original marks. The unidentified monogram still reads **Identité à confirmer**; its identity remains a human content decision.

Evidence: [partner strip](../.local/visual-review-2026-10-20/partenaires-1440.png). Relevant source: `src/components/client-demo/client-preview.module.css:301`.

## What works visually

- The scenic hero has a strong composition, readable headline/actions, restrained depth and a stable rounded frame. The 320px check retains readable content without horizontal overflow.
- Desktop typography, cream/green/gold palette, story image and milestone cards form a coherent presentation. Mobile milestones read naturally in order.
- The new photographic activity cards and subtle grid background suit the existing layout. Mobile cards keep clear labels and useful visual hierarchy.
- Team portraits have consistent treatment; supplied member names, order and roles remain intact. Mobile founder emphasis and subsequent two-column cards are balanced.
- The gallery's centered image/side previews provide a clear editorial focal point. Its framing issue above is localized; the interaction itself works.
- Partner motion is restrained and the final vision panel has strong contrast. The forthcoming-adventures message remains explicit rather than displaying invented events.

The current demo includes newer activity-photo cards, a changed supplied logo and a homepage gallery carousel. This review evaluates that live state; the older masonry-gallery screenshots and historical test counts are not substituted for it.

## Fresh checks performed

| Area | Observed result |
| --- | --- |
| Desktop | 1440 × 900; hero, story, timeline, activities, carousel, team, partners, vision and footer inspected |
| Tablet | 768 × 1024 with touch/coarse input; layout and gallery inspected; parallax correctly static under the touch policy |
| Mobile | 375 × 812, plus 320px narrow hero/overflow check |
| Hero depth | After 400px desktop scroll, background translated approximately +14.22px and text −4.44px; controls remain outside animated text |
| Gallery | Next control changed 01→02, caption updated, image dialog opened, Escape closed it and restored focus at all three main sizes |
| Mobile menu | Opens cleanly; Escape restores toggle focus after its close transition. An immediate pre-transition focus sample was inconclusive; the follow-up wait confirmed restoration |
| Reduced motion | Hero transforms cleared; all three milestone prose wrappers and the progress line returned to no transform and opacity 1 |
| No JavaScript | Hero copy visible; the fallback link opened `/gallery`, which rendered all 12 image links |
| Reflow | No document-wide horizontal overflow at 1440, 768, 375 or the additional 320px check |
| Loading/errors | No broken images found in inspected sections; no page errors or hydration warnings observed in the three main sessions |
| Privacy boundary | Live page used the private media adapter and returned noindex/nofollow/noarchive/noimageindex headers |

This was a local Chrome visual/interaction review, not a rerun of the historical 59-unit/42-browser suite. No build or source implementation was changed, so those counts are not presented as freshly passing here. No physical-device, Safari/Firefox, formal screen-reader or production hosting validation is claimed. Motion was reviewed through fresh before/after scroll states, static preference checks and the live component behavior; no new performance benchmark was run.

## Evidence and scope

Fresh screenshots and read-only browser observations are in ignored `.local/visual-review-2026-10-20/`, including `observations.json`, `details.json` and two review scripts. The preview launcher was restarted after the initial connection became unavailable. It binds loopback and disables the database; preparing its existing private derivatives does not edit original photos.

Only this report and ignored review artifacts were created. Existing application changes are preserved and remain uncommitted. The review does not change the 17 official BLOCKED assets, 85 PENDING REVIEW approval fields, Instagram records, authentication or schema.

**Exact next step:** separately authorize a small visual-polish pass for central gallery framing/credit visibility and footer readability, then repeat those desktop/mobile checks. Partner optical sizing can be included as minor polish. Do not advance the website phase or public release based on this visual review alone.
