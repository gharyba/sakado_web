import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { presentationRequestAllowed } from "@/lib/official-presentation-policy";
export const metadata = {
  title: "Présentation privée locale",
  robots: { index: false, follow: false },
};
export default async function PresentationAccess() {
  if (!presentationRequestAllowed(await headers())) notFound();
  return (
    <main className="container page-section">
      <h1>Présentation privée du site officiel</h1>
      <p>
        PostgreSQL reste actif. Les images sont réservées à cette revue locale
        et ne sont pas autorisées à la publication.
      </p>
      <form method="post" action="/dev/presentation/session">
        <label htmlFor="presentation-code">Code de présentation local</label>
        <input
          id="presentation-code"
          name="code"
          type="password"
          autoComplete="off"
          required
          maxLength={100}
        />
        <button type="submit">Ouvrir le site officiel</button>
      </form>
      <p>
        Code valable cinq minutes après le démarrage. Session limitée à une
        heure.
      </p>
    </main>
  );
}
