import { getGallery } from "@/lib/content";
import { getInstagramMedia } from "@/lib/instagram-content";
import { mediaPage } from "@/lib/instagram-policy";
import { InstagramMediaGallery } from "@/components/instagram-media-gallery";
import Link from "@/components/link";
import { getSettings } from "@/lib/settings";
import { PageIntro } from "@/components/page-intro";
import { Gallery } from "@/components/gallery";
import { pageMetadata } from "@/lib/metadata";
import { MotionToggle } from "@/components/motion/preference";
import { getClientDemoAssets } from "@/lib/client-demo";
import { ClientDemoDetail } from "@/components/client-demo/client-home";
import { getOfficialPresentation } from "@/lib/official-presentation";
import { PresentationGallery } from "@/components/company/presentation-gallery";
export const metadata = pageMetadata(
  "Galerie",
  "Les aventures, la nature et les moments partagés de Sakado Sfax en images.",
  "/gallery",
);
export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const assets = await getClientDemoAssets();
  if (assets) return <ClientDemoDetail assets={assets} section="gallery" />;
  const presentation = await getOfficialPresentation();
  const params = await searchParams;
  const view = params.view === "instagram" ? "instagram" : "photos";
  const page = mediaPage(params.page);
  const [photos, settings, instagram] = await Promise.all([
    getGallery(),
    getSettings(),
    view === "instagram" ? getInstagramMedia({ page }) : Promise.resolve(null),
  ]);
  return (
    <div className="container page-section">
      <PageIntro
        eyebrow="LES INSTANTS QUI RESTENT"
        title="Nos aventures en images."
      >
        <p>
          {settings.demo
            ? "Illustrations temporaires. Les photographies autorisées de Sakado remplaceront ces aperçus."
            : "Des instants vécus, des souvenirs à partager."}
        </p>
      </PageIntro>
      <nav className="gallery-filters" aria-label="Source de la galerie">
        <Link
          className="button"
          aria-current={view === "photos" ? "page" : undefined}
          href="/gallery"
        >
          Photos Sakado
        </Link>
        <Link
          className="button"
          aria-current={view === "instagram" ? "page" : undefined}
          href="/gallery?view=instagram"
        >
          Instagram
        </Link>
      </nav>
      {instagram ? (
        <>
          <InstagramMediaGallery items={instagram.items} />
          <nav
            className="instagram-pagination"
            aria-label="Pages des publications"
          >
            {page > 1 && (
              <Link
                className="text-link"
                href={"/gallery?view=instagram&page=" + (page - 1)}
              >
                ← Précédent
              </Link>
            )}
            <span>Page {page}</span>
            {instagram.hasMore && (
              <Link
                className="text-link"
                href={"/gallery?view=instagram&page=" + (page + 1)}
              >
                Suivant →
              </Link>
            )}
          </nav>
        </>
      ) : (
        <>
          <div className="s-gallery-controls">
            <MotionToggle />
          </div>
          {presentation ? (
            <PresentationGallery photos={presentation.gallery} />
          ) : (
            <Gallery photos={photos} cinematic />
          )}
        </>
      )}
    </div>
  );
}
