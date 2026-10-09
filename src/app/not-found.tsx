import Link from "@/components/link";
export default function NotFound() {
  return (
    <div className="container page-section">
      <p className="eyebrow">HORS SENTIER · 404</p>
      <h1>Cette page reste à explorer.</h1>
      <p>La page demandée est introuvable ou n’est pas encore publiée.</p>
      <Link href="/" className="button">
        Revenir à l’accueil →
      </Link>
    </div>
  );
}
