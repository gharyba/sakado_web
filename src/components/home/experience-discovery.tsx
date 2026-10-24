import Link from "@/components/link";
import type { Experience } from "@/lib/types";
import { ExperienceCategory } from "@/components/experience-category";
import { MotionSurface } from "@/components/motion/surface";
import { Icon } from "@/components/icon";
import { HomeWords } from "./home-words";
import styles from "./experience-discovery.module.css";

/** Server composition. The caller retains filtering, fetching and CMS order. */
export function ExperienceDiscovery({
  categories,
}: {
  categories: readonly Experience[];
}) {
  return (
    <section
      className={`experience-section ${styles.root}`}
      aria-labelledby="experience-discovery-heading"
      data-experience-discovery
    >
      <div className="container">
        <header className={styles.heading}>
          <div>
            <p className="eyebrow">À CHACUN SON ÉVASION</p>
            <h2
              id="experience-discovery-heading"
              aria-label="Quelle aventure vous ressemble ?"
            >
              <HomeWords text="Quelle aventure vous ressemble ?" />
            </h2>
          </div>
          <Link href="/experiences" className={`text-link ${styles.allLink}`}>
            Nos expériences <Icon size={18} />
          </Link>
        </header>
        {categories.length ? (
          <MotionSurface className={`s-activity-surface ${styles.surface}`}>
            <ul className={`experience-grid ${styles.grid}`} role="list">
              {categories.map((category, index) => (
                <li key={category.id}>
                  <ExperienceCategory category={category} index={index} />
                </li>
              ))}
            </ul>
          </MotionSurface>
        ) : (
          <p className={styles.unavailable}>
            Les expériences seront publiées après confirmation par Sakado.
          </p>
        )}
      </div>
    </section>
  );
}
