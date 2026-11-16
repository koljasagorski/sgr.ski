# sgr.ski

Personal website of Kolja Sagorski: home page, /leistungen, /workshops (with a quiz) and
/impressum. Static HTML and CSS; the home page needs no JavaScript —
no build step, no framework, no dependencies, no third-party requests.

Live at **https://sgr.ski**

## Structure

```
index.html                  home page, after Carrd template #318 (German); no JavaScript besides the tracker
leistungen/index.html       /leistungen — services for companies in the Ruhr area and NRW (German); index.md mirrors it as Markdown
workshops/index.html        /workshops — German workshop page ("Beide Seiten der Firewall")
workshops/quiz/index.html   /workshops/quiz — standalone quiz for sharing; index.md mirrors its content
impressum/index.html        /impressum — legal notice of patchletter UG, linked from the other pages
assets/quiz.css             standalone quiz page layout; reuses workshop styles and quiz logic
assets/card.css             home page, and the shared tokens, fonts and components of /leistungen and /impressum (Carrd #318 look: dark card, gold, Sora + Inter)
assets/leistungen.css       /leistungen and /impressum: header card, sheet, service sections, FAQ, contact block
assets/bg.svg               faceted page background of the #318 look, referenced from card.css
assets/portrait.webp        home page portrait, cropped from the 8256 px original, no metadata
assets/umami.js             self-hosted visit tracker for umami.patchletter.com
assets/umami-recorder.js    self-hosted heatmaps and session replays; honors DNT and rr-block exclusions
assets/workshops.css        /workshops styling; fixed light/dark split, no theme switch
assets/workshops.js         /workshops: draggable firewall line, scroll stages, phishing film
assets/workshop-quiz.js     /workshops and /workshops/quiz: shared 10-question self-check, scoring and email contact
assets/video/phishing*      /workshops phishing film (Higgsfield/Kling 3.0), AV1 + H.264, no audio, no metadata
assets/video/talk*          /workshops Formate background band (Kling 3 Pro via ElevenLabs): blurred, slowed, ping-pong loop
mta-sts-worker/             Cloudflare Worker for mta-sts.sgr.ski (MTA-STS policy, RFC 8461); deployed with wrangler
ip-worker/                  Cloudflare Worker for ip.sgr.ski (visitor IP/ASN/location); deployed with wrangler, not Pages
assets/fonts/*.woff2        Sora 600/700 + Inter 400/600 Latin (OFL; home page, /leistungen, /impressum) and JetBrains Mono (variable, /workshops), self-hosted
assets/avatar.webp          224px avatar, used on /workshops, /leistungen and /impressum
assets/og.png               1200×630 social card for the home page (source: scripts/home-social.html)
assets/og-leistungen.png    1200×630 social card for /leistungen (source: scripts/og-leistungen.html)
assets/og-workshops.png     1200×630 social card for /workshops (source: scripts/workshops-social.html)
assets/og-quiz.png          1200×630 social card for /workshops/quiz (source: scripts/quiz-social.html)
assets/icon-192.png, icon-512.png  app icons, with apple-touch-icon.png and favicon.ico (Higgsfield monogram, gold on #282830)
scripts/home-social.html    source of assets/og.png; real portrait and text over the Higgsfield background, render with Chromium at 1200×630
scripts/og-leistungen.html  source of assets/og-leistungen.png (same background and layout)
scripts/og/bg.png           Higgsfield-generated background of both cards; not published
site.webmanifest            web app manifest (name, icons, theme colour #282830)
kolja-sagorski.asc          PGP public key, offered as a download
llms.txt                    site summary for AI agents; leistungen/index.md and workshops/index.md mirror those pages as Markdown
sitemap.xml                 the five public pages with lastmod and priority
.well-known/security.txt    RFC 9116
.github/workflows/check.yml  CI build check only (deploys happen on Cloudflare)
scripts/build.sh            assembles the published allow-list into _site/
wrangler.jsonc              Cloudflare Workers config (static assets)
_headers                    security + cache headers for every response
.github/scripts/check-csp.py    JSON-LD hashes in the CSP (home page, /leistungen, /workshops)
.github/scripts/check-pages.py  page rules: no inline styles or data: URIs, local links exist, one <h1>, the title "Certified Security Analyst", required content per page
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

**The CSP hash.** `index.html`, `leistungen/index.html` and `workshops/index.html` each carry an inline JSON-LD block, allowed by an explicit
`'sha256-…'` in the Content-Security-Policy meta tag. Edit one of these JSON blocks and the hash goes stale —
browsers then drop the structured data silently. `.github/scripts/check-csp.py` fails the build
instead of letting that ship. It prints the correct value; paste it into the `script-src`
directive:

```sh
python3 .github/scripts/check-csp.py
```

**No inline styles or scripts.** The CSP is `default-src 'none'` with everything else scoped to
`'self'`. A `style="…"` attribute or an inline `<script>` will simply not apply.

## Licences

Type is [Sora](https://github.com/sora-xor/sora-font) and [Inter](https://github.com/rsms/inter)
(home page, /leistungen, /impressum) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono)
(/workshops), all under the SIL Open Font License 1.1; the Sora and Inter licence texts are in
`assets/fonts/`. The portrait is not licensed for reuse.

The Umami recorder includes rrweb; license notices are in
`assets/umami-recorder.LICENSE.txt`. To update it, download `recorder.js` from
`https://umami.patchletter.com/recorder.js` to a temporary file, then run
`python3 scripts/prepare-umami-recorder.py /path/to/recorder.js`. The preparation
script checks and reapplies the local privacy guards. Do not overwrite the
published recorder directly: upstream heatmaps do not honor rrweb block classes.

Heatmaps and replays also need enabling under the sgr.ski website's **Replays &
Heatmaps** settings in Umami. Their sample rates and replay duration are controlled
there. The script only runs on `sgr.ski` and respects Do Not Track. `.rr-block`
excludes quiz answer choices, results, and the workshop's live browser/network
values from replays and heatmap clicks. Quiz navigation remains measurable.
