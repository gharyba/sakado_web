import type { MetadataRoute } from "next";
import { publicOrigin, demoEnabled } from "@/lib/content-policy";
import { getEvents, getDestinations } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicOrigin();
  if (!origin || demoEnabled()) return [];
  const [events, destinations] = await Promise.all([
    getEvents(),
    getDestinations(),
  ]);
  return [
    "",
    "/events",
    "/experiences",
    "/destinations",
    "/gallery",
    "/about",
    "/contact",
    ...events
      .filter((item) => !item.demo)
      .map((item) => `/events/${item.slug}`),
    ...destinations
      .filter((item) => !item.demo)
      .map((item) => `/destinations/${item.slug}`),
  ].map((path) => ({ url: `${origin}${path}` }));
}
