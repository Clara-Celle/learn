#!/usr/bin/env python3
"""
make-midi.py — génère les fichiers MIDI d'entraînement (Synthesia, MidiSheetMusic…).

    python3 tools/make-midi.py          →  écrit dans midi/

Aucune dépendance : le format MIDI est écrit à la main (c'est ~60 lignes).
Les notes viennent des MÊMES données que les leçons — si un voicing change dans
une leçon, le corriger ici aussi, puis relancer.

Sortie : SMF format 1, deux pistes nommées « Main droite » / « Main gauche »
(canaux 0 et 1) — c'est ce que Synthesia lit pour séparer les mains.
"""
import struct, pathlib

TPQ = 480                      # ticks par noire

# ---------- doigtés ----------
# MIDI n'a AUCUN champ pour le doigté. Synthesia les stocke dans un fichier .synthesia
# séparé, avec cet encodage : 1-5 = main GAUCHE doigts 1-5, 6-9 puis 0 = main DROITE
# doigts 1-5, appliqués aux notes dans l'ordre physique de la piste, « - » saute une note.
#   https://github.com/Synthesia-LLC/metadata-editor/wiki/Finger-Hints
# On ne fabrique pas le conteneur XML (format non vérifié) : on écrit la CHAÎNE à coller
# dans l'éditeur de métadonnées, dans midi/doigtes.md, à côté du tableau lisible.
RH = {1: '6', 2: '7', 3: '8', 4: '9', 5: '0'}     # main droite → caractère Synthesia
LH = {1: '1', 2: '2', 3: '3', 4: '4', 5: '5'}     # main gauche → caractère Synthesia
SOLF = ['Do', 'Do♯', 'Ré', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si']


def nom(m):
    return SOLF[m % 12]


def doigte_triade(notes):
    """Même règle que piano.js : triade serrée (≤ quinte) → 1-3-5, plus large → 1-2-5."""
    ecart = max(notes) - min(notes)
    return [1, 3, 5] if ecart <= 7 else [1, 2, 5]


# ---------- écriture MIDI ----------
def vlq(n):
    """Nombre à longueur variable (delta-times MIDI)."""
    out = bytearray([n & 0x7F])
    n >>= 7
    while n:
        out.insert(0, (n & 0x7F) | 0x80)
        n >>= 7
    return bytes(out)


def track(events, name, tempo_bpm=None, first=False, sig=(4, 4)):
    """events = [(tick, status, data1, data2)] ; renvoie un chunk MTrk.
    sig = (numérateur, dénominateur) — 4/4 par défaut, 2/4 pour Katyusha."""
    meta = bytearray()
    meta += b'\x00\xff\x03' + vlq(len(name.encode())) + name.encode()
    if first:
        us = int(60_000_000 / tempo_bpm)
        meta += b'\x00\xff\x51\x03' + struct.pack('>I', us)[1:]
        num, den = sig
        assert den in (2, 4, 8), f'dénominateur non géré : {den}'
        meta += b'\x00\xff\x58\x04' + bytes([num, {2: 1, 4: 2, 8: 3}[den], 0x18, 0x08])

    body = bytearray(meta)
    prev = 0
    # note-off (0x80) avant note-on (0x90) au même tick → pas de note collée
    for tick, status, d1, d2 in sorted(events, key=lambda e: (e[0], e[1])):
        body += vlq(tick - prev) + bytes([status, d1, d2])
        prev = tick
    body += b'\x00\xff\x2f\x00'
    return b'MTrk' + struct.pack('>I', len(body)) + bytes(body)


DOIGTES = []                   # collecté par write(), rendu dans midi/doigtes.md


def _hints(spec, table):
    """Chaîne de doigtés Synthesia pour une piste.
    Ordre supposé : par tick croissant, puis par hauteur croissante dans un accord.
    (« ordre physique des évènements » d'après le wiki — non vérifié dans Synthesia.)"""
    out = []
    for e in sorted(spec, key=lambda e: (e[0], min(e[2]))):
        notes, fg = e[2], (e[4] if len(e) > 4 else None)
        if not fg:
            out.append('-' * len(notes))
        else:
            out.append(''.join(table.get(f, '-') for f in fg))
    return ''.join(out)


def write(path, right, left, bpm, title, sig=(4, 4)):
    """right/left = [(beat_start, beat_len, [notes], velocity[, [doigts]])]
    Les doigts sont parallèles aux notes TRIÉES par hauteur croissante."""
    def to_events(notes_spec, chan):
        ev = []
        for entry in notes_spec:
            start, length, notes, vel = entry[:4]
            t0 = int(round(start * TPQ))
            t1 = int(round((start + length) * TPQ)) - 2      # 2 ticks de respiration
            for n in notes:
                ev.append((t0, 0x90 | chan, n, vel))
                ev.append((max(t1, t0 + 1), 0x80 | chan, n, 0))
        return ev

    chunks = [track(to_events(right, 0), 'Main droite', bpm, first=True, sig=sig)]
    if left:
        chunks.append(track(to_events(left, 1), 'Main gauche'))
    header = b'MThd' + struct.pack('>IHHH', 6, 1, len(chunks), TPQ)
    path.write_bytes(header + b''.join(chunks))
    bars = max([e[0] + e[1] for e in right + left] or [0]) / sig[0]
    n = verify(path)                      # relecture immédiate : pas de fichier douteux livré
    DOIGTES.append({
        'file': path.name, 'title': title, 'bpm': bpm, 'sig': sig,
        'rh': _hints(right, RH), 'lh': _hints(left, LH),
        'notes': [(e[2], e[4] if len(e) > 4 else None) for e in sorted(right, key=lambda e: e[0])],
    })
    print(f'  {path.name:44s} {bpm:3d} BPM  {bars:.0f} mesures  {n:3d} notes  — {title}')


# ---------- relecture : le générateur se vérifie lui-même ----------
def _read_vlq(b, i):
    n = 0
    while True:
        c = b[i]; i += 1; n = (n << 7) | (c & 0x7F)
        if not c & 0x80:
            return n, i


def verify(path):
    """Re-parse le fichier écrit. Écrire du binaire à la main sans le relire,
    c'est expédier un fichier que Synthesia refusera d'ouvrir."""
    b = path.read_bytes()
    assert b[:4] == b'MThd', 'entête MThd manquante'
    hlen, fmt, ntrk, _div = struct.unpack('>IHHH', b[4:14])
    assert hlen == 6 and fmt == 1, f'format inattendu ({fmt})'
    i, total = 14, 0
    for _ in range(ntrk):
        assert b[i:i + 4] == b'MTrk', 'chunk MTrk manquant'
        ln = struct.unpack('>I', b[i + 4:i + 8])[0]
        body = b[i + 8:i + 8 + ln]
        assert len(body) == ln, 'longueur de piste incohérente'
        i += 8 + ln
        j, ons = 0, {}
        while j < len(body):
            _d, j = _read_vlq(body, j)
            st = body[j]
            if st == 0xFF:
                mt = body[j + 1]
                ln2, j2 = _read_vlq(body, j + 2)
                j = j2 + ln2
                if mt == 0x2F:
                    break
            elif st & 0xF0 in (0x80, 0x90):
                n, v = body[j + 1], body[j + 2]
                j += 3
                if st & 0xF0 == 0x90 and v > 0:
                    ons[n] = 1; total += 1
                else:
                    assert n in ons, f'note {n} relâchée sans avoir été jouée'
                    del ons[n]
            else:
                raise AssertionError(f'octet de statut inattendu {st:#x}')
        assert not ons, f'notes jamais relâchées : {sorted(ons)}'
    assert i == len(b), 'octets parasites en fin de fichier'
    return total


# ---------- matériel des leçons ----------
# The Scientist : voicings des leçons « rythme », « main gauche », « assemblage »
SCI = [                                   # (accord main droite, basse main gauche)
    ([62, 65, 69], 50),                   # Ré mineur
    ([62, 65, 70], 58),                   # Si♭ majeur
    ([60, 65, 69], 53),                   # Fa majeur
    ([60, 64, 67], 48),                   # Do majeur
]
# Renversements : le cycle « lié » (12 demi-tons sur un tour)
CYCLE = [[62, 65, 69], [62, 65, 70], [60, 65, 69], [60, 64, 67]]
# Premier accord : Do → Fa → Sol → Do
TRIADES = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]
# Gamme de Do, montée puis descente (leçon du passage du pouce)
GAMME = [60, 62, 64, 65, 67, 69, 71, 72]
# Au clair de la lune, dans la position de cinq doigts
POS = [60, 62, 64, 65, 67]
MEL = [0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0]
MEL_DUR = [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 4]

# ---------- Katyusha (Matveï Blanter, 1938) ----------
# ⚠️ ACCOMPAGNEMENT SEUL. La mélodie n'est pas reproduite ici : l'œuvre n'est pas dans le
# domaine public (Blanter mort en 1990). Ce qui suit est la GRILLE D'ACCORDS relevée sur
# Chordify — une suite d'accords, pas le thème. Clara joue la mélodie d'après sa partition.
# Tonalité : Ré mineur. Mesure : 2/4 (lue sur la partition — 2 temps, pas 4).
# La barre oblique d'un nom d'accord ne change QUE la basse : « Solm/Ré » = Sol mineur, Ré en bas.
KAT = {                                    # nom : (accord main droite, basse main gauche)
    'Rem':     ([62, 65, 69], 50),         # Ré · Fa · La
    'Rem/La':  ([62, 65, 69], 45),         #   même accord, La à la basse
    'Solm':    ([62, 67, 70], 43),         # Ré · Sol · Si♭ — 2e renv., la main ne bouge que de 3 demi-tons
    'Solm/Re': ([62, 67, 70], 50),         #   même accord, Ré à la basse
    'La7':     ([61, 67, 69], 45),         # Do♯ · Sol · La — la quinte (Mi) est omise, doigté tenable
    'La7/Do#': ([61, 67, 69], 49),         #   même accord, Do♯ à la basse
}
# Lecture de la grille Chordify. À corriger si Clara relève autre chose en jouant.
KAT_SEQ = ['Rem', 'Solm', 'Rem', 'La7', 'Rem', 'Rem/La', 'La7', 'Rem',
           'Solm', 'Rem/La', 'Solm/Re', 'Rem/La', 'La7', 'Rem', 'La7', 'Rem']

# ---------- Géographie : les repères ----------
# Les Do du clavier affiché (48-84), puis les 7 blanches d'une octave.
LES_DO = [48, 60, 72, 84]
BLANCHES = [60, 62, 64, 65, 67, 69, 71, 72]

# ---------- Majeur / mineur : la paire, sur chaque fondamentale blanche ----------
# Même palette que la leçon (RACINES du fichier majeur-ou-mineur-*.html).
MAJMIN = [(r, [r, r + 4, r + 7], [r, r + 3, r + 7]) for r in (60, 62, 64, 65, 67, 69)]

# ---------- Renversements : les 3 hauteurs de Si♭ (mode ② de la leçon) ----------
SIB_INV = [[58, 62, 65], [62, 65, 70], [65, 70, 74]]

# ---------- Canon de Pachelbel (domaine public — Pachelbel †1706) ----------
PACH = {
    'D':   ([62, 66, 69], 50), 'A':  ([61, 64, 69], 57), 'Bm': ([62, 66, 71], 59),
    'Fim': ([66, 69, 73], 54), 'G':  ([67, 71, 74], 55),
}
PACH_SEQ = ['D', 'A', 'Bm', 'Fim', 'G', 'D', 'G', 'A']

# Quel fichier pour quelle leçon. Les noms sont écrits SANS numéro : le préfixe « 01- » … « 11- »
# est calculé depuis la position dans cette liste (même principe que le tableau LESSONS de nav.js).
# Réordonner une leçon = déplacer une ligne ici, les fichiers se renomment tout seuls.
# Les entrées à 3 éléments (bonus, morceau cible) sont hors numérotation et gardent leur nom.
PAR_LECON = [
    ('Géographie du clavier',        ['geographie-les-do-et-loctave-60bpm.mid']),
    ('Cinq doigts & premier accord', ['cinq-doigts-au-clair-de-la-lune-70bpm.mid',
                                      'premier-accord-do-fa-sol-do-60bpm.mid']),
    ('Le passage du pouce',          ['passage-du-pouce-gamme-de-do-60bpm.mid']),
    ('Majeur ou mineur',             ['majeur-mineur-les-paires-60bpm.mid']),
    ('Les renversements',            ['renversements-les-3-si-bemol-60bpm.mid',
                                      'renversements-cycle-lie-60bpm.mid']),
    ('Accord mineur & The Scientist', ['accord-mineur-progression-the-scientist-55bpm.mid']),
    ('Un accord d\'un seul bloc',    ['renversements-cycle-lie-60bpm.mid']),   # même matière
    ('Le rythme',                    ['rythme-accords-en-mesure-50bpm.mid',
                                      'rythme-accords-en-mesure-60bpm.mid',
                                      'rythme-accords-en-mesure-80bpm.mid']),
    ('La main gauche : la basse',    ['main-gauche-basse-et-accords-60bpm.mid']),
    ('Le balancier (croches)',       ['balancier-croches-main-droite-60bpm.mid']),
    ('The Scientist : assemblage',   ['the-scientist-mains-ensemble-55bpm.mid',
                                      'the-scientist-mains-ensemble-75bpm.mid']),
    ('Bonus : Canon de Pachelbel',   ['bonus-pachelbel-progression-60bpm.mid'], '★'),
    ('Katyusha (morceau cible)',     ['katyusha-accompagnement-60bpm.mid',
                                      'katyusha-accompagnement-84bpm.mid'], '♪'),
]


def _prefixes():
    """base → « 01 », d'après la position dans PAR_LECON. Un fichier partagé par deux leçons
    garde le préfixe de la PREMIÈRE qui l'utilise (cycle-lie : leçon 05, réutilisé en 07)."""
    m, n = {}, 0
    for e in PAR_LECON:
        if len(e) > 2:                       # hors numérotation : pas de préfixe
            continue
        n += 1
        for base in e[1]:
            m.setdefault(base, f'{n:02d}')
    return m


PREFIXE = _prefixes()


def fic(base):
    """Nom de fichier final, préfixé du numéro de leçon quand il y en a un."""
    p = PREFIXE.get(base)
    return f'{p}-{base}' if p else base


def ecrire_doigtes(out):
    """midi/doigtes.md — le tableau lisible + la chaîne à coller dans l'éditeur Synthesia."""
    L = ['# Doigtés des fichiers MIDI', '',
         'MIDI **n\'a aucun champ pour le doigté** : ce fichier est généré à côté.', '',
         '- **Le tableau** se lit tel quel — c\'est celui des leçons (1 = pouce … 5 = auriculaire).',
         '- **La chaîne Synthesia** se colle dans l\'éditeur de métadonnées, qui produit le',
         '  fichier `.synthesia` accompagnant le MIDI. Encodage : `1`-`5` = main **gauche**',
         '  doigts 1-5, `6` `7` `8` `9` `0` = main **droite** doigts 1-5, `-` = pas d\'indication.',
         '  ⚠️ L\'ordre suppose « par temps croissant, puis grave→aigu » — à vérifier au premier essai.',
         '  Doc : <https://github.com/Synthesia-LLC/metadata-editor/wiki/Finger-Hints>', '',
         'Régénéré par `python3 tools/make-midi.py`. Ne pas éditer à la main.', '',
         '## Quel fichier pour quelle leçon', '',
         'Les fichiers sont préfixés du **numéro de leçon** : Synthesia trie par nom, la liste',
         'sort donc dans l\'ordre du cours. Un numéro peut manquer — une leçon qui réutilise le',
         'fichier d\'une autre garde le préfixe de la première (07 se travaille avec le fichier 05).',
         'Les préfixes sont **calculés** depuis l\'ordre ci-dessous, jamais écrits à la main.', '']
    connus, n = {d['file'] for d in DOIGTES}, 0
    for entree in PAR_LECON:
        titre, fichiers = entree[0], entree[1]
        if len(entree) > 2:                       # hors numérotation (bonus, morceau cible)
            num = entree[2]
        else:
            n += 1
            num = f'{n:02d}'
        for base in fichiers:
            assert fic(base) in connus, f'{fic(base)} listé pour « {titre} » mais jamais généré'
        L.append(f'- **{num} · {titre}** — ' + ' · '.join(f'`{fic(b)}`' for b in fichiers))
    orphelins = connus - {fic(b) for e in PAR_LECON for b in e[1]}
    if orphelins:
        L.append('')
        L.append('⚠️ Fichiers générés mais rattachés à aucune leçon : '
                 + ', '.join(f'`{f}`' for f in sorted(orphelins)))
    L.append('')
    for d in DOIGTES:
        L.append(f'## {d["file"]}')
        L.append(f'*{d["title"]}* — {d["bpm"]} BPM, mesure {d["sig"][0]}/{d["sig"][1]}')
        L.append('')
        vus = []
        for notes, fg in d['notes']:
            cle = tuple(sorted(notes))
            if cle in [v[0] for v in vus]:
                continue
            vus.append((cle, fg))
        if any(fg for _, fg in vus):
            L.append('| Notes | Doigts (main droite) |')
            L.append('|---|---|')
            for cle, fg in vus:
                noms = ' · '.join(nom(n) for n in cle)
                L.append(f'| {noms} | {" – ".join(str(f) for f in fg) if fg else "—"} |')
        else:
            L.append('*Pas de doigté imposé sur ce fichier.*')
        L.append('')
        if d['rh'].strip('-'):
            L.append(f'Chaîne Synthesia — main droite : `{d["rh"]}`')
        if d['lh'].strip('-'):
            L.append(f'Chaîne Synthesia — main gauche : `{d["lh"]}`')
        L.append('')
    (out / 'doigtes.md').write_text('\n'.join(L), encoding='utf-8')
    print(f'\n  {"doigtes.md":44s}          {len(DOIGTES):2d} fichiers documentés')


def main():
    out = pathlib.Path(__file__).resolve().parent.parent / 'midi'
    out.mkdir(exist_ok=True)
    print('\nFichiers MIDI générés dans midi/ :\n')

    # — mélodie : une note à la fois, main droite. Un doigt par touche = doigt i+1.
    r, t = [], 0.0
    for i, d in zip(MEL, MEL_DUR):
        r.append((t, d, [POS[i]], 80, [i + 1]))
        t += d
    write(out / fic('cinq-doigts-au-clair-de-la-lune-70bpm.mid'), r, [], 70,
          'Au clair de la lune (position de cinq doigts)')

    # — gamme : montée + descente, noires. Doigtés de la fiche position-des-doigts.
    MONTEE = [1, 2, 3, 1, 2, 3, 4, 5]
    DESCENTE = [5, 4, 3, 2, 1, 3, 2, 1]
    r = [(i, 1, [n], 80, [f]) for i, (n, f) in enumerate(zip(GAMME, MONTEE))]
    r += [(8 + i, 1, [n], 80, [f]) for i, (n, f) in enumerate(zip(reversed(GAMME), DESCENTE))]
    write(out / fic('passage-du-pouce-gamme-de-do-60bpm.mid'), r, [], 60,
          'gamme de Do, montée (pouce sous) et descente (3 par-dessus)')

    # — triades : Do → Fa → Sol → Do, un accord par mesure
    r = [(i * 4, 4, ch, 80, doigte_triade(ch)) for i, ch in enumerate(TRIADES)]
    write(out / fic('premier-accord-do-fa-sol-do-60bpm.mid'), r, [], 60,
          'les trois triades majeures, plaquées')

    # — renversements : le cycle lié, un accord par mesure, deux tours
    r = [(i * 4, 4, CYCLE[i % 4], 80, doigte_triade(CYCLE[i % 4])) for i in range(8)]
    write(out / fic('renversements-cycle-lie-60bpm.mid'), r, [], 60,
          'Ré m → Si♭ → Fa → Do en renversements (la main ne saute pas)')

    # — LEÇON 8, rythme : un accord plaqué par mesure, main droite seule
    for bpm in (50, 60, 80):
        r = [(i * 4, 4, SCI[i % 4][0], 80, doigte_triade(SCI[i % 4][0])) for i in range(8)]
        write(out / fic(f'rythme-accords-en-mesure-{bpm}bpm.mid'), r, [], bpm,
              'un accord sur le temps 1, tenu 4 temps')

    # — main gauche : basse tenue + accord plaqué. La basse se joue du 5 (auriculaire).
    r = [(i * 4, 4, SCI[i % 4][0], 80, doigte_triade(SCI[i % 4][0])) for i in range(8)]
    l = [(i * 4, 4, [SCI[i % 4][1]], 85, [5]) for i in range(8)]
    write(out / fic('main-gauche-basse-et-accords-60bpm.mid'), r, l, 60,
          'basse main gauche sous l\'accord main droite')

    # — balancier : main droite en croches
    r = []
    for bar in range(8):
        ch = SCI[bar % 4][0]
        for e in range(8):
            r.append((bar * 4 + e * 0.5, 0.5, ch, 72 if e % 2 else 84, doigte_triade(ch)))
    write(out / fic('balancier-croches-main-droite-60bpm.mid'), r, [], 60,
          'l\'accord répété en croches (8 par mesure)')

    # — The Scientist : tout ensemble, deux mains
    for bpm in (55, 75):
        r = []
        for bar in range(8):
            ch = SCI[bar % 4][0]
            for e in range(8):
                r.append((bar * 4 + e * 0.5, 0.5, ch, 72 if e % 2 else 84, doigte_triade(ch)))
        l = [(bar * 4, 4, [SCI[bar % 4][1]], 88, [5]) for bar in range(8)]
        write(out / fic(f'the-scientist-mains-ensemble-{bpm}bpm.mid'), r, l, bpm,
              'balancier en croches + basse — la chanson complète')

    # — Katyusha : accompagnement seul (basse + accords), en 2/4
    for bpm in (60, 84):
        r, l = [], []
        for bar, cle in enumerate(KAT_SEQ):
            notes, basse = KAT[cle]
            r.append((bar * 2, 2, notes, 80, doigte_triade(notes)))   # accord tenu la mesure
            l.append((bar * 2, 2, [basse], 88, [5]))                  # basse sur le temps 1
        write(out / fic(f'katyusha-accompagnement-{bpm}bpm.mid'), r, l, bpm,
              'Katyusha — accords + basse seuls (pas la mélodie), 2/4', sig=(2, 4))

    # — LEÇON 1, géographie : les Do repères, puis l'octave de blanches
    r = [(i * 2, 2, [n], 80) for i, n in enumerate(LES_DO)]
    r += [(8 + i, 1, [n], 80, [f]) for i, (n, f) in enumerate(zip(BLANCHES, [1, 2, 3, 1, 2, 3, 4, 5]))]
    write(out / fic('geographie-les-do-et-loctave-60bpm.mid'), r, [], 60,
          'les 4 Do repères, puis Do→Do en blanches (passage du pouce sur le Fa)')

    # — LEÇON 4, majeur/mineur : la paire sur chaque fondamentale blanche
    r, t = [], 0.0
    for _racine, maj, mineur in MAJMIN:
        r.append((t, 2, maj, 82, [1, 3, 5]))
        r.append((t + 2, 2, mineur, 82, [1, 3, 5]))
        t += 4
    write(out / fic('majeur-mineur-les-paires-60bpm.mid'), r, [], 60,
          'majeur puis mineur sur chaque blanche — une seule note change à chaque fois')

    # — LEÇON 5, renversements : les 3 hauteurs de Si♭ (mode ② de la leçon)
    r = [(i * 4, 4, ch, 80, doigte_triade(ch)) for i, ch in enumerate(SIB_INV)]
    write(out / fic('renversements-les-3-si-bemol-60bpm.mid'), r, [], 60,
          'Si♭ fondamentale → 1er renv. → 2e renv. : le même accord, trois hauteurs')

    # — LEÇON 6, accord mineur : la progression de The Scientist, accords + basse
    r = [(i * 4, 4, SCI[i % 4][0], 80, doigte_triade(SCI[i % 4][0])) for i in range(8)]
    l = [(i * 4, 4, [SCI[i % 4][1]], 85, [5]) for i in range(8)]
    write(out / fic('accord-mineur-progression-the-scientist-55bpm.mid'), r, l, 55,
          'Ré m → Si♭ → Fa → Do, accords tenus + basse (voicings liés)')

    # — BONUS, Canon de Pachelbel : 8 accords + basse, deux tours
    r, l = [], []
    for bar in range(16):
        ch, basse = PACH[PACH_SEQ[bar % 8]]
        r.append((bar * 4, 4, ch, 78, doigte_triade(ch)))
        l.append((bar * 4, 4, [basse], 86, [5]))
    write(out / fic('bonus-pachelbel-progression-60bpm.mid'), r, l, 60,
          'la progression du Canon en Ré, accords + basse (2 tours)')

    # Renommer, c'est laisser l'ancien nom derrière : sans ce ménage, Synthesia afficherait
    # deux jeux de fichiers. On ne touche qu'aux .mid de midi/, tous régénérés à chaque passage.
    ecrits = {d['file'] for d in DOIGTES}
    for vieux in sorted(out.glob('*.mid')):
        if vieux.name not in ecrits:
            vieux.unlink()
            print(f'  {"(supprimé)":44s} {vieux.name}')

    ecrire_doigtes(out)
    print('\nDans Synthesia : « Play a Song » → « Import Songs » → choisis le dossier midi/.')
    print('Doigtés : midi/doigtes.md (MIDI n\'a pas de champ pour ça).\n')


if __name__ == '__main__':
    main()
