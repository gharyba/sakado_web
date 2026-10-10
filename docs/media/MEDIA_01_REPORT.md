# SAKADO — MEDIA-01 photo analysis and staging

Review date: 2026-10-09.

MEDIA-02 path update: the user moved the working library into repository-root `SAKADO-MEDIA/`; it is now Git-ignored, not outside the repository. Original photographs still remain at `C:\Users\Dell\Desktop\sakado-photos`. Historical MEDIA-01 measurements and decisions below are retained; current paths are repaired. Source recovery: clean working tree at `c5a941b`, with Phase 02 `22ca885` and Phase 01 `8d7995b` preserved. Scope: local inventory, visual curation, private contact sheet and non-destructive staging only. **Every asset remains REVIEW REQUIRED.** A curatorial selection is not legal approval, confirmation of authenticity, or permission to publish.

## Collection and inspection evidence

Source: `C:\Users\Dell\Desktop\sakado-photos`, inspected recursively. Working library: `C:\Users\Dell\Desktop\sakado_web\SAKADO-MEDIA`.

| Finding | Result |
| --- | --- |
| Files inventoried / successfully decoded | **17 / 17**; all JPEG; no other files or subdirectories found |
| Photographs / brand graphic | **16 / 1**; S01 is a badge/background composite, not a scenic photograph |
| Original total | **4,808,210 bytes**, approximately 4.59 MiB |
| Largest source dimension | **1,440px**; no high-resolution wide hero master |
| Exact SHA-256 duplicates | **0 pairs** across all 136 pair comparisons |
| Perceptual-hash review matches | **0 pairs** at pHash ≤ 10 or dHash ≤ 10; this is a heuristic, not proof that every scene is unrelated |
| Corrupt / unsupported images | **0 / 0**; decoded through Sharp/libvips with warning-level failure enabled |
| Sakado-marked assets | **14/17** including S01; **13/16 photographs** |
| Assets with any obvious embedded identity/credit overlay | **15/17**, including photographer-credit-only S07; **14/16 photographs** |
| No obvious embedded logo/credit observed | **S10, S17**; neither is rights-cleared |
| Rights / public website authorization | **17 REVIEW REQUIRED; 0 approved** |

| Dimensions | Count | Framing |
| --- | ---: | --- |
| 1080 × 1080 | 1 | Square graphic S01 |
| 1440 × 960 | 2 | Landscape S02, S04 |
| 1440 × 1439 | 1 | Near-square S03; numerical orientation is landscape |
| 1439 × 809 | 2 | Wide S05, S06 |
| 1080 × 1434 | 1 | Native portrait S07 |
| 1440 × 1440 | 10 | Square S08–S17 |

All 17 assets were visually inspected in five labeled contact sheets. All 16 photographs were also viewed individually at 800px; S02 and S07 were additionally viewed at native resolution to read marks. The reference `design-references/sakado-hero.png` was opened and reviewed: left headline, scenic depth, prominent right subject and wide rounded frame are the selection criteria. Its mountains, van, logos and travel content are not Sakado assets.

`photo-inventory.csv` records every filename, source path, format, size, dimensions, ratio, orientation, SHA-256, metadata summary, hash metrics, overlays and rights checks. `asset-manifest.json` adds per-image composition, quality, color/light, storytelling, crop suitability, roles, and all staged variant dimensions/checksums. `photo-shortlist.csv` contains 14 selected/alternative photographs; S01 is held for identity review, S05 is a lower-resolution reserve, and S17 is a softer water-recreation reserve. The originals index was written before image derivatives were created.

### Metadata and visual quality

Every source is a progressive, three-channel sRGB JPEG with a 72dpi density tag and a 130-byte IPTC envelope. Parsed IPTC contains only record 2 / dataset 40, a 98-byte `FBMD` technical marker. No EXIF, XMP, ICC, JPEG comment, capture date, GPS, photographer or license evidence was found in the decoded metadata. This does not establish the original capture source. File modification times and social-style filenames must not be used as event dates. Raw embedded metadata is retained privately in `originals-index`; repository reports contain summaries, not raw payloads.

All files are limited for a large/high-DPR hero; the inventory's `lowResolution` flag means longest edge below the audit's 1600px review threshold, not that a photograph is unusable. `heroResolutionWarning` means width below 1920px. S05/S06 have only 809px of height; S01 is a 1080px raster badge; S07 is useful as a modest portrait. No upscaling was performed.

S05, S06 and S17 show the clearest soft/compressed detail, especially faces, water and small features. S10/S13 have night grain, deep shadows and clipped light sources. Several coastal images have strong saturation/sharpening; request camera originals for subtler grading. No photograph was confidently rejected for gross motion blur. The grayscale Laplacian variance is recorded as a scene-dependent **proxy only**, not a blur classifier: smooth water/night sky naturally scores below forest detail. No forensic compression, AI-origin or authenticity conclusion is claimed.

Thematically similar pairs are S05/S06 (posed hillside groups), S12/S14 (shallow-water shore), and S16/S17 (people/water/rocks). These are distinct compositions; no common location, event or date is asserted. The closest DCT pHash pair was S04/S08 at distance 22, well outside the review threshold. Visual review did not find duplicate photographs.

## Ranked hero candidates

**No candidate is production-ready.** The ranking balances visual impact and current usability; the top bright scenic choices need larger, clean, licensed masters. Proposed focal points below are **source coordinates (x%, y%)**, not approved crops or final CSS `object-position` values. Recalculate against the supplied master and actual frame geometry before integration.

| Rank / ID | Original filename | Visual advantages | Limitations | Text placement | Desktop / mobile focal point |
| --- | --- | --- | --- | --- | --- |
| **1 — S15** | `780139896_18365007085243599_9080316867381442797_n.jpg` | Sweeping beach curve, dark forest left, sea right; strongest bright cinematic composition | 1440px square; SAKADO bottom-right **and 2.0 bottom-left**; typical cover crops would remove marks; no isolated foreground subject | Left-middle over darker trees, below bright sky; preserve beach curve | 65,45 / 62,48 |
| **2 — S14** | `774469317_18363670774243599_4162114804796062612_n.jpg` | Layered shallow water, cabins and wooded hills; open left water space | Square; distant structures small; bright ripple detail needs contrast veil; bottom-right logo at risk in wide crop | Left-middle/lower-left with local dark veil; keep cabin band visible | 62,45 / 60,48 |
| **3 — S10** | `749076670_18359688478243599_2179109688776973541_n.jpg` | Unmarked dark sky, warm right-side structures, strong evening atmosphere | Night direction differs from sunny reference; 1440px square and noisy shadows; rights unknown | Upper/middle-left sky, avoiding bright horizon/right lamps | 58,65 / 55,60 |
| **4 — S08** | `730420915_18357463678243599_7051643634603082761_n.jpg` | Dramatic sky/sea depth and central rocky landform | Square; centered subject competes with copy; large top-center logo must remain; processed color | Left-middle with dark veil, away from central landform | 58,55 / 50,55 |
| **5 — S03** | `651513432_18341535379243599_212879179467755603_n.jpg` | Stream leading line, light shafts and dark woodland for copy | Near-square; wide crop loses stream progression or top-center logo; no right-side isolated subject | Left-middle over darker woodland, keeping stream clear | 55,55 / 50,55 |

All five support only **restrained single-image parallax**, after rights and crop approval. Use the existing Phase 03 single moving plane, overscan margin, MotionToggle and reduced-motion fallback. Do not split one raster into fictitious independently moving forest/sea/cloud layers. Embedded overlays would move with the photo and may repeat the navbar wordmark; this weakens the editorial reference match. Request legitimate clean originals rather than removing marks or hiding them under gradients.

S10 alone has explicitly labeled, unapproved crop previews: 16:9 extracted at `(left=0, top=390, width=1440, height=810)` and 4:5 at `(216,0,1152,1440)`. These are desktop/mobile review alternatives, not final hero prescriptions. The desktop crop reduces the upper star field; the mobile crop retains sky/tree/right lights. Both were visually inspected. No marked photograph was cropped.

Detailed advantages, limits, text positioning and parallax notes: [hero-candidates.csv](hero-candidates.csv).

## About / scroll-storytelling curation

This is a proposed editorial sequence, **not a claim that the images show one trip or a chronological itinerary**. Actual chapter copy, participants' permission and event provenance remain TO BE CONFIRMED.

| Scene | Image | Honest visual purpose |
| --- | --- | --- |
| 1 — Natural environment | **S03**; S15 is a coastal alternative | Forest stream / natural atmosphere before people |
| 2 — People in the outdoors | **S02**; S04 or S06 alternatives | Clearly visible group on a forest path; stronger community detail than the wider groups |
| 3 — Outdoor setting | **S09** | Visible camp layout, huts and tents; do not claim ownership or availability |
| 4 — Shared experience | **S13**; S10 as environment-only alternative | Participants around a fire, lights and trees |
| 5 — Transition into activities | **S12**, then optional S16 | Equipment in shallow water, followed by visible paddleboarding action |

There is no clear active hiking-in-motion photograph in this collection. Posed outdoor groups support hiking **context**, not invented route/action claims. No close-up participant portraits or consent-cleared human story has been supplied.

## Activities / events image map

These are supported visual subjects, **not approval to advertise services or create events**. All event names, dates, locations, schedules, services, prices and booking decisions remain TO BE CONFIRMED.

| Subject | Featured | Alternatives | Evidence / limit |
| --- | --- | --- | --- |
| Hiking / outdoor exploration context | **S02** | S04, S06, S05 | Posed groups in woodland or hilly settings; no walking action confirmed |
| Camping setting | **S09** | S10, S13, S14 | Tents/huts and outdoor gathering; facility ownership and accommodation offering unconfirmed |
| Nature excursions / environment | **S03** | S15, S08, S07 | Forest stream and wooded coast; no route/location inferred |
| Beach / coastal setting | **S15** | S11, S14, S07 | Sand, rocks and water; no commercial beach service implied |
| Kayaking equipment | **S12** | None | A kayak at rest; no confirmed actively paddled kayak or second kayaking image |
| Paddleboarding | **S16** | S12, equipment only | A person standing and paddling on a board in S16 |
| Group outings / community | **S02** | S04, S06, S05, S13 | Groups/shared gathering visible; participant consent unresolved |
| Campfire / shared evening | **S13** | S10, night setting only | Fire and group visible only in S13 |
| Water recreation, type unconfirmed | **S17**, reserve | None | Inflatable craft/board and people in water; do not infer specific activity type |

## Future gallery selection — 12 candidates

The gallery should accommodate original aspect ratios. A square or landscape photograph does not need to become a portrait to work in coverflow. Retain a complete-image fullscreen view and accessible static grid when that future feature is separately authorized. No gallery code was developed here.

| Rank / ID | Role | Portrait viability |
| --- | --- | --- |
| 1 — **S16** | Paddleboard subject, turquoise action context | Conditional 4:5, right anchored to retain person, board, paddle and corner mark; not prepared |
| 2 — **S13** | Human warmth, fire and night colors | Keep square; a narrow crop cuts outer participants or credit |
| 3 — **S07** | Coastal building / sea layers | Already portrait; preserve original ratio and HOUSSEM KORBOSLI credit |
| 4 — **S03** | Woodland stream, green atmosphere | Conditional centered 4:5 can retain stream and top wordmark; not prepared |
| 5 — **S12** | Kayak/paddleboard equipment | Keep square; full equipment arrangement spans the frame |
| 6 — **S10** | Night sky / amber lights | 4:5 preview prepared; native square remains available |
| 7 — **S02** | Community, forest group | Keep landscape; preserve participants and top-left credits |
| 8 — **S09** | Warm camp overview | Prefer square; narrow crop loses camp layout or corner mark |
| 9 — **S15** | Forest/beach scenic breathing space | Keep square while both corner overlays remain |
| 10 — **S14** | Calm water / cabin band | Conditional right-anchored 4:5 retains mark and scene; not prepared |
| 11 — **S11** | Rock pools / warm coastal textures | Prefer square; crop damages shelter/rock context or mark |
| 12 — **S08** | Sky, rocky landform and blue water | Conditional centered 4:5 possible; retain top logo and landform; not prepared |

S04/S06 remain useful landscape alternatives but add less visual variety to this gallery than S02. S05's limited detail and S17's softness do not justify expanding the primary gallery selection. See [gallery-candidates.csv](gallery-candidates.csv).

## Embedded branding, credits and rights

| Assets | Observed marks | Required review |
| --- | --- | --- |
| S01 | Dominant Sakado badge, Since 2017, slogan | Composite/background rights and approved identity/claims; request vector/transparent master; do not extract it as approved branding |
| S02 | Top-left Sakado badge + apparent **Creativa** studio mark | Exact studio attribution, photographer, owner/license and credit treatment; do not remove either mark |
| S03, S04, S05, S06, S08 | Top-center Sakado wordmark/badge | Repetition near navbar; crop and translation must not hide it; seek licensed clean master |
| S09, S11, S12, S13, S14, S16 | Bottom-right Sakado wordmark | Repeated identity in card/site framing; preserve complete bounds |
| S15 | Bottom-right Sakado + bottom-left 2.0 | Both corners constrain crop; no watermark-safe narrow crop assumed |
| S07 | Bottom-right **HOUSSEM KORBOSLI** | Visible attribution lead only, not verified authorship/license; retain credit and obtain permission |
| S12, additionally | **ITIWIT** text on equipment | In-scene manufacturer branding; not a Sakado partner endorsement; do not erase |
| S10, S17 | No obvious embedded mark | Still require photographer/source/public-use authorization; no automatic approval |

Each image has explicit fields for source, photographer/credit lead, rights verification, public website authorization, participant consent and minors review in the inventory/manifest. The only source claim supplied is the user's collection from Sakado social media/previous activities. **Per-image source URLs, original creators, licenses and written publication authorization are absent.** No Instagram matching, scraping or mutation was performed.

Identifiable groups: S02/S04/S05/S06; participants around fire: S13; visible person on paddleboard: S16; people on/in water: S17. Possible tiny/distant people in S09/S14/S15 need higher-resolution review. Consent cannot be inferred from posing, being at an outing or a social media post. No age is verified; for every visible/possible participant, **minors/guardian review remains REVIEW REQUIRED**. An absence of clearly visible people in another image is an observation, not a release certificate. Do not identify individuals from faces or put consent forms/personal details into Git or contact-sheet notes.

Before approving: owner records exact source/capture provenance, verifies creator/rightsholder, permitted website use/cropping/credit and withdrawal conditions, confirms participant consent and minors handling, and signs off the actual intended crop/layout. Keep evidence in a restricted store; use non-sensitive evidence references in the review log. Creative dropdown choices do not satisfy these gates. The `approved/` directory is empty.

## Optimization prepared and proposed integration

**Created in the private working library only:** 126 full-frame variants for 16 photographs, eight S10 crop previews, 16 blur placeholders, 17 review thumbnails and five original-review montage PNGs. No optimized photo copy of the branding composite S01 was prepared beyond its review thumbnail. Candidate folders contain reference indexes, not duplicate original photographs. No originals were copied, moved, renamed, retouched, sharpened, upscaled or overwritten.

Full-frame widths: **480, 768, 1080, up to 1440px**, capped at each source's actual width; S05/S06 end at 1439, S07 at 1080. WebP quality **80**, AVIF quality **50**, effort **4**, using installed Sharp **0.35.5** on Node **24.19.0**. Encoder quality scales are not interchangeable. All variants preserve original ratio except the explicitly labeled S10 crop previews. They are review baselines, not final universal compression settings.

The 134 variants total **14,534,909 bytes** (~13.86 MiB); this is the sum of multiple sizes/formats, **not page transfer size**. Load only a negotiated format and appropriate source size. Derivative hashes, dimensions, sizes, encoder parameters, crop rectangles and source hashes are in the manifest. Sharp strips metadata by default in this pipeline; EXIF/XMP/IPTC absence was checked on every variant. Pixel watermarks remain. Private originals and their embedded metadata are intact. Blurred 16px WebP placeholders and their data URLs stay outside Git at `optimized-staging/blur-placeholders.json`; reports contain references only.

| Variant / target | Actual observation |
| --- | --- |
| 768px card, proposed ≤150 KiB | All 16 AVIF variants pass (approximately 21–77 KiB). Four WebP variants exceed: S02 159,148 B; S07 168,514 B; S09 157,790 B; S16 154,854 B. This budget is **not universally passed**. Evaluate smaller size or lower WebP quality with credit/detail inspection before release. |
| Hero mobile ≤250 KiB; desktop combined ≤700 KiB | All five candidate full-frame AVIFs at native size are below 250 KiB; file size alone does not resolve resolution/crop/rights blockers. S15/S03 full-size WebP exceed the mobile limit; use a responsive source, not the largest copy on phones. |
| S10 1440 × 810 desktop crop | WebP **81,812 B**, AVIF **53,868 B** |
| S10 768 × 960 mobile crop | WebP **78,488 B**, AVIF **50,029 B** |

Target a licensed **2400–3200px landscape master** for the desktop hero, preferably with a genuine right-side subject and darker left copy area. Do not enlarge social JPEGs to manufacture that detail. Preserve native portrait/square framing for gallery cards where crop removes people, credits or context. Request clean originals from rightsholders; do not erase existing marks. Resized corner credits can become too small: inspect legibility and agree a companion caption/credit treatment before release, without removing the original credit.

### Next.js plan — documentation only, not applied

Recommendations were checked against installed Next **16.4.0** guides: `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md` and `01-app/03-api-reference/02-components/image.md`.

- Keep the existing server-rendered hero and opt-in motion. One selected LCP source uses the current `fill`/`sizes="100vw"` and stable parent geometry. Do not preload alternate candidates, gallery cards or both crop alternatives. `priority` is deprecated; use the installed API's `preload` policy consistently without also setting conflicting `loading`/`fetchPriority` props.
- Cards need intrinsic width/height or a reserved, approved ratio. Match `sizes` to real layout; proposed three/two/one-column example: `(max-width: 699px) calc(100vw - 40px), (max-width: 1199px) calc((100vw - 72px) / 2), 400px`. Confirm against actual future components. Lazy-load below-fold media; use useful contextual alt text, with decorative hero imagery empty-alt only when it adds no content beyond the heading. Credit/caption text remains accessible independently of animation.
- Current `next.config.ts` has no image-format/quality override. For a later approved use of Next's optimizer, consider explicit `formats: ['image/avif', 'image/webp']` and a bounded `qualities` allowlist, retaining **75** for existing defaults and adding **80** only if used. Local AVIF-50 staging settings are **not** a recommendation to use Next's `quality={50}` for all formats. Check CPU/cache cost on Hostinger; AVIF and WebP are separately cached. No configuration was changed.
- Choose **one** delivery pipeline: either optimize an authorized master through Next (and measure its actual output), or serve these pre-encoded variants through a reviewed responsive loader/picture contract. Avoid repeatedly recompressing staged copies or assuming Next automatically reads these external folders. Pre-encoded AVIF/WebP need genuine format fallback; one AVIF URL alone is not a responsive negotiation strategy.
- Current `/media/[key]` authorization is preserved. The default Next optimizer does not forward authorization headers; retain existing `unoptimized` behavior there until a secure size/format delivery contract is reviewed. Do not expose private media by adding wildcard remote hosts or moving it into `public/`.
- Choose durable storage, then tightly scope `remotePatterns` to the confirmed HTTPS host/path if the default remote optimizer is used. The existing CSP also needs deliberate image-host review for direct delivery. Preserve publication/parent visibility, cache withdrawal and stable `/media` keys. Forward `Accept` through any format-negotiating proxy/CDN. No provider, resource, CDN rule or upload was created.
- Use source focal/crop metadata after human sign-off; the Phase 03 default 70%/50% is provisional. Its full-bleed cover rendering and parallax overscan can crop edge marks even when the staged file is uncropped. Do not connect marked files to that background without verifying the entire motion envelope or obtaining an appropriately licensed clean master.
- Keep original/private metadata separate from public DTOs. After approval, derive public dimensions, selected focal point, alt/caption/required credit and versioned object reference only. No schema changes, imports or publication flags are part of this phase.

## Library, reports and verification

Open **`C:\Users\Dell\Desktop\sakado_web\SAKADO-MEDIA\contact-sheet.html`** locally. It provides uncropped thumbnails, original filenames, category/role filters, quality/crop/rights notes, larger staging links, creative selection fields and JSON review-note export. Search/filter/export work without any external network service; all cards remain readable without JavaScript. Choices exist only in the tab until exported; no CMS/database integration or implicit approval persistence. `review/qa-export-test.json` is a clearly labeled browser test artifact, **not owner approval**.

Private Git-ignored library:

```text
C:\Users\Dell\Desktop\sakado_web\SAKADO-MEDIA\
  README.md
  contact-sheet.html
  originals-index\       inventory + source references + private embedded metadata
  review\                thumbnails, montages, annotations, QA screenshots/evidence
  approved\              EMPTY — no approval inferred
  optimized-staging\     full-frame WebP/AVIF, S10 preview crops, blur placeholders
  hero-candidates\       references to 5 candidates
  storytelling-candidates\ references to 5 selections
  activity-candidates\   reference index + supported-category map
  gallery-candidates\    references to 12 candidates
```

Keep this library private, Git-ignored and outside public hosting. It is a working collection, **not an off-device or encrypted backup**. Original private files remain at the supplied source folder. Protect participant imagery and review artifacts; do not publicly share the HTML/screenshots before permissions are resolved.

Required repository reports, all in `C:\Users\Dell\Desktop\sakado_web\docs\media\`:

- `MEDIA_01_REPORT.md` — this report.
- `photo-inventory.csv` — all 17 assets and rights statuses.
- `photo-shortlist.csv` — 14 selected/alternative photographs.
- `hero-candidates.csv` — ranked five, focal suggestions and limits.
- `gallery-candidates.csv` — ranked 12 and portrait viability.
- `asset-manifest.json` — full annotations, activity map and external derivative references/checksums; **no photo bytes or raw private metadata**.

Validation actually performed:

- All originals re-read after processing: **17/17 SHA-256, size and modification-time matches**; complete original checksums in inventory and external verification record.
- All **134 variants decoded** and checked for EXIF/XMP/IPTC absence; source-bound hashes and dimensions recorded. Only S10 has crop rectangles; no marked image was cropped. Sixteen blur files and 17 review thumbnails were also produced for local review.
- Local Chrome/Playwright contact-sheet checks at **1440 × 900, 768 × 1024, 375 × 812**: all 17 thumbnails loaded, no horizontal overflow, filters/search worked, 17 full-frame links existed, source-hash-bound export worked, no page/console errors and no HTTP requests. Keyboard skip-link and no-JavaScript content checked. This is **not a full WCAG audit** or website integration test.
- QA files: `review/browser-validation.json`, `review/verification.json`, `review/contact-sheet-desktop.png`, `review/contact-sheet-tablet.png`, `review/contact-sheet-mobile.png`, with corresponding `-viewport.png` captures; the desktop/tablet/mobile viewport screenshots were visually reviewed. Final generated-file inventory: `review/library-checksums.csv`; all **210 listed files** were subsequently re-read and matched their recorded byte sizes and SHA-256 checksums (the checksum CSV excludes itself).
- No application source, dependencies, public assets, CMS, authentication, Prisma schema, database, Instagram records or original uploads were changed. No database service, import, fixture, migration, build/deployment or Git push was run. App unit/build tests were not rerun for this media-only reporting task; previous phase results are not claimed as new results. No commit or branch rewrite was requested/performed.

## Approval blockers and next step

1. Confirm exact source URLs/capture provenance, original creators/rightsholders, website license/credit/crop permissions and withdrawal process for every intended asset. Resolve Creativa and HOUSSEM KORBOSLI attribution explicitly.
2. Review participant releases and possible minors, particularly group/campfire/water photos and distant figures; retain evidence privately.
3. Supply clean licensed larger hero masters, approved logo/vector and final identity/copy. The badge's year/slogan and photographs' embedded marks are not approval of brand claims. Active hiking and active kayaking images, if needed, are missing.
4. Approve creative selection and actual responsive crops/credit legibility. S15 is the leading bright scenic direction; S10 is the clean-framing night alternative. Neither is automatically selected in settings.
5. Resolve final WebP card-budget exceptions and choose durable, authorization-aware delivery before later website integration. Recheck hero/nav contrast, image loading, motion boundaries, responsive crops, reduced motion and page performance using the **approved** asset.

**MEDIA-01 stops here.** Exact next step: review the local contact sheet, choose the intended hero and supporting images by ID, and provide the missing rights/consent evidence and clean masters. Wait for explicit user approval before any integration; Phase 04 has not begun.
