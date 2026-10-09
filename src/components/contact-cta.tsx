import Link from "@/components/link";
import { whatsappLink } from "@/lib/content-policy";
import { Icon } from "./icon";
export function ContactCTA({
  whatsappNumber,
  title,
  text,
}: {
  whatsappNumber: string | null;
  title: string;
  text: string;
}) {
  const whatsapp = whatsappLink(whatsappNumber);
  return (
    <section className="contact-cta">
      <div className="container contact-cta-inner">
        <div>
          <p className="eyebrow">ET SI ON PRENAIT L’AIR ?</p>
          <h2>{title}</h2>
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
