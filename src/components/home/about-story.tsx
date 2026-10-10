import Image from "next/image";
import Link from "@/components/link";
import { Icon } from "@/components/icon";
import { MotionScene } from "@/components/motion/scene";
import { Motion } from "@/components/motion/motion";

/** CMS copy is server-rendered; animation never decides what the visitor can read. */
export function AboutStory({
  about,
  story,
  mission,
  sinceYear,
}: {
  about: string;
  story: string | null;
  mission: string | null;
  sinceYear: number | null;
}) {
  const paragraphs = [about, story, mission].filter(
    (p, i, all): p is string => !!p && all.indexOf(p) === i,
  );
  return (
    <MotionScene className="s-about-story">
      <section
        className="section container about-section"
        aria-labelledby="about-story-title"
      >
        <div className="s-story-art">
          <div className="about-art">
            <Motion effect="image" distance={12} className="s-story-image">
              <Image
                unoptimized
                src="/images/trail.svg"
                alt="Illustration temporaire d’un sentier en pleine nature"
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
              />
            </Motion>
            <span className="about-stamp">
              <Icon name="compass" size={32} />
              <strong>
                PRENDRE
                <br />
                LE LARGE.
              </strong>
            </span>
            <small>Illustration temporaire</small>
          </div>
        </div>
        <div className="about-copy">
          <p className="eyebrow">SAKADO SFAX · TUNISIE</p>
          <h2 id="about-story-title">
            L’aventure commence
            <br />
            avec Sakado.
          </h2>
          <div className="s-story-passages">
            {paragraphs.map((paragraph, index) => (
              <Motion
                effect="reveal"
                distance={24}
                className="s-story-passage"
                key={index}
              >
                <p>{paragraph}</p>
              </Motion>
            ))}
          </div>
          {sinceYear && <p>Depuis {sinceYear}</p>}
          <Link className="text-link" href="/about">
            Rencontrer l’esprit Sakado <Icon />
          </Link>
          <div className="about-signature">Dehors, tout commence.</div>
        </div>
      </section>
    </MotionScene>
  );
}
