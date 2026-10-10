import "server-only";
import { cache } from "react";
import { z } from "zod";
import { confirmedSite } from "@/data/confirmed/site";
import { db, databaseConfigured } from "./db";
import { publicImagePath } from "./media-readiness";
import { demoEnabled, safeSocialUrl } from "./content-policy";
const editableSettings = z
  .object({
    footerText: z.string(),
    contactCtaTitle: z.string(),
    contactCtaText: z.string(),
    galleryPreview: z.boolean(),
    instagramMediaTitle: z.string().min(1).max(200),
    instagramMediaSubtitle: z.string().max(500),
    name: z.string().min(1),
    tagline: z.string(),
    heroTitle: z.string(),
    about: z.string(),
    instagramUrl: z.string().refine(safeSocialUrl),
    instagramHandle: z.string(),
    logoPath: z.string().nullable(),
    heroImage: z.string().nullable(),
    story: z.string().nullable(),
    mission: z.string().nullable(),
    values: z.array(z.string()),
    sinceYear: z.number().int().min(1900).max(2100).nullable(),
    whySakado: z.array(
      z.object({ title: z.string(), description: z.string() }),
    ),
    communityMetrics: z.array(
      z.object({ label: z.string(), value: z.string() }),
    ),
    whatsappNumber: z.string().nullable(),
    email: z.email().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
  })
  .partial();
export const getSettings = cache(async () => {
  const record =
    !demoEnabled() && databaseConfigured()
      ? await db.siteSettings.findUnique({ where: { id: "main" } })
      : null;
  const settings = {
    ...confirmedSite,
    whatsappNumber: process.env.WHATSAPP_NUMBER || null,
    email: process.env.CONTACT_EMAIL || null,
    phone: process.env.CONTACT_PHONE || null,
    address: process.env.CONTACT_ADDRESS || null,
    ...editableSettings.parse(record?.content ?? {}),
  };
  return {
    ...settings,
    logoPath: await publicImagePath(settings.logoPath),
    heroImage: await publicImagePath(settings.heroImage),
    instagramFollowersLabel: record?.instagramFollowersLabel ?? null,
    instagramPostsLabel: record?.instagramPostsLabel ?? null,
    communityMembersLabel: record?.communityMembersLabel ?? null,
    demo: demoEnabled(),
  };
});
