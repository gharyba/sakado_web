# Validation and handoff

Validated locally on 7 October 2026 against the optimized Next.js 16.4.0 production build.

## Results

| Check                                   | Result                                                         |
| --------------------------------------- | -------------------------------------------------------------- |
| Prisma client generation                | PASS — Prisma 6.19.3                                           |
| Initial migration and subsequent deploy | PASS — nine models, database synchronized                      |
| TypeScript                              | PASS — no errors                                               |
| ESLint                                  | PASS — no errors or warnings                                   |
| Unit tests                              | PASS — 10/10                                                   |
| Browser acceptance tests                | PASS — 14/14, Google Chrome                                    |
| Production build                        | PASS — all public, dynamic, metadata and admin routes compiled |
| Mobile Lighthouse performance           | 99/100                                                         |
| Mobile Lighthouse accessibility         | 100/100                                                        |
| Lighthouse best practices               | 100/100                                                        |
| Runtime dependency audit                | PASS — zero vulnerabilities with `--omit=dev`                  |

Lighthouse measured the local illustrated homepage with mobile emulation and simulated throttling. The complete output is `docs/lighthouse-mobile.json`. Scores describe this test, not a guarantee for future hosting or client photography. Retest after replacing assets. SEO was deliberately not scored while the preview is noindex and the canonical domain is unconfirmed.

## Acceptance coverage

- Homepage and event details at 320, 375, 390, 430, 768, 1024 and 1440px, with no horizontal overflow.
- Desktop and mobile screenshots visually reviewed; screenshot capture also verifies local images finish loading.
- Mobile navigation opens and reaches the events page.
- Gallery filtering, native lightbox, Escape dismissal and focus restoration.
- Contextual contact query, form submission, database persistence and visibility in the authenticated overview.
- Unauthenticated admin redirect, incorrect-password rejection, valid sign-in, sign-out and renewed denial afterward.
- Public content excludes unpublished records and demo database records when demo mode is off.
- Gallery excludes unauthorized images and images associated with unpublished destinations/events, including on detail pages.
- Missing dynamic routes return 404.
- Demo robots block crawling and demo sitemap is empty.
- Confirmed-mode sitemap includes published confirmed events and excludes drafts, demo records and admin.
- OpenGraph image endpoint returns PNG successfully.
- Unit tests cover demo isolation, missing operational data, URL/media policies, contact validation, password hashing, session tampering/expiry and request-limit expiry.

## Commands executed

```text
node --version
npm --version
npm install
npm install --save-dev @playwright/test
npm install --save-dev prettier
npm run db:generate
npm run db:migrate -- --name init_sakado
npm run db:migrate -- --name init_sakado --skip-generate
npm run db:deploy
npm run format
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm audit --json
npm audit --omit=dev --json
npm run start
npm exec --yes --package=lighthouse -- lighthouse http://127.0.0.1:3000 --only-categories=performance,accessibility,best-practices --output=json --output-path=./docs/lighthouse-mobile.json --chrome-flags="--headless --disable-gpu" --quiet
```

Dependency registry connection failures were retried. Windows sandbox filesystem restrictions required approved execution outside the sandbox for Prisma generation, Next.js build/server and browser testing. Missing SQLite files are now created non-destructively by the migration scripts. No administrator account was provisioned in the preview database; browser tests provision only their isolated test database.

The complete development dependency audit still reports five high-severity findings in the Next ESLint plugin's transitive fast-glob/micromatch/braces chain. The registry offered no patched braces release at verification. A forced downgrade of the Next lint configuration was not applied. The deepmerge-ts advisory was addressed with a patched override, tested through Prisma generation and migration. Runtime audit reports zero vulnerabilities. Review development-tool updates before CI/public hosting setup.

## Delivery boundaries

The preview is available locally at http://127.0.0.1:3000. No public deployment was made.

Logo, brand screenshots and authorized photos were not available in the attachments. The current wordmark, favicon and illustrations are clearly temporary. All sample adventures, categories and destination universes remain labeled as demonstrations. Operational details, official story, confirmed metrics, contact details and legal policy remain unset or expressly provisional.

Reservations/payment logic, media uploads and administrator content-editing screens remain future work. The admin overview and contact persistence are functional. See README for the complete folder/model inventory and client information checklist, and ARCHITECTURE for future booking/payment design.
