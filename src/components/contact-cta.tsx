import Link from "@/components/link";
import { whatsappLink } from "@/lib/content-policy";
import { Icon } from "./icon";
import { HomeWords } from "./home/home-words";
export function ContactCTA({
  whatsappNumber,
  title,
  text,
  animated = false,
}: {
  whatsappNumber: string | null;
  title: string;
  text: string;
  animated?: boolean;
}) {
  const whatsapp = whatsappLink(whatsappNumber);
  return (
    <section className="contact-cta">
      <div className="container contact-cta-inner">
        <div>
          <p className="eyebrow">ET SI ON PRENAIT L’AIR ?</p>
          <h2 aria-label={animated ? title : undefined}>
            {animated ? <HomeWords text={title} /> : title}
          </h2>
        </div>
        <div>
          <p>{text}</p>
          {whatsapp ? (
            <a
              href={whatsapp}
              className="button"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp <Icon />
            </a>
          ) : (
            <Link href="/contact" className="button">
              Parlons de votre aventure <Icon />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
