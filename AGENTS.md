<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SAKADO project instructions

- Start with docs/ARCHITECTURE.md; use DESIGN_SYSTEM, MOTION_SYSTEM, DATABASE and DEPLOYMENT for their domains. The 2026-10-09 audit supersedes stale SQLite/deferred-CMS claims in older docs.
- Preserve working routes, CMS, media, data and legacy migration artifacts. Make incremental compatible changes; never rerun one-off restructuring scripts or reset a real database.
- Stack: Next.js App Router, React, strict TypeScript, Prisma/PostgreSQL, plain CSS. Keep installed/locked versions; use npm ci. Target Hostinger managed Node.js on Node 24, external PostgreSQL and durable media storage.
- Keep database/auth/mutations server-side. Public DTOs must enforce confirmed/published/authorized status and parent visibility. Check auth, role, origin and validation on every mutation; Proxy/UI hiding is not authorization.
- Current roles OWNER/ADMIN/EDITOR have broad resource rights. Draft-only editors/explicit publishing are proposed, not implemented. Do not silently change business permissions.
- Preserve all 45 imported Instagram records and canonical URLs. They were unpublished/homepage-off at audit. Never infer type, scrape previews, publish or overwrite imported content implicitly.
- Do not invent identity, places, prices, bookings, metrics, partners or approved assets. Mark missing decisions TO BE CONFIRMED. Existing registration code is not evidence of business approval; do not expand transactional scope.
- The two supplied visual references are primary once accessible; never copy unrelated content. No references were available during the audit. Existing SVGs/wordmark are placeholders; the hardware upload is not approved Sakado imagery.
- Separate motion from business logic. Server-render readable static content; progressively enhance. Honor reduced motion, keyboard/touch, pause controls, focus and mobile/zoom reflow. No scroll hijacking or default WebGL.
- Keep secrets/PII out of client code, logs and commits. Preserve noindex on demos/staging/admin; never assume example domains are production.
- Before implementation, establish source recovery: this audited workspace had no .git entry. Read existing files, preserve user changes, and do not perform unrelated formatting or dependency upgrades.
- Validate proportional to changes: npm run typecheck, npm run lint, npm test and npm run build for implementation; add focused browser/integration coverage for affected behavior. DB/E2E fixture setup deletes data: inspect tests/test-database.ts and ensure an isolated local sakado_test DB. Never run fixtures on staging/production.
- Production migrations use reviewed additive SQL and npm run db:deploy after backup/restore verification, never migrate reset/db push. Local uploads are not durable on managed redeploy.
- Report changes, evidence, limitations and the exact next step. For this architecture phase, edit documentation only; do not implement the full website.
