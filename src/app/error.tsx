"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page-section">
      <h1>Une petite pause sur le chemin.</h1>
      <p>
        Le contenu n’a pas pu être chargé. Réessayez dans quelques instants.
      </p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </div>
  );
}
