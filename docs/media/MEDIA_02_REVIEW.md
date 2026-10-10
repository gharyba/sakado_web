# SAKADO — MEDIA-02 migration and visual review

Date: 2026-10-09. Status: **PENDING REVIEW — no visual, copyright, consent or publication approval granted**. Scope: path repair, static visual studies and separate optimization trials. No homepage, CMS, database, Instagram, authentication, deployment or Phase 04 work.

## Open the review package

- [MEDIA-02 dashboard](../../SAKADO-MEDIA/media-02-review.html): original JPEG compositions, five desktop/mobile hero comparisons, five About scenes, twelve gallery studies, four quality comparisons and separate approval indicators.
- [Existing MEDIA-01 contact sheet](../../SAKADO-MEDIA/contact-sheet.html): all 17 original asset IDs, categories and prior review notes; unchanged HTML and relative thumbnail/script links.
- [Manifest](asset-manifest.json): original schema version, IDs, hashes, metadata and historical rankings preserved; additive `media02Migration` / `media02Review` sections describe current paths and proposals.

Absolute dashboard path: **`C:\Users\Dell\Desktop\sakado_web\SAKADO-MEDIA\media-02-review.html`**. Open the HTML locally, not through the Sakado website. Original JPEG links leave the library only to read the actual source folder. No external network service is used. Source imagery and screenshots remain private and Git-ignored.

## Directory migration and integrity

The user had already moved the library to repository-root `SAKADO-MEDIA/`. No directory or photograph was moved again; the retired library location was not read or written.

The new library initially contained **211 files, 41,278,834 bytes**: the 210 files listed in the MEDIA-01 checksum inventory, plus that inventory CSV itself. Every listed file matched its recorded byte size and SHA-256: **0 missing, 0 changed**. This includes all 134 previously generated WebP/AVIF variants, 16 blur files, 17 review thumbnails, five montage sheets, HTML/JavaScript and prior QA artifacts.

**There are no original JPEGs inside the moved library.** MEDIA-01 intentionally referenced originals in place. All **17** were located at `C:\Users\Dell\Desktop\sakado-photos`; all match MEDIA-01 SHA-256, size and modification time. Stable IDs remain S01–S17. This is a reference-based library, not a second copy of the originals. No source was copied, renamed, rewritten, retouched or deleted.

Evidence:

- `SAKADO-MEDIA/review/media-02/pre-migration-audit.json`: recursive initial inventory/checksums, original reconciliation and application-file baseline.
- `SAKADO-MEDIA/review/media-02/path-migration.json`: precise reference-change log.
- `SAKADO-MEDIA/review/media-02/verification.json`: final reconciliation, metadata/dimension checks, stable-ID checks and application preservation.
- `SAKADO-MEDIA/review/media-02/library-checksums.csv`: new complete library inventory of **270 files**, excluding itself; all 270 were re-read and matched their size/hash. MEDIA-01's checksum inventory is retained unchanged.

### References repaired

| File / family | Treatment |
| --- | --- |
| `docs/media/MEDIA_01_REPORT.md` | Updated operational library paths; added explicit note that the user moved it inside the repository and it is now ignored. Historical measurements/rankings retained. |
| `docs/media/asset-manifest.json` | `workingLibrary` is now **`SAKADO-MEDIA`**, relative to repository root; added `pathBase: repository-root` and explicit field-base descriptions. Existing derivative `relativePath` values remain library-relative. |
| Four MEDIA-01 CSV files | Inspected. They reference valid original source paths or filenames, not the retired library root; unchanged. |
| Existing contact sheet / candidate indexes / original index | Already use working relative review paths or valid absolute original paths; no repair/regeneration needed. |
| Five ignored `.local/media01-*.cjs` tools | Updated their library root to `path.resolve(__dirname, '..', 'SAKADO-MEDIA')`. No historical generator was rerun. |
| `.gitignore` | Appended `/SAKADO-MEDIA/` in the private-artifact section, preserving every existing rule. |

Absolute `sourceDirectory` / per-image `sourcePath` fields remain valid because originals are outside this repository; making them falsely library-relative would break resolution. Dashboard original URLs are relative (`../../sakado-photos/<filename>`); preview/optimization URLs are relative to `workingLibrary`. No secret/environment values were changed or logged.

## Git and website exposure

`git ls-files -- SAKADO-MEDIA` and history lookup both returned no files/commits. Thus no index removal was needed or performed. `git check-ignore -v` confirms `/SAKADO-MEDIA/` excludes the old contact sheet, new dashboard and private original index. Source JPEGs remain outside the repository. Git HEAD remains **`c5a941b23e6e3b6b2fdedc98e7c5375e43f71745`**, branch `feat/phase03-cinematic-hero`; no history rewrite, commit, remote push or deployment.

The library is not in `public/`, imported by application code, or connected to CMS storage. Inspected `src/lib/storage.ts`: storage defaults to `uploads`, accepts only UUID WebP keys; `/media/[key]` validates keys and current authorization/publication policy before reading. The local configured storage location was checked privately and does not point into the review library. No storage configuration was changed.

An existing production build was started temporarily on loopback with **empty DATABASE_URL**, a validation-only auth value and isolated empty media location. Requests to the following returned **404**:

```text
/SAKADO-MEDIA/contact-sheet.html
/SAKADO-MEDIA/media-02-review.html
/SAKADO-MEDIA/originals-index/inventory.json
/api/SAKADO-MEDIA/contact-sheet.html
/media/S15-hero-desktop-1440x900.webp
```

The process was stopped. These are local route-exposure checks, not Hostinger deployment results. Git ignore is not encryption or a hosting access control: do not include this folder in a manual deployment/archive or serve the repository root as a static directory.

## Hero comparison and recommendation

The dashboard shows original JPEG, **1440 × 900 desktop preview**, **375 × 812 mobile preview**, rounded-frame outline and possible placement of the existing headline, “Explorez. Respirez. Vivez l’aventure.” Each photograph has text-safe area, marks, original resolution, focal-coordinate and parallax-tolerance notes. Rounded outlines and text backing are **HTML review overlays**, not baked into photographs, implemented hero components or approved copy changes.

The MEDIA-01 bright scenic ranking is preserved. Inspection of actual credit-retaining crops changes the recommendation for **current responsive usability**:

| Rank | Candidate | Observed suitability / decision needed |
| --- | --- | --- |
| **1** | **S10 — Night scene** | Best current crop compatibility: unmarked dark sky supports left white copy, warm structures anchor the right. Mobile shifts right to retain tree/lights. Night differs from the sunny reference. Rights unknown; 1440px square limits high-DPR detail. |
| **2** | **S03 — Forest stream** | Strong leading line and dark woodland, with a viable narrow mobile view. Desktop loses the lower stream; top-center Sakado mark competes with navigation and limits motion. A clean larger master is preferred. |
| **3** | **S14 — Waterfront cabins** | Daylight alternative, but a bottom-anchored desktop crop needed to retain the corner logo clips cabin roofs/setting and loses sky/forest depth. This preview demonstrates the limitation; do not approve it merely because it fills the canvas. Mobile right crop retains the mark and fewer cabins. |
| **4** | **S08 — Island view** | Strong blue scenic atmosphere; desktop keeps top mark and landform but loses foreground vegetation. Mobile trims outer landform edges. Centered subject and top logo compete with headline/navbar. |
| **5** | **S15 — Forest/beach** | Still the best bright scenic direction aesthetically. Keeping both bottom overlays forces a low desktop crop that loses sky/hills. **No full-height narrow crop can retain both corner overlays.** Mobile therefore shows a labeled full-frame contain fallback, not a destructive fill crop. Obtain a clean larger licensed master for the intended immersive hero. |

All originals are at most 1440px wide. No missing scenery was generated and no image pixels were upscaled to simulate a larger master. Plain padding in contain previews is visibly labeled review canvas, not reconstructed photograph content. No watermark/credit was erased or cropped out.

| Candidate | Desktop source rectangle: x, y, w, h | Mobile source rectangle or fallback | Source focal proposal: desktop / mobile (x%, y%) |
| --- | --- | --- | --- |
| S10 | 0,350,1440,900 | 700,0,665,1440 | 58,65 / 72,60 |
| S03 | 0,140,1440,900 | 380,0,665,1439 | 55,55 / 50,55 |
| S14 | 0,540,1440,900 | 775,0,665,1440 | 62,45 / 77,48 |
| S08 | 0,80,1440,900 | 420,0,665,1440 | 58,55 / 52,55 |
| S15 | 0,540,1440,900 | Full-frame contain on 375×812 canvas | 65,45 / 62,48; not a crop approval |

Near-matching integer source ratios use `contain` during resizing to avoid fractional edge loss/distortion. These source focal coordinates are not final CSS `object-position` values. Original compositions remain separately visible/clickable.

### Text and parallax tolerance

Prefer dark left sky (S10), dark woodland (S03/S15), or controlled backing over water/sky (S14/S08). Do not overlay people, the central landform, cabin subject band or embedded marks. Dashed areas in the dashboard indicate proposed copy regions; they are not a full contrast certification or final typography sign-off.

Existing Phase 03 desktop movement is ±32px with scale up to 1.035. For a 1440×900 review canvas, a conservative geometric reserve is approximately **48px vertically** (32 + 900×0.035/2) and **25px horizontally** (1440×0.035/2). Actual full-bleed background geometry/overscan differs, so integration requires a real motion-envelope test.

S14/S15's bottom marks have roughly 20px of margin and fail that reserve. S03/S08 top marks and S08's low landform leave limited room. S10 has the best mark-free geometric freedom, but tree/lamp edges still need checking. Prefer static marked media until a clean master or reviewed safe envelope is available. Mobile/reduced motion should remain static/lightweight using the existing foundation. **No animation or runtime parallax was implemented/profiled in MEDIA-02.** Every raster remains a single image plane; no fabricated independent depth layers.

## About Sakado storyboard

Sequence retained: **S03 → S02 → S09 → S13 → S12**. This is an editorial proposal, not proof of one journey, chronology, location or event. Final text remains TO BE CONFIRMED.

| Scene | Composition / crop | Text and focal proposal | Motion note only | Limits |
| --- | --- | --- | --- | --- |
| 1 — S03 | Full-frame desktop; centered 4:5 crop inside mobile review canvas | Adjacent text or dark left woodland; 50,55% | Desktop upward 12–20px; static mobile | Top logo; creator/provenance unknown; no stream-layer separation |
| 2 — S02 | Full landscape; contained on mobile | Adjacent copy, never faces/credits; 50,60% | Whole-frame reveal or ≤8px translation | Group consent/minor review, Sakado + apparent Creativa credit; no active walking action captured |
| 3 — S09 | Square/full-frame, contained in both canvases | Adjacent copy; 52,60% | Whole image upward 8–12px | Corner logo; possible tiny people; no ownership/accommodation-service claim |
| 4 — S13 | Square/full-frame; no narrow participant crop | Adjacent copy; 50,57% | Gentle entrance; no scroll-linked crop | Faces/shadows, consent/minor review and corner mark |
| 5 — S12 | Square/full equipment arrangement | Adjacent copy; 50,65% | Small whole-frame reveal | Kayak/boards at rest, manufacturer text and corner logo; no inferred booking/service |

Ten static storyboard files use 800×500 desktop and 400×600 mobile canvases. Containment preserves full compositions where a crop would cut people, equipment or marks. The dashboard describes desktop/mobile suitability and limitations for each scene. Nothing was added to the actual About page or motion engine.

## Gallery review — 12 candidates

Order retained: **S16, S13, S07, S03, S12, S10, S02, S09, S15, S14, S11, S08**. Each dashboard card shows original JPEG beside a 600×750 preview, source focal point, central-card suitability, quality and branding limits. No 3D interaction or gallery component was built.

| Image | Portrait treatment | Central-card recommendation |
| --- | --- | --- |
| S16 | Right-anchored 4:5 crop | Strong action subject; retain full board/paddle and corner logo; person/age review pending |
| S13 | Square contained | Shared campfire atmosphere; no cutting outer participants |
| S07 | Native portrait contained | Suitable vertical detail; retain HOUSSEM KORBOSLI credit and verify permission |
| S03 | Centered 4:5 crop | Strong leading stream; retain top wordmark |
| S12 | Square contained | Full kayak/boards; no forced narrow crop |
| S10 | Gentle 4:5 crop | Night contrast; watch shadow noise at larger scale |
| S02 | Landscape contained | Human/community counterpoint; retain group and studio mark |
| S09 | Square contained | Camp context; preserve complete setting |
| S15 | Square contained | Scenic breathing space; preserve both bottom overlays |
| S14 | Right-anchored 4:5 crop | Calm water; preserve cabins and corner mark |
| S11 | Square contained | Rock/shelter context; no forced narrow crop |
| S08 | Centered 4:5 crop | Central landform; top logo retained |

There are **five actual 4:5 gallery crops and seven contain previews** (including native-portrait S07). The letterbox/pillarbox padding is intentional. Embedded mark bounds were visually reviewed in the output montage. At final card size some credits will be small; agree legible credit/caption treatment with the rightsholder before use. In-scene ITIWIT branding is not a partnership claim.

## Separate approval ledger

All **17 assets × 5 axes = 85 pending statuses** are recorded under `media02Review.approvals` and displayed in the dashboard:

1. Visual approval — PENDING REVIEW.
2. Photographer/copyright permission — PENDING REVIEW.
3. Participant consent — PENDING REVIEW.
4. Minor consent review — PENDING REVIEW, with per-image observational applicability notes.
5. Public website publication approval — PENDING REVIEW.

No apparent people in a photograph does not automatically settle applicability or rights. For visible/possible participants, ages are unverified; owner/guardian evidence must be checked privately where relevant. Instagram/social publication is not permission. Photographer leads remain the apparent Creativa mark on S02 and HOUSSEM KORBOSLI on S07, not verified licenses.

Legacy MEDIA-01 `approvalStatus: REVIEW REQUIRED` and other original metadata remain intact. New MEDIA-02 axes use PENDING REVIEW; neither means approved. Existing database publication flags were not read or modified. Dashboard preference/note export preserves every axis as pending and has no CMS/network/write-back capability. `qa-feedback-export.json` is test evidence only, not a user decision.

## Improved WebP trials

New, separate staging: **`SAKADO-MEDIA/optimized-staging/media-02/`**. Each of the four oversize 768px q80 variants received a source-derived, same-ratio WebP q75 copy. No previous image was overwritten. All four pass the **153,600-byte (150KiB)** card target at q75; no q70 trial was needed.

| Asset | Existing q80 | New q75 | Saved | PSNR: q80 → q75 |
| --- | ---: | ---: | ---: | --- |
| S02 | 159,148 B | **138,952 B** | 12.7% | 32.82 → 31.45 dB |
| S07 | 168,514 B | **140,386 B** | 16.7% | 36.38 → 34.72 dB |
| S09 | 157,790 B | **135,112 B** | 14.4% | 33.56 → 32.33 dB |
| S16 | 154,854 B | **132,040 B** | 14.7% | 34.40 → 33.01 dB |

Files: `S02-full-768-q75.webp`, `S07-full-768-q75.webp`, `S09-full-768-q75.webp`, `S16-full-768-q75.webp`. Dimensions and SHA-256 are in the manifest, together with source IDs and original q80 references. All preserve ratio/pixel credits and have no EXIF/XMP/IPTC/ICC. No new AVIF trials were necessary; prior 768px AVIF alternatives already met the target and remain unchanged.

Native-size q80/q75 comparisons were visually reviewed: slight foliage/water microtexture loss, no new gross blur or obvious blocking observed at intended card size; faces and existing credits remain visible. **PSNR is only pixel error against the source resized to 768px, not a perceptual score or quality guarantee.** Final credit legibility, real-device image quality and approval remain pending. Full comparison pairs appear in the dashboard and `review/media-02/S*-quality-comparison.png`.

## Validation and preserved application

Completed checks:

- Original 17 SHA-256/size/mtime comparisons; all stable IDs and core source metadata preserved.
- All 210 historical checksum-listed files unchanged, including existing contact-sheet HTML, JavaScript and thumbnails. No contact-sheet regeneration.
- New 10 hero, 10 storyboard, 12 gallery preview canvases checked at exact dimensions; four optimization trials checked for ratio, dimensions, hashes and stripped metadata. Mark-retaining crops/contain fallbacks visually reviewed.
- Chrome/Playwright at **1440×900, 768×1024 and 375×812**: all **57 dashboard image occurrences** loaded; no page-level horizontal overflow. The approval table has an intentional named horizontal scroll region. A tablet overflow caused by an unpositioned hidden label was fixed in the private dashboard stylesheet and retested successfully.
- Existing contact sheet at the same three sizes: all **17 thumbnails** loaded, five-candidate filter worked, no overflow. New dashboard resolved all **83 local link/resource occurrences**; there were no external HTTP requests or final page/console errors.
- Feedback export: 17 source-hash-bound records, all five statuses pending. Reload clears unsaved preferences. Keyboard skip link and no-JavaScript hero/gallery content checked. This is not a complete accessibility audit.
- Five local production exposure routes returned 404. The original hardware upload and **146 application/public/Prisma/package files** matched the pre-work baseline; no website/source/public/Prisma/package changes. Only `.gitignore`, requested media documentation/manifest and ignored review artifacts changed.

Evidence: `SAKADO-MEDIA/review/media-02/browser-validation.json`, `verification.json`, `dashboard-desktop.png`, `dashboard-tablet.png`, `dashboard-mobile.png`, `hero-S10-desktop.png`, `hero-S10-tablet.png`, `hero-S10-mobile.png`, and comparison montages. Desktop/mobile dashboard/hero screenshots and all crop/quality montages were visually inspected; storyboard/gallery are covered by both image-output review and browser loading/layout checks.

No app build, unit suite, database fixture, import, schema migration, PostgreSQL startup or remote deployment was needed/run for this media-only task. The HTTP check used the existing production build; it is not a newly validated build. The local server was stopped afterward. Existing source files, private uploads, CMS/auth behavior and all Instagram records were left untouched. Sharp montage generation emitted non-fatal font-cache warnings under the filesystem sandbox; images/labels rendered and decoded correctly. No dependency was installed/upgraded.

## Pending owner decisions

- Choose the intended **daylight versus night direction**. S10 is most usable with this collection; S15 remains the clean-master target for the sunny scenic direction. No hero setting was changed.
- Obtain clean licensed larger masters, ideally a genuine wide 2400–3200px source, with approved responsive framing. Do not remove existing credits to manufacture one.
- Supply per-image source provenance, photographer/rightsholder permission, permitted crop/credit rules, participant consent and minors review where applicable, and separate public website authorization. Keep personal evidence outside Git; record references only.
- Confirm final crop/credit legibility, text treatment and real hero motion envelope before integration. S14 desktop and S15 mobile demonstrate unsuitable fill-crop limits; they are not production recommendations.
- Approve About/gallery selections explicitly, including square/landscape cards where portrait is destructive. Final story copy, locations/event details and any commercial service remain TO BE CONFIRMED.

**Stop after MEDIA-02.** Next step: review the local dashboard, return visual choices by stable ID, and separately provide rights/consent/publication approvals or evidence references. Production integration waits for explicit visual and rights authorization. Phase 04 has not begun.
