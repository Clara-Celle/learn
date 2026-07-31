# Le clavier est là et relié aux leçons (Web MIDI) — juillet 2026

Le Nektar Impact GXP61 est reçu et branché. Le plan Web MIDI esquissé depuis juin
(cf. [[0009-achat-premier-clavier-nektar-gxp61]]) est **livré**. Jeffy a **un vrai instrument
sous les doigts pour la première fois** — bascule majeure pour la mission [[MISSION.md]].

## Ce qui a été construit

- **`./serve.sh`** → `python3 -m http.server 8000`. Le navigateur n'ouvre un périphérique MIDI
  qu'en **contexte sécurisé** : `file://` est refusé, `http://localhost` accepté. Rien à installer.
- **Le MIDI vit dans `lib/piano.js`, pas dans les leçons.** Décision structurante : les messages
  entrants sont routés vers le `press()`/`release()` déjà utilisé par la souris et le clavier PC.
  → **les 9 leçons existantes ont fonctionné avec le vrai piano sans une ligne de changement**,
  y compris les exercices (qui écoutent `onNote`). Toute future leçon en hérite gratuitement.
- **Pédale = CC64** → 3e source de pédale (`pedalMidi`) à côté du bouton et de la barre Espace.
  Sa vraie pédale NP-2 pilote donc le sustain des leçons.
- **Témoin 🎹** dans `mountControls` (nom du clavier détecté) et **`lib/test-midi.html`**
  (journal des messages bruts + auto-test par injection de faux messages).

## Deux frictions repérées, à ne pas laisser le surprendre

1. **Le son ne démarre qu'après un clic sur la page.** Les navigateurs exigent un geste
   utilisateur pour l'audio, et un message MIDI n'en est pas un. Symptôme trompeur : les touches
   s'allument, mais aucun son → il croira que la lib est cassée.
2. **Plage affichée Do3→Do6 vs clavier Do2→Do7.** Les notes hors plage sont ignorées.
   → **prochaine micro-leçon : le bouton Octave**, qui servira aussi pour les graves
   d'*Interstellar*.

## Effets sur la pédagogie — à répercuter

- **Les contournements « pas d'instrument » sont morts** : ghosting du clavier PC, mode
  accompagnement obligatoire, astuce « deux surfaces » (bass-pad sur téléphone). Ils restent
  utiles comme *aides à l'apprentissage par couches*, mais ne sont plus des **contraintes**.
- **Le doigté devient enseignable pour de vrai.** Jusqu'ici impossible (clavier PC = disposition
  décalée, non transférable — cf. [[0001-point-de-depart]]). C'est le plus gros déblocage.
- **La nuance (vélocité) devient audible** sur un clavier sensible au toucher. La lib ignore
  encore la vélocité reçue → piste d'amélioration si on veut travailler les nuances.
- **Attente à cadrer** : semi-lesté ≠ marteaux. Un vrai piano lui paraîtra lourd ; ce n'est pas
  une régression.

## Prochaine session

**Rejouer *The Scientist* en entier sur le vrai clavier** (prévu au record 0009) : c'est le test
de transfert du savoir acquis au clavier PC vers un vrai toucher. Y greffer le **bouton Octave**
et le **doigté main droite**, tous deux nouvellement enseignables. Ensuite seulement, trancher
la question restée ouverte du record [[0008-the-scientist-assemblage]] : fignoler ou démarrer
*Interstellar*.
