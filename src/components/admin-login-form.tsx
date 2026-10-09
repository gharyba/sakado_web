"use client";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/admin/actions";
export function AdminLoginForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" });
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="form-stack">
      <label>
        Adresse e-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!enabled}
        />
      </label>
      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          disabled={!enabled}
        />
      </label>
      <p role="status">{state.error}</p>
      <button className="button" type="submit" disabled={!enabled || pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
