# Learn — atelier d'apprentissage personnel

Une collection statique de cours interactifs construits avec le skill `/learn`, publiée sur
GitHub Pages. Le glossaire ci-dessous fixe le vocabulaire commun au **hub** et à tous les cours.

## Language

**Hub**:
La page racine (`index.html`) qui liste tous les cours. Tient lui-même la liste et la méta de
chaque cours, en dur.
_Avoid_: Accueil, portail, landing

**Cours**:
Un dossier autonome (ex. `piano/`) qui enseigne un sujet, avec sa page d'accueil, ses leçons et
ses propres assets. Déplaçable seul, sans dépendance vers la racine.
_Avoid_: Module, matière, formation

**Page d'accueil du cours**:
L'`index.html` à la racine d'un cours. Présente le « pourquoi », la progression et la liste des
leçons. C'est la cible du lien du hub.
_Avoid_: Sommaire, index

**Leçon**:
Un fichier HTML interactif qui enseigne **une seule chose** avec un exercice jouable dans le
navigateur. Numérotée et ordonnée.
_Avoid_: Chapitre, page, cours

**Source unique des leçons**:
Dans un cours, l'unique endroit qui liste les leçons (pour le piano : le tableau `LESSONS` de
`lib/nav.js`, exposé via `window.LessonNav.lessons`). La page d'accueil la lit ; on n'édite
qu'ici pour ajouter une leçon.
_Avoid_: Manifeste, config

**Sommaire flottant**:
Le panneau de navigation latéral injecté par `nav.js` à l'intérieur des leçons. Distinct de la
page d'accueil du cours.
_Avoid_: Menu, nav

## Règles d'or

- **Tout est statique.** Pas de serveur, pas de build, pas de `fetch()` : le site doit marcher
  aussi bien en `file://` que sur GitHub Pages. Les listes (cours, leçons) sont des tableaux JS en
  dur, jamais chargés au runtime.
- **Cours autonomes.** Un cours ne dépend pas de la racine ; il porte son propre `lib/`.
- **Ajouter un cours** = créer son dossier + sa page d'accueil, puis ajouter une entrée au tableau
  `COURS` du hub (fait automatiquement à chaque `/learn`).
- **Chemins relatifs uniquement** (jamais de `/` initial), pour rester valides sous le sous-chemin
  `clara-celle.github.io/learn/`.
