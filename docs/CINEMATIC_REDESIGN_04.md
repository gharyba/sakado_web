# Cinematic Redesign 04 — Votre prochaine échappée

Date: 2026-10-23. Branch: `feat/cinematic-redesign-04`. Baseline HEAD: `e6fb7166d8a547c5ba75d26d58b2b95b7ae9ed46` (also local main). **Implemented for local review; final client acceptance and public launch are not approved.** No staging, commit, push, merge or deployment.

## Preservation and reproducible baseline

Read AGENTS, architecture/design/motion guidance, Redesigns 00–03, production/media restrictions, the earlier Redesign 04 plan in the conversation, and the installed Next.js server/client component guidance. Inspected the official homepage/About/gallery, category/content services, event cards, company story, motion recipes and existing browser coverage.

The working tree was clean on the expected branch. Before editing, copied all **375 tracked/proposed source files** into ignored `.local/recovery/cinematic-redesign-04-20261023-194823-ac12ec/source/`; independently verified every source/copy SHA-256. Manifest, HEAD, branch and working/index patches are retained there. `.local/redesign04-current-run.txt` points to this run. No ignored secrets, database files or private photographs were copied into this source snapshot.

A guarded repeatable-read **READ ONLY** transaction recorded all 15 authoritative table/schema fingerprints. Checksums cover 397 protected files, including real environment/lock/schema, media ledgers, private originals/derivatives and the held hardware upload. Post-test comparison matched that baseline. The PostgreSQL service was retained. Existing recovery material remains untouched.

The first baseline build hit Prisma's Windows library lock while the existing presentation was running. Under the user's earlier pause/restart approval, verified the loopback listener and exact three-node presentation process tree, stopped only that tree, then successfully rebuilt the unchanged baseline. PostgreSQL was not stopped. Baseline and final client-chunk hashes/sizes are retained in the ignored run. This is a same-device recovery snapshot, not off-device backup evidence.

## Implemented scope and creative rationale

The new editorial experience chapter gives the seven existing CMS categories clearer hierarchy between upcoming adventures and company history. Ivory serif titles, generous spacing, subdued ordinal markers, gold existing icons/arrows and bounded translucent navy cards inherit the existing continuous atmosphere. The closing rule is decorative; no full-width section color band, photo, new font or animation engine was introduced.

The concept name is this milestone's title. The public heading remains the existing **“Quelle aventure vous ressemble ?”**, with the existing eyebrow and category prose. The section adds only the existing navigation label “Nos expériences.” No difficulty, duration, price, availability, ranking, recommendation or business claim is inferred. Display numbering is aria-hidden and follows CMS order; it is not popularity.

Homepage order remains hero → manifesto → upcoming adventures → experiences → company story → existing later sections. Redesigns 00–03, About/history, team, gallery, navigation and footer implementations remain unchanged.

## Exact files changed

| File                                                  | Change                                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(public)/page.tsx`                           | Replaces only the two inline section compositions with server components; existing fetches and upcoming selection remain    |
| `src/components/experience-category.tsx`              | Accessible editorial link, complete CMS prose, decorative number, slug-based existing icon, neutral compass fallback        |
| `src/components/home/experience-discovery.tsx`        | New server-rendered semantic section/list; preserves all returned categories and order, with existing zero-category message |
| `src/components/home/upcoming-adventures.tsx`         | New server-rendered composition retaining EventCard, three-card limit, existing copy and native event/contact links         |
| `src/components/home/experience-discovery.module.css` | Scoped navy/ivory/gold layout, typography, focus, preference-gated interactions and responsive reflow                       |
| `tests/experience-discovery.test.ts`                  | Five new server-rendered regression cases                                                                                   |
| `tests/redesign04/render.ts`                          | Test-only renderer/CSS-module hook and synthetic category factory; not imported by application code                         |
| `tests/redesign04-browser/render-fixtures.ts`         | Generates ignored synthetic HTML/CSS fixtures; no application route or database fixtures                                    |
| `tests/redesign04-browser/discovery.spec.ts`          | Eight new production-browser cases, including responsive captures and scoped axe checks                                     |
| `playwright.redesign04.config.ts`                     | Isolated loopback production browser configuration; dummy unreachable database and private presentation disabled            |
| `tests/phase09b-browser/official.spec.ts`             | One assertion corrected from raw decorative text to the existing hero's accessible name                                     |
| `docs/CINEMATIC_REDESIGN_04.md`                       | This implementation/evidence report                                                                                         |

Reused: ExperienceCategory, Icon, Link, HomeWords, MotionSurface, SectionHeading, EventCard and the existing parent MotionScene. No dependency, lockfile, Prisma/schema, CMS service, role, auth, media policy, optimizer, production environment or private-presentation implementation change.

## CMS and component boundaries

`getExperiences` still filters enabled/confirmed categories server-side and orders by existing CMS order. Its data reaches the new composition through the original homepage Promise.all. There is no second fetch, sorting, seven-item cap or content replacement. Zero/one/seven/nine-item cases are tested; future unknown category slugs receive a neutral compass icon, including prototype-like names.

Names/descriptions stay complete, React-escaped server HTML. Missing descriptions omit their aria-describedby association. Native links remain `/experiences#slug`; each existing heading/anchor destination remains intact. The card accessible name is its visible title, with the description associated separately. Decorative ordinal/icon/arrow content is hidden from assistive technology. List items contain one native link, without nested controls.

The original upcoming lifecycle/date/featured selection remains in the homepage. The new upcoming component retains the three-event slice and unchanged EventCard behavior. Empty state retains the actual announcement text, a clear contact link and the event-listing link; no event or registration promise is fabricated. The component has no booking, capacity, waitlist or mutation logic.

## Responsive behavior and motion

- 1440px: three columns; 768/1024px: two; 320/375px: one. Container widths and minimum rem tracks allow fewer columns when enlarged text needs more room.
- No fixed card height, truncation, horizontal carousel, hover-only details or required gesture. Descriptions and long/unbroken French titles wrap naturally; equal row stretching does not clip content.
- Existing HomeWords heading entrance is owned by the existing parent MotionScene. No new GSAP timeline, scroll listener, pointer listener, frame loop or animation owner.
- Existing MotionSurface preferences gate 180ms border/surface transitions. Only the decorative arrow moves 4px on capable fine-pointer hover. Cards, headings, link targets and focus outlines do not translate.
- Pending/no-JS, saved off, save-data, coarse pointer and reduced-motion states do not receive these optional transitions. Keyboard focus remains visible through a 3px gold outline with 4px offset. Controls remain immediately usable.
- Scoped axe WCAG-tagged checks found no violations in the discovery section. 200% text enlargement and 320px reflow passed. These checks do not certify screen readers, every gradient state, physical-device zoom or all site content.

## Performance — actual before/after measurements

Both successful production builds used the same installed Next.js 16.4.1/dependency tree and application build/media gates. Every emitted client JavaScript chunk's content hash matched before/after:

| Measurement                           | Baseline |   Final |
| ------------------------------------- | -------: | ------: |
| Emitted client JS chunks              |       29 |      29 |
| Combined raw JS bytes                 |  983,093 | 983,093 |
| Sum of individually gzipped JS chunks |  321,357 | 321,357 |
| Lazy motion chunk raw bytes           |  126,167 | 126,167 |
| Lazy motion chunk gzip bytes          |   47,989 |  47,989 |

**Zero added client JavaScript bytes.** The composition and scoped styles are server-owned; the existing client boundaries are reused. No images/downloads were added by discovery. The totals above cover all emitted JS chunks, not initial-route network transfer or field Core Web Vitals. The pre-existing motion chunk still exceeds the original 30 KiB target; this phase does not claim that budget passes. No controlled cold-network/new-section or physical-device performance certification was performed.

## Executed validation

All results below were executed in this implementation, on local Windows/Chrome. No destructive E2E/CI database fixtures ran.

| Check                                                | Final result                                                                                                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                                           | PASS, including final recheck after browser servers stopped                                                                                                                      |
| ESLint                                               | PASS without warnings after removing the unused homepage import                                                                                                                  |
| Full unit suite                                      | **82 PASS**, zero failures/skips; includes five new discovery cases and Windows ACL/session/startup security regressions                                                         |
| Production build                                     | PASS; 17-asset pre/post public-media gate and 52 private deployment traces pass                                                                                                  |
| New discovery browser suite                          | **8 PASS**; 320/375/768/1024/1440, CMS order/links, zero/one/seven/nine, long French text, enlarged reflow, keyboard, reduced motion, saved off, save-data, no-JS and scoped axe |
| Existing homepage/story/gallery media suite          | **7 PASS**                                                                                                                                                                       |
| Existing hero development/production suite           | **9 PASS**                                                                                                                                                                       |
| Existing protected presentation/story suite          | **18 PASS**, including logout/replay, source/derivative mismatch, responsive/no-JS/story cleanup and production denial                                                           |
| Synthetic production-denial browser suite            | **6 PASS**, operational and demo production with dummy database/no private photographs                                                                                           |
| Official production/read-only database browser suite | **7 PASS**, including actual seven-category content, empty listings, auth/media denials and no-JS                                                                                |
| Unique browser cases across six suites               | **55 PASS**; final capture-only recheck is an additional repeat                                                                                                                  |
| Source secret guard, formatting and whitespace       | PASS; all 384 proposed source files scanned, all 12 changed/new files formatted, Git whitespace clean                                                                            |
| Database/protected-file preservation                 | All **15 tables/schema and 397 files unchanged**                                                                                                                                 |

Corrections during validation: the first responsive test caught three columns at 1024px; the tablet minimum-track formula now caps the layout at two while allowing larger text to collapse further, and all eight cases were rerun successfully. Initial lint reported one now-unused Link import; removed it. The broader official suite exposed a pre-existing raw-h1-text expectation (spaces are absent between decorative clauses); checksums proved hero/test source unchanged from baseline. Corrected only that assertion to use the existing complete accessible name, then reran all seven official production cases successfully. No hero product change was made to satisfy the test.

Existing development LCP suggestions during scripted scrolling and NO_COLOR warnings remain visible in logs. They are not new controlled performance findings. Historical test/audit numbers in earlier reports were not relabeled as new executions. No new dependency audit, Linux run, provider validation or remote workflow was performed.

## Evidence and local visual review

Ignored execution logs, source recovery, read-only fingerprints and bundle manifests: `.local/recovery/cinematic-redesign-04-20261023-194823-ac12ec/`.

Public-only section captures: `.local/redesign04/browser-results/discovery-official-homepag-0bfff-nchors-and-story-continuity/discovery-{320,375,768,1024,1440}.png`. The capture-only screenshot style hides fixed navigation/skip-link overlays so they do not cover the tall section; application styling and keyboard tests are unchanged. Final captures wait for the existing heading entrance to reach full opacity. Desktop and phone captures were visually inspected. Long-copy fixtures are synthetic and remain ignored; no test route is deployed.

Protected presentation captures from its existing regression suite remain in their ignored private audit directory. They were not copied to public assets, this report, Git or Sites.

For review, use the restored loopback official presentation at `http://127.0.0.1:3134/dev/presentation`, enter the fresh ignored local code privately if it is still within its five-minute deadline, then scroll through upcoming adventures → experiences → Notre histoire. Inspect desktop, tablet and phone; test Tab/Enter and the existing animation toggle. Do not share the code or expose the service. Expiry and media restrictions remain unchanged.

## Client decisions and production blockers

The implementation is technically authorized for local review, **not final client acceptance**. Await feedback on card density, heading scale, spacing and overall direction before further redesign. No category photography is selected; adding it would require explicit category/asset mapping and publication decisions. Copy, category priority and public visual identity must not be inferred from this technical work.

All 45 imported Instagram records retain private/homepage-off flags. All 17 library assets remain BLOCKED; all 85 review axes remain PENDING REVIEW. Exact-candidate Linux/remote CI, actual hosting/HTTPS/proxy/cookie/cache/log/alert evidence, external PostgreSQL/TLS, durable private media, encrypted off-device recovery/rollback and business/privacy/media approvals remain unresolved. A passing local design review does not clear release gates.

Stop after Redesign 04. No Redesign 05, Git staging/commit/push/merge or deployment is authorized by this task.

## Final preservation and handoff

Final full-source comparison: 372 of the original 375 files are byte-identical; exactly the three intended existing files listed above changed, nine new source/test/report files were added, and no original is missing. Every recovery copy was reverified. HEAD remains `e6fb716`; the index is empty and branch unchanged. Git status contains only this 12-file source change set, all unstaged/untracked.

The prior official presentation was restored on loopback 127.0.0.1:3134. Health returned HTTP 200, owner/SYSTEM-only runtime permissions were verified, and the fresh expiring local code file was present without disclosure. The original PostgreSQL process remains running. A final post-restart READ ONLY comparison again matched all 15 table/schema fingerprints and 397 protected files. No source database, schema, authorization record, private original or approval ledger was changed.

Stop for client/developer review. No commit, push, merge, tag, publication or deployment occurred.
