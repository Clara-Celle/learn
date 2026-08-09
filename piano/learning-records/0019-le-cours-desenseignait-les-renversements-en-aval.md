# Le cours désenseignait les renversements dans les leçons suivantes

Décision de Clara (août 2026), après deux sessions où la question était posée sans réponse :
**aligner les voicings des quatre leçons qui suivent « les renversements » sur la version liée.**
Et, en la creusant, la question s'est révélée n'être pas cosmétique du tout.

## Ce qui était présenté comme une incohérence

Le handoff décrivait ça comme un détail : Si♭ et Fa n'étaient pas empilés pareil entre
« un accord d'un seul bloc »/« assemblage » (`[65,70,74]`, `[65,69,72]`) et « renversements »
(`[62,65,70]`, `[60,65,69]`). Formulé ainsi, ça ressemble à une coquille de copier-coller, et la
réponse évidente est « ne touche à rien, elle a déjà pratiqué ».

## Ce que c'était vraiment

En regardant l'ordre du cours, les cinq fichiers concernés ne sont pas au même endroit :

| Leçon | Position | Voicing |
|---|---|---|
| un accord d'un seul bloc | 6 | bloc |
| **les renversements** | **7** | **lié** |
| le rythme | 8 | bloc |
| la main gauche | 9 | bloc |
| le balancier | 10 | bloc |
| The Scientist : assemblage | 11 | bloc |

La leçon « renversements » se termine littéralement par « Rejoue maintenant *The Scientist* avec ces
renversements », et elle chiffre son propre argument : 12 demi-tons par tour contre 52 en position
fondamentale partout. **Puis les quatre leçons suivantes la contredisent en silence.** Le cycle
qu'elles faisaient jouer coûte 36 demi-tons — mesuré, pas estimé.

Autrement dit : le cours enseignait l'économie de mouvement, puis faisait pratiquer les sauts
pendant quatre leçons, jusqu'à l'assemblage final — celui qui reste dans les doigts.

## La leçon

**Une incohérence de données entre deux leçons n'est cosmétique que si les deux leçons sont au même
endroit de la progression.** Dès qu'il y a un « avant » et un « après », la même différence devient
soit un stade d'apprentissage volontaire, soit un désenseignement. La seule façon de trancher est de
regarder l'ordre dans `lib/nav.js` — pas les fichiers côte à côte.

C'est ce qui a permis de couper proprement : les leçons **avant** les renversements gardent la
position fondamentale (on apprend à empiler avant d'apprendre à économiser), celles **après**
passent au lié. Le coût pour Clara est réel mais borné : deux accords à replacer, et elle s'y est
déjà entraînée dans la leçon des renversements.

## Corollaire méthodologique

Cette question dormait dans le backlog depuis deux sessions parce qu'elle avait été **posée sans être
instruite**. Poser une question à l'élève sur un arbitrage qu'on n'a pas soi-même analysé, c'est lui
demander de faire le travail de prof. Elle a répondu « donne-moi plus d'info » — la bonne réponse.
Réflexe à garder : **instruire l'arbitrage avant de le soumettre**, avec les chiffres et le coût.

## Au passage

Le même passage a fait tomber trois autres dettes du même type, toutes invisibles tant qu'on ne
lisait pas les fichiers en entier :

- **Quatre numéros de leçon écrits en dur** (`L7`, `L8`, `L9`) dans « assemblage », « balancier » et
  le bonus Pachelbel — tous **devenus faux** depuis l'insertion de la leçon majeur/mineur en
  position 4. Exactement la casse que la règle « citer par le nom, jamais par le numéro » existe pour
  éviter. Le `grep` de contrôle documenté dans `NOTES.md` ne cherchait que les ancrages `data-lnum`,
  pas les mentions en prose.
- **Deux justifications périmées du clavier d'ordinateur** dans « la main gauche » (« la plupart des
  claviers PC ne gèrent pas 4 touches », et la liste des raccourcis `S D G H J` / `A Z E R T Y U`),
  survivantes de la suppression de juillet 2026 parce qu'elles étaient dans de la prose et non dans
  du code.
- `lessons/bass-pad.html` supprimé (décision de Clara), avec ses deux liens entrants.

Toutes du même genre : **du texte que la suppression d'une fonctionnalité laisse derrière elle.**
Supprimer du code se vérifie (`selftest`) ; supprimer la prose qui le justifiait ne se vérifie pas.
