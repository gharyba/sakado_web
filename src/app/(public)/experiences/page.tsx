import Link from "@/components/link";
import { getExperiences, getEvents } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { EventCard } from "@/components/event-card";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Nos expériences",
  "Camping, randonnée et expériences en pleine nature avec Sakado Sfax.",
  "/experiences",
);
export default async function ExperiencesPage() {
  const [categories, events] = await Promise.all([
    getExperiences(),
    getEvents(),
  ]);
  return (
    <div className="container page-section">
      <PageIntro
        eyebrow="VOTRE FAÇON DE PRENDRE L’AIR"
        title="À chacun son aventure."
      />
      {categories.length ? (
        categories.map((category) => (
          <section
            className="experience-detail"
            id={category.slug}
            key={category.id}
          >
            <p className="eyebrow">
              {category.demo
                ? "CATÉGORIE DE DÉMONSTRATION · OFFRE À CONFIRMER"
                : "EXPÉRIENCE SAKADO"}
            </p>
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <div className="event-grid">
              {events
                .filter((event) => event.category === category.name)
                .map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </section>
        ))
      ) : (
        <p className="empty-state">
          Le catalogue d’expériences sera publié ici.{" "}
          <Link href="/contact">Échangez avec Sakado.</Link>
        </p>
      )}
    </div>
  );
}
