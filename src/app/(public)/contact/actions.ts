"use server";
import { db, databaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, contactSubjects } from "@/lib/contact-validation";
import { demoEnabled } from "@/lib/content-policy";
import { operationalFailure } from "@/lib/operational-log";
export type ContactState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};
export async function sendContact(
  _state: ContactState,
  form: FormData,
): Promise<ContactState> {
  if (demoEnabled())
    return {
      success: false,
      message: "L’envoi de messages est désactivé en démonstration.",
    };
  if (!databaseConfigured())
    return {
      success: false,
      message:
        "Le formulaire n’est pas encore disponible. Contactez Sakado sur Instagram.",
    };
  if (form.get("website"))
    return { success: false, message: "Votre message n’a pas pu être envoyé." };
  const result = contactSchema.safeParse(
    Object.fromEntries(
      ["name", "email", "phone", "subject", "message"].map((key) => [
        key,
        form.get(key) ?? "",
      ]),
    ),
  );
  if (!result.success)
    return {
      success: false,
      message: "Vérifiez les champs du formulaire.",
      errors: result.error.flatten().fieldErrors,
    };
  try {
    if (
      !(await rateLimit("contact-global", "all", 100, 60 * 60_000)) ||
      !(await rateLimit("contact-email", result.data.email, 3, 10 * 60_000))
    )
      return {
        success: false,
        message: "Trop de messages envoyés. Réessayez dans quelques minutes.",
      };
    const { subject, phone, ...data } = result.data;
    await db.contactMessage.create({
      data: {
        ...data,
        phone: phone || null,
        subject: contactSubjects[subject],
      },
    });
    return {
      success: true,
      message:
        "Votre message a été transmis à l’équipe Sakado. Ceci ne constitue pas une réservation.",
    };
  } catch {
    operationalFailure("contact");
    return {
      success: false,
      message:
        "Le message n’a pas pu être enregistré. Contactez Sakado directement sur Instagram.",
    };
  }
}
