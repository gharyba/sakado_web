# Cinematic Redesign 07 — The Final Journey

## État initial et préservation

Le 24 octobre 2026, le dépôt était sur `feat/cinematic-redesign-06`, HEAD `809fa76`, avec les Redesigns 05 et 06 toujours non commités. Les modifications supplémentaires du lanceur PostgreSQL étaient également présentes. Les rapports 05/06 et l’architecture Contact, CTA, footer, médias et motion ont été relus. La validation visuelle de la galerie 06 est confirmée par le brief utilisateur ; elle ne vaut pas autorisation de publication photographique.

Avant modification, les 24 fichiers modifiés/non suivis ont été copiés dans `.local/redesign07-recovery/20261024-pre07/`, ignoré par Git. Le manifeste SHA-256, le patch et le statut Git y sont conservés. Chaque copie a été vérifiée, puis les 24 fichiers ont été revérifiés après création de `feat/cinematic-redesign-07`. Parmi eux, 22 restent strictement identiques. Les deux fichiers partagés modifiés pour cette phase sont la homepage (prop photographique du CTA) et le runtime (branchement de la nouvelle recette).

Les fichiers propres à Floating Memories — composant, CSS, géométrie, intégration galerie, tests et lanceur — restent identiques à la sauvegarde. Aucun changement de géométrie, perspective, rotation, sélection ou chorégraphie de la galerie. Les sources du Hero, Company Story, Experiences et Team sont conservées. Le lanceur PostgreSQL de l’utilisateur reste identique.

Aucun staging Git, commit, push, merge ou déploiement. Aucun changement de dépendance, schéma, permissions média, coordonnées réelles ou données métier. Next.js 16.4.1, GSAP 3.15.0 et Zod verrouillé en 4.6.6 sont conservés.

## Architecture précédente

`/contact` utilisait `getSettings()`, `ContactForm` et la Server Action `sendContact`. Les cinq champs métier sont nom, e-mail, téléphone facultatif, sujet et message ; le champ piège `website` complète la protection. Les paramètres `subject`/`event`, les textes de confidentialité et l’avertissement de non-réservation existaient déjà.

Le CTA consommait les textes éditables `contactCtaTitle`/`contactCtaText` et proposait WhatsApp ou Contact. Le footer utilisait `Brand`, les liens réels, les réseaux du CMS, `footerText` et `/privacy`. La présentation officielle possède son fournisseur média avec session temporaire et vérification des hashes. Le runtime GSAP possède déjà les contextes, matchMedia, préférences et restaurations de styles.

## Composition réalisée

### Contact

- Grand titre confirmé : « L’aventure commence par un bonjour. » Le sous-titre existant est conservé.
- Composition éditoriale avec photographie autorisée en présentation privée, cadrage stable, vignettage et lien direct vers le formulaire.
- En public, seul un `heroImage` explicitement sélectionné dans les réglages et admis par le contrôle média public peut fournir une image. Sans image admissible, composition forestière abstraite, sans fausse photographie ni URL privée.
- Le fournisseur privé existant fournit la première photo de sa sélection vérifiée, avec son alternative existante. Aucun nouvel asset ou circuit de livraison n’est ajouté.
- Formulaire lisible, champs de 52 px minimum, bordures contrastées, focus visible, erreurs associées et confirmation existante.
- Coordonnées issues des réglages, sans valeur inventée. Le téléphone devient un lien `tel:` seulement après normalisation et contrôle de sa forme ; sinon sa valeur reste du texte. Instagram, WhatsApp et e-mail conservent leurs destinations.

La page Contact porte un canvas forestier continu jusqu’au footer. Les tokens sont réutilisés puis spécialisés uniquement sur cette route. Aucun panneau ivoire, fond violet ou bande noire isolée n’est ajouté. Le fond général des autres pages reste celui du site existant ; le footer y introduit progressivement une atmosphère forestière sans repeindre les sections validées.

### CTA et footer

Le CTA conserve les textes du CMS, son image facultative autorisée et un bouton principal vers `/contact`. WhatsApp reste disponible en lien secondaire lorsqu’il est configuré. Il forme une conclusion calme, sans nouveau carrousel.

Le footer conserve `Brand` et son logo/wordmark selon les règles existantes. `footerText` devient une grande phrase éditoriale ; les colonnes regroupent tous les liens existants. Copyright, confidentialité, réseaux supplémentaires du CMS et texte final restent présents. Les liens ne sont pas transformés. Un MotionToggle global, dont le nom accessible est distinct des contrôles déjà présents, permet de réduire les mouvements depuis chaque footer.

La marge basse du bandeau de revue privée a été annulée : elle s’effondrait hors du conteneur et exposait une bande ivoire sous le footer. Le bandeau et ses informations restent visibles.

## Chorégraphie et cycle de vie

La recette `cinematicFinalJourney` est activée uniquement par `data-final-journey`. Elle s’exécute dans le contexte et le matchMedia existants ; aucun autre moteur n’est installé.

| Cible                 | Comportement                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mots du titre         | Masque typographique, déplacement vertical borné et opacité ; durée 0,65 s desktop, 0,28 s mobile ; décalage total limité à 0,21 s                               |
| Copie d’introduction  | Léger déplacement réversible au scroll : 8 px desktop, 3 px tablette ; pas de déplacement mobile                                                                 |
| Cadre image           | Masque de 7 % desktop / 4 % tablette ; entrée en opacité seule sur mobile                                                                                        |
| Caméra photographique | Scale 1,035 → 1 et ±1 % vertical desktop ; 1,018 et ±0,4 % tablette ; aucune caméra au scroll sur mobile                                                         |
| Formulaire            | Les champs, valeurs, focus et boutons ne sont jamais transformés ni révélés par une animation ; seuls le titre et la copie non interactive accompagnent l’entrée |
| Footer                | Accent d’opacité discret sur la phrase éditoriale ; liens et coordonnées stables                                                                                 |

Le scroll est natif. Aucun pinning, interception de molette, boucle permanente personnalisée, `will-change` permanent ou état React par frame. Les styles des cibles sont mémorisés puis restaurés lors du changement de préférence, de breakpoint ou de route. Reduced motion, MotionToggle et économie de données utilisent le comportement statique existant. Sans JavaScript, tout le texte et le formulaire restent rendus côté serveur.

## Responsive et accessibilité

Les compositions ont été contrôlées à 1440, 1024, 768 et 375 px, avec une hauteur courte à 1024 et du texte agrandi à 200 %. Sur mobile : photo plus basse, colonnes empilées, champs confortables et bouton d’envoi pleine largeur. Les mots longs peuvent revenir à la ligne ; le footer conserve des liens d’au moins 44 px.

Le contrôle à 200 % a révélé un débordement de la grille du header existant. Une container query réutilise son menu mobile lorsque la largeur disponible ne suffit plus au texte agrandi. Il n’y a ni nouveau menu, ni nouveau listener, ni modification des destinations ou du rendu desktop à taille normale. Le test Contact vérifie l’ouverture du menu, Escape et le retour du focus à 200 %.

Les labels existants sont conservés. `aria-invalid` et les erreurs associées couvrent aussi téléphone/sujet. Le formulaire expose son état occupé ; les erreurs sont annoncées dans son propre élément d’alerte. La vérification axe sur Contact/footer ne relève aucune violation dans les règles WCAG 2 A/AA et 2.1 AA testées. Cette vérification automatisée ne remplace pas la revue humaine.

## Formulaire, sécurité et données

La Server Action, le schéma Zod, les accès Prisma et la logique de rate limit n’ont pas été modifiés. Le formulaire utilise toujours la même action et les mêmes champs. Un verrou de soumission côté client complète le fieldset désactivé pendant l’attente pour empêcher les doubles clics dans la page. Le succès apparaît après la réponse de l’action, laquelle attend `contactMessage.create`.

Protections effectivement inspectées :

- Refus en mode démonstration et lorsque la base n’est pas configurée.
- Champ piège `website`.
- Bornes et formats Zod des cinq champs.
- Limite globale de 100 messages/heure et limite par e-mail de 3 messages/10 minutes, avec identités HMAC en base.
- Comparaison Origin/Host de Next pour les requêtes Server Action avec Origin. Aucun jeton CSRF spécifique ni CAPTCHA n’est supposé ou ajouté.
- Erreur d’enregistrement capturée avec log opérationnel sans corps, identité ou texte du message.

Le backend inspecté enregistre les demandes dans le CMS ; aucun envoi SMTP ou destinataire externe n’a été utilisé pendant les tests. La confirmation testée prouve l’enregistrement, pas une livraison e-mail.

Tous les essais d’envoi passent par `scripts/test-redesign07.mjs`. Il refuse un port occupé, crée un nouveau cluster ignoré sur loopback 55447, génère sa propre URL et vérifie le nom de base, l’utilisateur et le répertoire réel avant migration. Le helper des tests revérifie cette identité avant chaque opération SQL. Les migrations existantes sont appliquées uniquement à ce cluster jetable. Les coordonnées et messages de fixture sont explicitement synthétiques ; ils ne sont jamais écrits dans le CMS réel ou les valeurs confirmées du projet.

Les traces et captures automatiques des tests de soumission sont désactivées. La revue de la vraie présentation privée bloque toute requête POST vers `/contact` ; zéro POST Contact réel a été transmis.

Les sessions temporaires, contrôles de hashes, allowlists, production-denial, règles d’optimizer et uploads restent inchangés. Aucune photographie privée dans `/public`, les métadonnées publiques ou les fichiers déployés. Les 17 assets bloqués et les 85 axes de revue en attente ne sont pas modifiés.

## Validation exécutée

| Vérification                         | Résultat                                                                                                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                           | Réussi                                                                                                                                                                                          |
| ESLint                               | Réussi                                                                                                                                                                                          |
| Tests unitaires                      | 84/84 réussis                                                                                                                                                                                   |
| Build de production                  | Réussi ; gate 17 assets et exclusion privée sur 53 traces de déploiement réussies                                                                                                               |
| Audit de production                  | Zéro vulnérabilité avec `npm audit --omit=dev --audit-level=high`                                                                                                                               |
| Secret guard / diff                  | Réussis                                                                                                                                                                                         |
| `node scripts/test-redesign07.mjs`   | 13/13 réussis sur base jetable vérifiée                                                                                                                                                         |
| `node scripts/test-redesign06.mjs`   | 10/10 réussis, galerie validée conservée                                                                                                                                                        |
| `npm run test:hero`                  | 9/9 réussis                                                                                                                                                                                     |
| `npm run test:phase04`               | 9/9 réussis, y compris la readiness des images lazy, sans modification de ses assertions                                                                                                        |
| Configuration Redesign 04            | 8/8 réussis                                                                                                                                                                                     |
| `npm run test:presentation:security` | 6/6 réussis                                                                                                                                                                                     |
| `npm run test:navigation`            | **9/10 : échec conservé**, voir ci-dessous                                                                                                                                                      |
| Revue privée en lecture seule        | Image Contact et image CTA décodées ; caméra réversible ; nettoyage statique ; quatre largeurs sans overflow ; équipe 2, histoire 3 chapitres, aperçu galerie 6 photos ; zéro POST Contact réel |

Les 13 contrôles spécifiques couvrent formulaire vide/invalide, rejet serveur, attente réseau, double clic, succès enregistré, panne d’écriture suivie d’un nouvel essai, honeypot, limite par e-mail, origine étrangère, envoi natif sans JavaScript, liens de coordonnées, responsive/zoom, clavier, préférences, scroll inverse, textes CMS, accessibilité et protections média/admin. Les premières erreurs de sélecteur liées à l’annonceur de route Next ont été corrigées en ciblant l’alerte du formulaire. Le test d’origine utilise une requête HTTP directe pour maîtriser réellement cet en-tête.

### Échecs et limites conservés

Le test navigation `hero boundary changes…` attend `rgb(245, 244, 240)` pour le fond du header après le Hero ; le résultat est `rgb(12, 23, 43)`. Le fichier `forest-environment.css` dans HEAD avant cette phase définissait déjà `--s-color-canvas: #0c172b`. L’assertion s’arrête sur cette attente de l’ancienne palette. Le test n’a pas été affaibli ou modifié pour obtenir du vert. Les neuf autres tests de cette suite passent. Son échec a été reproduit et sa trace conservée dans `.local/redesign07/navigation-evidence/`.

Le dernier résultat complet de la présentation privée reste historiquement **18/20**, avec deux erreurs de navigation `chrome-error://chromewebdata/` après connexion. Cette suite complète n’a pas été relancée contre la base métier existante ; le succès d’une revue privée limitée ne résout pas ces intermittences. Les règles précédentes de tests DB isolés sont conservées. Une trace locale serait retenue en cas d’échec de la revue privée de cette phase ; aucune réussite globale de cette ancienne suite n’est revendiquée.

Deux blocages de build locaux ont été rencontrés puis résolus : verrou Windows du moteur Prisma par le serveur de présentation encore ouvert ; puis fichier généré `.next/dev/types/routes.d.ts` de zéro octet après interruption d’une régénération. Le serveur concerné a été arrêté sans arrêter PostgreSQL ; les types interrompus ont été conservés dans `.local/redesign07/generated-dev-types-recovery/` puis régénérés. Le build final et le typecheck passent. Aucun code métier n’a été remplacé pour contourner ces erreurs.

Les résultats navigateur sont ceux de Chrome local sous Windows. Safari, appareils physiques et Linux CI ne sont pas certifiés par cette phase. Les photos restent non publiables tant que les droits ne sont pas approuvés séparément.

## Captures et observations de performance

Les preuves sont ignorées par Git :

- `.local/redesign07/screenshots/contact-test-*.png` et `footer-test-*.png` : environnement isolé avec coordonnées de test explicites, pas les coordonnées SAKADO réelles.
- `private-contact-*.png` : présentation protégée à 1440/1024/768/375 px.
- `private-closing-*.png` et `private-footer-*.png` : homepage/fin de parcours à 1440/375 px.
- `.local/redesign07/private-review.json` : observations agrégées, sans corps de message ou code d’accès.
- `.local/redesign07/navigation-evidence/…/trace.zip` : échec navigation conservé.

Les captures photographiques restent strictement locales. Une seule photographie est utilisée par scène ; aucun original pleine résolution, couche photographique dupliquée ou nouveau moteur de rendu. Le sample de 120 intervalles sur Contact privé réchauffé a observé une médiane de 8,3 ms, p95 8,5 ms et zéro intervalle au-dessus de 50 ms lors d’un scroll synthétique aller/retour. Ce n’est pas une garantie de FPS, de réseau froid ou de performance sur téléphone réel.

## Fichiers de cette phase

- `src/app/(public)/contact/page.tsx` — composition et coordonnées existantes.
- `src/app/(public)/page.tsx` — image autorisée passée au CTA, sans modification des autres sections.
- `src/app/(public)/layout.tsx` — marge finale du bandeau de revue privée.
- `src/components/company/final-journey.tsx` et `final-journey.module.css` — intro, mots masqués, image/atmosphère et mise en page.
- `src/components/contact-form.tsx` et `contact-form.module.css` — présentation, erreurs accessibles, attente et verrou de double clic.
- `src/components/contact-cta.tsx` — CTA partagé et destinations conservées.
- `src/components/site-footer.tsx` et `site-footer.module.css` — footer éditorial, liens et branding existants.
- `src/components/motion/preference.tsx` — nom accessible optionnel du contrôle de footer ; comportement par défaut conservé.
- `src/components/navigation/navigation.module.css` — fallback de mise en page pour texte agrandi.
- `src/lib/motion/final-journey.ts` et `runtime.ts` — recette scoped et branchement.
- `playwright.redesign07.config.ts` et `scripts/test-redesign07.mjs` — validation isolée.
- `tests/redesign07-browser/contact.spec.ts`, `layout.spec.ts`, `database.ts`, `setup.ts` — tests et garde DB.
- `docs/CINEMATIC_REDESIGN_07.md` — ce rapport.

Les autres changements encore visibles dans Git appartiennent aux travaux 05/06 et au lanceur utilisateur sauvegardés avant cette phase.

## Revue locale

1. Dans PowerShell : `cd C:\Users\Dell\Desktop\sakado_web`. Utiliser Node 24. La base locale existante sur 55432 reste préservée ; si elle est déjà active, ne pas lancer une seconde instance. Sinon, utiliser son lanceur habituel `npm run db:local`, sans reset, seed ou fixtures.
2. Arrêter tout serveur Next de ce dépôt avant un nouveau lancement, puis exécuter `npm run dev:presentation`. Ouvrir `http://127.0.0.1:3134/dev/presentation` et saisir en privé le code frais de `.local/official-presentation/access-code.txt` dans les cinq minutes. Session limitée à une heure ; si le code a expiré, redémarrer le lanceur officiel.
3. Ouvrir `http://127.0.0.1:3134/contact`. Examiner l’introduction, l’image et son cadrage, le formulaire, les coordonnées disponibles et la continuité du footer à 1440/1024/768/375 px. Tester le scroll dans les deux sens, les liens clavier, MotionToggle, reduced motion, hauteur courte et texte agrandi.
4. Ouvrir la homepage dans la même session, puis descendre jusqu’au CTA et au footer. Vérifier les textes CMS, les destinations Contact/WhatsApp disponibles, le logo et les liens légaux. La galerie 06 doit conserver son comportement validé.
5. Cette revue privée est visuelle : ne pas soumettre de message d’essai à la base existante. Pour vérifier les états d’envoi, arrêter le preview puis exécuter `npm run build` et `node scripts/test-redesign07.mjs`, qui créent uniquement leur base de test gardée.
6. Pour le fallback public, arrêter le preview puis lancer `npm run dev`. Examiner `http://127.0.0.1:3000/contact` et la homepage ; aucune photo privée ne doit y apparaître.

La validation visuelle humaine de Redesign 07 reste attendue. Aucun Redesign 08 n’a été commencé.
