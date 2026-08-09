# Grande harmonisation : composant d'exercice, ordre calculé, fusion 5 doigts + 1er accord

Demande de Clara en trois volets : structurer les composants d'exercice pour avoir **toujours la
même chose à l'écran**, rendre **l'ordre des leçons facile à modifier**, et **fusionner** la
position des doigts avec le premier accord.

## 1. `lib/exercise.js` — la coquille d'exercice

Toujours le même écran, dans le même ordre :
**consigne → contrôles → panneau → indice → clavier (touches à jouer surlignées) → verdict → score.**

Choix de conception : **un composant de présentation, pas un moteur de logique.** Chaque leçon
garde sa propre vérification (elles sont trop différentes : notes justes, écart en ms, demi-tons
parcourus). Ce qui était incohérent, c'était l'*affichage* — donc c'est lui qu'on mutualise.
Tentative d'abstraire aussi la logique = usine à gaz pour zéro gain.

API : `prompt / button / target / hit / miss / verdict / measure / streak / panel / showPanel / reset`,
plus `ex.pianoMount` et `ex.attach(kb)`. Styles `.ex-*` dans `lesson.css`.

**Migrées :** cinq-doigts-et-premier-accord, passage-du-pouce, accord-dun-seul-bloc, renversements.
**Pas migrées** (logique bespoke : métronome, frise, play-along) : les 7 autres. Leur JS est
intact ; on a **supprimé leurs règles CSS** de consigne/retour/score pour que les **alias hérités**
de `lesson.css` leur donne le même rendu. Uniformité visuelle sans risque de régression.

## 2. L'ordre : une seule source, des numéros calculés

Le vrai obstacle n'était pas nav.js — c'étaient **les numéros écrits partout** : dans les noms de
fichiers, les `<title>`, les kickers, les pieds de page et la prose. Le réordonnancement précédent
([[0013-reordonnancement-du-cours-piano-des-le-debut]]) avait coûté un audit de 28 occurrences.

Corrections structurelles :
- **Les numéros disparaissent des noms de fichiers** (`passage-du-pouce.html`). Un fichier = un slug.
- **Les numéros sont calculés** depuis la position dans `LESSONS` ; le champ `n` n'est plus écrit.
- Les leçons exposent des ancrages remplis par `nav.js` : `data-lnum`, `data-lnum="n"`,
  `data-lprevnext`, plus `document.title`.
- **Règle nouvelle et durable :** dans la prose, citer une leçon **par son nom, jamais par son
  numéro**. Toutes les occurrences ont été converties (« la leçon sur l'accord mineur »).

→ **Réordonner = déplacer une ligne.** Vérifié : `grep "Leçon [0-9]"` ne renvoie plus rien.

## 3. Fusion : cinq doigts + premier accord

Le pont qui justifie la fusion, et qu'aucune des deux leçons ne disait :
**un accord, c'est la position de cinq doigts en appuyant sur les doigts 1, 3 et 5 à la fois.**
Le doigté 1-3-5 n'est pas une règle à mémoriser, c'est « un doigt sur deux » dans une position
déjà connue. Les deux leçons enseignaient la même main sans jamais faire le lien.

Un seul clavier, **trois modes** (jeu des numéros / mélodie *Au clair de la lune* / accords
Do-Fa-Sol) — au lieu de deux pages avec deux claviers. Sert directement l'objectif « toujours la
même chose à l'écran ».

## Vérifications

- Vérificateur de liens (script node jetable) : **95 liens internes valides** après renommage complet.
- Syntaxe de tous les scripts de toutes les leçons : OK.
- **Auto-tests ajoutés à `lib/test-midi.html`** : ordre des zones du composant, `target/hit/miss/
  verdict/streak/reset`, et cohérence de `LESSONS` (numérotation dérivée, pas de doublon, bonus
  en dernier et hors numérotation).

## Ce qui n'a pas été fait, et pourquoi

- **Migrer les 7 leçons bespoke vers `Exercise`** : leur logique (métronome, frise, modes
  d'accompagnement) est spécifique et fonctionne. Les alias CSS donnent l'uniformité visuelle
  pour un risque nul. À faire leçon par leçon, quand l'une d'elles doit changer de toute façon.
- **Harmoniser les voicings d'accords** entre leçons : question posée à Clara, sans réponse.
  Ne rien toucher tant qu'elle n'a pas tranché — modifier une leçon déjà pratiquée est un coût réel.
