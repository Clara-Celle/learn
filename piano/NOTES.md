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
  - Le ghosting du clavier PC et l'astuce « deux surfaces » sont désormais **inutiles** — les deux
    mains sur un seul vrai clavier, autant de notes qu'elle veut. **`lessons/bass-pad.html` supprimé
    (août 2026, décision de Clara)** ; les deux leçons qui y renvoyaient sont nettoyées, et la
    justification « les claviers PC ne gèrent pas 4 touches » de la leçon main gauche est remplacée
    par la vraie raison (autonomie des deux mains). Le bouton « Tu joues » reste, lui est utile.
- **`lib/sheet.css`** = style commun des fiches `reference/*.html` (écran + impression).
  Les schémas propres à une fiche restent en `<style>` local.
- **`reference/glossaire.html` (août 2026)** = le vocabulaire du cours, 29 entrées, en solfège.
  **Une fois créé, un glossaire fait autorité** : tout mot employé dans une leçon doit y figurer avec
  ce sens-là. Contient le piège « noire (durée) ≠ touche noire », et la table lettres → solfège pour
  décoder une grille pop. Y ajouter tout mot que Clara signale comme flou.
- **La liste des fiches vit dans le tableau `REFS` de `lib/nav.js`** (comme `LESSONS` pour l'ordre).
  Elle alimente **le sommaire ET la page d'accueil** — avant, les deux listaient les fiches
  séparément et deux fiches n'apparaissaient nulle part. Ajouter une fiche = une ligne dans `REFS`.
  `selftest.js` vérifie que chaque fiche listée existe.
- **1re session sur vrai clavier prévue : rejouer The Scientist en entier**, pour transférer
  l'acquis du clavier PC vers un vrai toucher.

## Morceaux cibles (le « pourquoi »)
1. The Scientist — Coldplay (accords Dm – Bb – F – C). Le plus accessible → bon 1er objectif.
2. Happy Ending — Mika (ballade piano, accords).
3. Interstellar Main Theme — Hans Zimmer (arpège iconique).
4. **Katyusha — Blanter (ajouté août 2026, apporté par Clara).** Ré mineur, **2/4**, accords
   Ré m – Sol m – La7. Premier morceau qu'elle amène elle-même, et premier accord à **4 notes**.
   ⚠️ **Mélodie non fournie et à ne pas fournir** : œuvre protégée (Blanter †1990), et surtout
   c'est le blocage qui motive la leçon de lecture de portée (learning-record 0020).
   `midi/katyusha-accompagnement-*.mid` = basse + accords seulement.

## Pédagogie
- Une leçon = UNE chose, gain rapide et tangible, boucle de feedback serrée.
- **⚠️ Compter les tâches simultanées, pas seulement les notions.** Une leçon peut n'enseigner
  qu'une notion et rester injouable si l'exercice exige 3 gestes non automatiques en même temps
  (rythme + notes + anticipation = la leçon 8). Quand Clara dit « je n'arrive pas à me concentrer »,
  **compter d'abord ce que l'exercice lui demande de tenir à la fois** : c'est presque toujours de la
  surcharge, jamais de l'attention. Le remède est un **palier qui retire une variable**, pas un
  encouragement. Voir aussi le bouton « Tu joues » de la leçon main gauche, même principe.
- **⚠️ Réduire une DIMENSION, jamais retirer la tâche.** Règle unique derrière les deux corrections
  d'août 2026 (leçon 8 : paliers d'accords ; leçon 10 : deux mains). Pour le rythme on raccourcit
  le nombre d'accords ; pour les deux mains on raccourcit la **longueur** et le **tempo** — mais on
  garde **les deux mains**, parce que l'entraînement à une main **ne se transfère pas** (record 0021,
  Yokoi et al. 2017). Retirer la tâche entraîne autre chose que ce qu'on veut.
- **Sources de recherche : toujours vérifier avant d'écrire une leçon de méthode.** La leçon 10
  contredit le conseil universel (« mains séparées puis on réunit ») sur la foi de trois études
  citées et liées dans la page. Citer, et **dire quand on n'a lu que le résumé**.
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
- **`piano.held()`** = les touches **physiquement enfoncées** (souris ou MIDI), lues depuis `.pk-press`.
  ⚠️ **Une touche tenue ne renvoie jamais un second `onNote`.** Tout exercice qui compte des note-on
  pour valider un accord est donc faux dès que la cible change pendant que les doigts sont posés :
  les notes déjà tenues ne peuvent plus jamais être comptées. Les leçons « accord mineur » et
  « renversements » avaient ce bug (août 2026). **Toute nouvelle détection d'accord doit partir de
  `held()`, pas seulement des `onNote`.**
- **⛔ Ne jamais exiger un ORDRE de notes dans un accord.** Quand Clara plaque les 3 notes d'un bloc —
  ce que la leçon « un accord d'un seul bloc » lui apprend justement à faire — les messages MIDI
  arrivent dans l'ordre où les doigts touchent, donc **imprévisible**. La leçon majeur/mineur exigeait
  bas→haut : un bloc correct était compté faux une fois sur deux. Elle accepte maintenant les deux
  (l'ordre reste la voie guidée, le bloc est validé via `held()`).
- **⛔ Ne pas rejouer l'accord après une réussite.** Les touches sont encore enfoncées et sonnent ;
  un `playChord` par-dessus s'entend comme un écho parasite (signalé par Clara). Retiré des leçons
  majeur/mineur, accord mineur et bonus. Le bouton 🔊 Écouter suffit.
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
   ⚠️ Accepte l'accord **plaqué d'un bloc** via `held()` : exiger un ordre était un bug.
5. **Les renversements** ← remonté de la 7e place (août 2026, décision de Clara : « les accords
   finaux dès le début »). Elle **introduit Si♭ majeur** elle-même (§2), sinon la leçon parlerait
   d'un accord jamais présenté. 3 modes : ① Découvrir (Do) · ② Écoute le Si♭ (ses 3 hauteurs,
   comparaison à l'oreille) · ③ Le cycle (mesure les demi-tons parcourus).
6. Accord mineur & The Scientist — **voicings liés** (Si♭ = Ré·Fa·Si♭, Fa = Do·Fa·La)
7. Un accord d'un seul bloc — **voicings liés**
8. Le rythme — tableau de bord « À jouer / Tu as joué » (chips ✓ vert, ✗ rouge).
   ⚠️ **Bouton 🎹 Accords à TROIS paliers** (OFF → 1 seul accord → progression), pas un
   interrupteur. Clara : « j'ai du mal à me concentrer sur le rythme et les accords en même
   temps » — c'était une **surcharge de mémoire de travail**, pas un défaut d'attention.
   Trois tâches non automatiques d'un coup. Le palier « 1 seul » retire la variable inutile
   au travail du rythme. Consigne écrite dans la leçon : **rester à un palier jusqu'à ce qu'il
   soit ennuyeux** — l'ennui signale l'automatisation.
9. La main gauche : la basse
10. **Les deux mains : pourquoi ça coince** ← inséré (août 2026, demandé par Clara « je galère »).
    Adossée à trois études (record 0021). Thèse : **« mains séparées » ne transfère PAS** au jeu à
    deux mains (Yokoi et al. 2017), et c'est **la main gauche** qui se dégrade, chez les experts
    aussi (van Vugt & Altenmüller 2019). Mesure inédite dans le cours : **l'écart en ms entre les
    deux mains, avec le signe** — donc laquelle traîne.
11. Le balancier (croches)
12. The Scientist : assemblage
★ Bonus Canon de Pachelbel

**⚠️ La position fondamentale ne survit que là où on la CONSTRUIT** (leçon majeur/mineur : compter
4+3 depuis la fondamentale l'exige). Partout où Clara *joue*, ce sont les voicings liés. Ne pas
« réharmoniser » la leçon majeur/mineur : elle enseigne la théorie, pas le doigté final.

### ⚠️ AVANT DE DIRE QUE C'EST FINI : `node lib/selftest.js`
Vérifier la **syntaxe** (`new Function`) NE SUFFIT PAS. Une variable supprimée par erreur ne casse
qu'à l'exécution — et comme `mountControls()` est appelé au début de chaque leçon, **une seule
erreur y tue tout le script de la page** : le clavier s'affiche, les exercices disparaissent.
C'est exactement le bug de juillet 2026 (la suppression du clavier d'ordinateur a emporté le bloc
Web MIDI). `lib/selftest.js` exécute les libs sur un faux DOM et l'attrape en 200 ms.

### Vérifications à relancer après tout renommage/réordonnancement
- Le vérificateur de liens (script node jetable, cf. learning-record 0015) — **92 liens internes,
  0 cassé** au dernier passage (août 2026, après suppression de `bass-pad.html`).
- **`grep -rn "\bL[0-9]\b" lessons/*.html reference/*.html index.html`** → doit ne rien renvoyer.
  Les ancrages `data-lnum` ne sont pas le seul endroit où un numéro peut se cacher : quatre `L7`/`L8`/`L9`
  vivaient dans la **prose** et sont devenus faux à l'insertion de la leçon majeur/mineur (record 0019).
- `lib/test-midi.html` : auto-tests MIDI **+ auto-tests du composant et de l'ordre**.

### Fichiers MIDI pour Synthesia — `python3 tools/make-midi.py` → `midi/`
Générateur **sans dépendance** (format MIDI écrit à la main, ~60 lignes) qui **se relit lui-même**
après écriture (`verify()`) : un fichier binaire non revérifié est un fichier que Synthesia refuse.
Sortie : SMF **format 1, deux pistes nommées « Main droite » / « Main gauche »** (canaux 0 et 1) —
c'est ainsi que Synthesia sépare les mains.
⚠️ **Les notes sont dupliquées depuis les leçons.** Si un voicing change dans une leçon, le corriger
aussi dans `tools/make-midi.py` puis relancer. (Source unique impossible sans build : les leçons
sont du JS dans du HTML.)

**Couverture (août 2026) : les 11 leçons + le bonus + Katyusha ont chacun leur fichier.** La table
`PAR_LECON` fait le lien et **échoue à la génération** si elle cite un fichier qui n'existe pas, ou
signale les fichiers rattachés à aucune leçon. La leçon « un accord d'un seul bloc » réutilise
volontairement le fichier des renversements : même matière, pas de doublon.

**Fichiers préfixés `01-` … `11-`** (Synthesia trie par nom → la liste sort dans l'ordre du cours).
⚠️ **Le préfixe est CALCULÉ** depuis la position dans `PAR_LECON`, jamais écrit à la main — même
principe que le tableau `LESSONS` de `nav.js`. Réordonner = déplacer une ligne, les fichiers se
renomment seuls. Les noms de base dans `PAR_LECON` s'écrivent **sans numéro**. Bonus et Katyusha
sont hors numérotation (entrées à 3 éléments) et gardent leur nom.
Le générateur **supprime les `.mid` de `midi/` qu'il n'a pas écrits** — sans ça, un renommage
laisserait deux jeux de fichiers dans Synthesia. Ne rien déposer à la main dans `midi/`.
Un numéro peut manquer dans la liste (07 réutilise le fichier 05) : c'est normal, pas un oubli.

**Doigtés → `midi/doigtes.md`, généré.** MIDI n'a aucun champ pour le doigté. Synthesia les lit dans
un fichier **`.synthesia` séparé** ([doc](https://github.com/Synthesia-LLC/metadata-editor/wiki/Finger-Hints)) :
`1`-`5` = main gauche doigts 1-5, `67890` = main droite doigts 1-5, `-` = rien. On **ne fabrique pas
ce conteneur XML** (schéma non vérifié) : on écrit la chaîne à coller dans l'éditeur de métadonnées,
plus un tableau lisible. ⚠️ L'ordre des notes supposé (temps croissant, puis grave→aigu) n'a pas été
vérifié dans Synthesia — à confirmer au premier essai de Clara.
Les doigtés d'accords viennent de `doigte_triade()`, **même règle que `piano.guide()`** (≤ quinte →
1-3-5, plus large → 1-2-5) : si la règle change dans `piano.js`, la changer ici aussi.

### Suite
- **Où elle en est (août 2026)** : a passé le bloc harmonie (majeur/mineur, renversements, accord
  mineur) et travaille **le rythme** — d'où les trois paliers du bouton Accords (record 0018 bis,
  commit `bafdb2e`). Elle a apporté **Katyusha** elle-même et bute sur sa mélodie, qu'elle ne sait
  pas lire.
- **➡️ PROCHAINE LEÇON : la lecture de la portée (clé de Sol), construite sur SA partition de
  Katyusha** — pas sur un exercice abstrait. C'est le dernier point de `MISSION.md` sans leçon, et
  il vient de devenir le mur qui la bloque sur un morceau qu'elle veut jouer maintenant.
  ⚠️ **Ne pas lui donner la mélodie de Katyusha par un autre canal** tant que la lecture n'est pas
  acquise : ce serait retirer la difficulté désirable qui rend la leçon utile (record 0020).
- **✅ Chasse aux raccourcis non datés faite (août 2026, record 0018).** `grep -rniE "pour l'instant|
  plus tard|retiens juste|contente-toi|en gros|à ce stade"` sur `lessons/` + `reference/` → 6 hits,
  **un seul vrai défaut** : `keyboard-map.html` disait les touches noires « étudiées plus tard » alors
  que Clara joue du Si♭ depuis la leçon de l'accord mineur. Corrigé. Les autres sont datés (ils
  pointent une leçon) ou bornés par la mission (le diminué, hors programme assumé). **Relancer ce grep
  après chaque nouvelle leçon.**
- **Rejouer The Scientist en entier au vrai clavier, avec le doigté** (test de transfert).
- Au choix : fignoler The Scientist (accord cassé + mélodie) OU démarrer **Interstellar**
  (arpèges en La mineur — le passage du pouce est le prérequis, désormais couvert). Demander à Clara.
- Lecture de la portée (clé de Sol), trouver Do central.
- **✅ Voicings tranchés (août 2026, cf. learning-record 0019).** Coupure **à la leçon des
  renversements**, qui est désormais 5<sup>e</sup> : *avant* elle (majeur ou mineur, qui CONSTRUIT
  l'accord en comptant 4+3) → position fondamentale, c'est le bon stade ; *après* elle (accord
  mineur, un accord d'un seul bloc, rythme, main gauche, balancier, assemblage) → **voicings liés**,
  Si♭ = [62,65,70] (Ré·Fa·Si♭), Fa = [60,65,69] (Do·Fa·La). 12 demi-tons par tour au lieu de 36.
  Sinon le cours enseigne l'économie de mouvement puis fait pratiquer les sauts. `tools/make-midi.py`
  (`SCI`) mis à jour et relancé. Ne pas « réharmoniser » les leçons d'avant : la différence est
  voulue.
- **Travail restant (non bloquant) :** migrer vers `Exercise` les 7 leçons encore bespoke.
