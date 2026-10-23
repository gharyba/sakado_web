# Official application — private local client presentation

Baseline: clean main `0f8404a`, including Phase 10.1 `532af56`. Implementation branch: `feat/official-client-presentation`. Changes remain uncommitted. This is a private visual review, never public publication or legal approval.

## Current status and historical scope

This original implementation/validation record predates Cinematic Redesign 00. Its five-person asset mapping and five-portrait test result below describe that earlier review; they are retained as history, not current permanent staffing. Redesign 00 corrected the shared team to **Ben Beya Mohamed (Fondateur)** and **Bouzrara Manel (Gérante)** only. The other three historical private catalog slots are retained without public approval and are not rendered as fixed staff. Redesigns 01-03 and the subsequent navy/ivory/gold decisions supersede the original visual details. See the dated redesign reports.

Pre-commit security correction (2026-10-23): the launcher now rejects unexpected explicit Windows grants, establishes an exact owner/SYSTEM-only directory ACL, verifies it and rechecks before each runtime write. A signed viewing token now includes an independent random nonce and must also exist in a bounded, expiring in-process registry shared across Next server bundles. Logout revokes that individual token before clearing its cookie; a copied revoked token cannot be replayed. Other viewers remain valid. Restart revokes the run. This registry is specifically for the existing single-process local presentation, never a production/multi-instance authentication architecture. CMS sessions and database records are unchanged. See [PRECOMMIT_SECURITY](PRECOMMIT_SECURITY.md) for executed regressions and remaining release gates.

## Start and stop

Use Node 24 and the existing verified local PostgreSQL service. Stop other Next development processes for this workspace before starting; Next shares its development lock. Never initialize/reset the database to obtain a presentation.

```powershell
$env:DEMO_MODE = 'false'
$env:CLIENT_DEMO = 'false'
$env:STAGING_MODE = 'false'
npm run dev:presentation
```

Open **http://127.0.0.1:3134/dev/presentation** on this computer. Read `.local/official-presentation/access-code.txt` locally and enter its code in the password form. Do not paste it into chat, logs, screenshots or Git. The file is deleted after five minutes; the viewing session expires one hour after launch. Restart the launcher for a new code/session. Ctrl+C stops the presentation; a new run rotates the signing secret and invalidates earlier cookies. Only this exact IP/port is supported. No LAN listener, public tunnel, reverse-proxy exposure or external hosting is permitted.

Optional existing S16 alternative:

```powershell
npm run dev:presentation -- --hero=s16
```

The default is S08. Neither command changes the original private-preview S16 index or the official preferredHero/approval records. Ordinary `npm run dev` remains the original official application. `dev:client` remains the independent database-disconnected preview.

## Application and media architecture

- Official pages, CMS settings/queries, PostgreSQL, routes, company copy, navigation, CTA destinations, authentication and business operations remain in place. Both demo flags stay false. No fixtures, synthetic listings, media inserts or settings writes are involved.
- The launcher validates the configured URL against the existing private local configuration, exact loopback port 55432/database sakado and actual `.local/postgres` data directory in a READ ONLY transaction. Unknown identities, occupied presentation ports, staging/production and explicit demo selections are refused. No `.env` file is changed.
- `official-presentation-policy.ts` provides the independent short-lived viewing capability. `official-presentation.ts` authorizes the request/session before opening any private index/photo and returns minimal visual DTOs. React cache is request-scoped; there is no persistent private-content cache.
- An ignored catalog binds exact derivative keys to source and derivative SHA-256. Prepared legacy WebPs are recomputed in memory using their original pipeline and compared byte-for-byte, never overwritten. S08 uses already recorded, aspect-preserving, metadata-stripped 768/1440px WebPs with matching manifest hashes. The provider rechecks source/derivative hashes on delivery and falls back for unavailable slots.
- Source originals remain in the existing private team/logo/hero/gallery folders and recorded library source directory. Only existing prepared WebP derivatives can be delivered. No source filename/path/inventory/evidence enters browser props.
- Existing `CompanyTeam`, `Brand`, `ParallaxHero`, `Gallery`, GSAP/MotionScene, MotionToggle and reduced-motion behavior are reused. Portraits are mapped by explicit supplied identity, not inferred from faces. Logo dimensions preserve its aspect ratio. The square scenic image uses conservative containment within the existing hero geometry/overlays.
- The optional gallery is a labeled private visual sample alongside the unchanged public CMS results, with six images on the homepage and twelve on `/gallery`. It creates no CMS rows and does not imply published status. A scoped grid constraint prevents aspect-ratio/min-height overflow; other galleries are unchanged.

## Original private asset mapping (historical)

| Slot          | Supplied identity / visual                      | Existing derivative                        |
| ------------- | ----------------------------------------------- | ------------------------------------------ |
| Team          | Ben Beya Mohamed — Fondateur                    | 480px WebP                                 |
| Team          | Bouzrara Manel — Gérante                        | 480px WebP                                 |
| Team          | Aladin Jemni — Graphiste / Animateur            | 480px WebP                                 |
| Team          | Jad Tagougui — Photographe / Vidéaste           | 480px WebP                                 |
| Team          | Ayoub Hamza — Guitariste / Chanteur             | 480px WebP                                 |
| Brand         | Selected supplied transparent Sakado crest      | 240 × 225px WebP                           |
| Default hero  | S08, explicitly preferred in selection feedback | 768/1440px existing WebPs                  |
| Optional hero | S16, exact recovered private source copy        | Existing 750/1440px WebPs                  |
| Gallery       | Existing twelve curated private selections      | Existing 900/1800px variants, no upscaling |

S16's missing recorded source path is not repaired or rewritten. Its private recovered copy is used only for the explicit alternative. Supplied partner marks are not added to the official application by this task.

## Security boundaries

- A dedicated process binds only 127.0.0.1:3134. Exact Host, Origin where supplied, Fetch Metadata and forwarded-host consistency are checked. Cross-site and same-site/different-origin browser fetches are denied. Host checks alone are not authorization: a signed viewing cookie is mandatory for private visuals.
- A 192-bit random access code is valid for five minutes, with bounded form bodies and ten handshake attempts per minute. A separate per-run 384-bit signing secret is process-only. Runtime code/catalog files stay ignored; their directory is restricted to owner/SYSTEM on Windows (0700/0600 on Unix).
- The distinct HttpOnly, SameSite=Strict, host-only presentation cookie grants no CMS privileges. It intentionally operates over fixed loopback HTTP, so it does not use Secure; existing Secure CMS cookies are unchanged. Treat the computer/browser as trusted. Stop the process to revoke a run; browser-visible derivatives can be saved/captured and are not DRM-protected.
- `/dev/presentation-media/[key]` accepts only exact catalog keys and validated WebP locations. Traversal, symlinks, unknown/mismatched hashes and unauthorized requests fail closed. The catalog and all path components are validated before reads. No original-file route exists.
- Responses are private/no-store/noindex/noimageindex with same-origin resource policy. No CORS grant, optimizer allowlist expansion or service-worker cache is introduced. Private hero images explicitly bypass optimization; optimizer requests remain rejected by the unchanged Phase 10.1 restrictions.
- Production startup refuses the presentation flag, including alongside demo mode. Runtime guards also require development, verified local database, both demos false and staging false. The old `/dev/client-media` policy remains DB-disconnected and unchanged.
- Public media eligibility, `/media` authorization/readiness, CMS roles, schema/migrations, environment files and approval ledgers remain unchanged. Private visual selection does not flow through or relax `publicImagePath`.
- Private URLs stay out of metadata, structured data, sitemap/static output and deployment traces. Existing public-media and private-trace build gates remain mandatory. Never distribute `.local`, `SAKADO-MEDIA`, credentials, screenshots or runtime catalogs.
- CMS/contact/registration operations are still real operations. The viewing capability does not authenticate staff or authorize mutations. Do not submit forms or change real records during a visual presentation without separate authorization.

## Original validation evidence and limitations (historical)

Local Windows/Node 24/Chrome only. Evidence and actual official-application captures are ignored under `.local/official-presentation-audit/`; they must not be committed or published. No external or Linux validation is implied.

| Executed check                                 | Actual local result                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript / ESLint                            | PASS                                                                                                                                                                                                                                                 |
| Unit suite                                     | 70 PASS, including session expiry, forged/missing capability, local-only identity, startup refusal and filesystem restrictions                                                                                                                       |
| Production build                               | PASS; 17-asset public audits and all 52 private deployment traces PASS                                                                                                                                                                               |
| Presentation browser suite                     | 9 PASS: S08, five portraits on homepage/About, logo, live database health/seven categories, all twelve gallery images, desktop/tablet/mobile, keyboard, no-JS, reduced motion/MotionToggle, hash mismatch, fallback, optimizer and production denial |
| S16 alternative                                | 1 focused Playwright PASS for explicit S16 selection and the official hero/MotionToggle lifecycle                                                                                                                                                    |
| Existing official development/production suite | 14 PASS; actual local database, routes, placeholder/private denial, no-JS and responsive checks, no fixtures                                                                                                                                         |
| Existing guarded admin/media regressions       | 18 database assertions plus actor/import checks; 21 Phase 05 + 17 Phase 06 + 4 Phase 10 browser tests PASS in a NEW owned synthetic cluster only                                                                                                     |
| Preservation                                   | PASS: all 15 authoritative table/schema fingerprints and 98 protected file hashes unchanged; all 45 Instagram rows remain unpublished/homepage-off                                                                                                   |
| Git / secret safety                            | Source guard PASS for all 350 tracked/proposed files; no private source/evidence/artifacts staged; diff whitespace PASS                                                                                                                              |

Earlier failed gallery checks exposed a scoped aspect-ratio sizing issue and a pre-hydration interaction race; the width correction and hydration-aware test address these without changing public media policy. Two standalone alternative-smoke harness attempts timed out without providing valid evidence; the existing Playwright harness then verified explicit S16 selection successfully. Ordinary development warnings about lazy-image LCP and NO_COLOR/FORCE_COLOR are not hidden. No new field-performance benchmark, Linux run or external deployment was performed.

Screenshots: `desktop-hero.png`, `tablet-hero.png`, `mobile-hero.png`; corresponding `*-portraits.png` and `*-gallery.png` are actual session-authorized official routes. These are viewport emulations, not physical-device/screen-reader or field performance certification.

Remaining human approvals: portrait/crest/scenic composition and private client acceptance; all public copyright, participant/minor, credit, brand/publication and hosting/privacy decisions remain separate. All 17 registered assets remain BLOCKED and all 85 axes PENDING REVIEW. Square 1440px hero sources limit wide-screen photographic fidelity; no invented layers, wider master or new artwork is generated. Per-request hashing intentionally trades local I/O for integrity; no new client animation dependency or measured production performance claim is made.

## Changed source files

- `AGENTS.md`
- `docs/OFFICIAL_CLIENT_PRESENTATION.md`
- `package.json`
- `playwright.presentation.config.ts`
- `scripts/dev-presentation.mjs`
- `scripts/presentation-files.d.mts`
- `scripts/presentation-files.mjs`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/gallery/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/dev/presentation-media/[key]/route.ts`
- `src/app/dev/presentation/page.tsx`
- `src/app/dev/presentation/session/route.ts`
- `src/components/brand.tsx`
- `src/components/company/presentation-gallery.module.css`
- `src/components/company/presentation-gallery.tsx`
- `src/components/company/sections.tsx`
- `src/components/home/parallax-hero.module.css`
- `src/components/home/parallax-hero.tsx`
- `src/components/site-footer.tsx`
- `src/components/site-header.tsx`
- `src/lib/hero.ts`
- `src/lib/official-presentation-policy.ts`
- `src/lib/official-presentation.ts`
- `src/lib/production-env.ts`
- `src/proxy.ts`
- `tests/official-presentation.test.ts`
- `tests/presentation-browser/presentation.spec.ts`
- `tests/presentation-browser/production.spec.ts`
