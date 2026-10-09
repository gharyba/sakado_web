import { z } from "zod";
export const contactSubjects = {
  reservation: "Réservation",
  event: "Événement à venir",
  group: "Groupe privé",
  partnership: "Partenariat",
  general: "Question générale",
} as const;
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/),
  subject: z.enum(["reservation", "event", "group", "partnership", "general"]),
  message: z.string().trim().min(10).max(5000),
});
