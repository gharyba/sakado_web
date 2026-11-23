import Link from "@/components/link";
import { whatsappLink } from "@/lib/content-policy";
import { Icon } from "./icon";
import {
  JourneyWords,
  JourneyImage,
  type JourneyPhoto,
} from "./company/final-journey";
import { MotionScene } from "./motion/scene";
import styles from "./company/final-journey.module.css";
export function ContactCTA({
  whatsappNumber,
  title,
  text,
  animated = false,
  photo,
}: {
  whatsappNumber: string | null;
  title: string;
  text: string;
  animated?: boolean;
  photo?: JourneyPhoto;
}) {
  const whatsapp = whatsappLink(whatsappNumber);
  return (
    <section
      className={`contact-cta ${styles.closing}`}
      aria-label="Votre prochaine aventure"
    >
      <MotionScene
        cinematic
        enabled={animated}
        data-final-journey="closing"
        className={`container ${styles.closingInner}`}
      >
        <div className={styles.closingCopy}>
          <p className={styles.eyebrow}>ET SI ON PRENAIT L’AIR ?</p>
          <h2
            className={styles.closingTitle}
            aria-label={animated ? title : undefined}
          >
            {animated ? <JourneyWords text={title} /> : title}
          </h2>
          <p className={styles.closingText} data-journey-copy>
            {text}
          </p>
          <div className={styles.closingActions}>
            <Link href="/contact" className="button">
              Parlons de votre aventure <Icon />
            </Link>
            {whatsapp && (
              <a
                href={whatsapp}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp <Icon />
              </a>
            )}
          </div>
        </div>
        <JourneyImage photo={photo} />
      </MotionScene>
    </section>
  );
}
