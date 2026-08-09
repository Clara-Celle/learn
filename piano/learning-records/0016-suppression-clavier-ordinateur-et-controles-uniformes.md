# Suppression du clavier d'ordinateur & contrôles uniformes

Clara a un vrai piano MIDI depuis [[0010-clavier-branche-web-midi]]. Tout l'échafaudage
« jouer au clavier d'ordinateur », construit quand elle n'avait pas d'instrument
([[0001-point-de-depart]]), est devenu du poids mort. Elle a demandé sa suppression.

## Supprimé

- `piano.js` : tables `KEYMAP`/`KEYMAP2`/`AZLBL`/`AZLBL2`, options `computerKeys`/`keyboard:'2oct'`/
  `keymap`/`keylabels`, écouteurs `keydown`/`keyup` de notes, badges `.pk-kkey`, `toggleKeys`.
- `piano.css` : styles des badges et `.pk-hidekeys`.
- Toutes les leçons : indices « ⌨ raccourci clavier », mentions AZERTY, contournement du
  **ghosting**, remarques sur la plage MIDI 60-75 imposée par le clavier PC.
- **La barre Espace reste** : c'est la pédale, pas une note.

Vérifié par grep : plus aucune occurrence de `AZERTY`, `Touches PC`, `computerKeys`, `toggleKeys`
dans `lib/`, `lessons/` ou `index.html`.

## Ajouté : deux réglages présents dans toutes les leçons

`mountControls` injecte désormais partout la même barre :
**🔊 Son · 🎵 Noms des notes · 🎯 Guide · ✋ Doigtés · 🎶 Pédale · 🎹 témoin MIDI.**

- **🎯 Guide** = surlignage des prochaines touches à jouer.
- **✋ Doigtés** = ronds numérotés posés dessus.

**Implémentés en CSS pure** (`pk-noguide`, `pk-nofing` sur la racine du clavier) : une leçon appelle
`guide()`/`target()` sans jamais tester l'état. Le choix de Clara gagne toujours — corollaire
important : `guide()` **ne doit pas** retirer `pk-noguide`, sinon le bouton serait écrasé à chaque
changement d'accord. (Piège rencontré et corrigé.)

## `piano.guide(notes[, doigts])` — doigté déduit

Les 6 leçons non migrées vers `Exercise` n'ont aucune donnée de doigté : le bouton ✋ y aurait été
un contrôle mort. Plutôt que de saisir le doigté de chaque accord de chaque leçon, `guide()` le
**déduit de l'écart** : triade serrée (≤ une quinte) → **1-3-5**, plus large (donc un renversement)
→ **1-2-5**. C'est exactement la règle enseignée dans la fiche `position-des-doigts.html`.
Heuristique marquée `ponytail:` dans le code ; passer `doigts` explicitement pour les gammes et
mélodies (où elle ne s'applique pas).

Les anciennes leçons sont passées de `piano.highlight(notes,'pk-target')` à `piano.guide(notes)` —
un `sed`, et elles gagnent les ronds de doigté sans autre changement.

## La question Angular : non

Clara proposait de basculer sur Angular « si ça devient trop compliqué ». Refusé, et c'est
argumenté : le dépôt fait **12 pages statiques + 4 fichiers de lib**, sans build, sans
dépendance, ouvrables en double-clic. La complexité réelle de cette session était de la
**suppression** — Angular en aurait ajouté (build, bundler, composants, routing) pour résoudre un
problème qu'on n'a pas. Le signal qui justifierait d'y revenir : un état partagé entre pages
(progression, statistiques de pratique, comptes) — pas le nombre de leçons.

## Reste

- `lessons/bass-pad.html` (pad de basse mobile, astuce « deux surfaces ») est **obsolète** depuis
  le vrai clavier. Encore lié depuis deux leçons. Non supprimé : Clara ne l'a pas demandé.
- Migration des 6 leçons bespoke vers `Exercise` : toujours en attente, non bloquante.

---

## ⚠️ Régression introduite puis corrigée : le bloc Web MIDI supprimé par erreur

Clara : « l'outil clavier a l'air identique, mais j'ai perdu tous les exercices. »

**Cause.** La suppression du clavier d'ordinateur découpait `piano.js` entre deux marqueurs de
commentaire. Entre ces deux marqueurs il n'y avait pas que le clavier d'ordinateur : **le bloc
Web MIDI entier** s'y trouvait aussi. Il est parti avec. `midiListeners` devenait indéfini, donc
`mountControls()` levait une `ReferenceError`.

**Pourquoi le symptôme trompait.** `mountControls()` est appelé au tout début du script de chaque
leçon, juste après `create()`. Le clavier était donc déjà construit et s'affichait normalement —
mais **tout le code d'exercice qui suit ne s'exécutait jamais**. D'où « le clavier va bien, les
exercices ont disparu ». Bonus : l'entrée MIDI du vrai piano était morte aussi.

**Ce qui a laissé passer le bug.** La vérification utilisée était `new Function(source)` : elle ne
teste que la **syntaxe**. Une variable manquante est une erreur d'**exécution** — invisible à ce
contrôle. Toutes les pages « compilaient » et étaient servies en 200.

**Correctif.** Bloc Web MIDI réécrit et réinséré (note ON/OFF, pédale CC64, note hors plage,
avertissement audio suspendu, branchement à chaud).

**Garde-fou permanent : `node lib/selftest.js`.** Faux DOM minimal, puis **exécution réelle** de
`piano.js`, `exercise.js` et `nav.js` : `create`, `mountControls`, `guide`, doigté déduit, les deux
toggles, décodage MIDI, zones du composant, cohérence de l'ordre, existence des fichiers.
19 contrôles, ~200 ms. **À lancer avant de déclarer une modif de lib terminée.**

Leçon retenue, à ne pas réapprendre : **découper du code par marqueurs de commentaire est
dangereux** — il faut vérifier ce qu'il y a *entre* les marqueurs, pas seulement les marqueurs.
