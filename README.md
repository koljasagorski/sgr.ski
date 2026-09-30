# sgr.ski

Personal one-page site for Kolja Sagorski. Static HTML, CSS and ~2 KB of JavaScript —
no build step, no framework, no dependencies, no third-party requests.

Live at **https://sgr.ski**

## Structure

```
index.html                  the page
workshops/index.html        /workshops — German workshop page ("Beide Seiten der Firewall")
assets/styles.css           all styling; light + dark via CSS custom properties
assets/theme.js             three-state theme switch, render-blocking in <head>
assets/workshops.css        /workshops styling; fixed light/dark split, no theme switch
assets/workshops.js         /workshops: draggable firewall line, scroll stages, phishing film
assets/workshop-quiz.js     /workshops: 10-question self-check, local scoring and email contact
assets/video/phishing*      /workshops phishing film (Higgsfield/Kling 3.0), AV1 + H.264, no audio, no metadata
assets/video/talk*          /workshops Formate background band (Kling 3 Pro via ElevenLabs): blurred, slowed, ping-pong loop
mta-sts-worker/             Cloudflare Worker for mta-sts.sgr.ski (MTA-STS policy, RFC 8461); deployed with wrangler
ip-worker/                  Cloudflare Worker for ip.sgr.ski (visitor IP/ASN/location); deployed with wrangler, not Pages
assets/fonts/*.woff2        JetBrains Mono, self-hosted (variable, weight axis 100–800)
assets/avatar.webp          224px source, rendered at 56px
assets/og.png               1200×630 social card
assets/og-workshops.png     1200×630 social card for /workshops (HTML-set, rendered with Chrome)
kolja-sagorski.asc          PGP public key, offered as a download
llms.txt                    site summary for AI agents; workshops/index.md mirrors /workshops as Markdown
.well-known/security.txt    RFC 9116
.github/workflows/check.yml  CI build check only (deploys happen on Cloudflare)
scripts/build.sh            assembles the published allow-list into _site/
wrangler.jsonc              Cloudflare Workers config (static assets)
_headers                    security + cache headers for every response
.github/scripts/check-csp.py
```

## Local development

```sh
python3 -m http.server 8765
# → http://127.0.0.1:8765/
```

Open the file directly and the absolute `/assets/...` paths break — use the server.

## Deployment

Hosted on **Cloudflare Workers** (static assets). Workers Builds is connected to this repo:
every push to `main` is pulled by Cloudflare, which runs `npx wrangler deploy`. That runs
`build.command` from `wrangler.jsonc` first — `scripts/build.sh` checks the CSP hashes and copies
an explicit allow-list into `_site/`, so `.git/`, `design/` and stray files never reach the web
root. `_headers` adds HSTS, `frame-ancestors`, `X-Frame-Options` and friends.

Deploy by hand, if ever needed: `npx wrangler deploy`.

DNS lives on Cloudflare too. `sgr.ski` and `www.sgr.ski` are Worker custom domains; `www`
redirects to the apex via a Cloudflare redirect rule, and "Always Use HTTPS" is on.

## Two things that will bite you

**The CSP hash.** `index.html` and `workshops/index.html` each carry an inline JSON-LD block, allowed by an explicit
`'sha256-…'` in the Content-Security-Policy meta tag. Edit either JSON block and the hash goes stale —
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
