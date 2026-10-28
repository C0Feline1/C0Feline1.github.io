# Portrait collection

These ten transparent `96 × 112` PNGs belong to the character illustration
collection. The homepage animation continues to use its separate `48 × 64`
sprite kits.

- `C0.png`, `X0.png`, and `Feline1.png` are original, code-drawn studio portraits.
  Every shape is authored on the native integer grid; they are not enlargements
  of the map sprites. `Feline1` is displayed as **F1** in the interface.
- The seven AI PNGs preserve the original AI PIXEL PARTY illustrations byte for
  byte. The original poster is retained at `../ai-pixel-party-original.png`.
  Their character references and attribution remain in [the parent README](../README.md).
- `manifest.json` records each PNG's native size and SHA-256 digest.

Rebuild the three studio portraits with `python3 tools/build_studio_portraits.py`
from the repository root. Pillow is needed only when authoring. The existing
seven archived PNGs are kept when the optional original authoring folder is
unavailable. `--original-dir` can select that folder; `--review-dir` writes a
contact sheet outside the published collection.
