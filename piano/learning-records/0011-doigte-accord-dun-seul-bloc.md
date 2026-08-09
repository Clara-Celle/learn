# Leçon 08 livrée : le doigté, mesuré par le vrai clavier

Première leçon **rendue possible par l'instrument** (cf. [[0010-clavier-branche-web-midi]]).
Le doigté était explicitement hors de portée depuis le début : le clavier PC a une disposition
décalée, non transférable ([[0001-point-de-depart]]). Verrou levé.

## Le choix pédagogique : mesurer ce que l'oreille d'une débutante ne sait pas juger

Une appli **ne peut pas voir quels doigts** Clara utilise. Plutôt que de faire semblant, la leçon
mesure deux **proxys objectifs** que seul le MIDI fournit :

1. **L'écart de temps** entre la 1re et la dernière note d'un accord (< 40 ms = « d'un seul bloc »,
   > 90 ms = « tu arpèges »). Une main mal formée *ne peut pas* faire tomber 3 notes ensemble →
   l'écart mesure indirectement la forme de la main.
2. **L'écart de vélocité** entre les 3 doigts, avec désignation du plus faible (presque toujours
   le 5). Rend visible une faiblesse réelle et rassurante à nommer.

La leçon **dit explicitement ce qu'elle ne voit pas** (position du poignet, doigts à plat) et
renvoie vers deux boucles hors-machine : se filmer 30 s au téléphone, et poster sur
[r/pianolearning](https://www.reddit.com/r/pianolearning/).

## Difficulté désirable

- L'accord est **nommé, pas montré** → rappel en mémoire, pas reconnaissance.
- **« 👁 Montre-moi » remet la série à zéro** : regarder a un coût explicite.
- **Interleaving** : les 4 accords de *The Scientist* tirés au hasard, jamais deux fois de suite.
- Objectif : 5 blocs d'affilée → renvoi vers la Leçon 07 pour rejouer le morceau avec les bons doigts.

## Contenu enseigné

Numérotation 1-5 (pouce = 1 **aux deux mains**), doigté **1-3-5** pour une triade en position
fondamentale, **5** à la main gauche pour la basse, forme de main courbée / poignet à niveau.
**Exception assumée : Si♭ se joue 1-2-5** dans le voicing du cours ([65,70,74] = un renversement,
intervalle plus large). Signalé sans introduire la théorie des renversements — à traiter plus tard.

Source primaire : [Hoffman Academy — Finger Numbers, leçon 16](https://app.hoffmanacademy.com/lessons/piano/finger-numbers/video/)
(+ fiche PDF gratuite).

## Technique (pour les prochaines leçons)

- **La vélocité traverse maintenant la lib** : `onNote(midi, el, {velocity, source})`, et le volume
  de synthèse suit la force de frappe → les nuances sont enfin *audibles*. Test de non-régression
  ajouté dans `lib/test-midi.html`.
- **`lib/lesson.css`** = coquille commune des leçons, extraite du bloc dupliqué dans 01→07.
  Les anciennes leçons gardent leur style inline (elles marchent, on n'y touche pas) ; **toute
  nouvelle leçon doit lier `lesson.css`** et ne garder en local que ce qui lui est propre.

## Suite

**Rejouer *The Scientist* en entier au vrai clavier avec le doigté** — le test de transfert prévu
au record [[0009-achat-premier-clavier-nektar-gxp61]]. Ensuite seulement, trancher la question
laissée ouverte en [[0008-the-scientist-assemblage]] : fignoler le morceau (accord cassé + mélodie)
ou démarrer *Interstellar* (arpèges + bouton Octave, déjà amorcé dans cette leçon).
