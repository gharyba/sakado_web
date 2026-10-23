import Link from "@/components/link";
import { Icon } from "./icon";
import { HomeWords } from "./home/home-words";
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkText,
  animated = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
  animated?: boolean;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 aria-label={animated ? title : undefined}>
          {animated ? <HomeWords text={title} /> : title}
        </h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkText ?? "Tout découvrir"}
          <Icon size={18} />
        </Link>
      )}
    </div>
  );
}
