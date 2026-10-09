"use server";
import { db, databaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, contactSubjects } from "@/lib/contact-validation";
export type ContactState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};
export async function sendContact(
  _state: ContactState,
  form: FormData,
): Promise<ContactState> {
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
  if (
    !(await rateLimit("contact-global", "all", 100, 60 * 60_000)) ||
    !(await rateLimit("contact-email", result.data.email, 3, 10 * 60_000))
  )
    return {
      success: false,
      message: "Trop de messages envoyés. Réessayez dans quelques minutes.",
    };
  try {
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
    return {
      success: false,
      message:
        "Le message n’a pas pu être enregistré. Contactez Sakado directement sur Instagram.",
    };
  }
}
