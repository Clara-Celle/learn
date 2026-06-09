# Mes cours

Atelier d'apprentissage personnel : une collection de cours interactifs, construits avec le
skill `/learn`, jouables directement dans le navigateur. Site 100 % statique publié sur
GitHub Pages.

**En ligne :** https://clara-celle.github.io/learn/

## Structure

```
index.html        ← le hub : liste tous les cours
piano/            ← un cours autonome
  index.html      ← page d'accueil du cours
  lessons/*.html  ← les leçons interactives
  lib/            ← assets propres au cours (clavier, sommaire…)
CONTEXT.md        ← glossaire du domaine
```

## Ajouter un cours

Créer son dossier + sa page d'accueil, puis ajouter une entrée au tableau `COURS` dans
`index.html`. (Fait automatiquement à chaque `/learn`.) Tout reste statique : pas de build,
marche aussi en local en ouvrant `index.html`.
