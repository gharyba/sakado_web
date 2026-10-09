import type { ScheduleItem } from "@/lib/types";
export function EventProgram({
  items,
  demo,
}: {
  items: ScheduleItem[];
  demo: boolean;
}) {
  if (!items.length) return <p>Le programme sera communiqué par Sakado.</p>;
  return (
    <div className="program">
      {demo && (
        <p className="notice">
          Structure de démonstration. Aucun horaire officiel annoncé.
        </p>
      )}
      {[...new Set(items.map((item) => item.day))]
        .sort((a, b) => a - b)
        .map((day) => (
          <div key={day}>
            <h3>Jour {day}</h3>
            <ol>
              {items
                .filter((item) => item.day === day)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <li key={item.id}>
                    <span>{item.time ?? "À confirmer"}</span>
                    <div>
                      <strong>{item.title}</strong>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        ))}
    </div>
  );
}
