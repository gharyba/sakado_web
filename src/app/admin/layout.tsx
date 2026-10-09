import type { Metadata, Viewport } from "next";
import { AdminPwa } from "@/components/admin/pwa";
import "./admin.css";
export const metadata: Metadata = {
  title: { default: "Sakado Admin", template: "%s | Sakado Admin" },
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sakado Admin",
    statusBarStyle: "default",
  },
  icons: { apple: "/admin/icon-192.png" },
};
export const viewport: Viewport = { themeColor: "#163e35" };
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sakado-admin">
      <AdminPwa />
      {children}
    </div>
  );
}
