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


def write(path, right, left, bpm, title, sig=(4, 4)):
    """right/left = [(beat_start, beat_len, [notes], velocity)]"""
    def to_events(notes_spec, chan):
        ev = []
        for start, length, notes, vel in notes_spec:
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
    bars = max([s + l for s, l, _, _ in right + left] or [0]) / sig[0]
    n = verify(path)                      # relecture immédiate : pas de fichier douteux livré
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


def main():
    out = pathlib.Path(__file__).resolve().parent.parent / 'midi'
    out.mkdir(exist_ok=True)
    print('\nFichiers MIDI générés dans midi/ :\n')

    # — mélodie : une note à la fois, main droite
    r, t = [], 0.0
    for i, d in zip(MEL, MEL_DUR):
        r.append((t, d, [POS[i]], 80))
        t += d
    write(out / 'cinq-doigts-au-clair-de-la-lune-70bpm.mid', r, [], 70,
          'Au clair de la lune (position de cinq doigts)')

    # — gamme : montée + descente, noires
    r = [(i, 1, [n], 80) for i, n in enumerate(GAMME)]
    r += [(8 + i, 1, [n], 80) for i, n in enumerate(reversed(GAMME))]
    write(out / 'passage-du-pouce-gamme-de-do-60bpm.mid', r, [], 60,
          'gamme de Do, montée (pouce sous) et descente (3 par-dessus)')

    # — triades : Do → Fa → Sol → Do, un accord par mesure
    r = [(i * 4, 4, ch, 80) for i, ch in enumerate(TRIADES)]
    write(out / 'premier-accord-do-fa-sol-do-60bpm.mid', r, [], 60,
          'les trois triades majeures, plaquées')

    # — renversements : le cycle lié, un accord par mesure, deux tours
    r = [(i * 4, 4, CYCLE[i % 4], 80) for i in range(8)]
    write(out / 'renversements-cycle-lie-60bpm.mid', r, [], 60,
          'Ré m → Si♭ → Fa → Do en renversements (la main ne saute pas)')

    # — LEÇON 7, rythme : un accord plaqué par mesure, main droite seule
    for bpm in (50, 60, 80):
        r = [(i * 4, 4, SCI[i % 4][0], 80) for i in range(8)]
        write(out / f'rythme-accords-en-mesure-{bpm}bpm.mid', r, [], bpm,
              'un accord sur le temps 1, tenu 4 temps')

    # — main gauche : basse tenue + accord plaqué
    r = [(i * 4, 4, SCI[i % 4][0], 80) for i in range(8)]
    l = [(i * 4, 4, [SCI[i % 4][1]], 85) for i in range(8)]
    write(out / 'main-gauche-basse-et-accords-60bpm.mid', r, l, 60,
          'basse main gauche sous l\'accord main droite')

    # — balancier : main droite en croches
    r = []
    for bar in range(8):
        for e in range(8):
            r.append((bar * 4 + e * 0.5, 0.5, SCI[bar % 4][0], 72 if e % 2 else 84))
    write(out / 'balancier-croches-main-droite-60bpm.mid', r, [], 60,
          'l\'accord répété en croches (8 par mesure)')

    # — The Scientist : tout ensemble, deux mains
    for bpm in (55, 75):
        r = []
        for bar in range(8):
            for e in range(8):
                r.append((bar * 4 + e * 0.5, 0.5, SCI[bar % 4][0], 72 if e % 2 else 84))
        l = [(bar * 4, 4, [SCI[bar % 4][1]], 88) for bar in range(8)]
        write(out / f'the-scientist-mains-ensemble-{bpm}bpm.mid', r, l, bpm,
              'balancier en croches + basse — la chanson complète')

    # — Katyusha : accompagnement seul (basse + accords), en 2/4
    for bpm in (60, 84):
        r, l = [], []
        for bar, nom in enumerate(KAT_SEQ):
            notes, basse = KAT[nom]
            r.append((bar * 2, 2, notes, 80))          # accord tenu la mesure entière
            l.append((bar * 2, 2, [basse], 88))        # basse sur le temps 1
        write(out / f'katyusha-accompagnement-{bpm}bpm.mid', r, l, bpm,
              'Katyusha — accords + basse seuls (pas la mélodie), 2/4', sig=(2, 4))

    print('\nDans Synthesia : « Play a Song » → « Import Songs » → choisis le dossier midi/.\n')


if __name__ == '__main__':
    main()
