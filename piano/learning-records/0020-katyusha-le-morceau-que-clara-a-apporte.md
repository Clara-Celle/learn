# Katyusha : le premier morceau que Clara apporte elle-même

Août 2026. Clara arrive avec un tutoriel Synthesia, puis une grille Chordify, puis une partition
complète, et demande le fichier MIDI équivalent. **Mission mise à jour** : Katyusha rejoint les
morceaux cibles, à côté de *The Scientist*, *Happy Ending* et *Interstellar*.

## Pourquoi c'est un changement de nature, pas juste un morceau de plus

Les trois morceaux d'origine ont été choisis **par moi**, pour construire une progression. Katyusha,
c'est elle qui l'amène. C'est le premier signe qu'elle ne consomme plus le cours : elle a une envie,
elle est allée chercher les ressources (vidéo, grille, partition) et elle est revenue avec de quoi
travailler. C'est exactement l'autonomie que `MISSION.md` vise.

Et le morceau tombe pédagogiquement juste :
- **Ré mineur** — la tonalité qu'elle vient de travailler.
- **2/4** — sa première mesure qui n'est pas à 4 temps.
- **La7** — son premier accord à **quatre** notes.
- **Accords barrés** (`Solm/Ré`, `Rem/La`) — la notation des renversements dans la vraie vie,
  deux jours après la leçon sur les renversements. Elle a reconnu le lien toute seule.

## Ce qui a été livré, et ce qui ne l'a pas été

Livré : `midi/katyusha-accompagnement-{60,84}bpm.mid` — **basse + accords, deux pistes**, 2/4.
`tools/make-midi.py` sait désormais écrire une signature rythmique autre que 4/4 (paramètre `sig`).

**Pas livré : la mélodie.** Blanter est mort en 1990, l'œuvre n'est pas dans le domaine public — on
ne transcrit pas le thème. La grille d'accords, elle, est de l'information harmonique et ne pose pas
le même problème. Position à tenir si la demande revient.

## La conséquence, et c'est la vraie leçon

Clara a répondu : « c'est inutilisable tant que j'ai pas la mélodie ».

**Elle a raison, et son blocage est exactement le dernier point non couvert de la mission.** Elle a
la partition sous les yeux. La mélodie n'est pas manquante — elle est illisible pour elle. Le seul
point de `MISSION.md` qui n'avait ni leçon ni ressource (« lire une partition simple ») vient de
cesser d'être un objectif lointain pour devenir **le mur qui la bloque sur un morceau qu'elle veut
jouer maintenant**.

C'est la meilleure configuration possible pour l'enseigner : la motivation est là, le matériel est
là, et l'utilité est immédiate au lieu d'être promise. La prochaine leçon est donc la **lecture de la
portée**, construite sur sa propre partition de Katyusha — et pas sur un exercice abstrait.

⚠️ Corollaire à ne pas rater : tant que la lecture n'est pas acquise, **ne pas lui fournir la
mélodie par un autre canal**. Ce serait retirer précisément la difficulté désirable qui rend la
leçon utile. Le contournement pratique (saisir la mélodie dans MuseScore depuis sa partition, puis
exporter en MIDI) est acceptable parce qu'il **passe par la lecture** au lieu de l'éviter.
