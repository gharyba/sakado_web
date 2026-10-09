import type { MetadataRoute } from "next";
import { publicOrigin, demoEnabled } from "@/lib/content-policy";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const origin = publicOrigin();
  return {
    rules: {
      userAgent: "*",
      ...(demoEnabled() || !origin
        ? { disallow: "/" }
        : { allow: "/", disallow: ["/admin", "/api"] }),
    },
    ...(origin && !demoEnabled() ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
