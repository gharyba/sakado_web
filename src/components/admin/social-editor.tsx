"use client";
import { useState } from "react";
type Social = { label: string; url: string; enabled: boolean };
export function SocialEditor({ initial }: { initial: Social[] }) {
  const [items, setItems] = useState(initial);
  return (
    <section className="admin-panel">
      <h2>Liens sociaux</h2>
      <input type="hidden" name="socialLinks" value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div className="admin-fields" key={i}>
          <label className="admin-field">
            Nom
            <input
              value={item.label}
              onChange={(e) =>
                setItems(
                  items.map((v, n) =>
                    n === i ? { ...v, label: e.target.value } : v,
                  ),
                )
              }
              required
            />
          </label>
          <label className="admin-field">
            Lien HTTPS
            <input
              value={item.url}
              type="url"
              onChange={(e) =>
                setItems(
                  items.map((v, n) =>
                    n === i ? { ...v, url: e.target.value } : v,
                  ),
                )
              }
              required
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) =>
                setItems(
                  items.map((v, n) =>
                    n === i ? { ...v, enabled: e.target.checked } : v,
                  ),
                )
              }
            />
            Afficher
          </label>
          <button
            type="button"
            className="admin-button-secondary"
            onClick={() => setItems(items.filter((_, n) => n !== i))}
          >
            Retirer
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-button-secondary"
        onClick={() =>
          setItems([...items, { label: "", url: "", enabled: true }])
        }
      >
        + Ajouter un lien
      </button>
    </section>
  );
}
