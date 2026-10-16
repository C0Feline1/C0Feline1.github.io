"""Render the original Feline 8-bit loop as a small, seamless WAV."""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "music" / "feline-neon-loop-v3.wav"
RATE = 22050
BPM = 92
BEAT = 60 / BPM
BARS = 8
LOOP_SECONDS = BARS * 4 * BEAT
TOTAL = round(RATE * LOOP_SECONDS)

# C major, with a mid-register, connected hook and a light, warm chiptune bed.
CHORDS = [
    ("C3", ["C4", "E4", "G4", "E4"]),
    ("G2", ["G3", "B3", "D4", "B3"]),
    ("A2", ["A3", "C4", "E4", "G4"]),
    ("F2", ["F3", "A3", "C4", "A3"]),
    ("C3", ["C4", "E4", "G4", "E4"]),
    ("G2", ["G3", "B3", "D4", "B3"]),
    ("F2", ["F3", "A3", "C4", "A3"]),
    ("G2", ["G3", "B3", "D4", "G4"]),
]
MELODY = [
    ["G4", "A4", "C5", "E5", "D5", "C5", "A4", "G4"],
    ["E4", "G4", "C5", "D5", "E5", "D5", "C5", None],
    ["A4", "C5", "E5", "G5", "E5", "C5", "B4", "A4"],
    ["G4", "B4", "D5", "E5", "D5", "B4", "G4", None],
    ["G4", "A4", "C5", "E5", "G5", "E5", "D5", "C5"],
    ["C5", "G4", "E4", "G4", "A4", "C5", "D5", "E5"],
    ["A4", "C5", "E5", "G5", "A5", "G5", "E5", "C5"],
    ["D5", "B4", "G4", "A4", "C5", None, "G4", None],
]

def midi(name: str) -> int:
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
             "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    import re
    m = re.fullmatch(r"([A-G]#?)(-?\d+)", name)
    assert m, name
    return (int(m.group(2)) + 1) * 12 + names[m.group(1)]

def hz(name: str) -> float:
    return 440.0 * 2 ** ((midi(name) - 69) / 12)

left = [0.0] * TOTAL
right = [0.0] * TOTAL

def add_tone(start: float, duration: float, freq: float, amp: float,
             kind: str, pan: float = 0.0, duty: float = 0.5):
    a = max(0, round(start * RATE)); z = min(TOTAL, round((start + duration) * RATE))
    if z <= a: return
    length = z - a
    attack = max(1, round(0.006 * RATE)); release = max(1, round(0.014 * RATE))
    phase_step = freq / RATE
    # Oscillator phase is reset per note, matching the compact, crisp sound chip timbre.
    for j, i in enumerate(range(a, z)):
        env = min(1.0, j / attack, (length - 1 - j) / release)
        phase = (j * phase_step) % 1.0
        if kind == "square":
            v = 1.0 if phase < duty else -1.0
        elif kind == "triangle":
            v = 1.0 - 4.0 * abs(phase - 0.5)
        else:
            v = math.sin(2 * math.pi * phase)
        v *= amp * max(0.0, env)
        left[i] += v * (1 - max(0, pan))
        right[i] += v * (1 + min(0, pan))

def add_kick(start: float, amp: float = 0.09):
    a = round(start * RATE); n = round(0.12 * RATE)
    for j in range(n):
        i = a + j
        if i >= TOTAL: break
        t = j / RATE; env = math.exp(-t * 30)
        v = math.sin(2 * math.pi * (95 - 38 * t / 0.12) * t) * env * amp
        left[i] += v; right[i] += v

def add_noise_hit(start: float, amp: float, length: float, seed: int):
    rng = random.Random(seed); a = round(start * RATE); n = round(length * RATE)
    for j in range(n):
        i = a + j
        if i >= TOTAL: break
        env = math.exp(-j / RATE * (24 if length < .08 else 16))
        v = rng.uniform(-1, 1) * amp * env
        left[i] += v * .72; right[i] += v

for bar, (root, arp) in enumerate(CHORDS):
    tbar = bar * 4 * BEAT
    # Round, short square bass pulses; leave air at the end of each bar.
    for beat in (0, 2):
        add_tone(tbar + beat * BEAT, BEAT * 1.55, hz(root), .075, "triangle", pan=-.04)
    # Two soft chord tones per bar leave plenty of space around the melody.
    pattern = [0, 2]
    for step, note_index in enumerate(pattern):
        add_tone(tbar + step * 2 * BEAT, BEAT * 1.45, hz(arp[note_index]), .022,
                 "square", pan=(-.06 if step % 2 == 0 else .06), duty=.25)
    # A playful lead hook, with an occasional tiny high bell as a catlike chirp.
    for step, note in enumerate(MELODY[bar]):
        if note:
            start = tbar + step * BEAT / 2
            add_tone(start, BEAT * .44, hz(note), .085,
                     "triangle", pan=.03)
            if bar in (1, 5) and step == 4:
                add_tone(start, .12, hz("E6"), .018, "triangle", pan=-.05)
    # Only a soft low pulse on the strong beats; no noisy snare or constant hats.
    for beat in range(4):
        if beat == 0: add_kick(tbar, .055)

# Quiet fade at the loop boundary makes repeated playback click-free.
fade_n = round(.018 * RATE)
for j in range(fade_n):
    gain = j / fade_n
    left[j] *= gain; right[j] *= gain
    left[-1-j] *= gain; right[-1-j] *= gain

peak = max(max(abs(x) for x in left), max(abs(x) for x in right), 1e-9)
# Leave generous digital headroom so the exported file itself is quiet.
scale = .22 / peak
OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), "wb") as wav:
    wav.setnchannels(2); wav.setsampwidth(2); wav.setframerate(RATE)
    frames = bytearray()
    for l, r in zip(left, right):
        frames.extend(struct.pack("<hh", round(max(-1, min(1, l * scale)) * 32767),
                                  round(max(-1, min(1, r * scale)) * 32767)))
    wav.writeframes(frames)
print(f"Wrote {OUT.name} ({LOOP_SECONDS:.3f}s loop, {OUT.stat().st_size:,} bytes)")
