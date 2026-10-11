import Link from "@/components/link";
import { getEvents } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import {
  AdventureListing,
  readAdventureFilters,
} from "@/components/adventure-listing";
import { pastAdventures } from "@/lib/adventure-discovery";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Les aventures passées",
  "Les récits et souvenirs publiés des aventures Sakado.",
  "/adventures",
);
export default async function AdventuresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [events, params] = await Promise.all([getEvents(), searchParams]);
  return (
    <div className="container page-section">
      <PageIntro eyebrow="LES SOUVENIRS" title="Les aventures passées">
        <p>
          Retrouvez les récits et les images autorisées des sorties terminées.
        </p>
        <Link className="text-link" href="/events">
          Découvrir les prochaines aventures →
        </Link>
      </PageIntro>
      <AdventureListing
        events={pastAdventures(events)}
        filters={{ ...readAdventureFilters(params), open: false }}
        past
      />
    </div>
  );
}
