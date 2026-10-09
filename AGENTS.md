<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SAKADO project instructions

- Start with docs/ARCHITECTURE.md; use DESIGN_SYSTEM, MOTION_SYSTEM, DATABASE and DEPLOYMENT for their domains. The 2026-10-09 audit supersedes stale SQLite/deferred-CMS claims in older docs.
- Preserve working routes, CMS, media, data and legacy migration artifacts. Make incremental compatible changes; never rerun one-off restructuring scripts or reset a real database.
- Stack: Next.js App Router, React, strict TypeScript, Prisma/PostgreSQL, plain CSS. Keep locked versions; use npm ci. GSAP 3.15.0 (including ScrollTrigger) is explicitly authorized for Phase 01; do not add another animation engine. Target Hostinger managed Node.js on Node 24, external PostgreSQL and durable media storage.
- Keep database/auth/mutations server-side. Public DTOs must enforce confirmed/published/authorized status and parent visibility. Check auth, role, origin and validation on every mutation; Proxy/UI hiding is not authorization.
- Current roles OWNER/ADMIN/EDITOR have broad resource rights. Draft-only editors/explicit publishing are proposed, not implemented. Do not silently change business permissions.
- Preserve all 45 imported Instagram records and canonical URLs. They were unpublished/homepage-off at audit. Never infer type, scrape previews, publish or overwrite imported content implicitly.
- Do not invent identity, places, prices, bookings, metrics, partners or approved assets. Mark missing decisions TO BE CONFIRMED. Existing registration code is not evidence of business approval; do not expand transactional scope.
- The supplied visual references are primary once accessible; never copy unrelated content. Phase 02 uses design-references/sakado-hero.png (ROAMLY navbar reference, not a website asset). The other reference and approved brand assets remain pending. Existing SVGs/wordmark are placeholders; the hardware upload is not approved Sakado imagery.
- Separate motion from business logic. Server-render readable static content; progressively enhance. Honor reduced motion, keyboard/touch, pause controls, focus and mobile/zoom reflow. No scroll hijacking or default WebGL.
- Keep secrets/PII out of client code, logs and commits. Preserve noindex on demos/staging/admin; never assume example domains are production.
- Source recovery exists: local baseline commit 0a0c542, tag phase-00-baseline, and a verified external Git bundle. Preserve history and user changes. No Git remote or push is authorized; recommend a private GitHub repository only.
- Validate proportional to changes: npm run typecheck, npm run lint, npm test and npm run build for implementation; add focused browser/integration coverage for affected behavior. DB/E2E fixture setup deletes data: inspect tests/test-database.ts and ensure an isolated local sakado_test DB. Never run fixtures on staging/production.
- Production migrations use reviewed additive SQL and npm run db:deploy after backup/restore verification, never migrate reset/db push. Local uploads are not durable on managed redeploy.
- Phases 01–02 authorize frontend primitives/motion laboratory and the cinematic navigation only. Preserve the legacy homepage apart from navigation integration, CMS/auth and database behavior. Do not change Prisma schema, create paid resources, push or deploy without a separate explicit instruction.
- Recovery files live outside Git at C:/Users/Dell/SAKADO-backups/2026-10-09-phase00-5-8327b4d3. Inspect the restricted database-verification.json and media-inventory.json before risky work. Never overwrite the original database to test a restore; use a fresh disposable database and verify row/schema hashes and all 45 Instagram flags.
- Node policy is 24.x (.nvmrc/package engines). Local start stays loopback; Hostinger uses npm run start:hostinger and a process-level PORT. Typecheck generates Next types first. Real .env files, dumps, uploads and build artifacts stay ignored; only empty/example environment templates are committed.
- Linux validation is prepared in .github/workflows/linux-validation.yml with manual dispatch, pinned actions and dummy DB settings. A prepared workflow is not a passing Linux run. No DB fixtures/migrations run in this workflow. Linux execution and actual Hostinger staging remain separate verification gates.
- Use namespaced s-* styling from src/styles and opt-in MotionScene/Motion wrappers. Keep server content visible; background/foreground/transition targets must be aria-hidden and noninteractive. Pinning is desktop-only and rejects interactive/tall content. Include MotionToggle wherever motion is introduced; system reduced motion always wins. Read docs/MOTION_SYSTEM.md before extending the engine.
- /dev/motion is development-only and returns 404 in production; do not link it from public navigation. npm run test:motion uses its own DB-disabled browser config and requires a current production build. Never substitute the existing fixture-based E2E setup for these motion checks.
- Navigation uses a server-rendered Brand slot, NavigationShell and native mobile dialog/disclosure fallback. Only a direct homepage hero marked data-navigation-hero="dark" enables transparent styling; reserve --s-navigation-height in hero content. No scroll listeners/GSAP for navbar effects. Read docs/PHASE_02.md before integration. npm run test:navigation is DB-disabled and requires a production build; never use fixture E2E as a substitute.
- Report changes, evidence, limitations and the exact next step. Stop after Phase 02; do not begin Phase 03 automatically.
