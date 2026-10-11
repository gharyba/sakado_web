"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  bookingInput,
  registrationErrors,
  registrationFields,
  type RegistrationErrors,
  type RegistrationField,
} from "@/lib/registration-validation";
import { priceLabel } from "@/lib/format";
import { bookingLabels } from "@/lib/event-policy";

type Draft = ReturnType<typeof bookingInput.parse>;
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export function RegistrationForm({
  eventId,
  waitlist,
  price,
  currency,
  availablePlaces,
}: {
  eventId: string;
  waitlist: boolean;
  price: number;
  currency: string;
  availablePlaces: number | null;
}) {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [review, setReview] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    status: keyof typeof bookingLabels;
  } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const key = useRef<string | null>(null);
  const submitting = useRef(false);
  const max =
    !waitlist && availablePlaces !== null
      ? Math.min(100, availablePlaces)
      : 100;
  useEffect(() => {
    if (error || Object.keys(errors).length) summary.current?.focus();
    else if (review || confirmation) heading.current?.focus();
  }, [error, errors, review, confirmation]);
  function fieldProps(name: RegistrationField) {
    return {
      id: `registration-${name}`,
      name,
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name]
        ? `registration-${name}-error`
        : undefined,
    };
  }
  function fieldError(name: RegistrationField) {
    return errors[name] ? (
      <span className="s-field-error" id={`registration-${name}-error`}>
        {errors[name]}
      </span>
    ) : null;
  }
  if (confirmation)
    return (
      <div className="success-message" role="status">
        <h3 ref={heading} tabIndex={-1}>
          Votre demande a bien été enregistrée.
        </h3>
        <p>
          Votre référence : <strong>{confirmation.reference}</strong>
        </p>
        <p>État : {bookingLabels[confirmation.status]}.</p>
        <p>
          {confirmation.status === "PENDING"
            ? "Votre demande est en attente de confirmation par Sakado."
            : confirmation.status === "WAITLIST"
              ? "Votre demande est sur liste d’attente. Aucune place n’est garantie."
              : "Cette référence correspond à votre demande déjà enregistrée."}{" "}
          Aucun paiement n’a été effectué par ce formulaire.
        </p>
      </div>
    );
  return (
    <form
      ref={form}
      className="form-stack s-registration"
      method="post"
      action="/api/registrations"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (submitting.current) return;
        setError("");
        setErrors({});
        if (!review) {
          key.current ??= crypto.randomUUID();
          const data = Object.fromEntries(new FormData(event.currentTarget));
          const parsed = bookingInput.safeParse({
            ...data,
            eventId,
            idempotencyKey: key.current,
          });
          if (!parsed.success) {
            setErrors(registrationErrors(parsed.error.issues));
            return;
          }
          if (parsed.data.participantCount > max) {
            setErrors({
              participantCount: `Choisissez au maximum ${max} participants. Les places sont revérifiées à l’envoi.`,
            });
            return;
          }
          setDraft(parsed.data);
          setReview(true);
          return;
        }
        if (!draft) return;
        submitting.current = true;
        setBusy(true);
        try {
          const response = await fetch("/api/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...draft,
              website: new FormData(event.currentTarget).get("website"),
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            const safeFields: RegistrationErrors = {};
            for (const name of Object.keys(
              result.fields ?? {},
            ) as RegistrationField[])
              if (
                typeof result.fields[name] === "string" &&
                Object.hasOwn(registrationFields, name)
              )
                safeFields[name] = registrationFields[name];
            setErrors(safeFields);
            setError(
              response.status === 400
                ? "Vérifiez les champs indiqués."
                : response.status === 409
                  ? "Les conditions d’inscription ont changé ou les places ne sont plus disponibles. Consultez les informations actualisées de la sortie avant de réessayer."
                  : response.status === 429
                    ? "Trop de demandes. Réessayez plus tard."
                    : "Impossible d’enregistrer votre demande. Réessayez ou contactez Sakado.",
            );
            if (Object.keys(safeFields).length) setReview(false);
            return;
          }
          if (
            typeof result.reference !== "string" ||
            !Object.hasOwn(bookingLabels, result.status)
          )
            throw Error("Invalid response");
          setConfirmation({
            reference: result.reference,
            status: result.status,
          });
        } catch {
          setError(
            "Impossible de vérifier l’enregistrement. Réessayez sans recharger cette page : la même référence de demande évite un doublon.",
          );
        } finally {
          submitting.current = false;
          setBusy(false);
        }
      }}
    >
      {(error || Object.keys(errors).length > 0) && (
        <div
          ref={summary}
          tabIndex={-1}
          className="s-form-errors"
          role="alert"
          aria-label="Erreurs de la demande d’inscription"
        >
          <p>{error || "Vérifiez les champs indiqués avant de continuer."}</p>
          <ul>
            {Object.entries(errors).map(([name, message]) => (
              <li key={name}>
                <a href={`#registration-${name}`}>{message}</a>
              </li>
            ))}
          </ul>
          {error && !error.startsWith("Impossible de vérifier") && (
            <a
              href=""
              onClick={(event) => {
                event.preventDefault();
                window.location.reload();
              }}
            >
              Actualiser les informations de la sortie
            </a>
          )}
        </div>
      )}
      <fieldset disabled={busy || !ready} hidden={review}>
        <legend className="s-visually-hidden">Vos coordonnées</legend>
        <div className="form-row">
          <div className="s-registration-field">
            <label htmlFor="registration-firstName">
              Prénom
              <input
                {...fieldProps("firstName")}
                autoComplete="given-name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            {fieldError("firstName")}
          </div>
          <div className="s-registration-field">
            <label htmlFor="registration-lastName">
              Nom
              <input
                {...fieldProps("lastName")}
                autoComplete="family-name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            {fieldError("lastName")}
          </div>
        </div>
        <div className="s-registration-field">
          <label htmlFor="registration-email">
            E-mail
            <input
              {...fieldProps("email")}
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          {fieldError("email")}
        </div>
        <div className="s-registration-field">
          <label htmlFor="registration-phone">
            Téléphone
            <input
              {...fieldProps("phone")}
              type="tel"
              autoComplete="tel"
              minLength={8}
              maxLength={30}
              required
            />
          </label>
          {fieldError("phone")}
        </div>
        <div className="s-registration-field">
          <label htmlFor="registration-participantCount">
            Nombre de participants
            <input
              {...fieldProps("participantCount")}
              type="number"
              min={1}
              max={max}
              defaultValue={1}
              required
            />
          </label>
          {fieldError("participantCount")}
        </div>
        <p className="form-privacy">
          Les places sont vérifiées à nouveau lors de l’envoi.
        </p>
        <div className="s-registration-field">
          <label htmlFor="registration-notes">
            Un message pour Sakado (facultatif)
            <textarea {...fieldProps("notes")} maxLength={2000} rows={3} />
          </label>
          {fieldError("notes")}
        </div>
        <div className="honeypot" aria-hidden="true">
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-label="Site internet"
          />
        </div>
        <p className="form-privacy">
          Vos coordonnées sont transmises à l’équipe Sakado pour gérer cette
          demande. <a href="/privacy">Confidentialité</a>.
        </p>
        <button className="button" type="submit">
          Vérifier ma demande
        </button>
      </fieldset>
      {review && draft && (
        <div className="s-registration-review" aria-busy={busy}>
          <h3 ref={heading} tabIndex={-1}>
            Vérifier ma demande
          </h3>
          <dl>
            {[
              ["Nom", `${draft.firstName} ${draft.lastName}`],
              ["E-mail", draft.email],
              ["Téléphone", draft.phone],
              ["Participants", String(draft.participantCount)],
              ["Tarif par personne", priceLabel(price, currency)],
              [
                "Total indicatif",
                priceLabel(
                  Number((price * draft.participantCount).toFixed(3)),
                  currency,
                ),
              ],
              ...(draft.notes ? [["Message", draft.notes]] : []),
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="preserve-lines">{value}</dd>
              </div>
            ))}
          </dl>
          <p>
            {waitlist
              ? "Demande sur liste d’attente, sans garantie de place."
              : "Demande soumise à la confirmation de Sakado."}{" "}
            Aucun paiement en ligne.
          </p>
          <div className="s-registration-actions">
            <button
              type="button"
              className="button button-outline"
              disabled={busy}
              onClick={() => {
                setReview(false);
                requestAnimationFrame(() =>
                  form.current
                    ?.querySelector<HTMLInputElement>("[name=firstName]")
                    ?.focus(),
                );
              }}
            >
              Modifier
            </button>
            <button className="button" type="submit" disabled={busy}>
              {busy
                ? "Enregistrement…"
                : waitlist
                  ? "Envoyer ma demande sur liste d’attente"
                  : "Envoyer ma demande d’inscription"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
