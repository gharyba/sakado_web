import { z } from "zod";
import { approvedImagePath, safeSocialUrl } from "./content-policy";
const text = (max = 20000) => z.string().trim().max(max);
const optionalText = (max = 20000) =>
  text(max)
    .nullish()
    .transform((v) => v || null);
const bool = z.preprocess(
  (v) => v === true || v === "true" || v === "on",
  z.boolean(),
);
const number = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().finite().min(0).max(max).nullable(),
  );
const date = z.preprocess(
  (v) =>
    v === "" || v == null
      ? null
      : typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)
        ? v + "+01:00"
        : v,
  z.coerce.date().nullable(),
);
export const id = z.string().min(1).max(100);
const image = optionalText(500).refine(
  (v) => !v || !!approvedImagePath(v),
  "Image non autorisée.",
);
const slug = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Utilisez des minuscules, chiffres et tirets.",
  );
export const scheduleSchema = z
  .array(
    z.object({
      day: z.coerce.number().int().min(1).max(90),
      time: optionalText(5).refine(
        (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      ),
      title: text(200).min(1),
      description: optionalText(2000),
    }),
  )
  .max(200);
export const eventSchema = z
  .object({
    title: text(200).min(2),
    slug,
    shortDescription: text(500).min(2),
    description: text().min(2),
    categoryId: optionalText(100),
    destinationId: optionalText(100),
    location: optionalText(200),
    startsAt: date,
    endsAt: date,
    duration: optionalText(100),
    meetingTime: optionalText(5),
    meetingPoint: optionalText(1000),
    price: number(1000000),
    capacity: number(10000).refine((v) => v === null || Number.isInteger(v)),
    difficulty: z
      .enum(["", "Facile", "Moyenne", "Difficile"])
      .transform((v) => v || null),
    coverImage: image,
    status: z.enum([
      "DRAFT",
      "UPCOMING",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
      "ARCHIVED",
    ]),
    registrationStatus: z.enum([
      "CLOSED",
      "OPEN",
      "FEW_PLACES",
      "FULL",
      "WAITLIST_ONLY",
    ]),
    registrationOpenAt: date,
    registrationDeadline: date,
    published: bool,
    featured: bool,
    showAvailability: bool,
    included: text().default(""),
    excluded: text().default(""),
    equipment: text().default(""),
    recommendations: optionalText(),
    conditions: optionalText(),
    importantInfo: optionalText(),
    cancellationInfo: optionalText(),
    recap: optionalText(),
    schedule: z.preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : (v ?? [])),
      scheduleSchema,
    ),
  })
  .superRefine((v, c) => {
    if (v.startsAt && v.endsAt && v.endsAt < v.startsAt)
      c.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "La fin doit suivre le début.",
      });
    if (v.published && v.status === "DRAFT")
      c.addIssue({
        code: "custom",
        path: ["status"],
        message: "Choisissez un statut avant de publier.",
      });
    if (
      v.registrationStatus !== "CLOSED" &&
      (!v.startsAt || v.price === null || v.capacity === null || v.capacity < 1)
    )
      c.addIssue({
        code: "custom",
        path: ["capacity"],
        message:
          "Date, tarif et capacité sont requis pour ouvrir les inscriptions.",
      });
    if (
      v.registrationOpenAt &&
      v.registrationDeadline &&
      v.registrationOpenAt >= v.registrationDeadline
    )
      c.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "La clôture doit suivre l’ouverture.",
      });
  });
export { bookingInput } from "./registration-validation";
export const bookingEdit = z.object({
  id,
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "WAITLIST",
    "CANCELLED",
    "COMPLETED",
  ]),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID", "REFUNDED"]),
  participantCount: z.coerce.number().int().min(1).max(100),
  firstName: text(100).min(2),
  lastName: text(100).min(2),
  email: z.email().max(254),
  phone: text(30).min(8),
  internalNote: optionalText(5000),
});
export const destinationSchema = z.object({
  name: text(200).min(2),
  slug,
  region: optionalText(200),
  description: text().min(2),
  coverImage: image,
  published: bool,
  archived: bool,
  featured: bool,
  difficulty: optionalText(100),
  environment: z
    .enum(["", "FOREST", "MOUNTAIN", "BEACH", "DESERT", "COUNTRYSIDE"])
    .transform((v) => v || null),
});
export const categorySchema = z.object({
  name: text(100).min(2),
  slug,
  description: optionalText(500),
  enabled: bool,
  order: z.coerce.number().int().min(0).max(10000),
});
export const gallerySchema = z.object({
  id,
  alt: text(300).min(2),
  caption: optionalText(1000),
  category: optionalText(100),
  eventId: optionalText(100),
  destinationId: optionalText(100),
  authorized: bool,
  published: bool,
  featured: bool,
  order: z.coerce.number().int().min(0).max(10000),
});
export const userSchema = z.object({
  name: text(100).min(2),
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  role: z.enum(["OWNER", "ADMIN", "EDITOR"]),
  active: bool,
  password: z
    .string()
    .max(256)
    .default("")
    .refine(
      (v) => !v || v.length >= 12,
      "Le mot de passe doit contenir au moins 12 caractères.",
    ),
});
export const siteSchema = z.object({
  heroTitle: text(200).min(2),
  tagline: text(500).min(2),
  heroImage: image,
  about: text(),
  story: optionalText(),
  mission: optionalText(),
  values: text().default(""),
  contactCtaTitle: text(200),
  contactCtaText: text(500),
  galleryPreview: bool,
  instagramMediaTitle: text(200).min(1).default("Nos aventures"),
  instagramMediaSubtitle: text(500).default(
    "Revivez quelques-uns de nos meilleurs moments.",
  ),
});
export const settingsSchema = z.object({
  name: text(100).min(2),
  logoPath: image,
  email: z
    .union([z.email().max(254), z.literal("")])
    .transform((v) => v || null),
  phone: optionalText(30),
  whatsappNumber: optionalText(20).refine(
    (v) => !v || /^\+?[1-9]\d{7,14}$/.test(v),
    "Numéro international requis.",
  ),
  address: optionalText(500),
  instagramUrl: z.string().refine(safeSocialUrl),
  instagramHandle: text(100),
  facebookUrl: z.union([z.literal(""), z.string().refine(safeSocialUrl)]),
  footerText: text(1000),
  instagramFollowersLabel: optionalText(100),
  instagramPostsLabel: optionalText(100),
  communityMembersLabel: optionalText(100),
  socialLinks: z.preprocess(
    (v) => (typeof v === "string" ? JSON.parse(v) : (v ?? [])),
    z
      .array(
        z.object({
          label: text(100).min(1),
          url: z.string().refine(safeSocialUrl),
          enabled: bool,
        }),
      )
      .max(20),
  ),
});
export function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean);
}
