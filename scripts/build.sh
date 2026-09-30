#!/bin/sh
# Assemble the public site into _site/ for Cloudflare Workers static assets.
# Runs locally and in Workers Builds (via build.command in wrangler.jsonc).
#
# An allow-list, deliberately: only these paths are ever published. A
# deny-list would let any stray file in the repo root (.DS_Store, an editor
# backup, a scratch note, design/) reach the public web root. A missing
# entry fails the build rather than silently shipping less.
set -eu
cd "$(dirname "$0")/.."

python3 .github/scripts/check-csp.py

rm -rf _site
mkdir -p _site
for path in \
  index.html \
  workshops \
  impressum \
  assets \
  .well-known \
  favicon.ico \
  apple-touch-icon.png \
  site.webmanifest \
  robots.txt \
  llms.txt \
  sitemap.xml \
  kolja-sagorski.asc \
  _headers
do
  if [ ! -e "$path" ]; then
    echo "error: expected to publish '$path' but it does not exist" >&2
    exit 1
  fi
  cp -R "$path" _site/
done

find _site -name .DS_Store -delete
echo "── published tree ──"
find _site -type f | sort
