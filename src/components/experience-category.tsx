import Link from "@/components/link";
import type { Experience } from "@/lib/types";
import { Icon } from "./icon";
export function ExperienceCategory({
  category,
  index,
}: {
  category: Experience;
  index: number;
}) {
  return (
    <Link
      className="experience-category"
      href={`/experiences#${category.slug}`}
    >
      <span className="experience-icon">
        <Icon
          name={index === 0 ? "tent" : index === 1 ? "trail" : "sun"}
          size={32}
        />
      </span>
      <span>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        {category.demo && <small>Catégorie de démonstration</small>}
      </span>
      <Icon />
    </Link>
  );
}
