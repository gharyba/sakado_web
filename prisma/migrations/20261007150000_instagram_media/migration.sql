CREATE TYPE "InstagramMediaType" AS ENUM ('INSTAGRAM_MEDIA', 'PHOTO', 'VIDEO', 'REEL', 'CAROUSEL');
CREATE TABLE "InstagramMedia" (
  "id" TEXT NOT NULL,
  "instagramUrl" TEXT NOT NULL,
  "title" TEXT,
  "mediaType" "InstagramMediaType" NOT NULL DEFAULT 'INSTAGRAM_MEDIA',
  "previewImage" TEXT,
  "eventId" TEXT,
  "destinationId" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InstagramMedia_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InstagramMedia_instagramUrl_key" ON "InstagramMedia"("instagramUrl");
CREATE INDEX "InstagramMedia_published_showOnHomepage_displayOrder_idx" ON "InstagramMedia"("published", "showOnHomepage", "displayOrder");
CREATE INDEX "InstagramMedia_eventId_idx" ON "InstagramMedia"("eventId");
CREATE INDEX "InstagramMedia_destinationId_idx" ON "InstagramMedia"("destinationId");
ALTER TABLE "InstagramMedia" ADD CONSTRAINT "InstagramMedia_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InstagramMedia" ADD CONSTRAINT "InstagramMedia_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
