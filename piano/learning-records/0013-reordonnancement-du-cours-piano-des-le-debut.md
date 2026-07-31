# Réordonnancement du cours : hypothèse « piano dès le premier jour »

Jeffy a demandé un ordre de leçons qui tienne debout **en supposant l'instrument présent dès le
départ**. L'ancien ordre était une **conséquence de la contrainte « pas d'instrument »**
([[0001-point-de-depart]]) : accords d'abord (le clavier PC pouvait les approcher), doigté et jeu
note à note relégués en fin de parcours. Cette contrainte est morte
([[0010-clavier-branche-web-midi]]) — l'ordre devait suivre.

## Nouvel ordre

| # | Leçon | Ancien n° |
|---|---|---|
| 01 | Géographie du clavier | 01 |
| 02 | La position de cinq doigts | 09 |
| 03 | **Le passage du pouce** | *nouveau* |
| 04 | Premier accord (majeur) | 02 |
| 05 | Accord mineur & The Scientist | 03 |
| 06 | Un accord d'un seul bloc | 08 |
| 07 | Le rythme | 04 |
| 08 | La main gauche : la basse | 05 |
| 09 | Le balancier (croches) | 06 |
| 10 | The Scientist : assemblage | 07 |

**Logique :** géographie → corps (doigts, main, déplacement) → harmonie (accords) → temps (rythme,
mains ensemble) → morceau. C'est l'ordre des méthodes classiques : **la mélodie avant les accords**,
parce qu'un doigt par touche est plus simple que trois doigts simultanés.

## Décisions techniques

- **Fichiers renommés**, pas seulement les numéros d'affichage : `NNNN-slug.html` correspond
  désormais au numéro affiché. Un décalage permanent nom/numéro aurait piégé chaque session future.
- **Vérificateur de liens** (script node jetable) passé après le renommage : **84 liens internes
  valides**. À refaire à tout futur renommage.
- **Bug antérieur corrigé** : dans `nav.js`, `HOME`/`HUB` étaient relatifs à la racine alors que
  nav.js est chargé depuis `lessons/` → le lien 🏠 pointait sur `lessons/index.html` (404).
  Corrigés en `../index.html` et `../../index.html`.

## Conséquences de fond (pas seulement de la renumérotation)

Le réordonnancement a créé une **référence en avant** qu'il a fallu résoudre :

- La **forme de la main** (doigts courbés, poignet à niveau) était enseignée dans l'ancienne 08 et
  seulement *citée* par l'ancienne 09. Comme 09 passe devant, le contenu a été **déplacé dans la
  Leçon 02**, et la Leçon 06 le présente désormais comme un **rappel**.
- L'encadré **bouton Octave** a suivi vers la Leçon 02 : c'est maintenant la première leçon jouée
  sur l'instrument réel.

**Règle qui en découle :** un réordonnancement n'est jamais purement mécanique — il faut relire les
renvois entre leçons, une leçon ne pouvant pas s'appuyer sur ce qui vient après elle.

## Nouvelle leçon 03 — Le passage du pouce

Dette annoncée en [[0012-position-de-cinq-doigts]], maintenant payée.

- **Le vrai sujet n'est pas la distance, c'est la continuité** : déplacer la main *pendant* qu'une
  note sonne. La leçon mesure donc le **trou en ms au moment du pivot** (Mi→Fa), pas la justesse
  des notes — < 60 ms = lié, > 150 ms = la main a sauté. Même philosophie que la Leçon 06
  (mesurer un proxy objectif que l'oreille débutante ne sait pas juger).
- Montée (pouce sous, pivot sur le Fa) **et** descente (le 3 passe par-dessus, pivot sur le Mi).
- Ancrage mission : l'arpège d'*Interstellar* est un passage du pouce répété.
- Fiche `reference/position-des-doigts.html` complétée avec le doigté de la gamme de Do.

## Où en est Jeffy

Son avancement **réel** ne change pas : il a déjà fait l'équivalent des leçons 01, 04, 05, 07, 08,
09, 10 (ancienne numérotation 01→07) et assemblé *The Scientist*. Ce qui lui **manque dans le
nouvel ordre**, ce sont précisément **02, 03 et 06** — le bloc « corps » que l'ancien ordre avait
rejeté à la fin. C'est donc son chemin immédiat, et il est cohérent avec le test de transfert
prévu en [[0009-achat-premier-clavier-nektar-gxp61]].
