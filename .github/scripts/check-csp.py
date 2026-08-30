#!/usr/bin/env python3
"""Guard the inline JSON-LD against its Content-Security-Policy hash.

index.html carries an inline <script type="application/ld+json"> block, allowed
by a 'sha256-...' source in the CSP meta tag. Edit the JSON and the hash goes
stale — the browser then silently drops the structured data. This fails the
build instead.
"""
import base64
import hashlib
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parents[2]
page = root / "index.html"
html = page.read_text(encoding="utf-8")

block = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
if not block:
    sys.exit("FAIL: no inline JSON-LD block found in index.html")

want = base64.b64encode(hashlib.sha256(block.group(1).encode("utf-8")).digest()).decode()

csp = re.search(r'script-src([^;"]*)', html)
if not csp:
    sys.exit("FAIL: no script-src directive found in the CSP meta tag")

have = re.findall(r"'sha256-([A-Za-z0-9+/=]+)'", csp.group(1))
if want not in have:
    sys.exit(
        "FAIL: CSP hash is stale.\n"
        f"  JSON-LD needs : 'sha256-{want}'\n"
        f"  CSP allows    : {have or 'nothing'}\n"
        "  Fix: paste the needed value into the script-src directive in index.html."
    )

print(f"OK: JSON-LD matches CSP hash sha256-{want}")
