"""Render images/profile2.jpg as an IPA-glyph portrait for the home page.

Writes _includes/portrait/{light,dark}.txt (72×50 cells) and the matching
images/portrait-crop.jpg used under the hover lens.

    pip install pillow numpy "rembg[cpu]"
    python scripts/portrait.py

rembg downloads a ~170 MB person-segmentation model on first run; it is only
used to blank out the background. The glyph ramp is ordered by ink coverage in
Source Code Pro (600 weight); keep it in sync if the site font changes.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images" / "profile2.jpg"
BOX = (150, 165, 650, 745)          # head-and-shoulders crop of the 793×793 photo
COLS = 72
CELL = 1 / 0.6                      # cell height / width: line-height 1em, advance .6em
RAMP = [(0.000, " "), (0.011, "·"), (0.017, "ˈ"), (0.021, "ː"), (0.028, "ɾ"), (0.035, "ʌ"),
        (0.043, "ɔ"), (0.047, "ɪ"), (0.052, "ʃ"), (0.056, "ʊ"), (0.060, "ŋ"), (0.063, "ə"),
        (0.065, "ɦ"), (0.068, "ʒ"), (0.071, "ħ"), (0.074, "ɓ"), (0.079, "ð"), (0.086, "æ"),
        (0.089, "θ")]


def main():
    dens = np.array([d for d, _ in RAMP])
    glyphs = [g for _, g in RAMP]

    photo = Image.open(SRC).convert("RGB")
    mask = remove(photo, session=new_session("u2net_human_seg"), only_mask=True).convert("L")
    img, mask = photo.crop(BOX), mask.crop(BOX)
    w, h = img.size
    rows = round(COLS * h / w / CELL)

    g = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=1)
    g = g.filter(ImageFilter.UnsharpMask(radius=5, percent=220, threshold=2))
    lum = np.asarray(g.resize((COLS, rows), Image.LANCZOS), dtype=float) / 255
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(6)).resize((COLS, rows), Image.LANCZOS), dtype=float) / 255

    # Partial histogram equalization inside the silhouette so the face uses more of the ramp.
    inside = m > 0.5
    ranks = np.searchsorted(np.sort(lum[inside]), lum, side="right") / inside.sum()
    lum = np.where(inside, 0.3 * ranks + 0.7 * lum, lum)

    def render(dark_is_dense):
        lines = []
        for y in range(rows):
            line = ""
            for x in range(COLS):
                L = lum[y, x] ** 1.35
                t = ((1 - L) if dark_is_dense else L) * m[y, x]
                line += glyphs[int(np.abs(dens - t * dens[-1]).argmin())]
            lines.append(line)
        return "\n".join(lines)

    out = ROOT / "_includes" / "portrait"
    out.mkdir(exist_ok=True)
    (out / "light.txt").write_text(render(True), encoding="utf-8")
    (out / "dark.txt").write_text(render(False), encoding="utf-8")
    img.save(ROOT / "images" / "portrait-crop.jpg", quality=80, optimize=True, progressive=True)
    print(f"{COLS}×{rows} cells written to {out}")


if __name__ == "__main__":
    main()
