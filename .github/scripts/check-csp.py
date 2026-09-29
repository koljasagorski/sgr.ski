#!/usr/bin/env python3
"""Guard the inline JSON-LD against its Content-Security-Policy hash.

Every page carries an inline <script type="application/ld+json"> block, allowed
by a 'sha256-...' source in its own CSP meta tag. Edit the JSON and the hash
goes stale — the browser then silently drops the structured data. This fails
the build instead.
"""
import base64
import hashlib
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parents[2]
PAGES = ["index.html", "workshops/index.html"]

failed = False
for rel in PAGES:
    html = (root / rel).read_text(encoding="utf-8")

    block = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if not block:
        print(f"FAIL {rel}: no inline JSON-LD block found")
        failed = True
        continue

    want = base64.b64encode(hashlib.sha256(block.group(1).encode("utf-8")).digest()).decode()

    csp = re.search(r'script-src([^;"]*)', html)
    if not csp:
        print(f"FAIL {rel}: no script-src directive found in the CSP meta tag")
        failed = True
        continue

    have = re.findall(r"'sha256-([A-Za-z0-9+/=]+)'", csp.group(1))
    if want not in have:
        print(
            f"FAIL {rel}: CSP hash is stale.\n"
            f"  JSON-LD needs : 'sha256-{want}'\n"
            f"  CSP allows    : {have or 'nothing'}\n"
            f"  Fix: paste the needed value into the script-src directive in {rel}."
        )
        failed = True
        continue

    print(f"OK {rel}: JSON-LD matches CSP hash sha256-{want}")

sys.exit(1 if failed else 0)
