import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Confidentialité",
  "Informations sur le formulaire de contact et les données du site Sakado Sfax.",
  "/privacy",
);
export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <div className="container page-section prose">
      <p className="eyebrow">VOS INFORMATIONS</p>
      <h1>Confidentialité</h1>
      <p className="notice">
        Notice provisoire à faire valider par Sakado avant la publication
        officielle. Les coordonnées du responsable, l’hébergement et la durée de
        conservation restent à confirmer.
      </p>
      <h2>Formulaire de contact</h2>
      <p>
        Votre nom, votre e-mail, votre téléphone facultatif et votre message
        sont enregistrés pour permettre à l’équipe Sakado de répondre à votre
        demande. Aucun paiement n’est demandé sur ce site.
      </p>
      <h2>Demandes d’inscription</h2>
      <p>
        Votre prénom, votre nom, votre e-mail, votre téléphone, le nombre de
        participants et votre message facultatif servent à gérer votre demande.
        Seuls les membres autorisés de l’équipe peuvent consulter ces données.
        Une demande reste en attente jusqu’à sa confirmation par Sakado.
        Les informations de paiement affichées dans l’espace de gestion sont
        un suivi manuel ; aucun paiement en ligne n’est effectué.
      </p>
      <h2>Accès et conservation</h2>
      <p>
        Les messages sont accessibles aux administrateurs autorisés. La durée de
        conservation et la procédure de suppression doivent être définies avant
        le lancement public.
      </p>
      <h2>Cookies</h2>
      <p>
        La navigation publique n’utilise pas de cookies publicitaires. Un cookie
        de session strictement nécessaire, valable huit heures au maximum,
        protège l’espace administrateur.
      </p>
      <h2>Service externe</h2>
      <p>
        Les liens Instagram ouvrent un service externe qui applique ses propres
        règles de confidentialité. Aucun contenu Instagram n’est récupéré
        automatiquement.
      </p>
      <h2>Nous contacter</h2>
      <p>
        Pour toute question sur vos informations,{" "}
        <a
          href={settings.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          contactez Sakado via son compte Instagram officiel
        </a>
        .
      </p>
    </div>
  );
}
