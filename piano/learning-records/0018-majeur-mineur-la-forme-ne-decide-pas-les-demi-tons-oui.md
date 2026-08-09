# Majeur / mineur : la forme ne décide pas, les demi-tons oui

Clara, sur la leçon de l'accord mineur : « j'ai du mal à comprendre les accords majeur vs mineur,
pourquoi Ré Fa La ce n'est pas le majeur de Ré ? »

**C'est le cours qui lui avait donné une règle fausse.** Elle a trouvé exactement l'endroit où elle
casse.

## La dette

La leçon « cinq doigts & ton premier accord » enseignait, dans un encadré central :

> **Départ → saute 1 blanche → joue → saute 1 blanche → joue.**

Suivi de « la même forme donne trois accords » (Do, Fa, Sol majeurs). C'est vrai **pour ces trois
départs seulement**. Appliquée depuis Ré, Mi ou La, la même forme produit des accords **mineurs**.
La leçon présentait donc un raccourci valable en Do comme une règle générale, et son aside
« pour l'instant, retiens la forme » repoussait la correction sans jamais la programmer.

La leçon sur l'accord mineur, elle, **affirmait** le cas de Ré (« c'est l'inverse de Do… et c'est
correct ») sans jamais l'expliquer. Rassurer n'est pas enseigner : Clara a lu la phrase, l'a crue,
et n'a toujours pas compris — d'où sa question.

## Le fond

Ce qui décide de la couleur, ce n'est pas la **forme** de la main mais la **distance en demi-tons**.
Les blanches ne sont pas régulièrement espacées : pas de touche noire entre **Mi-Fa** ni entre
**Si-Do**. Donc « sauter une blanche » ne parcourt pas toujours la même distance.

- Do → Mi = **4** demi-tons (tierce majeure)
- Ré → Fa = **3** demi-tons (tierce mineure), parce que la marche Mi-Fa manque

**Majeur = 4 puis 3. Mineur = 3 puis 4. Total toujours 7.** Ce total constant est la clé
pédagogique : il explique d'un coup pourquoi la note du haut ne bouge jamais, pourquoi la main garde
la même forme, et pourquoi « baisser la note du milieu » (règle déjà enseignée) fonctionne.

## Nouvelle leçon, insérée avant « accord mineur & The Scientist »

`lessons/majeur-ou-mineur-compter-les-demi-tons.html` — rubrique Harmonie.

- Part **de sa question**, pas d'une définition. Le titre de la section 3 est littéralement
  « la réponse à ta question ».
- Le tableau des **sept triades blanches** montre que le partage 3 majeurs / 3 mineurs / 1 diminué
  n'est pas arbitraire : il se déduit en comptant. Le diminué est en aside (hors mission).
- **Exercice** (composant `Exercise`) : l'appli nomme un accord et ne surligne **que la
  fondamentale** — les deux autres notes sont à trouver. C'est le seul exercice du cours où montrer
  les touches donnerait la réponse ; un bouton **👀 Montrer** reste disponible, et une réussite
  après révélation ne compte pas dans la série.
- **Le retour d'erreur chiffre l'écart** au lieu de dire « non » : « Fa = 3 demi-tons, il en faut 4
  — monte encore de 1 ». C'est le proxy objectif de cette leçon, dans la lignée de
  [[0017-le-legato-se-mesure-en-silence-pas-en-tempo]] : mesurer la grandeur qui est réellement
  en cause.
- Tirage aléatoire majeur/mineur sur 6 fondamentales blanches = **interleaving**. Fondamentales
  blanches uniquement → la quinte tombe toujours sur une blanche (sauf depuis Si, exclu), donc la
  seule touche noire possible est celle du milieu : exactement ce que la leçon travaille.
- **Orthographe des noires** : ♯ en majeur (tierce montée), ♭ en mineur (tierce baissée).
  Ré maj → Fa♯, Do min → Mi♭. Même touche, deux noms — et le nom dit ce qu'on a fait.

## Corrections en amont

- « Cinq doigts & ton premier accord » : encadré ⚠️ ajouté sous les trois accords — le raccourci ne
  vaut que pour Do, Fa, Sol — et l'aside « Pourquoi majeur ? » renvoie désormais à la nouvelle leçon.
  **La règle fausse n'est plus livrée sans son antidote.**
- « Accord mineur & The Scientist » : le cas de Ré est maintenant **expliqué** (3 contre 4 demi-tons)
  et non plus seulement affirmé.
- Nouvelle fiche `reference/accords-majeur-mineur.html` : la table 4+3 / 3+4 / 3+3, les sept triades
  blanches, l'orthographe des noires, et les accords des trois morceaux cibles avec leurs écarts.

## Ce qu'il faut retenir

**Un raccourci pédagogique doit être daté à sa naissance.** « Retiens ça pour l'instant » sans leçon
programmée derrière, ce n'est pas une simplification, c'est une erreur en attente. Le coût ne tombe
pas sur le prof qui l'a écrite, mais sur l'élève qui bute dessus trois leçons plus tard en croyant
que c'est elle qui n'a pas compris.

**Corollaire :** quand une leçon doit écrire « et c'est correct » pour rassurer, c'est le signal
qu'une explication manque. Rassurer masque le trou au lieu de le combler.

## Vérification

- `node lib/selftest.js` → 20 contrôles ✅ (l'ordre et l'existence des fichiers incluent la
  nouvelle leçon).
- Exécution réelle du script de la leçon dans le faux DOM : 12 accords tirables, Ré majeur =
  62·66·69 « Ré Fa♯ La », Ré mineur = 62·65·69, orthographe ♯/♭ correcte, toutes les quintes sur
  une blanche, 4+3 / 3+4 vérifiés sur les 12, boucle de l'exercice et remise à zéro de la série OK,
  et le verdict d'erreur chiffre bien « 3 demi-tons / il en faut 4 ».
