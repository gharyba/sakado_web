# SAKADO — Cinematic Redesign 07.1 : Partenaires et signature

Revue locale Windows / Chrome du 25 octobre 2026. Branche `feat/cinematic-redesign-07-1`, issue de `809fa76`. Travail non commité, en attente de validation visuelle. Aucun push, merge, déploiement ou démarrage de Redesign 08.

## Préservation et architecture retrouvée

Avant les changements : inventaire des 43 fichiers déjà modifiés/non suivis des Redesigns 05–07 et snapshot ignoré `.local/redesign07-1-recovery/20261025-pre071/` avec patch et empreintes SHA-256. Le changement de branche a conservé exactement ces fichiers.

L'inspection du schéma Prisma, des routes, des composants et des paramètres CMS ne révèle aucun modèle Partner, aucune route `/partners`, aucun écran `/admin/partners` et aucun contrôle CMS de classement des partenaires. Une transaction PostgreSQL explicitement READ ONLY, terminée par ROLLBACK, confirme zéro table partenaire et zéro paramètre contenant une clé partenaire. Aucun enregistrement métier n'a été écrit, aucune migration ni fixture n'a été exécutée contre cette base.

L'ancien adaptateur privé, déconnecté de PostgreSQL, possédait `ClientPartners` et six logos dans son index. La section Community existe déjà dans la page officielle et conserve ses métriques CMS et Instagram ; aucune duplication.

Les six images fournies sont conservées dans leur répertoire privé. Leur présence établit une disponibilité pour la revue locale, pas une relation commerciale ni une autorisation de publication.

| Slot existant | Identité disponible                                        | État à confirmer                       |
| ------------- | ---------------------------------------------------------- | -------------------------------------- |
| partner-0     | SOPAL                                                      | Relation, identité légale, droits, URL |
| partner-1     | FINLOGIK                                                   | Relation, identité légale, droits, URL |
| partner-2     | Belle Rose Distribution                                    | Relation, identité légale, droits, URL |
| partner-3     | Identité à confirmer ; ancien fichier `creativas_logo.png` | Identité exacte, relation, droits, URL |
| partner-4     | الجمعية التونسية للمحامين الشبان                           | Nom officiel, relation, droits, URL    |
| partner-5     | الهيئة الوطنية للمحامين بتونس                              | Nom officiel, relation, droits, URL    |

Le nom de fichier du quatrième logo ne sert pas à inventer une identité. Les six noms de slot et leur ordre viennent de l'index privé existant. Aucune URL partenaire n'est enregistrée ou ajoutée : les marques ne sont pas cliquables.

## Interface et emplacement

Nouveau composant serveur `PartnersSection`, intitulé **Nos Partenaires**, immédiatement après la galerie de la page d'accueil. Les sections suivantes, notamment Community, Instagram et la conclusion Contact, conservent leur ordre. La galerie Floating Memories, ses contrôles et son animation restent inchangés.

La section ajoute une lumière forestière radiale transparente, des titres ivoire et des accents or. Elle conserve l'atmosphère existante de la page, sans repeindre les autres sections ni créer de bandeau de fond opaque. Les petits supports ivoire assurent la lisibilité des couleurs natives des logos fournis. Les PNG originaux et leur transparence ne sont pas modifiés ; les images utilisent `object-fit: contain`, sans filtre ou déformation.

La grille comporte six colonnes sur grand écran, trois jusqu'à 1023 px et deux jusqu'à 699 px. Le titre peut revenir à la ligne avec une police agrandie. Sans données publiques éligibles, le site affiche : « Les partenariats seront présentés ici après confirmation par Sakado. » Aucune marque privée n'apparaît dans ce mode.

La présentation officielle authentifiée réutilise les six dérivés protégés, avec un avertissement explicite sur les identités, relations et droits à confirmer. Le quatrième logo conserve une légende « Identité à confirmer ». Il n'y a aucun nouveau système de gestion parallèle.

## Mouvement, accès et médias

Le titre utilise la recette HomeWords existante ; les marques ont une seule animation propriétaire dans le runtime GSAP/ScrollTrigger existant. Sur desktop : déplacement maximal 6 px, opacité 0,76–1, progression au scroll et retour réversible. Sur tablette : déplacement maximal 3 px. Sur mobile : opacité 0,86–1 en entrée unique, sans translation. Aucun carrousel, pinning ou effet 3D des partenaires.

Les contextes et styles sont nettoyés avec le cycle de vie existant. MotionToggle et la préférence système restaurent des marques statiques, opaques et lisibles. Le HTML serveur conserve les logos autorisés et les titres sans JavaScript. Aucune action interactive n'est animée.

Le fournisseur officiel existant est étendu uniquement aux slots `partner-0` à `partner-5`, aux sources PNG sous `partners/`, aux dérivés preview de taille nominale 480 et aux dimensions réelles positives ≤ 480 px. Le maximum de catalogue reste **40**, inchangé : 34 entrées historiques + 6 partenaires.

La préparation vérifie les empreintes originales, les empreintes des dérivés et leur reproduction déterministe en mémoire. Un logo facultatif absent ou invalide est omis. Les six nouvelles entrées s'ajoutent sans changer les 34 précédentes : comparaison structurelle exacte effectuée avant renouvellement du catalogue.

Les barrières existantes restent actives : session indépendante expirante avant accès disque, loopback local, origine autorisée, vérification des hashes à la livraison, `no-store`, refus en production et refus par l'optimiseur Next. Aucun original ou dérivé n'est copié dans `public/`. Les 17 éléments BLOCKED et les 85 axes PENDING REVIEW restent inchangés.

## Signature du développeur

`DeveloperSignature` est ajouté en dernier dans le footer global, sous le copyright et le lien Confidentialité. Le logo SAKADO, la navigation, les réseaux et les deux membres permanents de l'équipe ne changent pas.

La composition reprend la direction de la capture fournie : esquisse originale de personnage au chapeau entourée d'une ellipse, lettrage manuscrit **Ghrayba_jr**, soulignement et grand trait croisé à droite. L'ivoire et l'or s'intègrent au pied forestier. Le petit libellé « Développement » distingue le crédit de l'identité de l'entreprise.

Le nom est un tracé SVG statique issu d'un lettrage local Segoe Script, et non du texte courant. Aucune police embarquée ou téléchargée, dépendance, image raster, lien social ou portfolio. Environ 23 Ko pour le tracé de lettrage, quelques chemins supplémentaires pour la composition. Largeur maximale 16 rem, adaptée au parent. Le SVG possède un nom accessible explicite et ne reçoit pas le focus. Seule l'opacité d'une fioriture réagit au survol, si les animations sont actives et autorisées par le système.

Des captures réelles du footer à 1440 et 375 px ont été inspectées. Le nom reste lisible et la signature est placée après les informations légales sur les dix routes publiques contrôlées, y compris les deux vues Galerie.

## Vérifications exécutées

| Vérification                                    | Résultat local actuel                                       |
| ----------------------------------------------- | ----------------------------------------------------------- |
| TypeScript et ESLint                            | PASS, dont un second passage après arrêt du serveur dev     |
| Tests unitaires                                 | **86/86**, dont deux nouveaux tests de périmètre partenaire |
| Build de production                             | PASS, Prisma généré sans migration                          |
| Audit `npm audit --omit=dev --audit-level=high` | **0 vulnérabilité** ; dépendances et lockfile inchangés     |
| Barrières médias avant/après build              | PASS, 17 actifs contrôlés                                   |
| Traces de déploiement                           | PASS, 53 traces sans fichiers privés                        |
| Secret guard                                    | PASS                                                        |
| Nouveaux tests Partenaires/signature            | **8/8**                                                     |
| Sécurité médias de présentation en production   | **6/6**, modes opérationnel et démo                         |
| Hero                                            | **9/9**                                                     |
| Phase 04                                        | **9/9**                                                     |
| Découverte Redesign 04                          | **8/8**                                                     |
| Galerie Redesign 06, laboratoire sans base      | **9/9**                                                     |
| Revue privée officielle ciblée                  | PASS, six logos décodés et zéro POST métier transmis        |
| Ancienne suite Phase 09                         | **4/14** ; limites détaillées ci-dessous                    |

Les huit nouveaux tests utilisent le rendu partagé en mode démo de production, sans base ni fixtures. Ils couvrent dix routes publiques, l'ordre après Galerie et avant Contact, Community unique, l'équipe canonique, l'absence de logos privés publics, les liens légaux, la signature sans lien, quatre largeurs (1440/1024/768/375), le viewport court 1024×600, le texte à 200 %, le fallback sans JavaScript, MotionToggle, reduced motion et axe WCAG 2 A/AA + 2.1 AA sur les deux nouveaux éléments. Il s'agit de contrôles ciblés, pas d'une certification d'accessibilité complète.

La revue privée utilise la vraie application PostgreSQL en lecture seule sur 127.0.0.1:3134 et le lanceur autorisé. Elle vérifie le fallback sans session, six marques avec `object-fit: contain`, les dimensions intrinsèques, l'absence de liens, la notice, le retour du scroll, le nettoyage MotionToggle, reduced motion, le rendu sans JavaScript et les quatre largeurs. Elle confirme deux membres d'équipe, une Community et six photos dans la galerie de l'accueil.

Les requêtes de médias vérifient : session valide → 200/no-store ; sans session → 404 ; origine étrangère → 404 ; optimiseur → 400 ; logout → révocation/404. Un hash de dérivé partenaire dans le seul catalogue runtime ignoré a été temporairement altéré pour obtenir 404, puis restauré dans un `finally` avec le writer sécurisé existant ; le même média répond ensuite 200. Aucun octet original, dérivé ou statut d'approbation n'est altéré par ce test. Les hashes des six PNG sources sont inchangés après revue.

La première tentative de revue privée a attendu un libellé erroné du bouton de réactivation dans le helper de test ; corrigé vers le libellé existant « Réactiver les animations », puis passage complet. La première tentative du laboratoire 3D a rencontré le verrou d'un autre serveur dev de tests ; il a été relancé seul après son arrêt et les neuf tests passent.

### Limites conservées et échecs distincts

La suite historique Phase 09 a été exécutée en complément : 4 passent, 10 échouent. Six échecs attendent des espaces dans le `textContent` du Hero actuel en mots séparés, qui dispose déjà du bon nom accessible ; deux collectent globalement tous les h2 et trouvent les titres de navigation du footer Redesign 07 ; deux constatent un débordement à 320–360 px et texte 200 %. Les tests historiques ne sont pas modifiés pour masquer ces résultats.

Le diagnostic de reflow mesure une largeur document de 366 px aux viewports 360 et 320. Elle reste **366 px après masquage des nouveaux Partenaires et signature**. Les éléments sortants appartiennent aux sections déjà présentes, notamment Hero et certains petits textes. Cette limite n'est pas corrigée ici pour respecter la portée et les sections approuvées. Les deux nouveaux éléments passent leurs propres contrôles de reflow aux largeurs testées.

Le résultat historique Navigation **9/10** reste une limite connue : attente d'ivoire face au navy existant, antérieur à cette intervention. La suite privée complète historique **18/20**, avec deux erreurs Chrome après connexion, n'est pas réputée réparée par la revue ciblée. Ces deux suites complètes n'ont pas été relancées pour cette phase. La suite galerie complète 10/10 de la phase précédente n'est pas présentée comme un nouveau résultat : seuls les neuf tests laboratoire sans base sont rejoués ici.

Aucune preuve Linux/GitHub Actions, staging, mobile physique ou publication n'est déduite de ces tests Windows locaux.

## Fichiers de cette intervention

Modifiés :

- `scripts/presentation-files.mjs`
- `src/lib/official-presentation.ts`
- `src/app/(public)/page.tsx`
- `src/lib/motion/runtime.ts`
- `src/components/site-footer.tsx`

Ajoutés :

- `src/components/company/partners-section.tsx`
- `src/components/company/partners-section.module.css`
- `src/lib/partner-preview-policy.ts`
- `src/lib/motion/partners.ts`
- `src/components/developer-signature.tsx`
- `src/components/developer-signature.module.css`
- `tests/partner-preview.test.ts`
- `tests/redesign07-1-browser/partners-signature.spec.ts`
- `playwright.redesign07-1.config.ts`
- ce document.

Sur les 43 fichiers préexistants du snapshot, 40 gardent exactement leur SHA-256. Les trois autres sont seulement la page d'accueil, le footer et le runtime, étendus pour cette phase. Les sources Galerie/Floating Memories, Contact, navigation, script PostgreSQL de l'utilisateur, dépendances, lockfile, Prisma et médias publics ne sont pas modifiés par cette intervention.

Les helpers, captures privées, traces et résultats détaillés restent ignorés dans `.local/redesign07-1/`. Le serveur de test privé est arrêté à la fin des contrôles ; le PostgreSQL local préexistant reste démarré.

## Revue client et prochaine étape

Depuis le dépôt : `npm run dev:presentation`, puis ouvrir `http://127.0.0.1:3134/dev/presentation` et saisir localement le code du fichier indiqué par le lanceur dans les cinq minutes. Ne pas partager le code, les captures privées ni exposer le serveur. Après connexion, visiter `/#partenaires` et le bas du footer ; vérifier aussi `/contact` et `/gallery`. La signature est également visible sans session sur les pages publiques.

À valider par le client : rendu visuel Partenaires et signature **Ghrayba_jr** ; identité du quatrième logo et noms officiels ; réalité et nature de chaque relation ; autorisation de publication de chaque marque ; URL confirmée et ordre souhaité. Sans ces confirmations, les logos restent privés et le fallback public reste actif.

Arrêt pour validation visuelle. Aucun staging, commit, push, merge ou deploiement effectue.

## Redesign 07.2 — raffinement visuel et lien de signature (25 octobre 2026)

La grille précédente présentait six grands rectangles ivoire, un titre trop ample et trop d'espace. Le fond partagé de `forest-environment.css` contient les bleus et violets constatés ; ses variables restent inchangées pour préserver les autres sections. La section Partenaires adopte maintenant un fond forestier local à transition verticale douce, un titre éditorial plus petit, un court texte sans fait commercial nouveau et une bande horizontale de six marques sur grand écran. Chaque logo garde son ratio, `object-fit: contain`, ses couleurs natives et un petit support neutre pour le contraste. La bande passe à trois colonnes sous 1024 px puis deux sous 700 px. Le fallback public reste textuel, sans marque privée.

Les marques utilisent le runtime GSAP existant : une seule entrée à faible déplacement et décalage maximal de 200 ms ; MotionToggle et `prefers-reduced-motion` rendent le contenu statique. Le titre réutilise HomeWords. Aucun fichier de la galerie 3D n'a été modifié. La signature SVG conserve ses chemins, dimensions, couleurs, position et fioriture ; son SVG est désormais dans un lien `mailto:ygharbi955@gmail.com`, nommé « Contacter le développeur Ghrayba_jr », avec focus visible. L'adresse n'est pas affichée en texte.

Fichiers touchés par 07.2 : `src/components/company/partners-section.tsx`, `src/components/company/partners-section.module.css`, `src/lib/motion/partners.ts`, `src/components/developer-signature.tsx`, `src/components/developer-signature.module.css`, `tests/redesign07-1-browser/partners-signature.spec.ts`, `tests/presentation-browser/partners-072.spec.ts`, `playwright.presentation.config.ts` et ce document. Aucun original, permission média, contenu CMS, schéma ou source Galerie n'a changé.

Vérifications locales : typecheck PASS ; ESLint PASS ; build PASS (17 actifs bloqués et 53 traces privées contrôlées) ; audit production : zéro vulnérabilité. Les neuf cas du navigateur public ont exécuté leurs assertions, dont les quatre largeurs 1440/1024/768/375, le lien clavier, l'accessibilité automatisée ciblée, sans JavaScript et la réduction du mouvement. Les six cas de refus des médias privés en production ont également exécuté leurs assertions. Le lanceur Playwright reste suspendu à la fermeture des serveurs après le dernier cas ; ces exécutions ont été interrompues et ne constituent donc pas des sorties globales PASS. `npm test` ne démarre pas sous le Node 24 de cette machine car `os.userInfo()` renvoie `uv_os_get_passwd ENOMEM`. Avec un contournement éphémère ignoré dans `.local/redesign07-2/`, 84/86 tests passent ; deux tests existants de permissions de répertoire privé échouent. Le lanceur de présentation officielle refuse également le démarrage avant le test ciblé des six logos. Ces échecs ne sont ni masqués ni contournés dans le code applicatif.

Limites : la nouvelle composition avec les six logos protégés n'a pas pu être vérifiée dans le navigateur ici. Les identités, relations et droits du tableau ci-dessus restent à confirmer. La revue publique ne prouve ni la publication des logos, ni le fonctionnement du provider, ni une validation sur mobile physique. Les captures publiques restent dans `.local/redesign07-1/screenshots/` ; aucune capture privée n'a été publiée.

Revue locale : corriger d'abord les permissions du runtime privé sans assouplir ses contrôles, puis lancer `npm run dev:presentation`, ouvrir `http://127.0.0.1:3134/dev/presentation` et entrer localement le code temporaire. Examiner `/#partenaires` à 1440, 1024, 768 et 375 px et la signature en bas du footer. Vérifier l'ouverture de l'application mail avec Entrée au focus. Comparer la galerie et le CTA Contact sans modifier leurs comportements. Attendre ensuite la validation visuelle humaine ; ne pas commencer Redesign 08.

## Validation des bloqueurs 07.2 — rectification du 25 octobre 2026

Cette section remplace les résultats provisoires 84/86, le refus de démarrage et les sorties Playwright suspendues ci-dessus. Branche et HEAD restent `feat/cinematic-redesign-07-1` / `809fa76` ; toutes les modifications 05–07.2 sont restées non commitées.

**Causes établies.** Sous le bac à sable Windows de l'agent, Node 24.19.0 échoue seulement sur `os.userInfo()` (`uv_os_get_passwd ENOMEM`) ; `homedir()`/`tmpdir()` et l'identité Windows fonctionnent, et le même appel Node réussit hors du bac à sable. Le contournement éphémère `.local/redesign07-2/node-userinfo-workaround.cjs` n'a pas été utilisé dans la validation finale et a été supprimé ; aucun contournement n'est intégré à l'application. Les deux tests ACL échouaient dans leur première étape commune : le helper vérifiait déjà le propriétaire, puis demandait inutilement `SetOwner` en écrivant le nouveau descripteur. Le diagnostic synthétique isolé a montré le refus de privilège ; la même DACL propriétaire/SYSTEM s'applique sans cette écriture de propriétaire. `scripts/presentation-runtime.mjs` retire seulement `SetOwner` et conserve les contrôles de propriétaire, d'héritage, des deux règles et du refus des accès inattendus avant et après. Le répertoire réel de présentation a été relu hors bac à sable : propriétaire attendu, héritage protégé et exactement deux règles propriétaire/SYSTEM.

Les mêmes configurations Playwright qui restaient suspendues dans le bac à sable terminent normalement hors de celui-ci, avec code de sortie zéro et fermeture des serveurs. Aucun défaut applicatif de cycle de vie n'a été démontré et aucun arrêt forcé ou assouplissement du nettoyage n'a été ajouté. Le diagnostic initial du lanceur privé hors bac à sable a isolé `ECONNREFUSED` sur le PostgreSQL local arrêté. Un helper temporaire ignoré a démarré **le cluster existant** après contrôle de `PG_VERSION`, du port libre et de l'identité réelle de sa base ; il n'a créé ni base ni fixture et n'a pas édité `.env`. Le nouveau préflight a confirmé environnement, base READ ONLY, port 3134 libre, catalogue de 40 dérivés dont six partenaires, et répertoire privé. Le lanceur et la session protégée ont ensuite fonctionné. Le premier test visuel privé vérifiait `naturalWidth` avant la fin du chargement paresseux ; l'assertion attend maintenant le décodage réel.

Sur Windows, Playwright indique que l'arrêt gracieux `SIGINT`/`SIGTERM` de `webServer` n'est pas pris en charge ; la terminaison forcée peut empêcher le gestionnaire du lanceur de supprimer le fichier de code temporaire. Le premier test avait effectivement laissé ce code sans serveur ni secret de session actif. Après vérification du chemin et de l'absence de lien, ce seul fichier éphémère a été supprimé. `playwright.presentation.config.ts` déclenche maintenant un `globalTeardown` dédié : il vérifie le répertoire privé et le type du fichier, puis supprime uniquement `access-code.txt`, même si un test échoue. La nouvelle exécution privée sort avec code zéro, port 3134 fermé et code temporaire absent. Le catalogue et les médias sont préservés. Un arrêt anormal d'une présentation manuelle hors Playwright peut toujours contourner son gestionnaire d'arrêt ; le code reste alors inutilisable sans serveur et secret de session, mais le fichier doit être retiré localement.

**Résultats finaux hors bac à sable :** `npm test` **86/86** ; navigateur Partenaires/Footer **9/9** et sortie normale ; refus média privé en production **6/6** et sortie normale ; présentation protégée ciblée **1/1** et sortie normale ; laboratoire Galerie 3D sans base **9/9** et sortie normale ; typecheck, lint et build **PASS** ; gate build : 17 actifs bloqués et 53 traces de déploiement sans fichiers privés. Les captures privées ignorées `.local/redesign07-2/partners-private-{1440,1024,768,375}.png` ont été inspectées : les six logos décodent, gardent leurs proportions et tiennent dans la bande/grille sans débordement ; le fond est forestier et le quatrième logo conserve sa mention d'identité incertaine. Le test privé confirme également 404 sans session, 200 avec session et refus de l'optimiseur. Le lien manuscrit conserve l'art existant ; focus, destination `mailto:` et activation par Entrée sont contrôlés dans le navigateur public. Aucun client mail système n'a été ouvert automatiquement par les tests.

**Fichiers modifiés pendant cette validation :** `scripts/presentation-runtime.mjs`, `playwright.presentation.config.ts`, `tests/presentation-browser/cleanup-code.ts`, `tests/presentation-browser/partners-072.spec.ts`, `tests/redesign07-1-browser/partners-signature.spec.ts` et ce document. Les scripts de diagnostic, le helper de démarrage et les captures demeurent dans `.local/redesign07-2/`, ignoré par Git. Aucun original, statut de publication, contenu métier, schéma, galerie 3D, contact, dépendance ou politique d'authentification n'a été modifié. Restent à confirmer humainement l'identité et les droits des partenaires, la validation visuelle finale du client et le comportement d'une vraie application mail sur son appareil ; aucune preuve de staging ou de production n'est inférée.

Le PostgreSQL local a été arrêté après les contrôles ; les ports 55432 et 3134 ne sont plus en écoute et le fichier de code temporaire est absent.

