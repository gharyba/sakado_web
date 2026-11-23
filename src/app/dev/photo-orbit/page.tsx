import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingMemories } from "@/components/floating-memories";
import { MotionToggle } from "@/components/motion/preference";
import type { GalleryPhoto } from "@/lib/types";

export const metadata: Metadata = {
  title: "Laboratoire photographique — développement",
  robots: { index: false, follow: false, noarchive: true },
};

/** Synthetic, DB-free fixtures, never linked from the public site. */
export default async function PhotoOrbitLab({
  searchParams,
}: {
  searchParams: Promise<{ count?: string; broken?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  const count = Math.max(
    0,
    Math.min(40, Number.parseInt(params.count ?? "12", 10) || 0),
  );
  const photos: GalleryPhoto[] = Array.from({ length: count }, (_, index) => ({
    id: `lab-${index}`,
    src:
      params.broken === "true" && index === 0
        ? "/images/unavailable-orbit.webp"
        : `/images/${["camp", "coast", "trail"][index % 3]}.svg`,
    alt: `Illustration de laboratoire ${index + 1}`,
    caption: index % 2 ? null : `Essai spatial ${index + 1}`,
    category: index % 2 ? "B" : "A",
    demo: true,
  }));
  return (
    <main className="container page-section s-company-site">
      <h1 style={{ overflowWrap: "anywhere" }}>
        Laboratoire — Floating Memories
      </h1>
      <p>Illustrations de test, aucun contenu photographique officiel.</p>
      <MotionToggle />
      <FloatingMemories photos={photos} />
    </main>
  );
}
