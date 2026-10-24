import Link from "@/components/link";
import type { ComponentProps } from "react";
import type { Experience } from "@/lib/types";
import { Icon } from "./icon";
import styles from "./home/experience-discovery.module.css";

const icons: Partial<Record<string, ComponentProps<typeof Icon>["name"]>> = {
  randonnee: "trail",
  camping: "tent",
  kayak: "compass",
  paddle: "sun",
  "exploration-cotiere": "pin",
  "aventures-en-foret": "trail",
  "retraites-nature": "sun",
};
export function experienceIcon(slug: string) {
  return Object.hasOwn(icons, slug) ? icons[slug]! : "compass";
}

/** Numbering follows CMS order; it is decoration, never a ranking. */
export function ExperienceCategory({
  category,
  index,
}: {
  category: Experience;
  index: number;
}) {
  const titleId = `experience-title-${category.id}`;
  const descriptionId = `experience-description-${category.id}`;
  return (
    <Link
      className={`experience-category ${styles.card}`}
      href={`/experiences#${category.slug}`}
      aria-labelledby={titleId}
      aria-describedby={category.description ? descriptionId : undefined}
      data-experience={category.slug}
    >
      <div className={styles.cardTop} aria-hidden="true">
        <span className={styles.number}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`experience-icon ${styles.icon}`}
          data-experience-icon={experienceIcon(category.slug)}
        >
          <Icon name={experienceIcon(category.slug)} size={28} />
        </span>
      </div>
      <div className={styles.copy}>
        <h3 id={titleId}>{category.name}</h3>
        {category.description && (
          <p id={descriptionId}>{category.description}</p>
        )}
        {category.demo && <small>Catégorie de démonstration</small>}
      </div>
      <span className={styles.arrow} data-experience-arrow aria-hidden="true">
        <Icon size={22} />
      </span>
    </Link>
  );
}
