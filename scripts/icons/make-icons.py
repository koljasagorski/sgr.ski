#!/usr/bin/env python3
"""Render the site icons from the Higgsfield pixel-art master.

Not part of the build (scripts/ is not on the build.sh allow-list).
Needs Pillow, e.g. in a throwaway venv:
    python3 -m venv /tmp/icons && /tmp/icons/bin/pip install Pillow
    /tmp/icons/bin/python scripts/icons/make-icons.py

Master: scripts/icons/face-master.png, 1024x1024, generated 2026-11-16 with
Higgsfield (gpt_image_2_6, job 9b9aeeab-480c-46a1-a659-c258df9f9c7c) from a
face crop of assets/portrait.webp. Saved without the generator's text chunk.
Outputs carry no metadata: Pillow writes only IHDR/IDAT/IEND (+ ICO frames).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
master = Image.open(ROOT / "scripts/icons/face-master.png").convert("RGB")


def scaled(size: int) -> Image.Image:
    # BOX averages whole source areas: keeps the pixel-art blocks clean
    # at small sizes instead of LANCZOS ringing around the glasses.
    return master.resize((size, size), Image.BOX)


scaled(512).save(ROOT / "assets/icon-512.png", optimize=True)
scaled(192).save(ROOT / "assets/icon-192.png", optimize=True)
scaled(180).save(ROOT / "apple-touch-icon.png", optimize=True)
scaled(32).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32)],
                append_images=[scaled(16)])
print("icons written")
