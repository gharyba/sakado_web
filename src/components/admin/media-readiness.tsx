import React from "react";
import {
  approvalAxes,
  eligibleForPublication,
  type MediaRegistry,
} from "@/lib/media-readiness-policy";

const labels: Record<(typeof approvalAxes)[number], string> = {
  visualApproval: "Sélection visuelle",
  copyrightPermission: "Droits d’auteur",
  participantConsent: "Participants / consentement",
  minorConsentReview: "Revue des mineurs",
  publicWebsitePublicationApproval: "Autorisation de publication",
};
/** Safe metadata only. No original paths, evidence contents or photo previews. */
export function MediaReadinessView({ registry }: { registry: MediaRegistry }) {
  const eligible = registry.assets.filter((a) =>
    eligibleForPublication(a, registry.globalCleared),
  ).length;
  return (
    <div className="s-readiness-view">
      <section className="admin-panel">
        <h2>MEDIA-04 · Revue humaine requise</h2>
        {!registry.valid ? (
          <p role="alert">
            Registre indisponible ou incohérent. Publication bloquée par
            sécurité.
          </p>
        ) : (
          <p>
            {registry.assets.length} fichiers suivis · {eligible} éligible(s) ·{" "}
            {registry.assets.length - eligible} BLOCKED.
          </p>
        )}
        <p>
          Cette vue est en lecture seule. Une case « autorisé » dans la galerie
          ne remplace pas les justificatifs. Les aperçus sont retenus jusqu’à
          confirmation de leur usage pour la revue.
        </p>
        <p>
          Les exigences d’hébergement et de confidentialité restent{" "}
          {registry.globalCleared
            ? "validées dans le registre"
            : "PENDING REVIEW"}
          . L’éligibilité ne publie jamais une photo automatiquement.
        </p>
      </section>
      <div className="s-readiness-grid">
        {registry.assets.map((a) => (
          <article className="admin-panel" key={a.id}>
            <h2>{a.id}</h2>
            <p className="s-readiness-filename">{a.originalFilename}</p>
            <p className="s-readiness-badge">
              {eligibleForPublication(a, registry.globalCleared)
                ? "ÉLIGIBLE · publication CMS séparée requise"
                : "BLOCKED"}
            </p>
            <dl className="s-readiness-fields">
              <dt>Titulaire des droits</dt>
              <dd>{a.photographerRightsHolder}</dd>
              {approvalAxes.map((axis) => (
                <div key={axis}>
                  <dt>{labels[axis]}</dt>
                  <dd>{a.approvals[axis]}</dd>
                </div>
              ))}
              <dt>Participants</dt>
              <dd>{a.participantClassification}</dd>
              <dt>Priorité de revue des âges / mineurs</dt>
              <dd>{a.minorReviewPriority}</dd>
              <dt>Preuve vérifiée indépendamment</dt>
              <dd>
                {a.independentlyVerifiedAuthorizationEvidence
                  ? "Déclarée vérifiée dans le registre"
                  : "Aucune"}
              </dd>
              <dt>Usage, crédits et transformations</dt>
              <dd>
                {a.websiteUseVerified &&
                a.creditConditionsVerified &&
                a.cropAndOptimizationVerified
                  ? "Vérifiés dans le registre"
                  : "À vérifier"}
              </dd>
            </dl>
            <h3>Points restant à résoudre</h3>
            <ul>
              {a.unresolvedIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
