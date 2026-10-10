# Website Phase 04 — safe cinematic media foundation

Date: 2026-10-10. Branch: `feat/phase04-safe-cinematic-media`, based on Phase 03 commit `c5a941b`. No push or deployment is authorized.

## Scope discovered

There was no dedicated Website Phase 04 specification. The architecture roadmap's “4 — Motion” row described hero depth, story progression, activity interactions, a CSS 3D gallery and Instagram reuse. The user's new Website Phase 04 request supersedes the old instruction to stop after Phase 03 and adds readiness enforcement and a protected status view. Phase 03 hero/navigation remain intact. This phase implements the bounded presentation foundation; approved-photo choreography and a complete photographic story remain blocked.

## Presentation

Homepage: preserve existing sections and CMS content. Extract About into `AboutStory`: server-render existing about/story/mission text, retain the labeled trail illustration, add optional entry reveals through the Phase 01 controller, and allow sticky art on tall desktop viewports. Controls stay outside revealed targets. Empty fields do not create chapters. Mobile/reduced-motion layouts stay in normal flow. This is not the proposed S03 → S02 → S09 → S13 → S12 photographic sequence, which still requires authorization and approved copy.

Activity links share the existing motion preference store through `MotionSurface`. Only the decorative arrow moves 4px on hover/focus when permitted. Descriptions and links remain visible.

Homepage and `/gallery` opt into the existing Gallery component's CSS perspective: 1000px, ±5° desktop / ±3° tablet, 16px hover depth. Image wrappers move; link hit areas and caption geometry stay stable. Keyboard focus flattens the card, mobile/touch stays flat, and system reduced motion or MotionToggle disables depth. Native dialog supports Escape and focus restoration. Photo links work without JavaScript. No WebGL, pointer loop, global scroll listener or new library. Event/destination galleries retain default presentation.

Instagram's importer, deduplication, flags, parent filtering, marquee, modal and pagination are reused. Only preview-image eligibility is added to its server loader/save endpoint. No Instagram record is changed.

## Readiness boundary

`media-readiness-policy.ts` is a pure validator, not a legal decision maker. `media-readiness.ts` is server-only. It reads the existing manifest/readiness JSON, verifies the manifest digest, unique IDs, filenames and source SHA-256, and indexes source and registered derivative hashes. Missing/inconsistent data fails closed for photographic media; the three existing explicitly labeled demo SVGs remain usable. Registry data and original/evidence paths never enter public component props.

Settings, event/destination covers, photo DTOs and Instagram previews are checked before serialization, preload or rendering. Existing published/authorized/CONFIRMED/parent checks still apply. `/media/[key]` checks returned bytes and withholds known blocked media even from authenticated previews. Demo mode/unconfigured DB returns 404 on upload-media URLs without querying PostgreSQL.

Every role's CMS HTTP mutation passes a gate before selecting covers, hero/logo or gallery authorization/publication flags. Uploads check both original bytes/name and normalized derivative bytes before storage/database writes. Instagram preview selection uses the same eligibility check. No API changes readiness, creates evidence or grants approval. Existing gallery flags remain the review mechanism for unrelated legacy CMS media; the role matrix is unchanged.

Static files bypass route handlers. `scripts/check-public-media.ts` scans `public/` before building and both `public/` and `.next/static/` afterward. It rejects registered blocked originals/derivatives, renamed exact copies, known asset filenames and symlinks, including accidentally bundled image imports. It changes no files. Next output tracing includes only the two non-sensitive registry JSON documents, never `SAKADO-MEDIA`/private evidence. Include these safe documents in any future reviewed source/deployment package; their currently untracked state is preserved in this task.

**Limits:** SHA-256 identifies exact bytes, not visually similar photos. Arbitrarily re-encoded/cropped and renamed files outside registered hashes cannot be attributed automatically. There is no face recognition/perceptual matching. Unregistered legacy uploads still require genuine human review using existing CMS controls. Operators must keep blocked files outside `public/` at runtime too; preflight is not a filesystem watcher. Trusted readiness metadata is not cryptographic proof of rights. A logo, filename, Instagram URL or passing technical check cannot establish permission.

## Protected review

`/admin/media-readiness` requires authentication and the existing gallery permission. It shows 17 IDs/filenames, five axes, rights holder, participant classification, minor priority, missing conditions and computed eligibility. It is read-only. No evidence contents, personal identifiers, original paths, download links or private previews are exposed. Gallery links to this view and withholds unavailable/blocked previews. Review-preview permission remains TO BE CONFIRMED.

PENDING REVIEW describes an axis; BLOCKED describes publication eligibility. Eligibility is not publication: explicit CMS selection/publication and parent checks remain required.

## Future human approval → eligibility → publication

1. Qualified humans review real rights, participant/minor requirements and hosting/privacy conditions. Signed documents stay only in the restricted ignored evidence directory. This code neither reads nor uploads them.
2. An authorized operator records safe review metadata in the readiness source through a separately reviewed workflow. There is no editor-facing approval endpoint/importer in this phase. Preserve the manifest identity binding; do not fabricate evidence or change source hashes to force acceptance.
3. Every applicable axis needs a `humanDecisions` entry: `axis`, exact `status`, `independentlyVerified: true`, safe `reviewerId` (`RV-…` / `LR-…`), safe `evidenceId` (`EV-…`, also in `evidenceIds`), meaningful `justification`, ISO `reviewDate`. NOT APPLICABLE is accepted only for participant/minor axes with a matching justified human decision. HIGH-priority participant/minor decisions require a legal-review identifier and `minorLegalRequirementsVerified: true`. An identifier alone does not establish legal qualification.
4. Confirm `websiteUseVerified`, `creditConditionsVerified`, `cropAndOptimizationVerified`, permitted use, non-expired permission (or explicit `NO EXPIRY (VERIFIED)`), reviewer/date and no unresolved issues. Supply `approvedRenditionHashes` binding exact licensed web derivatives. Prepare compliant derivatives without removing required credits/watermarks. The upload pipeline's exact normalized output must itself be reviewed/bound, or a future reviewed import workflow is needed.
5. Only after global hosting/privacy blockers are explicitly cleared may `publicationAllowed` and an asset's `ELIGIBLE FOR HUMAN PUBLICATION DECISION` state be recorded. All five axes must be resolved. These are necessary trusted human metadata, not automatic legal findings.
6. Eligibility never publishes. Use existing authenticated CMS controls to import/select/publish eligible bytes. Public loaders still check parent visibility. No React change is needed. File-backed readiness updates follow a controlled release; a persistent registry service can replace this adapter separately.

Current state: 17 BLOCKED; 85 PENDING REVIEW; no verified rights holders/permissions. Preferred hero S08, proposed About sequence and 12 gallery candidates remain proposals only.

## Preservation and validation

Preserve the three pre-existing demo-mode loader fixes. Git history, media exclusion, original photos, MEDIA-01–04 documents/approvals/checksums, hardware upload, schema/auth and database records are unchanged. No fixture setup, migrations or production database mutation is used for validation.

Commands: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:phase04`, plus affected Phase 01–03 browser regressions. Phase04 browser tests use a production loopback server, DEMO_MODE=true and an intentionally unreachable dummy PostgreSQL endpoint. They cover 375/390/768/1024/1440px homepage/gallery, image loading, overflow, keyboard dialog/filter controls, no-JS links, reduced motion, MotionToggle, private/static URL exclusion and anonymous admin/API denial. Admin screenshots use an isolated rendered presentation; they are not an authenticated database-backed workflow test.

Linux, Hostinger staging, external storage, authenticated CMS mutation E2E, real-device profiling and legal approvals remain separate gates. Stop after Website Phase 04.

## Execution results

| Check                                    | Actual result                                                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Strict TypeScript / Next type generation | PASS                                                                                                                                      |
| ESLint                                   | PASS                                                                                                                                      |
| Unit tests                               | 32 PASS; seven new readiness/static-file tests; all 15 original tests retained                                                            |
| Production build                         | PASS, including pre/post-build public/generated-static audits                                                                             |
| Website Phase04 Chrome                   | 7 PASS on current production build                                                                                                        |
| Phase02 navigation regression            | 10 PASS                                                                                                                                   |
| Phase01 motion regression                | 8 PASS                                                                                                                                    |
| Phase03 hero regression                  | 9 PASS                                                                                                                                    |
| Total browser cases                      | 34 PASS; no fixture preparation or database service used                                                                                  |
| Supported demo HTTP                      | GET / returns 200 with intentionally unavailable dummy DB; 12 public routes/resources plus OpenGraph checked                              |
| Responsive                               | 375, 390, 768, 1024, 1440px homepage/gallery and isolated admin presentation pass; no horizontal overflow                                 |
| Integrity                                | 17 originals, 12 existing MEDIA documents and the hardware upload retain baseline hashes; 17 BLOCKED / 85 PENDING REVIEW                  |
| Private evidence                         | Existing protected ACL retained (four rules, inheritance disabled); signed-evidence/review-export folders empty; no tracked library files |

Chrome checks cover keyboard lightbox/Escape/focus restoration, gallery filtering, no-JS image links, focus flattening, live reduced motion, persisted MotionToggle, image loading, no browser page errors, private/static URL denial and unauthenticated admin/API rejection. The 51 tested original-photo URLs (three route forms ×17), private dashboard/evidence/registry URLs and demo upload-media URL return 404. Known bytes are additionally checked by the server policy and static-file audits. This cannot prove identity of arbitrarily altered/renamed unregistered copies; retain the limits above.

Screenshot review caught and fixed About mobile overflow, clipping of its overlapping stamp and gallery-control spacing. Final screenshots are private local artifacts in `.local/phase04/browser-results-final/`: homepage/gallery at all five widths, About desktop/mobile reduced motion and admin presentation at all widths. Desktop/mobile gallery and About screenshots were opened and visually inspected. These depict labeled SVG demonstrations, not approved Sakado photos. Admin presentation screenshots do not verify authenticated database-backed CMS workflows.

No new dependency was installed. Production JS across all 28 static chunks changes from 922,377 to 924,108 raw bytes (+1,731; aggregate build output, not a route transfer metric). The initial demo-homepage request loads 11 JS resources, 500,409 raw / 151,919 gzip bytes by summing fetched chunk files; no ScrollTrigger chunk is among them. This is a local artifact measurement, not a network/real-device benchmark. The existing warm hero regression profile at 4× desktop Chrome CPU recorded median 8.3ms / p95 8.5ms frames, zero frames >50ms and no long tasks in the sample. It does not certify the new story/gallery with real photos. Next tracing includes the two safe registry files and no `SAKADO-MEDIA`/original photo paths.

## Final requested report

| #                          | Status                | Result                                                                                                                                         |
| -------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 · Requirements           | COMPLETE              | Discovered roadmap Motion scope and new media-safety/admin requirements; older Phase03 stop superseded by explicit request.                    |
| 2 · Implementation         | COMPLETE              | Bounded About motion, activity interactions, opt-in CSS depth gallery and readiness guards.                                                    |
| 3 · Files                  | COMPLETE              | File groups below distinguish new work from preserved user changes.                                                                            |
| 4 · Public pages           | COMPLETE              | Homepage and gallery presentation enhanced; shared cover/settings/photo/Instagram DTOs and `/media` guarded; existing routes preserved.        |
| 5 · Admin                  | COMPLETE              | Protected read-only `/admin/media-readiness`, navigation/gallery link and preview withholding; mutation/upload selections gated for all roles. |
| 6 · Readiness source       | COMPLETE              | Read-only JSON/manifest identity validation; no statuses changed or evidence created.                                                          |
| 7 · Exclusion              | COMPLETE              | Registered-byte/name guards before public props/media response, CMS selection/upload and pre/post-build static checks.                         |
| 8 · Assets                 | COMPLETE              | Existing labeled camp/trail/coast SVG demonstrations only; production hero remains static without selected media.                              |
| 9 · Instagram              | COMPLETE              | Existing system reused; no duplicate system, imports or record mutations.                                                                      |
| 10 · Responsive            | COMPLETE              | All five widths pass; screenshots captured.                                                                                                    |
| 11 · Accessibility         | PARTIALLY IMPLEMENTED | Affected keyboard/focus/no-JS/reduced-motion behavior verified; full screen-reader/site-wide accessibility audit not performed.                |
| 12 · Privacy/security      | COMPLETE              | Current 17 excluded, private URLs denied, ACL/Git exclusion retained, no private evidence copied; hash/trusted-operator limits documented.     |
| 13 · Lint                  | COMPLETE              | PASS.                                                                                                                                          |
| 14 · Typecheck             | COMPLETE              | PASS.                                                                                                                                          |
| 15 · Tests                 | COMPLETE              | 32 unit and 34 browser cases pass; authenticated CMS mutation E2E remains not run.                                                             |
| 16 · Build                 | COMPLETE              | Next16 production build and both static audits pass.                                                                                           |
| 17 · Remaining phase work  | PARTIALLY IMPLEMENTED | Approved-photo choreography/full photographic story, verified copy and authenticated CMS/staging E2E await separate work.                      |
| 18 · Human/legal approvals | BLOCKED               | All 17 assets; copyright missing for all, 10 priority age/minor reviews, seven applicability reviews, hosting/privacy clearance.               |

Deployment, GitHub push, database migration/mutation, external media provisioning, readiness-edit/import UI and Website Phase05: NOT STARTED. No new commit is made because this request did not ask for one; changes remain on the dedicated feature branch for review.

## File inventory

New: `src/components/home/about-story.tsx`, `src/components/motion/surface.tsx`, `src/components/admin/media-readiness.tsx`, `src/app/admin/(protected)/media-readiness/page.tsx`, `src/styles/cinematic.css`; `src/lib/media-readiness-policy.ts`, `media-readiness.ts`, `media-mutation-guard.ts`, `public-media-audit.ts`; `scripts/check-public-media.ts`; `tests/media-readiness.test.ts`, `tests/phase04-browser/phase04.spec.ts`, `tests/phase04-browser/render-admin.ts`, `playwright.phase04.config.ts`; this document.

Modified: homepage/gallery pages, shared Gallery, root CSS import, admin navigation/gallery, media GET route, existing admin resource/upload/Instagram endpoints, content/settings/Instagram loaders, package scripts, Next tracing, ESLint private-library exclusion, AGENTS, ARCHITECTURE, MOTION_SYSTEM and DEPLOYMENT. No Prisma/schema/auth/hero/navbar/Instagram presentation component changes.

Preserved pre-existing changes: `.gitignore` library exclusion, the three loader demo-mode fixes, and untracked `docs/media/` preparation. Existing MEDIA files and original photos are byte-for-byte unchanged. Exact next step: review this implementation, then obtain real permission evidence and explicit human decisions before any photo integration; authenticated CMS mutation E2E should run only against a verified isolated test database in a separate authorized validation task.
