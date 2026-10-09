export default function Forbidden() {
  return (
    <main className="container page-section">
      <h1>Accès non autorisé</h1>
      <p>Votre rôle ne permet pas d’accéder à cette fonction.</p>
      <a href="/admin" className="button">
        Retour au tableau de bord
      </a>
    </main>
  );
}
