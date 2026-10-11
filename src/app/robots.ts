import type { MetadataRoute } from "next";
import { publicOrigin, demoEnabled } from "@/lib/content-policy";
import { stagingEnabled } from "@/lib/staging-policy";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const origin = publicOrigin();
  return {
    rules: {
      userAgent: "*",
      ...(stagingEnabled() || demoEnabled() || !origin
        ? { disallow: "/" }
        : { allow: "/", disallow: ["/admin", "/api"] }),
    },
    ...(origin && !demoEnabled() && !stagingEnabled()
      ? { sitemap: `${origin}/sitemap.xml` }
      : {}),
  };
}
