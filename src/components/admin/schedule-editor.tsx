"use client";
import { useState } from "react";
type Item = {
  day: number;
  time: string | null;
  title: string;
  description: string | null;
};
export function ScheduleEditor({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  function change(index: number, field: string, value: string) {
    setItems(
      items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "day" ? Number(value) : value }
          : item,
      ),
    );
  }
  return (
    <section className="admin-panel">
      <h2>Programme</h2>
      <p>
        Ajoutez les étapes dans leur ordre de déroulement. Les heures sont
        celles de Tunisie.
      </p>
      <input type="hidden" name="schedule" value={JSON.stringify(items)} />
      {items.map((item, index) => (
        <div className="schedule-editor-row" key={index}>
          <label>
            Jour
            <input
              type="number"
              min="1"
              max="90"
              value={item.day}
              onChange={(e) => change(index, "day", e.target.value)}
            />
          </label>
          <label>
            Heure
            <input
              type="time"
              value={item.time ?? ""}
              onChange={(e) => change(index, "time", e.target.value)}
            />
          </label>
          <label>
            Étape
            <input
              value={item.title}
              required
              maxLength={200}
              onChange={(e) => change(index, "title", e.target.value)}
            />
          </label>
          <label>
            Description
            <input
              value={item.description ?? ""}
              maxLength={2000}
              onChange={(e) => change(index, "description", e.target.value)}
            />
          </label>
          <div className="admin-actions">
            <button
              type="button"
              aria-label={"Monter l’étape " + (index + 1)}
              disabled={index === 0}
              onClick={() => {
                const copy = [...items];
                [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                setItems(copy);
              }}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={"Descendre l’étape " + (index + 1)}
              disabled={index === items.length - 1}
              onClick={() => {
                const copy = [...items];
                [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
                setItems(copy);
              }}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, i) => i !== index))}
            >
              Retirer
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-button-secondary"
        onClick={() =>
          setItems([
            ...items,
            { day: 1, time: null, title: "", description: null },
          ])
        }
      >
        + Ajouter une étape
      </button>
    </section>
  );
}
