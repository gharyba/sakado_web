"use client";
import { useId, useRef, useState } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const locked = useRef(false);
  const summary = useRef<HTMLDivElement>(null);
  const formId = useId();
  const router = useRouter();
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (locked.current) return;
        if (!navigator.onLine) {
          setMessage("Connexion Internet requise pour modifier les données.");
          requestAnimationFrame(() => summary.current?.focus());
          return;
        }
        const form = e.currentTarget;
        const data = new FormData(form);
        const destructive = Array.from(form.elements).some((field) => {
          if (field instanceof HTMLSelectElement) {
            const original =
              Array.from(field.options).find((o) => o.defaultSelected)?.value ??
              "";
            return (
              field.value !== original &&
              ((field.name === "status" &&
                ["CANCELLED", "ARCHIVED"].includes(field.value)) ||
                (["eventId", "destinationId"].includes(field.name) &&
                  !!original &&
                  !field.value))
            );
          }
          return (
            field instanceof HTMLInputElement &&
            field.name === "active" &&
            field.defaultChecked &&
            !field.checked
          );
        });
        if (
          destructive &&
          !window.confirm(
            "Confirmer cette annulation, cet archivage, cette désactivation ou ce retrait de relation ?",
          )
        )
          return;
        locked.current = true;
        setBusy(true);
        setMessage("");
        setErrors({});
        for (const field of Array.from(form.elements))
          if (
            field instanceof HTMLElement &&
            field.getAttribute("aria-describedby")?.startsWith(formId)
          ) {
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
          }
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
          if (!response.ok) {
            const fields: Record<string, string> = {};
            for (const name of Object.keys(result.fields ?? {})) {
              const field = form.elements.namedItem(name);
              if (
                field instanceof HTMLElement &&
                !(field instanceof HTMLInputElement && field.type === "hidden")
              ) {
                field.id ||= formId + "-" + name;
                field.setAttribute("aria-invalid", "true");
                field.setAttribute(
                  "aria-describedby",
                  formId + "-error-" + name,
                );
                const label =
                  field.getAttribute("aria-label") ||
                  (
                    field as HTMLInputElement
                  ).labels?.[0]?.textContent?.trim() ||
                  "Champ du formulaire";
                fields[name] = label + " : Vérifiez ce champ.";
              }
            }
            setErrors(fields);
            setMessage(
              typeof result.error === "string"
                ? result.error
                : "Impossible d’enregistrer.",
            );
            requestAnimationFrame(() => summary.current?.focus());
            return;
          }
          for (const field of Array.from(form.elements))
            if (field instanceof HTMLElement) {
              field.removeAttribute("aria-invalid");
              if (field.getAttribute("aria-describedby")?.startsWith(formId))
                field.removeAttribute("aria-describedby");
            }
          setMessage(result.message ?? "Enregistré.");
          if (result.redirect) router.push(result.redirect);
          router.refresh();
        } catch {
          setMessage(
            "Connexion interrompue ou service indisponible. Vérifiez les données enregistrées avant de réessayer.",
          );
          requestAnimationFrame(() => summary.current?.focus());
        } finally {
          locked.current = false;
          setBusy(false);
        }
      }}
    >
      <div
        ref={summary}
        tabIndex={-1}
        role="status"
        aria-label="Résultat de l’enregistrement"
      >
        {message && <p>{message}</p>}
        {Object.keys(errors).length > 0 && (
          <ul>
            {Object.entries(errors).map(([name, error]) => (
              <li key={name} id={formId + "-error-" + name}>
                <a
                  href={"#" + formId + "-" + name}
                  onClick={(e) => {
                    e.preventDefault();
                    const field = e.currentTarget
                      .closest("form")
                      ?.elements.namedItem(name);
                    if (field instanceof HTMLElement) field.focus();
                  }}
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <fieldset disabled={busy}>
        {children}
        <div className="admin-save">
          <button className="button" type="submit">
            {busy ? "Enregistrement…" : submit}
          </button>
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
  const locked = useRef(false);
  const router = useRouter();
  return (
    <span className="admin-action">
      <button
        type="button"
        className="admin-button-secondary"
        disabled={busy}
        onClick={async () => {
          if (locked.current) return;
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          locked.current = true;
          setBusy(true);
          setError("");
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
              setError(
                typeof data.error === "string"
                  ? data.error
                  : "Impossible d’enregistrer.",
              );
              return;
            }
            if (data.redirect) router.push(data.redirect);
            router.refresh();
            setError(data.message ?? "Modification enregistrée.");
          } catch {
            setError(
              "Impossible d’enregistrer. Vérifiez l’état actuel avant de réessayer.",
            );
          } finally {
            locked.current = false;
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
