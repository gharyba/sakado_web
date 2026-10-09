# Instagram media library and marquee

## Existing architecture

The existing App Router homepage uses server-side content queries and small client components. GalleryImage stores authorized local photographs, served from public/images or the authenticated/public-policy-aware /media route. Gallery uses next/image and a native dialog. Admin uses shared forms, gallery permissions, same-origin checks, database sessions and audit logs. Prisma uses PostgreSQL. Global CSS defines forest green, warm neutrals and breakpoints at 900px and 700px for this feature.

## Components and integration

- InstagramMediaMarquee: one row, calm 22px/second native scrolling, three identical groups for looping, intersection and document visibility gating, hover/focus/pointer pause, explicit pause/resume and previous/next controls.
- InstagramMediaCard: vertical 4:5 preview, local lazy image, subtle Instagram icon, verified-type-only video indicator, honest branded fallback when no thumbnail exists or loading fails.
- InstagramMediaDialog: native accessible modal, Escape/backdrop/close button, focus restoration, associated public adventure/destination links, original Instagram link.
- InstagramMediaGallery: shared public library with type filters and 24-item server pagination.

The homepage Instagram profile strip is replaced with the new section; other homepage sections remain in place. Section title and subtitle are editable in /admin/site. /gallery?view=instagram and associated event pages reuse the same records.

## Database and import

Migration: prisma/migrations/20261007150000_instagram_media/migration.sql.

InstagramMedia includes a unique canonical Instagram URL, title, enum media type, optional preview path, optional event and destination relations, featured, showOnHomepage, published, displayOrder and timestamps. Foreign keys use SetNull. Composite selection and relation indexes support bounded public queries.

The 45 supplied links live in src/data/instagram-media.json. Run:

    npm run db:deploy
    npm run db:generate
    npm run instagram:import

The script validates HTTPS and exact Instagram domains, accepts only media paths, removes query strings and fragments, and skips duplicate canonical URLs. It never downloads Instagram content, infers media type from /p/, or changes existing records on re-import. All new records are generic INSTAGRAM_MEDIA and unpublished, with homepage selection off. Bulk admin import accepts up to 100 links, one per line. Invalid batches are rejected before inserts.

Local initial import: 45 inserted; second run: 0 inserted and 45 duplicates skipped. No supplied URL failed syntax validation. Instagram availability, thumbnail metadata and post contents were not fetched or verified.

## Admin workflow

Open /admin/instagram. All roles with the existing gallery permission can manage this library. Administrators can add/import, choose an authorized local preview, label media type after verification, associate an event/destination, publish/unpublish, show/hide on homepage, feature, reorder and remove posts from Sakado. Removal never contacts or deletes anything on Instagram. Lists are paginated at 24 records.

Upload thumbnail photographs using /admin/gallery. To display an uploaded preview publicly, confirm authorization and publish its gallery record; private or unavailable previews fall back to branded cards. Private/demo/archived associations are excluded from public selection. Gallery images used as Instagram previews cannot be deleted until they are detached.

To activate the marquee, publish selected records and enable “Afficher sur l’accueil”. Homepage queries return at most 16 records, ordered by featured, displayOrder and ID. No unpublished media is serialized to the homepage.

## Performance, mobile and fallback

No Instagram embed, third-party script, iframe or remote thumbnail is loaded, including when the preview modal opens. The deliberate Version 1 fallback opens Instagram only when the visitor chooses the external link. This keeps the existing CSP intact and makes private/deleted/blocked Instagram posts harmless to Sakado rendering. No arbitrary HTML is accepted or rendered.

Preview images use lazy next/image with responsive sizes; uploaded images are already optimized WebP by the existing upload pipeline. Animation starts only while visible, stops while the document is hidden, and is disabled under prefers-reduced-motion. Manual native touch scrolling and navigation remain available. Duplicated groups are hidden from accessibility navigation and reduced-motion layouts. Mobile cards use 68vw to reveal the next item; tablet uses 29vw; desktop uses 19vw capped at 300px. The section contains horizontal overflow.

## Changed files

New: src/data/instagram-media.json; scripts/import-instagram-media.ts; src/lib/instagram-policy.ts; src/lib/instagram-import.ts; src/lib/instagram-content.ts; src/app/api/admin/instagram/route.ts; src/app/admin/(protected)/instagram/page.tsx; src/components/instagram-media-card.tsx; src/components/instagram-media-dialog.tsx; src/components/instagram-media-marquee.tsx; src/components/instagram-media-gallery.tsx; tests/instagram.test.ts; tests/browser/instagram.confirmed.spec.ts; the migration above; this report.

Updated: package.json; prisma/schema.prisma; src/app/(public)/page.tsx; src/app/(public)/gallery/page.tsx; src/app/(public)/events/[slug]/page.tsx; src/app/globals.css; src/components/admin/navigation.tsx; src/app/admin/(protected)/gallery/page.tsx; src/app/admin/(protected)/site/page.tsx; src/data/confirmed/site.ts; src/lib/settings.ts; src/lib/admin-validation.ts; src/lib/admin-mutations.ts; tests/browser/setup.ts; tests/browser/admin.spec.ts.

## Verification

- npm run lint: passed.
- npm run typecheck: passed.
- npm test: 15 passed, 0 failed.
- npm run build: passed; new admin and API routes included.
- npm run test:e2e: 23 passed, 0 failed, including all existing public/admin flows and three new Instagram browser tests.
- Import: 45 inserted; repeated import: 0 inserted, 45 duplicates skipped.
- Real local database after verification: 45 Instagram records, 0 published. Browser fixtures only touched sakado_test.
- Browser checks cover desktop autoplay and loop boundary, hover/pause interaction, modal opening/Escape/focus restoration, zero Instagram network requests, 390px native mobile swipe, reduced-motion behavior, no page overflow, public subset/privacy selection, gallery type filters, 24/21 admin pagination, duplicate bulk import, validated editing/deletion, unauthenticated access and same-origin protection.
- Visual review screenshots: test-results/instagram-desktop-section.png and test-results/instagram-mobile-section.png. Test previews are synthetic fixtures and are not added to the real media library.

The regression harness needed fixes to an existing creation-redirect race, select locators, HTTP API cookie fixtures, streamed forbidden-page assertions and uploaded-photo cleanup. These changes are confined to tests/browser/admin.spec.ts; production cookie settings remain unchanged.

Performance claims concern loading strategy; no before/after LCP or INP benchmark has been performed.
