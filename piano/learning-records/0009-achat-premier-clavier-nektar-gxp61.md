# Achat du premier clavier : Nektar Impact GXP61 (juillet 2026)

Jeffy a le budget et arrive avec **deux options déjà choisies** : Nektar Impact GXP61 (206 €)
vs Arturia KeyLab Essential 61 mk3 (215 €) — un ami lui avait conseillé le Nektar.

**Constat qui n'était pas dans sa question :** ce sont deux **contrôleurs MIDI**, pas des pianos.
Aucun son, aucun haut-parleur, aucune mécanique à marteaux. Ça contredit la reco de juin 2026
(88 touches lestées slim, cf. [[NOTES.md]]).

**Contraintes clarifiées cette session (elles tranchent) :**
- **Largeur dispo : ~1 m max** → un 88 touches (132 cm) ne rentre pas. Casio CDP-S110 (299 €) et
  Roland FP-10 (398 €) sont écartés **par la place, pas par le prix**.
- **Budget : ~200 €.**

**Décision : Nektar Impact GXP61.** Motifs, par ordre de poids :
1. **Semi-lesté** (+ aftertouch) vs synth-action chez Arturia → meilleur toucher des deux pour du piano.
2. **2 entrées sustain + 1 expression** vs 1 jack → la pédale est déjà dans la pédagogie (Leçon 07).
3. Les faders/potards/pads/arpégiateur de l'Arturia servent à produire, pas à apprendre.
   (L'Arturia gagne sur le bundle logiciel — UVI Model D — mais un bon piano gratuit existe.)

**Piège relevé : la pédale de sustain n'est pas fournie** (boîte = clavier + câble USB + Cubase LE
+ Retrologue). → ajouter **Nektar NP-2, 17,90 €**, polarité commutable. Total ~224 €.

**Conséquences pédagogiques :**
- **Le plan Web MIDI devient actionnable** → il faudra un petit serveur `localhost` pour brancher
  les leçons sur le vrai clavier (contexte sécurisé exigé par le navigateur).
- **Son : Splice INSTRUMENT (ex-Spitfire LABS), gratuit, mode autonome sans DAW**, preset
  *Soft Piano* — timbre feutré très proche de *The Scientist*. Route « je m'assois et je joue ».
  Attention latence → ASIO4ALL si ça traîne sous Windows.
- **Attente à cadrer :** pas de marteaux → la force de doigts et les nuances ne se travailleront
  que partiellement. À lui redire quand il touchera un vrai piano, pour qu'il ne lise pas ça
  comme une régression.
- **61 touches** : OK pour *The Scientist* et *Happy Ending* ; pour *Interstellar*, prévoir
  d'enseigner le **bouton Octave** pour atteindre les graves.

**Upgrade futur** (quand la place ou le toucher deviennent limitants) : Casio CDP-S110 → Roland FP-10.
Le GXP61 restera utile comme clavier maître.

Fiche livrée : [reference/premier-clavier-et-branchement.html](../reference/premier-clavier-et-branchement.html)
(comparatif, checklist de déballage, réglage de la pédale). Voir aussi [[MISSION.md]].

**Suite :** la question ouverte du record [[0008-the-scientist-assemblage]] reste entière —
fignoler *The Scientist* ou démarrer *Interstellar*. À reprendre quand le clavier sera livré :
la première session sur vrai instrument devrait être **The Scientist rejoué en entier**, pour
transférer l'acquis du clavier PC vers un vrai toucher.
