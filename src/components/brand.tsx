import Image from "next/image";
import Link from "@/components/link";
export function Brand({ name, logo }: { name: string; logo: string | null }) {
  return (
    <Link className="brand" href="/" aria-label={`${name} · TUNISIE — Accueil`}>
      {logo ? (
        <Image unoptimized src={logo} alt={name} width={150} height={60} />
      ) : (
        <span>
          {name.replace(" SFAX", "")}
          <small>SFAX · TUNISIE</small>
        </span>
      )}
    </Link>
  );
}
