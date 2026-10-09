import Image from "next/image";
import Link from "@/components/link";
import type { Place } from "@/lib/types";
import { environmentLabels } from "@/lib/format";
import { Icon } from "./icon";
export function DestinationCard({ destination }: { destination: Place }) {
  return (
    <Link
      className="destination-card"
      href={`/destinations/${destination.slug}`}
    >
      <Image
        unoptimized
        src={destination.coverImage ?? "/images/trail.svg"}
        alt={
          destination.demo
            ? "Illustration de démonstration, lieu non confirmé"
            : destination.coverImage
              ? destination.name
              : "Illustration en attente d’une photographie autorisée"
        }
        fill
        sizes="(max-width: 700px) 100vw, 50vw"
      />
      <div className="destination-overlay" />
      <div className="destination-content">
        <span className="eyebrow">
          {destination.demo
            ? "UNIVERS DE DÉMONSTRATION"
            : (destination.region ?? "Tunisie")}
        </span>
        <h3>{destination.name}</h3>
        <span>
          {destination.environment
            ? environmentLabels[destination.environment]
            : "À découvrir"}
        </span>
      </div>
      <span className="destination-arrow">
        <Icon />
      </span>
    </Link>
  );
}
