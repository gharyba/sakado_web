import { z } from "zod";

// Shared browser/server contract. The server still validates every request inside the transaction.
export const registrationFields = {
  firstName: "Indiquez un prénom de 2 à 100 caractères.",
  lastName: "Indiquez un nom de 2 à 100 caractères.",
  email: "Indiquez une adresse e-mail valide (254 caractères maximum).",
  phone:
    "Indiquez un téléphone de 8 à 30 caractères : chiffres, +, espaces, parenthèses, points ou tirets.",
  participantCount:
    "Choisissez un nombre entier de participants entre 1 et 100.",
  notes: "Limitez votre message à 2 000 caractères.",
};
export type RegistrationField = keyof typeof registrationFields;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;
export const bookingInput = z.object({
  eventId: z.string().min(1).max(100),
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(30)
    .regex(/^[+\d\s().-]+$/),
  participantCount: z.coerce.number().int().min(1).max(100),
  notes: z
    .string()
    .trim()
    .max(2000)
    .nullish()
    .transform((value) => value || null),
  idempotencyKey: z.string().uuid(),
});
export function registrationErrors(
  issues: readonly { path: readonly PropertyKey[] }[],
): RegistrationErrors {
  const errors: RegistrationErrors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && Object.hasOwn(registrationFields, field))
      errors[field as RegistrationField] =
        registrationFields[field as RegistrationField];
  }
  return errors;
}
