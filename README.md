# sgr.ski

Personal one-page site for Kolja Sagorski. Static HTML, CSS and ~2 KB of JavaScript —
no build step, no framework, no dependencies, no third-party requests.

Live at **https://sgr.ski**

## Structure

```
index.html                  the page
assets/styles.css           all styling; light + dark via CSS custom properties
assets/theme.js             three-state theme switch, render-blocking in <head>
assets/fonts/*.woff2        JetBrains Mono, self-hosted (variable, weight axis 100–800)
assets/avatar.webp          224px source, rendered at 56px
assets/og.png               1200×630 social card
kolja-sagorski.asc          PGP public key, offered as a download
.well-known/security.txt    RFC 9116
.github/workflows/deploy.yml
.github/scripts/check-csp.py
```

## Local development

```sh
python3 -m http.server 8765
# → http://127.0.0.1:8765/
```

Open the file directly and the absolute `/assets/...` paths break — use the server.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which assembles the site into
`_site/` (explicitly, so `.git/` and `.github/` never reach the web root) and publishes it to
GitHub Pages.

DNS lives on Cloudflare and points straight at GitHub Pages — four A records, four AAAA
records, `www` as a CNAME to `koljasagorski.github.io`. All of them are **DNS-only (grey
cloud)**: proxying them through Cloudflare blocks GitHub's Let's Encrypt challenge and the
certificate never issues.

## Two things that will bite you

**The CSP hash.** `index.html` carries an inline JSON-LD block, allowed by an explicit
`'sha256-…'` in the Content-Security-Policy meta tag. Edit that JSON and the hash goes stale —
browsers then drop the structured data silently. `.github/scripts/check-csp.py` fails the build
instead of letting that ship. It prints the correct value; paste it into the `script-src`
directive:

```sh
python3 .github/scripts/check-csp.py
```

**No inline styles or scripts.** The CSP is `default-src 'none'` with everything else scoped to
`'self'`. A `style="…"` attribute or an inline `<script>` will simply not apply.

## Licences

Type is [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) under the SIL Open Font
License 1.1. The portrait is not licensed for reuse.
