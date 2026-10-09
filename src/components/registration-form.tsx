"use client";
import { useState } from "react";
export function RegistrationForm({
  eventId,
  waitlist,
}: {
  eventId: string;
  waitlist: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  if (reference)
    return (
      <div className="success-message" role="status">
        <h2>Demande enregistrée.</h2>
        <p>
          Votre référence : <strong>{reference}</strong>
        </p>
        <p>
          {waitlist
            ? "Votre demande est sur liste d’attente."
            : "Votre demande est en attente de confirmation par Sakado."}{" "}
          Aucun paiement n’a été effectué.
        </p>
      </div>
    );
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
          const response = await fetch("/api/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, eventId, idempotencyKey: key }),
          });
          const result = await response.json();
          if (!response.ok) throw Error(result.error);
          setReference(result.reference);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Impossible d’enregistrer la demande.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <div className="form-row">
          <label>
            Prénom
            <input
              name="firstName"
              autoComplete="given-name"
              minLength={2}
              maxLength={100}
              required
            />
          </label>
          <label>
            Nom
            <input
              name="lastName"
              autoComplete="family-name"
              minLength={2}
              maxLength={100}
              required
            />
          </label>
        </div>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <label>
          Téléphone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            minLength={8}
            maxLength={30}
            required
          />
        </label>
        <label>
          Nombre de participants
          <input
            type="number"
            name="participantCount"
            min={1}
            max={100}
            defaultValue={1}
            required
          />
        </label>
        <label>
          Un message pour Sakado (facultatif)
          <textarea name="notes" maxLength={2000} rows={3} />
        </label>
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
          {busy
            ? "Enregistrement…"
            : waitlist
              ? "Rejoindre la liste d’attente"
              : "Envoyer ma demande d’inscription"}
        </button>
        <p role="status">{error}</p>
      </fieldset>
    </form>
  );
}
