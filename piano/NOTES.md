# Notes de travail — préférences & contexte

## Langue & notation
- **Communiquer en français.** Jeffy a formulé sa demande en français.
- **Solfège UNIQUEMENT (Do Ré Mi).** Jeffy a explicitement dit ne pas vouloir des lettres
  américaines (C D E) s'il peut s'en passer. → Système principal = Do Ré Mi partout.
  Les lettres restent disponibles seulement en aside « pour info » / toggle optionnel.
  Quand un tuto pop écrit un accord en lettres (Dm, F, C…), **c'est le prof qui traduit**
  en solfège (« Ré mineur », « Fa majeur », « Do majeur »).

## Contexte apprenant
- Débutant **complet** (aucun instrument joué auparavant, ne lit pas la musique).
- **Pas de piano/clavier physique** pour l'instant → pratique sur piano virtuel en ligne
  ([virtualpiano.net](https://virtualpiano.net/), [pianist.me](https://pianist.me/)).
- **Décision (juin 2026) : on continue SANS achat pour l'instant.** Jeffy a buté sur le
  placement des doigts au clavier PC (normal : disposition décalée, non transférable). Lui ai
  expliqué que le clavier PC sert au SAVOIR, pas à la TECHNIQUE.
- **Contraintes d'achat futures : place limitée + veut une connexion PC.** → recommandé :
  **88 touches lestées SLIM** (Casio Privia PX-S, prof. ~23 cm) ; critère PC = **USB-MIDI**.
  Reproposer un guide chiffré quand il fixe un budget.
- **Plan Web MIDI :** quand il a un clavier USB-MIDI, brancher les leçons dessus via la Web MIDI
  API (les leçons réagissent au vrai piano). Nécessite de servir les leçons en `localhost`
  (contexte sécurisé requis) — prévoir un petit serveur local à ce moment-là.

## Morceaux cibles (le « pourquoi »)
1. The Scientist — Coldplay (accords Dm – Bb – F – C). Le plus accessible → bon 1er objectif.
2. Happy Ending — Mika (ballade piano, accords).
3. Interstellar Main Theme — Hans Zimmer (arpège iconique).

## Pédagogie
- Une leçon = UNE chose, gain rapide et tangible, boucle de feedback serrée.
- Privilégier les leçons HTML interactives (clavier cliquable) puisqu'il n'y a pas d'instru.
- Toujours rattacher au moins un morceau cible pour ancrer la théorie.

## Préférences techniques (HTML)
- **Lib piano réutilisable : `lib/piano.css` + `lib/piano.js`** (demandée par Jeffy). À utiliser
  dans CHAQUE leçon plutôt que de redupliquer le code du clavier. Script classique (marche en
  `file://`), expose `window.PianoKeyboard.create({mount, onNote, octaves, labels, computerKeys…})`.
  API : `playNote/playChord`, `highlight(notes,'pk-target')`, `addClass/removeClass(midi,'pk-ok'/'pk-bad')`,
  `clearClass(...)`, `mountControls(el)` (boutons Son/Noms/Touches), `midiToEl`. Classes CSS préfixées `.pk-`.
  Inclure via `<link href="../lib/piano.css">` et `<script src="../lib/piano.js">`.
  ⚠️ Plage clavier AZERTY = MIDI 60–75 → choisir les voicings d'accords dans cette plage.
  **Les 5 leçons utilisent la lib.** `playChord` joue toutes les notes au MÊME instant via
  l'horloge audio (plus de `setTimeout` → plus d'arpège parasite).
- **Sustain (notes tenues) :** la lib expose `noteOn(midi)` / `noteOff(midi)`. Les appuis
  (souris/tactile via pointerdown/up/leave, clavier via keydown/keyup) tiennent la note tant que
  pressée et la relâchent au lâcher (release douce ~0,2 s). `blur` → `releaseAll` (anti-touche
  bloquée). `playNote`/`playChord` restent en one-shot pour la lecture programmée (accords/démo).
  Toute leçon qui gère ses propres touches (ex. rangée de basse de la 0005) doit appeler
  `piano.noteOn`/`noteOff` + écouter `keyup`.
- **Sommaire de navigation : `lib/nav.js`** (auto-monté, injecte son propre CSS, repliable,
  état mémorisé en localStorage, masqué à l'impression). Inclure `<script src="../lib/nav.js">`
  dans chaque leçon. Liste des leçons codée en dur dans nav.js → la compléter à chaque nouvelle leçon.
- **Piano = pleine largeur de la fenêtre**, pas la largeur de la colonne de texte.
  Implémentation : conteneur en full-bleed (`width:100vw;margin-left:calc(50% - 50vw)`),
  touches blanches en `flex:1`, touches noires positionnées en JS via getBoundingClientRect
  (+ listener resize) ou en % pour les schémas statiques.
- **Le piano DOIT jouer le son des notes** (Web Audio API, synthèse intégrée, aucun fichier
  externe). Chaque touche stocke un n° MIDI ; `freq = 440·2^((midi-69)/12)`. Do central = Do4
  (MIDI 60). Oscillateur triangle + légère harmonique sine, enveloppe attaque rapide/déclin.
  Prévoir un toggle 🔊 pour couper le son.
- **Limite clavier PC = ghosting** (max ~3-4 touches simultanées). Pour les leçons « mains ensemble »,
  toujours proposer un **mode accompagnement** : l'appli joue une main (auto, sur le temps 1) pendant
  que Jeffy joue l'autre → ≤3 touches à la fois. Pattern implémenté en Leçon 0005 (bouton « Tu joues » :
  mains ensemble / main droite+basse auto / main gauche+accords auto). Mentionner aussi tablette
  (multi-touch) et MIDI comme alternatives.
- **Clavier 2 octaves chromatiques partout** : `create({ keyboard:'2oct', octaves:3, startOctave:3 })`.
  **Les 5 leçons l'utilisent** (rendu identique Do3→Do6, mêmes raccourcis → mémoire musculaire
  transférable). Layout façon DAW : main gauche grave = rangée du bas (blanches) + rangée du milieu
  (noires : S D G H J, **Si♭=J**) ; main droite médium = A Z E R T Y U (blanches) + chiffres (noires).
  Built-in dans la lib (`KEYMAP2`/`AZLBL2`) ; option `keymap`/`keylabels` reste dispo pour un mapping
  custom. Badges des blanches affichés EN BAS de la touche, noires en haut (cohérence avec les rangées PC).
- **Jouable au clavier d'ordinateur (AZERTY).** Mapper par **position physique** (`event.code`,
  pas `event.key`) → robuste quelle que soit la disposition. Convention :
  rangée du milieu = blanches (`Q S D F G H J K L` = Do4→Ré5),
  rangée du dessus = noires (`Z E · T Y U · O P`, trous entre Mi-Fa et Si-Do).
  Codes : blanches A S D F G H J K L (60,62,64,65,67,69,71,72,74) ;
  noires W E T Y U O P (61,63,66,68,70,73,75). Afficher un badge de la touche PC sur chaque
  touche (toggle ⌨). Réutiliser ce mapping dans les futures leçons.

## Progression prévue (esquisse)
1. ✅ Géographie du clavier + noms des notes (Do Ré Mi) — Leçon 0001.
2. ✅ Triade majeure (Do/Fa/Sol majeur, forme « saute une touche », doigté 1-3-5) — Leçon 0002.
3. ✅ Accord mineur (baisser la tierce d'1/2 ton) + demi-tons/touches noires + Si♭ majeur
   → 4 accords de The Scientist (Ré m – Si♭ – Fa – Do) avec exercice d'enchaînement — Leçon 0003.
4. ✅ Rythme : pulsation, mesure 4/4, tempo, métronome + play-along — Leçon 0004.
5. ✅ Main gauche (basse = fondamentale) + coordination mains ensemble — Leçon 0005.
6. Motif rythmique main droite (croches, le « balancier ») → le vrai feel de The Scientist.
7. Lecture de la portée (clé de Sol), trouver Do central.
8. Arpèges (accords « cassés ») → lien direct vers Interstellar & The Scientist.
