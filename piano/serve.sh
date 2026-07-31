#!/bin/sh
# Sert le dossier du cours en http://localhost — obligatoire pour le MIDI :
# le navigateur refuse d'ouvrir un clavier USB depuis un fichier file://.
cd "$(dirname "$0")" || exit 1
echo ""
echo "  🎹 Cours de piano  →  http://localhost:8000/"
echo "     (Ctrl+C pour arrêter)"
echo ""
exec python3 -m http.server 8000
