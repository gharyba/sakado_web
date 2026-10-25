import Image from "next/image";
import { MotionScene } from "@/components/motion/scene";
import { HomeWords } from "@/components/home/home-words";
import styles from "./partners-section.module.css";

export type PrivatePartnerLogo = {
  id: string;
  label: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** No public Partner model/approved records exist. Only authenticated preview DTOs enter here. */
export function PartnersSection({
  privatePartners = [],
  privateReview = false,
}: {
  privatePartners?: readonly PrivatePartnerLogo[];
  privateReview?: boolean;
}) {
  const logos = privateReview ? privatePartners : [];
  return (
    <section
      id="partenaires"
      className={styles.section}
      aria-labelledby="partners-heading"
      data-partners-section
    >
      <MotionScene cinematic className="container" data-partners-story>
        <header className={styles.header}>
          <p className={styles.eyebrow}>L’AVENTURE, ENSEMBLE</p>
          <h2 id="partners-heading" aria-label="Nos Partenaires">
            <HomeWords text="Nos Partenaires" />
          </h2>
          <p className={styles.intro}>Une aventure qui se partage.</p>
        </header>
        {privateReview && (
          <p className={styles.review} data-partner-review>
            Logos fournis pour cette revue privée. Identités, partenariats et
            droits de publication restent à confirmer.
          </p>
        )}
        {logos.length ? (
          <ul
            className={styles.logos}
            aria-label="Logos fournis pour la revue privée"
          >
            {logos.map((logo) => (
              <li key={logo.id}>
                <figure>
                  <div className={styles.mark} data-partner-mark>
                    <div className={styles.logoSurface}>
                      <Image
                        unoptimized
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width}
                        height={logo.height}
                        sizes="(max-width: 699px) 40vw, (max-width: 1023px) 27vw, 15vw"
                      />
                    </div>
                  </div>
                  {logo.label.includes("confirmer") && (
                    <figcaption>Identité à confirmer</figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty} data-partners-empty>
            Les partenariats seront présentés ici après confirmation par Sakado.
          </p>
        )}
      </MotionScene>
    </section>
  );
}
