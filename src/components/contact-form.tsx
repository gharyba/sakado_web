"use client";
import Link from "@/components/link";
import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/(public)/contact/actions";
import { contactSubjects } from "@/lib/contact-validation";
const initial: ContactState = { success: false, message: "" };
export function ContactForm({
  enabled,
  subject,
  event,
}: {
  enabled: boolean;
  subject: string;
  event: string;
}) {
  const [state, action, pending] = useActionState(sendContact, initial);
  if (state.success)
    return (
      <div className="success-message" role="status">
        <h2>Merci pour votre message.</h2>
        <p>{state.message}</p>
        <Link className="text-link" href="/events">
          Retour aux aventures →
        </Link>
      </div>
    );
  return (
    <form action={action} className="form-stack">
      <fieldset disabled={!enabled || pending}>
        <legend className="sr-only">Votre message à Sakado</legend>
        <div className="form-row">
          <label>
            Nom <span aria-hidden="true">*</span>
            <input
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
              aria-describedby="error-name"
              aria-invalid={Boolean(state.errors?.name)}
            />
            <small id="error-name">
              {state.errors?.name
                ? "Indiquez votre nom (2 à 100 caractères)."
                : ""}
            </small>
          </label>
          <label>
            E-mail <span aria-hidden="true">*</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              aria-describedby="error-email"
              aria-invalid={Boolean(state.errors?.email)}
            />
            <small id="error-email">
              {state.errors?.email ? "Indiquez une adresse e-mail valide." : ""}
            </small>
          </label>
        </div>
        <label>
          Téléphone <span className="muted">(facultatif)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            aria-describedby="error-phone"
          />
          <small id="error-phone">
            {state.errors?.phone ? "Vérifiez le numéro de téléphone." : ""}
          </small>
        </label>
        <label>
          Sujet <span aria-hidden="true">*</span>
          <select name="subject" defaultValue={subject} required>
            {Object.entries(contactSubjects).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Message <span aria-hidden="true">*</span>
          <textarea
            name="message"
            rows={6}
            minLength={10}
            maxLength={5000}
            defaultValue={
              event
                ? `Bonjour Sakado, je souhaite en savoir plus sur « ${event} ».`
                : ""
            }
            required
            aria-describedby="error-message"
            aria-invalid={Boolean(state.errors?.message)}
          />
          <small id="error-message">
            {state.errors?.message
              ? "Votre message doit contenir entre 10 et 5 000 caractères."
              : ""}
          </small>
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Site internet
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="form-privacy">
          Les informations saisies servent à traiter votre demande.{" "}
          <Link href="/privacy">En savoir plus</Link>. Les champs marqués * sont
          obligatoires.
        </p>
        <button type="submit" className="button">
          {pending ? "Envoi en cours…" : "Envoyer mon message →"}
        </button>
      </fieldset>
      <p role="status" className={state.message ? "notice" : ""}>
        {state.message}
      </p>
    </form>
  );
}
