#!/usr/bin/env python3
"""Vendor an Umami recorder downloaded from our own instance.

Usage: python3 scripts/prepare-umami-recorder.py /path/to/recorder.js
Keep these guards when updating: local development and DNT never record;
heatmaps honor the same rr-block exclusions as rrweb session replays.
Abort if an upstream update changes the expected code instead of silently
publishing a recorder without the exclusions.
"""
import hashlib
from pathlib import Path
import sys

source = Path(sys.argv[1]).read_text()
patches = [
    (
        'i=o("website-id"),a=o("host-url");if(!i)return;',
        'i=o("website-id"),a=o("host-url");'
        'if(!i||e.location.hostname!=="sgr.ski"||'
        '["1","yes"].includes(String(e.navigator.doNotTrack||e.doNotTrack||e.navigator.msDoNotTrack)))return;',
    ),
    (
        'if(!t.isTrusted||0!==t.button)return;',
        'if(!t.isTrusted||0!==t.button||t.target?.closest?.(".rr-block"))return;',
    ),
]
for old, new in patches:
    if source.count(old) != 1:
        raise SystemExit('Upstream recorder changed. Review the privacy guards before updating.')
    source = source.replace(old, new)

digest = hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest()
notice = (
    '/*! Umami recorder from https://umami.patchletter.com/recorder.js\n'
    f' * Upstream SHA-256: {digest}\n'
    ' * Local guards: sgr.ski only, DNT, heatmaps exclude .rr-block.\n'
    ' * Includes rrweb. See umami-recorder.LICENSE.txt.\n'
    ' * Update using scripts/prepare-umami-recorder.py. */\n'
)
target = Path(__file__).resolve().parents[1] / 'assets' / 'umami-recorder.js'
target.write_text(notice + source)
print(f'Prepared {target.name} with privacy guards.')
