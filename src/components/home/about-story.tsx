import { CompanyStory } from "@/components/company/company-story";
import type { GalleryPhoto } from "@/lib/types";

/** Retains every CMS passage; the shared story owns only its presentation. */
export function AboutStory({
  about,
  story,
  mission,
  sinceYear,
  photos,
}: {
  about: string;
  story: string | null;
  mission: string | null;
  sinceYear: number | null;
  photos?: readonly GalleryPhoto[];
}) {
  return (
    <CompanyStory
      intro={{ about, story, mission, sinceYear }}
      photos={photos}
    />
  );
}
