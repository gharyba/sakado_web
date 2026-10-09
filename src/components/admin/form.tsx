"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AdminForm({
  endpoint,
  children,
  submit = "Enregistrer",
  multipart = false,
}: {
  endpoint: string;
  children: React.ReactNode;
  submit?: string;
  multipart?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!navigator.onLine) {
          setMessage("Connexion Internet requise pour modifier les données.");
          return;
        }
        const form = e.currentTarget;
        const data = new FormData(form);
        setBusy(true);
        setMessage("");
        try {
          const payload: Record<string, unknown> = Object.fromEntries(data);
          for (const field of Array.from(form.elements))
            if (field instanceof HTMLInputElement && field.type === "checkbox")
              payload[field.name] = field.checked;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: multipart ? {} : { "Content-Type": "application/json" },
            body: multipart ? data : JSON.stringify(payload),
          });
          const result = await response.json();
          if (!response.ok)
            throw Error(result.error ?? "Impossible d’enregistrer.");
          setMessage(result.message ?? "Enregistré.");
          if (result.redirect) router.push(result.redirect);
          router.refresh();
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Impossible d’enregistrer.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        {children}
        <div className="admin-save">
          <button className="button" type="submit">
            {busy ? "Enregistrement…" : submit}
          </button>
          <p role="status">{message}</p>
        </div>
      </fieldset>
    </form>
  );
}
export function ActionButton({
  endpoint,
  payload,
  label,
  confirmMessage,
}: {
  endpoint: string;
  payload: Record<string, unknown>;
  label: string;
  confirmMessage?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <span className="admin-action">
      <button
        type="button"
        className="admin-button-secondary"
        disabled={busy}
        onClick={async () => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          setBusy(true);
          setError("");
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw Error(data.error);
            if (data.redirect) router.push(data.redirect);
            router.refresh();
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Impossible d’enregistrer.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Patientez…" : label}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
