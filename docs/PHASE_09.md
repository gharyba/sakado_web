# Website Phase 09 — authentic company content and client demo

Historical phase record. [PHASE_09B](PHASE_09B.md) supersedes its default-launcher description: the official local application is now primary; private preview requires `npm run dev:client` explicitly. Phase 09B also integrates the seven categories into the existing local CMS table after verified recovery preparation.

Date: 2026-10-21. Status: implemented and locally validated; ready for client review with the documented asset limitations. Branch: `demo/client-preview`, preserving HEAD `0e2c147` and the existing uncommitted private-preview/motion work. Scope: incremental implementation and local verification only. No Git staging/commit, schema/migration, provider resource, remote connection, push or deployment.

## Implemented scope

| Priority | Result |
| --- | --- |
| P09-01 Brand | Reused the accessible server-rendered `Brand` in desktop/mobile navigation and footer. The clean wordmark and existing temporary favicon remain; supplied private logos have no independently verified public permission. No invented official artwork or loading screen. |
| P09-02 Story | Centralized supplied company facts and three French chapters: 2017 founding by Mohamed Ben Beya, 2022 formal establishment, and today's nature/community philosophy. Reused the cinematic timeline with progressive reveals, responsive intensity and reduced-motion cleanup. |
| P09-03 Team | Exact five members/roles/order on homepage and About. Shared editorial portrait frames use initials and “Photo à venir” without public portrait authorization. Existing private preview still displays its separately supplied private portraits under its original guards. No developer inserted into the company team. |
| P09-04 Discovery | Seven real activity categories with French editorial descriptions and working contact links. Existing event/destination DTOs, details, filters and CMS loaders preserved. Demo examples remain illustrative, with no invented dates, prices, seats or bookings. |
| P09-05 Homepage | Preserved “Explorez. Respirez. Vivez l’aventure.”, existing hero/navigation, About, adventures, destinations, gallery, community, Instagram fallback and contact. Added one timeline and one team section to the normal homepage. No replacement of the existing private photo homepage. |
| P09-06 Demo | Exact requested `DEMO_MODE=true` / `npm run dev` selects the safe company demo, without PostgreSQL or the private media adapter. Loopback only; noindex/private/no-store. Ordinary CMS and authenticated application operation remain available through their original paths. |
| P09-07 Governance | Existing registry remains 17 BLOCKED assets / 85 PENDING REVIEW axes. No approval evidence inferred from file presence, supplied photos or Instagram. Source integrity exception S16 is recorded below; no manifest repair or automatic permission changes. |
| P09-08 Polish/QA | Footer typography/touch targets enlarged, including the old mobile anchor override. Active private carousel photo now uses contain to preserve its full composition/embedded credit; side peeks retain their composition. Added focused company and browser tests; local results recorded below. |

## Content provenance

**User-confirmed text:** Sakado Sfax; founded 2017 by Mohamed Ben Beya; formally established 2022; “Vivre la nature autrement.”; Tunisia/nature/community mission; safety, nature respect, community, discovery and authentic human connection. Names/roles:

- Ben Beya Mohamed — Fondateur.
- Bouzrara Manel — Gérante.
- Aladin Jemni — Graphiste / Animateur.
- Jad Tagougui — Photographe / Vidéaste.
- Ayoub Hamza — Guitariste / Chanteur.

Real categories: Randonnée, Camping, Kayak, Paddle, Exploration côtière, Aventures en forêt, Retraites nature. Descriptions are editorial presentations of those supplied categories, not approved scheduled products, safety certifications, itineraries or availability claims.

**Illustrative:** existing demo events/destinations and their safe SVG artwork, gallery illustrations, development-only hero illustration, example value-proposition copy explicitly labeled for validation. No fictional listing is represented as an operational outing. Instagram uses the existing honest fallback/link rather than invented posts, fetched previews or implicit publication of the 45 imports.

**Awaiting public approval:** official logo/vector/raster masters, favicon/metadata artwork, all five portraits, scenic/activity/gallery photos, partner identities/marks and publication permissions. Private client-preview files remain private. `SAKADO-MEDIA/approved` was inspected and is empty. A source photograph or supplied crest is not an authorization document.

## Architecture and modified files

- `src/data/confirmed/company.ts`: shared confirmed facts, chapters, team and activities; no data-access or animation logic.
- `src/data/confirmed/site.ts`: confirmed story/mission/values/year defaults. Existing `getSettings` still merges editable CMS settings over defaults; no records are seeded or overwritten.
- `src/lib/content.ts`: explicit safe-demo branch returns the seven confirmed categories. Existing database queries and private-preview suppression remain. No duplicate CMS or new team schema/editor.
- `src/components/client-demo/client-home.tsx`: extracted shared `CompanyTimeline`; optional-media team/story fallbacks. Server-rendered content stays visible without JavaScript; existing MotionScene/Motion/MotionSurface own enhancement. A future portrait adapter must use an approved public media resolver rather than the private index.
- Public homepage/About: reuse the timeline/team once per page. Experiences adds meaningful contact CTAs. Contact disables submission in demo mode. Public layout adds a scoped demo class; header disclosure describes examples honestly.
- `src/components/site-footer.tsx`, `src/styles/company.css`, root layout: scoped reading/touch-target polish without admin selectors, new motion owners or global scroll listeners.
- `src/components/client-demo/gallery-carousel.module.css`: active photo containment; original files and carousel interaction logic unchanged.
- `src/proxy.ts`: demo responses receive the existing private/no-store/noindex treatment. Authentication and mutation authorization are unchanged.
- `scripts/dev.mjs`, `package.json`: safe demo launcher routing and `test:phase09`. No new package or lockfile change.
- `tests/company.test.ts`, `playwright.phase09.config.ts`, `tests/phase09-browser/company.spec.ts`: confirmed-content, responsive, public-route, admin, private-media, reduced-motion and no-JS checks. Existing production private-preview test now expects public initials/team text while still rejecting every private image.
- `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/CLIENT_DEMO.md`, this report: current instructions and launch distinctions. Pre-existing edits outside this list are retained, not attributed to Phase 09.

CMS branding/story fields remain maintainable through existing settings. Shared team/chapters are source-managed because there is no existing team model/editor; a future CMS extension requires a separately reviewed scope. Database-backed behavior was preserved by inspection and pure-policy tests; no live database login/CRUD or fixture suite was performed for this phase.

## Motion, responsive and visual review

Reused GSAP 3.15.0 and ScrollTrigger; no dependency added. Existing opt-in reveal/timeline/portrait choreography, native scrolling, MotionToggle and system reduced-motion priority remain. Controls stay outside transformed text targets. Mobile uses existing lower-intensity/static motion strategies. No global smooth scrolling, WebGL, new scroll handler or animated business state.

Reviewed Chrome screenshots at 1440 × 900, 768 × 1024 and 375 × 812: existing rounded hero, sticky navigation, three chapters, all five team cards, footer, and static/mobile fallbacks. No horizontal overflow or hydration/page errors observed in focused tests. Initials preserve portrait geometry. The safe production hero intentionally has no development illustration and skips its image engine; scenic fidelity remains limited until explicit approved media is selected.

Screenshots and browser artifacts are ignored under `.local/phase09/`; existing private review screenshots remain under `.local/client-preview-review/`. These are local Chrome/layout/keyboard checks, not physical-device, screen-reader or formal WCAG certification. The existing private-preview suite also sampled 90 warm desktop frames at 4× CPU throttling: median 8.4ms, p95 16.9ms, zero frames over 50ms, no observed long tasks or layout shift. This development-browser sample is not a real-device performance certification or a safe-demo production benchmark. No numeric bundle-delta measurement is claimed. Reusing existing client motion chunks avoids a new animation dependency; timeline/team add their actual DOM and existing enhancement work.

## Source integrity and media gates

Read-only check on 2026-10-21: **16 of 17** original files are present at their recorded paths and match the manifest SHA-256 values. **S16 is missing** from its recorded `C:/Users/Dell/Desktop/sakado-photos` location; the folder currently contains 16 files. This is missing-source evidence, not evidence of changed photo bytes. No original was written, relocated, removed or reconstructed during this task. Do not claim a fresh 17/17 source verification. Restore/locate S16 and verify its existing hash before future integration; do not rewrite its identity to conceal the gap.

The source manifest, selection feedback and publication-readiness records were not modified. All 17 assets remain BLOCKED, all 85 source axes PENDING REVIEW, `publicationAllowed=false`. Build checks find no blocked photo copies in `public/`/`.next/static` and no private workspace files in 49 deployment traces. No database, upload, Instagram record, hardware diagram or evidence file is changed. Private/source directories remain Git-ignored.

## Validation

Local Windows, Node 24.19.0, Next 16.4.0, installed Chrome. No database fixtures, migrations, PostgreSQL startup, external service or production infrastructure used.

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS, including Next route type generation |
| `npm run lint` | PASS |
| `npm test` | 61 PASS, including two company tests and existing 17-asset/85-axis policy tests |
| `npm run build` | PASS; public-media pre/post gates and all 49 private-trace checks PASS |
| `npm run test:phase09` | 14 PASS against DB-disconnected development and production servers; final mobile link measurement included |
| `npm run test:client` | 42 PASS, including private media boundaries, production denial, text zoom, carousel, motion lifecycle and performance sample |
| Final targeted private reflow rerun | 3 PASS after the shared-section wrapping adjustment: carousel 320px, static controls 320px, 200%-text/400%-equivalent reflow |
| `npm run test:phase04` | 7 PASS, including normal public gallery/About and isolated read-only admin/media readiness presentation |
| `npm run test:hero` | 9 PASS, existing responsive hero, real scroll behavior, cleanup, static production fallback, no-JS and accessibility checks |
| Exact requested demo launcher/startup | PASS on loopback 3000: HTTP 200, five team cards, seven categories, zero private images/hydration errors, working MotionToggle, noindex/private/no-store |

Initial browser failures were incorrect test assumptions, corrected after source inspection: GET on a POST-only resource returned 405; the admin GET assertion now uses the actual protected export endpoint. Production correctly omits the development illustration, so its reduced-motion test asserts static visible content. No authorization/media policy was relaxed to pass. Next development can warn when route/automated scrolling makes the lazy trail illustration the LCP candidate; no blanket eager-loading change was made. Playwright emits the environment's NO_COLOR/FORCE_COLOR warning.

The first full private-browser run passed 40/42 and exposed a real footer regression at 200% text size: larger links forced the old mobile grid's min-content columns beyond 320/360px. Scoped `minmax(0, 1fr)`, zero child minimum width and wrapping fixed it without clipping the page or shrinking text. The complete rerun passed 42/42. Adding the same enlarged-text assertions to the safe demo then exposed a shared-timeline dependency on the private homepage's inherited wrapping. Shared sections now carry their own wrapping, and the mobile timeline uses a zero-minimum grid track. Direct checks confirm 360/360px and 320/320px document/viewport widths without page clipping. The final safe-demo suite exercises this behavior in both development and production.

Public route smoke checks returned 200 with a visible page heading for `/`, `/about`, `/experiences`, `/events`, `/adventures`, `/destinations`, `/gallery`, `/gallery?view=instagram`, `/contact`, `/privacy`, `/events/demo-camping` and `/destinations/demo-foret`. Admin page access redirects to login; unauthenticated admin export GET and event POST return 401. Contact submission and illustrative event registration stay unavailable. No real login session or database-backed CRUD claim is made. Exact-launcher evidence is ignored at `.local/phase09/startup-smoke.json`; media recheck evidence is `.local/phase09/media-verification.json`. Read-only Git checks find no staged files, no tracked private directories, no protected source/lockfile/schema/media-report changes and no whitespace errors.

## Launch the company demo

From the repository root on Node 24, with installed locked dependencies:

```powershell
$env:DEMO_MODE = 'true'
npm run dev
```

Open **http://127.0.0.1:3000**. Ctrl+C stops it. No PostgreSQL or admin setup is needed. The child process clears `DATABASE_URL`, `CLIENT_DEMO`, `CLIENT_DEMO_DIRECTORY`, `SITE_URL` and `ADMIN_URL` even if the shell had configured them. Production/staging invocation is refused. This selects the safe text/illustration demo; it does not publish the separately supplied private photos.

For the separately authorized local photo presentation, stop the server and run `npm run dev:client`. Without an explicit `DEMO_MODE=true`, `npm run dev` preserves that historical shortcut. For ordinary application development, use `npm run dev:app` with the existing safe local configuration. No preview may be tunneled, bound to a LAN listener or treated as staging access control.

## Remaining launch actions

1. Human review of Phase 09 text, responsive presentation and temporary asset treatment.
2. Obtain independently verified official logo/portrait/scenic/partner rights and all applicable participant/minor/credit/publication decisions. Locate S16 and verify its existing SHA-256; keep all registry records blocked until the separately authorized evidence workflow is satisfied.
3. Approve real events/destinations, operational contact details, registration terms and policies before replacing examples/enabling transactions. Source-controlled team/chapters can later receive an explicitly scoped CMS extension.
4. Provider evidence is still BLOCKED/NOT TESTED: actual Hostinger Node 24, approved hostname/HTTPS, restricted dedicated staging, external PostgreSQL, durable media storage, countries/privacy review, secrets, restore/rollback and real staging validation. Historical local/CI results are not provider clearance.
5. Review the uncommitted changes and prepare a new reviewed release candidate only after the relevant gates and explicit authorization. No commit, push, resource provisioning, deployment or following phase is performed here.
