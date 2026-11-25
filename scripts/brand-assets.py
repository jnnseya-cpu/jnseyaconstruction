"""Build web logo files from the master artwork in design/brand/.

Usage: python3 scripts/brand-assets.py   (needs Pillow and NumPy)

For each master (transparent PNG/WebP) it writes to public/brand/:
  <name>-logo.png            full logo for light backgrounds (1200px wide)
  <name>-logo-on-dark.png    the same with dark ink turned white, for navy
  <name>-mark.png            the symbol alone (256px wide)
  <name>-mark-on-dark.png
The first horizontal band of artwork is the logo (a tagline line below it is
dropped and set as live text on the site); the first vertical band is the mark.
"""
from PIL import Image
import numpy as np

MASTERS = [
    # file, output name, colour for light parts on dark backgrounds (None: keep the original colour)
    ("design/brand/Nseya_Group_Construction.webp", "nseya-group", (27, 169, 150)),
    ("design/brand/ETABLIX_Endorsed.png", "etablix", None),
]
OUT = "public/brand"
PAD = 8


def bands(flags):
    out, start = [], None
    for i, v in enumerate(flags):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((start, i - 1))
            start = None
    if start is not None:
        out.append((start, len(flags) - 1))
    return out


def on_dark(im, accent):
    a = np.array(im).astype(float)
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    d = np.clip((85 - lum) / 45, 0, 1)[..., None]  # dark ink -> white
    other = np.array(accent, float) if accent else a[..., :3]
    a[..., :3] = np.array([255, 255, 255.0]) * d + other * (1 - d)
    return Image.fromarray(a.clip(0, 255).astype("uint8"), "RGBA")


def save(im, name, width):
    h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(f"{OUT}/{name}.png", optimize=True)
    print(f"{OUT}/{name}.png {width}x{h}")


for path, name, accent in MASTERS:
    src = Image.open(path).convert("RGBA")
    ink = np.array(src)[..., 3] > 40
    top, bottom = bands(ink.any(axis=1))[0]
    cols = bands(ink[top : bottom + 1].any(axis=0))
    left, right = cols[0][0], cols[-1][1]
    mark_right = cols[0][1]
    mark_rows = bands(ink[top : bottom + 1, left : mark_right + 1].any(axis=1))
    m_top, m_bottom = top + mark_rows[0][0], top + mark_rows[-1][1]
    box = lambda l, t, r, b: (max(l - PAD, 0), max(t - PAD, 0), min(r + PAD, src.width), min(b + PAD, src.height))
    logo = src.crop(box(left, top, right, bottom))
    mark = src.crop(box(left, m_top, mark_right, m_bottom))
    save(logo, f"{name}-logo", 1200)
    save(on_dark(logo, accent), f"{name}-logo-on-dark", 1200)
    save(mark, f"{name}-mark", 256)
    save(on_dark(mark, accent), f"{name}-mark-on-dark", 256)
