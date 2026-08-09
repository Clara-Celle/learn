# Notes de travail — préférences & contexte

## Langue & notation
- **Communiquer en français.** Clara a formulé sa demande en français.
- **Solfège UNIQUEMENT (Do Ré Mi).** Clara a explicitement dit ne pas vouloir des lettres
  américaines (C D E) si elle peut s'en passer. → Système principal = Do Ré Mi partout.
  Les lettres restent disponibles seulement en aside « pour info » / toggle optionnel.
  Quand un tuto pop écrit un accord en lettres (Dm, F, C…), **c'est le prof qui traduit**
  en solfège (« Ré mineur », « Fa majeur », « Do majeur »).

## Contexte apprenant
- Débutante **complète** (aucun instrument joué auparavant, ne lit pas la musique).
- **Pas de piano/clavier physique** pour l'instant → pratique sur piano virtuel en ligne
  ([virtualpiano.net](https://virtualpiano.net/), [pianist.me](https://pianist.me/)).
- **Décision (juin 2026) : on continue SANS achat pour l'instant.** Clara a buté sur le
  placement des doigts au clavier PC (normal : disposition décalée, non transférable). Lui ai
  expliqué que le clavier PC sert au SAVOIR, pas à la TECHNIQUE.
- **✅ ACHAT ARBITRÉ (juillet 2026) : Nektar Impact GXP61** (206 €, B-stock 189 €)
  **+ pédale Nektar NP-2** (17,90 €, non fournie !). Contraintes chiffrées enfin connues :
  **largeur dispo ~1 m max** et **budget ~200 €** → les 88 touches lestés (Casio CDP-S110 299 €,
  Roland FP-10 398 €, tous ~132 cm) sont écartés **par la place**, pas par le prix.
  Choisi contre l'Arturia KeyLab Essential 61 mk3 : semi-lesté > synth-action, 2 entrées sustain
  + 1 expression > 1 jack. Détails → `reference/premier-clavier-et-branchement.html`.
- **⚠️ C'est un contrôleur MIDI : aucun son ni haut-parleur, pas de marteaux.**
  - Son recommandé : **Splice INSTRUMENT (ex-Spitfire LABS), gratuit, mode AUTONOME sans DAW**,
    preset *Soft Piano* (timbre feutré ≈ The Scientist). Cubase LE fourni mais plus lourd.
  - Latence > 20 ms sous Windows → **ASIO4ALL**.
  - **Cadrer l'attente :** toucher semi-lesté ≠ marteaux. Force de doigts et nuances ne se
    travaillent que partiellement ; un vrai piano lui paraîtra lourd → le lui redire à ce
    moment-là pour qu'elle ne le lise pas comme une régression.
  - **61 touches** : OK pour The Scientist / Happy Ending. Pour **Interstellar**, enseigner le
    **bouton Octave** pour atteindre les graves.
- **✅ WEB MIDI LIVRÉ (juillet 2026) — le clavier est reçu et branché.**
  - **`./serve.sh`** = `python3 -m http.server 8000` (stdlib, rien à installer). **Obligatoire** :
    le navigateur refuse le MIDI en `file://`. Tout se fait via **http://localhost:8000/**.
  - **Le MIDI est dans `lib/piano.js`, pas dans les leçons.** Les messages entrants passent par
    le MÊME `press()`/`release()` que la souris et le clavier PC → **les 9 leçons ont réagi au
    vrai piano sans être modifiées**. Ne pas dupliquer de code MIDI dans une leçon.
    Note ON/OFF (0x90/0x80, vélocité 0 = OFF) + **pédale = CC64** → `pedalMidi`, 3e source de
    pédale à côté du bouton et de la barre Espace.
  - **Témoin 🎹 ajouté à `mountControls`** : affiche le nom du clavier détecté, ou le message
    d'aide qui va bien (hors plage / pas en localhost / son à débloquer).
  - **Diagnostic : `lib/test-midi.html`** — journal des messages bruts + auto-test qui injecte
    de faux messages via `api.midiMessage(bytes)`. À lui faire ouvrir si « ça ne marche pas ».
  - **⚠️ Piège du son :** le navigateur ne démarre l'audio qu'après un **geste utilisateur** ;
    un message MIDI n'en est pas un → il faut **cliquer une fois sur la page**. Géré par un
    message dans le témoin, mais à redire de vive voix.
  - **⚠️ Plage :** les leçons affichent Do3→Do6 (MIDI 48-84), le GXP61 va de Do2 à Do7.
    Les notes hors plage sont ignorées (message dans le témoin) → **lui apprendre le bouton
    Octave**, ce qui servira aussi pour les graves d'*Interstellar*.
  - Le ghosting du clavier PC et l'astuce « deux surfaces » (bass-pad mobile) sont désormais
    **inutiles** — les deux mains sur un seul vrai clavier, autant de notes qu'elle veut.
- **`lib/sheet.css`** = style commun des fiches `reference/*.html` (écran + impression).
  Les schémas propres à une fiche restent en `<style>` local.
- **1re session sur vrai clavier prévue : rejouer The Scientist en entier**, pour transférer
  l'acquis du clavier PC vers un vrai toucher.

## Morceaux cibles (le « pourquoi »)
1. The Scientist — Coldplay (accords Dm – Bb – F – C). Le plus accessible → bon 1er objectif.
2. Happy Ending — Mika (ballade piano, accords).
3. Interstellar Main Theme — Hans Zimmer (arpège iconique).

## Pédagogie
- Une leçon = UNE chose, gain rapide et tangible, boucle de feedback serrée.
- Privilégier les leçons HTML interactives (clavier cliquable) puisqu'il n'y a pas d'instru.
- Toujours rattacher au moins un morceau cible pour ancrer la théorie.

## Préférences techniques (HTML)
- **⛔ LE CLAVIER D'ORDINATEUR EST SUPPRIMÉ (juillet 2026).** Clara a un vrai piano MIDI : plus de
  mapping AZERTY, plus de badges de touches, plus de bouton « Touches PC », plus de contournement
  du ghosting ni d'astuce « deux surfaces ». Retiré de `piano.js`/`piano.css` et de toutes les
  leçons. **Ne pas le réintroduire.** (La barre Espace reste = pédale : ce n'est pas une note.)
- **Boutons standard, identiques dans TOUTES les leçons** (injectés par `mountControls`) :
  🔊 Son · 🎵 Noms des notes · 🎯 Guide · ✋ Doigtés · 🎶 Pédale · 🎹 témoin MIDI.
  **🎯 Guide** = surlignage des prochaines touches ; **✋ Doigtés** = ronds numérotés dessus.
  Les deux sont de simples classes CSS (`pk-noguide`, `pk-nofing`) → une leçon appelle
  `guide()`/`target()` sans se soucier de l'état choisi par Clara.
- **`onRelease(midi, el)`** (option de `create`, jumelle de `onNote`) : la lib remonte les
  **relâchements**. Indispensable pour toute mesure de **legato**, qui est un intervalle
  relâché→enfoncé. ⚠️ **Ne jamais mesurer une liaison en début→début** : ça mesure le tempo, pas le
  silence, et l'exercice devient injouable si l'élève ralentit (bug corrigé, cf. learning-record 0017).
- **`piano.guide(notes[, doigts])`** = surligne + pose les ronds. **Doigté déduit si omis** :
  triade serrée (≤ quinte) → 1-3-5, plus large (renversement) → 1-2-5. Passer `doigts`
  explicitement pour tout autre cas (gammes, mélodies).
- **Lib piano réutilisable : `lib/piano.css` + `lib/piano.js`** (demandée par Clara). À utiliser
  dans CHAQUE leçon plutôt que de redupliquer le code du clavier. Script classique (marche en
  `file://`), expose `window.PianoKeyboard.create({mount, onNote, octaves, labels, computerKeys…})`.
  API : `playNote/playChord`, `highlight(notes,'pk-target')`, `addClass/removeClass(midi,'pk-ok'/'pk-bad')`,
  `clearClass(...)`, `mountControls(el)` (boutons Son/Noms/Touches), `midiToEl`. Classes CSS préfixées `.pk-`.
  Inclure via `<link href="../lib/piano.css">` et `<script src="../lib/piano.js">`.
  **Les 5 leçons utilisent la lib.** `playChord` joue toutes les notes au MÊME instant via
  l'horloge audio (plus de `setTimeout` → plus d'arpège parasite).
- **Sustain (notes tenues) :** la lib expose `noteOn(midi)` / `noteOff(midi)`. Les appuis
  (souris/tactile via pointerdown/up/leave, clavier via keydown/keyup) tiennent la note tant que
  pressée et la relâchent au lâcher (extinction douce, `cancelAndHoldAtTime` pour éviter le saut de
  volume). `blur` → `releaseAll`. `playNote`/`playChord` restent one-shot (lecture programmée).
- **Pédale de sustain :** `setPedal/togglePedal/isPedal`. Activable par le bouton **🎶 Pédale**
  (ajouté par `mountControls` → présent dans toutes les leçons, verrou ON/OFF) ET par la **barre
  Espace** (momentanée, maintenue = pédale baissée, comme un vrai piano ; gérée globalement dans
  la lib donc marche partout, même sans `computerKeys`). Pédale baissée : le relâchement de touche
  ne coupe plus la note (ajoutée à `pedaled`) ; pédale levée → `stopVoice` sur toutes les `pedaled`.
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

## Progression & architecture du cours (juillet 2026 — grande harmonisation)

### ⚠️ L'ORDRE VIT DANS UN SEUL ENDROIT : le tableau `LESSONS` de `lib/nav.js`
- **Les fichiers n'ont plus de numéro** (`passage-du-pouce.html`, pas `0003-…`).
  **Réordonner = déplacer une ligne du tableau.** Rien d'autre à toucher.
- Les numéros sont **calculés** depuis la position ; le champ `n` n'est jamais écrit à la main.
- Chaque leçon expose des ancrages que `nav.js` remplit :
  `<p class="kicker" data-lnum>`, `<span data-lnum="n">` (forme courte), `<nav data-lprevnext>`,
  et `document.title`. **Aucun numéro n'est écrit en dur dans une page** — vérifié par grep.
- **Règle absolue :** dans le texte d'une leçon, citer une autre leçon **par son nom**, jamais par
  son numéro (« la leçon sur l'accord mineur »), sinon le réordonnancement casse la prose.

### Composant d'exercice : `lib/exercise.js` (+ styles `.ex-*` dans `lesson.css`)
Toujours le même écran, dans le même ordre :
**consigne → contrôles → panneau → indice → clavier (touches à jouer surlignées) → verdict → score.**
API : `prompt / button / target / hit / miss / verdict / measure / streak / panel / showPanel / reset`.
`ex.pianoMount` = où monter le clavier ; `ex.attach(kb)` monte les boutons de la lib.
- **Migrées vers le composant :** cinq-doigts-et-premier-accord, passage-du-pouce,
  accord-dun-seul-bloc, renversements.
- **Pas migrées** (logique bespoke : métronome, frise, play-along) : géographie, accord-mineur,
  rythme, main-gauche, balancier, the-scientist-assemblage, bonus. Elles gardent leur JS mais
  leurs règles CSS de consigne/retour/score ont été **supprimées** → les alias hérités de
  `lesson.css` (`.tprompt`, `.tfeedback`, `.exfeedback`, `.score`…) leur donnent le même rendu.
  Les migrer pour de bon = travail restant, non bloquant.
- **Toute nouvelle leçon utilise `Exercise`.** Inclure : `lesson.css`, `piano.css`,
  `piano.js`, `exercise.js`, `nav.js`.

### Ordre actuel
1. Géographie du clavier
2. **Cinq doigts & ton premier accord** ← fusion demandée par Clara (position de 5 doigts +
   triade majeure). Pont pédagogique : **l'accord = la position, doigts 1-3-5 ensemble**.
   Un seul clavier, 3 modes (jeu des numéros / mélodie / accords).
3. Le passage du pouce
4. **Majeur ou mineur : compte les demi-tons** ← inséré (août 2026). Clara a buté sur « pourquoi
   Ré·Fa·La n'est pas le majeur de Ré ». Cause : la leçon 02 enseignait « saute une touche » comme
   une règle alors que ça ne vaut qu'en Do/Fa/Sol. **Majeur = 4+3, mineur = 3+4, total 7.**
   ⚠️ Seul exercice du cours où le guide ne montre **que la fondamentale** — tout surligner
   donnerait la réponse. Bouton 👀 Montrer en secours (ne compte pas dans la série).
5. Accord mineur & The Scientist
6. Un accord d'un seul bloc
7. Les renversements
8. Le rythme
9. La main gauche : la basse
10. Le balancier (croches)
11. The Scientist : assemblage
★ Bonus Canon de Pachelbel

### ⚠️ AVANT DE DIRE QUE C'EST FINI : `node lib/selftest.js`
Vérifier la **syntaxe** (`new Function`) NE SUFFIT PAS. Une variable supprimée par erreur ne casse
qu'à l'exécution — et comme `mountControls()` est appelé au début de chaque leçon, **une seule
erreur y tue tout le script de la page** : le clavier s'affiche, les exercices disparaissent.
C'est exactement le bug de juillet 2026 (la suppression du clavier d'ordinateur a emporté le bloc
Web MIDI). `lib/selftest.js` exécute les libs sur un faux DOM et l'attrape en 200 ms.

### Vérifications à relancer après tout renommage/réordonnancement
- Le vérificateur de liens (script node jetable, cf. learning-record 0015) — **95 liens** au dernier passage.
- `lib/test-midi.html` : auto-tests MIDI **+ auto-tests du composant et de l'ordre**.

### Fichiers MIDI pour Synthesia — `python3 tools/make-midi.py` → `midi/`
Générateur **sans dépendance** (format MIDI écrit à la main, ~60 lignes) qui **se relit lui-même**
après écriture (`verify()`) : un fichier binaire non revérifié est un fichier que Synthesia refuse.
Sortie : SMF **format 1, deux pistes nommées « Main droite » / « Main gauche »** (canaux 0 et 1) —
c'est ainsi que Synthesia sépare les mains.
⚠️ **Les notes sont dupliquées depuis les leçons.** Si un voicing change dans une leçon, le corriger
aussi dans `tools/make-midi.py` puis relancer. (Source unique impossible sans build : les leçons
sont du JS dans du HTML.)

### Suite
- **Où elle en est (août 2026)** : passage du pouce (le mouvement vient), puis arrivée sur l'accord
  mineur → a buté sur majeur/mineur, d'où la nouvelle leçon « compte les demi-tons » insérée avant.
  Prochaine étape : la faire, puis reprendre « accord mineur & The Scientist » avec la vraie règle.
- **⚠️ Chercher les autres raccourcis non datés** (cf. learning-record 0018) : toute phrase du type
  « pour l'instant, retiens… » sans leçon programmée derrière est une erreur en attente.
- **Rejouer The Scientist en entier au vrai clavier, avec le doigté** (test de transfert).
- Au choix : fignoler The Scientist (accord cassé + mélodie) OU démarrer **Interstellar**
  (arpèges en La mineur — le passage du pouce est le prérequis, désormais couvert). Demander à Clara.
- Lecture de la portée (clé de Sol), trouver Do central.
- **Décision en attente :** harmoniser les voicings d'accords entre la leçon « un accord d'un seul
  bloc »/« assemblage » (Si♭ [65,70,74], Fa [65,69,72]) et la leçon « renversements »
  (Si♭ [62,65,70], Fa [60,65,69]). Question posée à Clara, pas de réponse → on ne touche à rien.
- **Travail restant (non bloquant) :** migrer vers `Exercise` les 7 leçons encore bespoke.
