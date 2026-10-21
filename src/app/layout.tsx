import type { Metadata } from "next";
import { publicOrigin } from "@/lib/content-policy";
import "@/styles/tokens.css";
import "@/styles/primitives.css";
import "./globals.css";
import "@/styles/cinematic.css";
import "@/styles/adventures.css";
import "@/styles/company.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    default: "SAKADO SFAX | Camping & randonnée en Tunisie",
    template: "%s | SAKADO SFAX",
  },
  description:
    "Camping, randonnée et aventures en pleine nature avec Sakado Sfax.",
  metadataBase: new URL(publicOrigin() ?? "http://localhost:3000"),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
