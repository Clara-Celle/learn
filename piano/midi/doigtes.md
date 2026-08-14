# Doigtés des fichiers MIDI

MIDI **n'a aucun champ pour le doigté** : ce fichier est généré à côté.

- **Le tableau** se lit tel quel — c'est celui des leçons (1 = pouce … 5 = auriculaire).
- **La chaîne Synthesia** se colle dans l'éditeur de métadonnées, qui produit le
  fichier `.synthesia` accompagnant le MIDI. Encodage : `1`-`5` = main **gauche**
  doigts 1-5, `6` `7` `8` `9` `0` = main **droite** doigts 1-5, `-` = pas d'indication.
  ⚠️ L'ordre suppose « par temps croissant, puis grave→aigu » — à vérifier au premier essai.
  Doc : <https://github.com/Synthesia-LLC/metadata-editor/wiki/Finger-Hints>

Régénéré par `python3 tools/make-midi.py`. Ne pas éditer à la main.

## Quel fichier pour quelle leçon

Les fichiers sont préfixés du **numéro de leçon** : Synthesia trie par nom, la liste
sort donc dans l'ordre du cours. Un numéro peut manquer — une leçon qui réutilise le
fichier d'une autre garde le préfixe de la première (07 se travaille avec le fichier 05).
Les préfixes sont **calculés** depuis l'ordre ci-dessous, jamais écrits à la main.

- **01 · Géographie du clavier** — `01-geographie-les-do-et-loctave-60bpm.mid`
- **02 · Cinq doigts & premier accord** — `02-cinq-doigts-au-clair-de-la-lune-70bpm.mid` · `02-premier-accord-do-fa-sol-do-60bpm.mid`
- **03 · Le passage du pouce** — `03-passage-du-pouce-gamme-de-do-60bpm.mid`
- **04 · Majeur ou mineur** — `04-majeur-mineur-les-paires-60bpm.mid`
- **05 · Les renversements** — `05-renversements-les-3-si-bemol-60bpm.mid` · `05-renversements-cycle-lie-60bpm.mid`
- **06 · Accord mineur & The Scientist** — `06-accord-mineur-progression-the-scientist-55bpm.mid`
- **07 · Un accord d'un seul bloc** — `05-renversements-cycle-lie-60bpm.mid`
- **08 · Le rythme** — `08-rythme-accords-en-mesure-50bpm.mid` · `08-rythme-accords-en-mesure-60bpm.mid` · `08-rythme-accords-en-mesure-80bpm.mid`
- **09 · La main gauche : la basse** — `09-main-gauche-basse-et-accords-60bpm.mid`
- **10 · Les deux mains : le protocole** — `10-deux-mains-tres-lent-40bpm.mid`
- **11 · Le balancier (croches)** — `11-balancier-croches-main-droite-60bpm.mid`
- **12 · The Scientist : assemblage** — `12-the-scientist-mains-ensemble-55bpm.mid` · `12-the-scientist-mains-ensemble-75bpm.mid`
- **★ · Bonus : Canon de Pachelbel** — `bonus-pachelbel-progression-60bpm.mid`
- **♪ · Katyusha (morceau cible)** — `katyusha-accompagnement-60bpm.mid` · `katyusha-accompagnement-84bpm.mid`

## 02-cinq-doigts-au-clair-de-la-lune-70bpm.mid
*Au clair de la lune (position de cinq doigts)* — 70 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Do | 1 |
| Ré | 2 |
| Mi | 3 |

Chaîne Synthesia — main droite : `66678768776`

## 03-passage-du-pouce-gamme-de-do-60bpm.mid
*gamme de Do, montée (pouce sous) et descente (3 par-dessus)* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Do | 1 |
| Ré | 2 |
| Mi | 3 |
| Fa | 1 |
| Sol | 2 |
| La | 3 |
| Si | 4 |
| Do | 5 |

Chaîne Synthesia — main droite : `6786789009876876`

## 02-premier-accord-do-fa-sol-do-60bpm.mid
*les trois triades majeures, plaquées* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Do · Mi · Sol | 1 – 3 – 5 |
| Fa · La · Do | 1 – 3 – 5 |
| Sol · Si · Ré | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680680680680`

## 05-renversements-cycle-lie-60bpm.mid
*Ré m → Si♭ → Fa → Do en renversements (la main ne saute pas)* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`

## 08-rythme-accords-en-mesure-50bpm.mid
*un accord sur le temps 1, tenu 4 temps* — 50 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`

## 08-rythme-accords-en-mesure-60bpm.mid
*un accord sur le temps 1, tenu 4 temps* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`

## 08-rythme-accords-en-mesure-80bpm.mid
*un accord sur le temps 1, tenu 4 temps* — 80 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`

## 09-main-gauche-basse-et-accords-60bpm.mid
*basse main gauche sous l'accord main droite* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`
Chaîne Synthesia — main gauche : `55555555`

## 10-deux-mains-tres-lent-40bpm.mid
*basse + accord au même instant, très lent — la coordination avant la vitesse* — 40 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`
Chaîne Synthesia — main gauche : `55555555`

## 11-balancier-croches-main-droite-60bpm.mid
*l'accord répété en croches (8 par mesure)* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680680680680680680680680670670670670670670670670670670670670670670670670680680680680680680680680680680680680680680680680670670670670670670670670670670670670670670670670680680680680680680680680`

## 12-the-scientist-mains-ensemble-55bpm.mid
*balancier en croches + basse — la chanson complète* — 55 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680680680680680680680680670670670670670670670670670670670670670670670670680680680680680680680680680680680680680680680680670670670670670670670670670670670670670670670670680680680680680680680680`
Chaîne Synthesia — main gauche : `55555555`

## 12-the-scientist-mains-ensemble-75bpm.mid
*balancier en croches + basse — la chanson complète* — 75 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680680680680680680680680670670670670670670670670670670670670670670670670680680680680680680680680680680680680680680680680670670670670670670670670670670670670670670670670680680680680680680680680`
Chaîne Synthesia — main gauche : `55555555`

## katyusha-accompagnement-60bpm.mid
*Katyusha — accords + basse seuls (pas la mélodie), 2/4* — 60 BPM, mesure 2/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Sol · Si♭ | 1 – 2 – 5 |
| Do♯ · Sol · La | 1 – 2 – 5 |

Chaîne Synthesia — main droite : `680670680670680680670680670680670680670680670680`
Chaîne Synthesia — main gauche : `5555555555555555`

## katyusha-accompagnement-84bpm.mid
*Katyusha — accords + basse seuls (pas la mélodie), 2/4* — 84 BPM, mesure 2/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Sol · Si♭ | 1 – 2 – 5 |
| Do♯ · Sol · La | 1 – 2 – 5 |

Chaîne Synthesia — main droite : `680670680670680680670680670680670680670680670680`
Chaîne Synthesia — main gauche : `5555555555555555`

## 01-geographie-les-do-et-loctave-60bpm.mid
*les 4 Do repères, puis Do→Do en blanches (passage du pouce sur le Fa)* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Do | — |
| Do | — |
| Do | — |
| Do | — |
| Ré | 2 |
| Mi | 3 |
| Fa | 1 |
| Sol | 2 |
| La | 3 |
| Si | 4 |

Chaîne Synthesia — main droite : `----67867890`

## 04-majeur-mineur-les-paires-60bpm.mid
*majeur puis mineur sur chaque blanche — une seule note change à chaque fois* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Do · Mi · Sol | 1 – 3 – 5 |
| Do · Mi♭ · Sol | 1 – 3 – 5 |
| Ré · Fa♯ · La | 1 – 3 – 5 |
| Ré · Fa · La | 1 – 3 – 5 |
| Mi · La♭ · Si | 1 – 3 – 5 |
| Mi · Sol · Si | 1 – 3 – 5 |
| Fa · La · Do | 1 – 3 – 5 |
| Fa · La♭ · Do | 1 – 3 – 5 |
| Sol · Si · Ré | 1 – 3 – 5 |
| Sol · Si♭ · Ré | 1 – 3 – 5 |
| La · Do♯ · Mi | 1 – 3 – 5 |
| La · Do · Mi | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680680680680680680680680680680680680`

## 05-renversements-les-3-si-bemol-60bpm.mid
*Si♭ fondamentale → 1er renv. → 2e renv. : le même accord, trois hauteurs* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Si♭ · Ré · Fa | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Fa · Si♭ · Ré | 1 – 2 – 5 |

Chaîne Synthesia — main droite : `680670670`

## 06-accord-mineur-progression-the-scientist-55bpm.mid
*Ré m → Si♭ → Fa → Do, accords tenus + basse (voicings liés)* — 55 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa · La | 1 – 3 – 5 |
| Ré · Fa · Si♭ | 1 – 2 – 5 |
| Do · Fa · La | 1 – 2 – 5 |
| Do · Mi · Sol | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680670670680`
Chaîne Synthesia — main gauche : `55555555`

## bonus-pachelbel-progression-60bpm.mid
*la progression du Canon en Ré, accords + basse (2 tours)* — 60 BPM, mesure 4/4

| Notes | Doigts (main droite) |
|---|---|
| Ré · Fa♯ · La | 1 – 3 – 5 |
| Do♯ · Mi · La | 1 – 2 – 5 |
| Ré · Fa♯ · Si | 1 – 2 – 5 |
| Fa♯ · La · Do♯ | 1 – 3 – 5 |
| Sol · Si · Ré | 1 – 3 – 5 |

Chaîne Synthesia — main droite : `680670670680680680680670680670670680680680680670`
Chaîne Synthesia — main gauche : `5555555555555555`
