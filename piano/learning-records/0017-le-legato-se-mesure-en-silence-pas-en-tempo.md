# Le legato se mesure en silence, pas en tempo

Clara, sur la leçon du passage du pouce : « j'ai l'impression d'avoir un peu le mouvement, mais
l'objectif de moins de 150 ms est vraiment très dur à atteindre ».

**Ce n'était pas elle. L'exercice était injouable.**

## Le bug

La leçon annonçait mesurer « le silence entre le Mi et le Fa ». Elle mesurait en réalité
l'intervalle **début de note → début de note** :

```js
if(pos===dir.pivot && tPrev!=null) gapMs=Math.round(now-tPrev);
tPrev=now;                                    // ← tPrev = un ENFONCEMENT, pas un relâchement
```

Cet intervalle, c'est le **tempo**. À une noire par seconde — une vitesse d'apprentissage normale —
il vaut 1000 ms, quel que soit le legato. Passer sous 150 ms aurait demandé de jouer la gamme à
~400 à la noire. Le chiffre affiché ne récompensait donc pas la liaison : il récompensait la
précipitation, exactement le contraire de la consigne écrite trois lignes plus bas
(« ralentis jusqu'à ce que la jointure disparaisse, *puis* accélère »).

## La correction

Le legato est un intervalle **relâché → enfoncé**. Il fallait donc les note-off, que
`lib/piano.js` consommait sans jamais les remonter : `release()` appelait `noteOff()` (le son) et
rien d'autre. Ajout symétrique de `onNote` :

```js
var onRelease=opts.onRelease||function(){};
function release(el){ … noteOff(midi); onRelease(midi,el); }
```

La leçon retient l'instant de relâchement de la dernière note correcte, et au pivot :

```js
if(pos===dir.pivot && lastNote!=null) gapMs=(lastOff==null)?-1:Math.round(now-lastOff);
```

`lastOff==null` = la note précédente **sonne encore** au moment du pivot → chevauchement, liaison
parfaite. C'est la vraie cible d'un pianiste, et elle est atteignable à n'importe quelle vitesse.

Seuils : chevauchement ou < 30 ms → lié · 30-120 ms → ça s'entend · > 120 ms → la main a sauté.
Les anciens (60 / 150) sont morts avec l'ancienne grandeur mesurée — ils chiffraient autre chose.
La fiche `reference/position-des-doigts.html` suivait le même chiffre, corrigée aussi.

## Ce qu'il faut retenir pour les prochaines leçons

**Un proxy objectif mal choisi est pire que pas de proxy.** La philosophie « mesurer ce que
l'oreille débutante ne sait pas juger » ([[0013-reordonnancement-du-cours-piano-des-le-debut]],
[[0014-renversements-economie-de-mouvement]]) reste bonne — mais la grandeur doit être **invariante
par rapport à ce que l'élève a le droit de faire varier**. Ici il a le droit de choisir son tempo,
donc la mesure ne devait pas dépendre du tempo. Un chiffre qui bouge quand l'élève fait la bonne
chose (ralentir) lui apprend à faire la mauvaise.

**Test à appliquer à toute future mesure :** si l'élève exécute parfaitement mais lentement, le
chiffre doit-il rester bon ? Si non, on mesure la mauvaise chose.

Ce piège précis a un nom en analyse MIDI : confondre **IOI** (inter-onset interval, un tempo) et
**KOT/gap** (key-overlap time, un legato). Le second peut être **négatif** — et c'est là qu'est la
cible, ce qui explique pourquoi le bug était invisible : personne n'attend une bonne note sous zéro.

## Vérification

- `node lib/selftest.js` → **20 contrôles**, dont un nouveau : « note OFF remonte à la leçon via
  onRelease ». Sans lui, aucune leçon ne peut mesurer un legato.
- Simulation jetable de la gamme dans le faux DOM, horloge injectée : legato lent → `-1`
  (chevauchement) ; trou de 40 / 300 / 10 ms → `40` / `300` / `10`. **La mesure ne dépend plus du
  tempo.** L'ancien code aurait renvoyé 1000 / 1000 / 1000 / 100.
