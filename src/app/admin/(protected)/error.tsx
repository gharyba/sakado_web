"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="admin-panel">
      <h2>Impossible de charger ces informations.</h2>
      <p>Réessayez dans quelques instants.</p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </div>
  );
}
