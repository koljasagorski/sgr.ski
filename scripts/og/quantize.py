#!/usr/bin/env python3
"""Shrink a freshly rendered OG card in place: 128-colour palette PNG.

Chrome's lossless screenshot of the cards is about 590 KB, because the
Higgsfield background is grainy; WhatsApp drops link previews above roughly
300 KB. libimagequant (the engine behind pngquant) with 128 colours and
dithering 0.7 brings each card to about 215-230 KB without visible banding
in the gold glow or on the portrait (PSNR about 43 dB against the original).

The output carries only IHDR, PLTE, IDAT and IEND: no alpha (tRNS), no
gamma/colour profile, no text chunks.

Not part of the build. Needs Pillow and imagequant, e.g. in a throwaway venv:
    python3 -m venv /tmp/ogq && /tmp/ogq/bin/pip install Pillow imagequant
    /tmp/ogq/bin/python scripts/og/quantize.py assets/og.png assets/og-leistungen.png
"""
import io
import sys

import imagequant
from PIL import Image

COLOURS = 128
DITHER = 0.7

for path in sys.argv[1:]:
    rgb = Image.open(path).convert("RGB")
    q = imagequant.quantize_pil_image(
        rgb.convert("RGBA"),
        dithering_level=DITHER,
        max_colors=COLOURS,
        min_quality=0,
        max_quality=100,
    )
    # Same indices and palette, but a plain "P" image: the source is opaque,
    # so the tRNS chunk imagequant would add carries no information.
    out = Image.new("P", q.size)
    out.putpalette(q.getpalette()[: 3 * 256])
    out.frombytes(q.tobytes())
    buf = io.BytesIO()
    out.save(buf, "PNG", optimize=True)
    with open(path, "wb") as fh:
        fh.write(buf.getvalue())
    print(f"{path}: {len(buf.getvalue()) // 1024} KB")
