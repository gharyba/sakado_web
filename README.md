# SAKADO SFAX

French, mobile-first Next.js platform for camping, hiking and organized nature experiences in Tunisia.

## Official local application — Phase 09B

The official database-backed application is the primary development target. Use Node 24 and the locked dependencies. This workspace already has local PostgreSQL configuration and data; preserve `.env` and do not rerun migrations or fixture/bootstrap commands to preview it.

If the existing database is stopped, start it in one terminal:

```powershell
npm run db:local
```

In another terminal, clear a previously selected preview mode and start the application:

```powershell
Remove-Item Env:DEMO_MODE -ErrorAction SilentlyContinue
npm run dev
```

Open http://127.0.0.1:3000; administration is at `/admin` and requires the existing login. `npm run dev` forces official mode even if the legacy `.env` contains `DEMO_MODE=true`, accepts only a loopback PostgreSQL URL and disables private media. Child-process origin overrides keep local administration path-based; `.env` and production configuration are unchanged. Confirmed history/team and the seven existing CMS categories are visible. Events/destinations remain honestly empty until confirmed records are supplied.

Optional database-free preview: `npm run dev:demo`, or `$env:DEMO_MODE='true'; npm run dev`. Optional **private local photo preview**: `npm run dev:client`. Stop the current app before switching modes; both previews use port 3000, reject staging/production and grant no public media approval. `npm run dev:app` retains direct Next development for explicit developer configuration. The official logo/photos remain unapproved, so wordmark, initials and safe illustrations are intentional. See [PHASE_09B](docs/PHASE_09B.md), historical [PHASE_09](docs/PHASE_09.md) and [CLIENT_DEMO](docs/CLIENT_DEMO.md).

The initial implementation notes below are historical; the audited PostgreSQL/CMS architecture in [ARCHITECTURE](docs/ARCHITECTURE.md) supersedes their SQLite and deferred-feature claims. Do not run historical fixture commands against a developer or real database.

## Initial inspection

The supplied workspace was empty: no existing application, Prisma schema, Git repository, logo, Instagram screenshot or authorized photographs were available. This implementation therefore establishes the requested foundation. The brand name, business activity and Instagram URL are the confirmed inputs. The wordmark, favicon and illustrations are temporary assets, not the official logo or Sakado photographs.

## Historical bootstrap record

The commands and database/E2E descriptions in this older section are superseded by the current instructions above and `AGENTS.md`. Do not overwrite this workspace's `.env` or invoke historical fixtures for normal development.

Requires Node.js 24 and npm. Dependencies are locked in `package-lock.json`.

```powershell
npm ci
Copy-Item .env.example .env
npm run db:deploy
npm run db:generate
npm run dev:app
```

Open http://127.0.0.1:3000. For the separately authorized private client-preview view, use `npm run dev:client`; it prepares the private derivatives and starts a loopback-only, database-disconnected preview. No administrator account or administrator secret is created by default.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run start
```

Browser tests require installed Google Chrome, run against the production build on ports 3100/3101, and use a separate `prisma/e2e.db`. Their synthetic credentials are exclusively for that test database. They never seed production content or accounts. On this Windows host, Prisma generation, Next.js compilation and browser tests require execution outside the restricted filesystem sandbox.

## Implemented

- French homepage: hero, upcoming adventures, enabled experience categories, about, destinations, gallery, value propositions, community, Instagram and contact.
- Reusable `EventCard`, `ExperienceCategory`, `DestinationCard`, `Gallery`, `EventProgram` and `InstagramPreview` components.
- `/events`, `/events/[slug]`, `/experiences`, `/destinations`, `/destinations/[slug]`, `/gallery`, `/about`, `/contact`, `/privacy`.
- Complete event presentation: optional dates, price, capacity, difficulty, schedule by day, inclusions, exclusions, equipment, meeting point, information, cancellation and gallery. Unconfirmed fields explicitly say so.
- Gallery filters, responsive grids, lazy loading, Next Image and native dialog lightbox with focus restoration and Escape support.
- Database-driven published content, enabled categories, site settings, social links, authorized gallery media and saved contact messages.
- Server-validated contact form with optional phone, subjects, contextual event message, honeypot and request throttling. Messages appear in the protected admin overview; no email delivery service is configured.
- `/admin/login` and protected `/admin`: actual database counts, upcoming events and recent messages. Scrypt password hashes, signed eight-hour sessions, HTTP-only cookies, production Secure flag, authorization checked on every dashboard request, disabled-account revocation and login throttling.
- Dynamic metadata, canonicals when a real domain is configured, OpenGraph image, Twitter cards, sitemap, robots and Organization JSON-LD. Event JSON-LD appears only for confirmed events with known dates and location.
- Mobile navigation, large public touch targets, contextual mobile contact bar, reduced-motion support and semantic markup.
- Reservations and payments remain unavailable. No reservation endpoint, inventory mutation or payment service exists.

## Folder structure

```text
src/
  app/                   App Router pages, metadata routes and server actions
    admin/               Login and authorized overview
    events/[slug]/       Dynamic adventure details
    destinations/[slug]/ Dynamic destination details
  components/            Reusable presentation and interaction components
  data/
    confirmed/site.ts    Confirmed brand facts and empty configurable fields
    demo/content.ts      Explicitly marked demonstration records
  lib/                   Database access, policy, authentication, validation, settings
prisma/
  schema.prisma          Nine core content/administration models
  migrations/            Checked-in initial SQL migration
public/images/           Temporary original SVG illustrations; reviewed media location
scripts/                 Admin provisioning and SQLite preparation
tests/                   Policy, validation and security tests
  browser/               Isolated fixture setup and browser acceptance tests
docs/                    Project context, future architecture and validation report
```

## Database models

| Model             | Purpose                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| AdminUser         | Active authorized administrators and password hashes                              |
| Event             | Publishable adventures, optional operational information and content source       |
| EventCategory     | Editable categories with enable switch and display order                          |
| Destination       | Progressive catalogue, environment and optional coordinates                       |
| EventScheduleItem | Ordered schedule entries by day, with optional time                               |
| GalleryImage      | Publication state, explicit authorization and optional event/destination relation |
| ContactMessage    | Contact details, subject, message and read state                                  |
| SiteSettings      | Singleton JSON content plus editable community/social labels                      |
| SocialLink        | Enabled social links and display order                                            |

There are **nine models** in the initial database. Booking, Participant and Payment are intentionally deferred; see `docs/ARCHITECTURE.md`. Enum types: EventStatus, ContentSource and EnvironmentType.

## Content rules and configuration

`DEMO_MODE=true` loads only `src/data/demo/content.ts` for public adventure content. It displays a demo banner and prevents indexing. Demo records contain no real locations, schedules, prices, dates, capacity or contact information.

`DEMO_MODE=false` reads only published, confirmed database records. Demo database records and drafts stay private. Galleries require both `published=true` and `authorized=true`; media related to unpublished or demo events/destinations stays private. Empty production collections show honest empty states. A missing database configuration disables the contact form and leaves content collections empty. An unavailable configured database is treated as an error, never silently replaced with demo content.

`src/data/confirmed/site.ts` holds the confirmed brand fallback. The `SiteSettings` row with ID `main` overrides supported fields through its `content` JSON. Supported fields include name, tagline, heroTitle, instagramUrl, instagramHandle, logoPath, heroImage, about, story, mission, values, sinceYear, whySakado, communityMetrics, whatsappNumber, email, phone and address. `instagramFollowersLabel`, `instagramPostsLabel` and `communityMembersLabel` are editable columns. No social counts, dates of creation or certification claims are prepopulated.

Place the actual logo and authorized images under `public/images/`, then configure local paths such as `/images/sakado-logo.png`. The first version restricts media to reviewed local paths. Add an explicit trusted `images.remotePatterns` entry and a media policy before adopting an external storage host. Instagram is linked directly; no photographs or counts are scraped and no third-party embeds are loaded.

Set `SITE_URL` to the confirmed HTTPS origin before public indexing. Without it, pages are noindex and the sitemap is empty. `WHATSAPP_NUMBER` accepts a confirmed international number; missing/invalid values hide the WhatsApp CTA. Other contact environment values are optional. Never commit `.env` or databases.

Content editing interfaces are **not implemented yet**. Database-backed content is ready for those screens; a developer can provision verified content through Prisma tooling meanwhile. The dashboard roadmap is clearly marked as future work.

## Administrator setup

Set a random `SESSION_SECRET` of at least 32 characters, a real `ADMIN_EMAIL`, and an `ADMIN_PASSWORD` of 12–256 characters in `.env`, then run:

```powershell
npm run admin:create
```

Remove `ADMIN_PASSWORD` afterward. No default credentials, public signup or password recovery endpoint is provided. Re-running provisioning for an existing email fails rather than overwriting an account. Only active AdminUser records can access the overview. Use HTTPS in production.

Request throttling is process-local in this first version. Before multi-instance deployment, use a shared limiter and appropriate edge protections. SQLite is appropriate for a single-instance first version with persistent storage and backups; evaluate a managed database before scaling or using ephemeral hosting. The privacy notice is provisional and requires client review.

## Still needed from Sakado

1. Actual logo files, Instagram screenshot and approved brand/font guidelines.
2. Authorized high-resolution photographs, descriptions, credits and usage rights.
3. Official story, mission, values, creation year and supported experience categories.
4. Real upcoming/past events: locations, dates, duration, difficulty, prices/currency, capacity, programs, inclusions, exclusions, equipment and meeting points.
5. Confirmed destinations, regions, descriptions, coordinates and photo associations.
6. Phone/WhatsApp, contact email, address if applicable, and responsible contact person.
7. Confirmed community metrics and wording, if these should appear.
8. Domain, hosting, administrator users, content approval roles and media-upload needs.
9. Reservation lifecycle, participant data, capacity rules, payment provider, deposit, confirmation, cancellation and refund terms.
10. Legal business identity, privacy contact, retention periods and publication-approved legal notices.

No deployment or publication has been performed.
