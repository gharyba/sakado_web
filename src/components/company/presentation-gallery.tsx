import { Gallery } from "@/components/gallery";
import type { GalleryPhoto } from "@/lib/types";
import styles from "./presentation-gallery.module.css";
/** Separate visual sample; public CMS gallery results remain untouched. */
export function PresentationGallery({
  photos,
  revealPreview = false,
}: {
  photos: GalleryPhoto[];
  revealPreview?: boolean;
}) {
  if (!photos.length) return null;
  return (
    <aside
      className={styles.root}
      data-official-presentation-gallery
      aria-label="Sélection photographique privée"
    >
      <p className="notice">
        Sélection privée pour cette présentation locale · aucune publication
        CMS.
      </p>
      <Gallery photos={photos} cinematic revealPreview={revealPreview} />
    </aside>
  );
}
