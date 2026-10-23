import Image from "next/image";
import Link from "@/components/link";
import { MotionSurface } from "./motion/surface";
export function Brand({
  name,
  logo,
  privatePreview = false,
  logoDimensions,
}: {
  name: string;
  logo: string | null;
  privatePreview?: boolean;
  logoDimensions?: { width: number; height: number };
}) {
  const image = logo ? (
    <Image
      unoptimized
      src={logo}
      alt={name}
      width={logoDimensions?.width ?? (privatePreview ? 80 : 150)}
      height={logoDimensions?.height ?? (privatePreview ? 80 : 60)}
    />
  ) : null;
  return (
    <Link
      className={`brand${privatePreview ? " s-client-brand" : ""}`}
      href="/"
      aria-label={`${name} · TUNISIE — Accueil`}
    >
      {logo ? (
        privatePreview ? (
          <MotionSurface className="s-client-logo-motion">
            {image}
          </MotionSurface>
        ) : (
          image
        )
      ) : (
        <span>
          {name.replace(" SFAX", "")}
          <small>SFAX · TUNISIE</small>
        </span>
      )}
    </Link>
  );
}
