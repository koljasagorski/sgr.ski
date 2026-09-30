# sgr.ski — Repo-Konventionen

Private Ein-Seiten-Website. **Statisch, kein Build-Step, keine Dependencies.** Nicht auf ein
Framework migrieren, ohne dass es ausdrücklich gewünscht ist.

## Linear

Für dieses Repo existiert **kein** Linear-Projekt (Stand 2026-08-30, Team `KOL` geprüft). Falls
substanzielle Arbeit ansteht, zuerst prüfen, ob inzwischen eines angelegt wurde.

## Design-Herkunft

Die Seite setzt Variante **1d „Status Page"** aus dem Claude-Design-Projekt
`21986e11-b920-40b9-94b3-94a5c0a84351` (`Website Entwürfe.dc.html`) um. Das Canvas enthält vier
Varianten — 1a Terminal, 1b Swiss Print, 1c Dossier, 1d Status Page. Die Dark-Theme-Palette ist
aus 1c abgeleitet, bleibt also innerhalb desselben Entwurfs-Systems.

Feste Werte aus dem Entwurf: Spalte 620 px, Avatar 56 px rund, Fließtext 14 px,
Tagline 26 px, Chips 11 px mit `letter-spacing: .1em`, Trennlinien als 1-px-Haarlinien.

## Unterseite /workshops

`workshops/index.html` (deutsch) setzt Variante 1b „Beide Seiten der Firewall" aus
`design/Workshops.dc.html` um; eigene `assets/workshops.css` / `workshops.js`. Hell = Nutzer-,
dunkel = Angreiferperspektive — deshalb dort **kein** Theme-Schalter. Dynamische Werte (Linie,
Bühnen) setzt das JS als Custom Properties per CSSOM (`style.setProperty`), das erlaubt die CSP
anders als `style=""`. Ohne JS stehen alle Ebenen untereinander.

IP, Provider, Standort und Verbindung liefert der eigene Cloudflare Worker `ip.sgr.ski`
(Quelle in `ip-worker/`, Deploy per `wrangler deploy` aus dem Ordner — **nicht** über Pages).
Er wird beim Laden automatisch abgefragt (Entscheidung des Betreibers am 2026-09-29), speichert
und loggt nichts (`observability` aus) und erlaubt CORS nur für sgr.ski. In der CSP steht dafür
`connect-src https://ip.sgr.ski`. Das ist die einzige Ausnahme von „keine Dritt-Requests“ und
bleibt auf der eigenen Domain; keine fremden IP-Dienste einbinden. Alle übrigen Werte liest der
Browser lokal aus. Bilder für die Seite ohne Metadaten ablegen (`cwebp -metadata none`).

Der Phishing-Film (`assets/video/phishing*`) ist mit Higgsfield erzeugt (Startbild `gpt_image_2_5`,
Video Kling 3.0, 10 s, ohne Ton) und selbst gehostet — nie von Higgsfield/CloudFront einbetten.
Neu kodieren mit `ffmpeg -an -map_metadata -1` (AV1 zuerst, H.264 als Fallback, je mit
`codecs=`-Angabe). Die CSP enthält dafür `media-src 'self'`. Er startet automatisch (`autoplay`, auch bei
`prefers-reduced-motion` — Wunsch des Betreibers am 2026-09-29), pausiert außerhalb des
Sichtbereichs. Bewusst **ohne** Bedienelemente (Wunsch des Betreibers): randlose
dunkle Bühne, ein Klick aufs Bild hält an (WCAG 2.2.2). Unten ein großes Wort je Einstellung,
synchron zu den Schnitten bei 3 s und 6,5 s (`SHOTS` in `workshops.js`) — bei neuem Film anpassen.

Formate hat ein Hintergrundvideo (`assets/video/talk*`): jemand trägt vor einem kleinen Team vor,
so unscharf, dass niemand erkennbar ist (der Betreiber stand noch auf keiner Bühne — nichts
behaupten, was das Bild nicht hergibt). Quelle: Higgsfield-Startbild (Job
`d41df290-9dc1-4e35-85fd-ef4adb6fc6dc`), animiert mit Kling 3 Pro über **ElevenLabs** (Flow
`xyy1R7f8lUyiVb2UZs83`, 10 s, ohne Ton, ~6.800 Credits), weil Higgsfield am Tageslimit hing.
Kette: `setpts=2.0*PTS,minterpolate=fps=24:mi_mode=blend` (Zeitlupe ohne Ruckeln),
`scale=1280:-2`, `gblur=sigma=12` (22 ließ die Person verschwinden, 8 ist zu scharf), vorwärts +
`reverse` per concat (nahtlose Schleife), AV1 `-crf 42` + H.264 `-crf 30`, `-an -map_metadata -1`.
Unschärfe gehört ins Video, nie als CSS-`filter`. Das Video ist ein **Bildband oben**
(`clamp(380px, 72vh, 700px)`), das nach unten ins Dunkel ausläuft; die Überschrift steht im
unteren Teil, die Formatzeilen auf ruhigem Dunkel. Nach jedem Tausch pro Textelement über die
ganze Schleife gegen das hellste Hintergrundpixel messen, alle Texte ≥ 4.5:1. Die drei
Einstellungen beschreibt eine `sr-only`-Liste für Screenreader.

SEO /workshops: Die H1 ist das kleine Label „WORKSHOPS · DIGITALE SELBSTVERTEIDIGUNG · OPSEC ·
QUELLENSCHUTZ“ (Suchbegriffe); der große Slogan ist bewusst ein `<p>`. Titel ≤ 62 Zeichen,
Description ~150. Das OG-Bild `assets/og-workshops.png` ist in HTML gesetzt (Seiten-Schrift,
Hell/Dunkel-Split wie im Hero) und mit Chrome gerendert — nicht KI-generiert, damit die Schrift
exakt ist. Bei Textänderung neu rendern; LinkedIn cacht Vorschauen (Post Inspector nutzen).

KI-Lesbarkeit: `/llms.txt` (Allow-List in `scripts/build.sh`!) und `workshops/index.md` als Markdown-Spiegel der
Workshop-Seite, verlinkt per `rel="alternate" type="text/markdown"`. **Inhaltliche Änderungen an
`workshops/index.html` auch in `index.md` nachziehen** — sonst widersprechen sich die Fassungen.
Kein Ranking-Hebel für Google (laut Google selbst), aber Agenten lesen es.

## Harte Regeln

- **Keine Inline-Styles, keine Inline-Scripts.** Die CSP ist `default-src 'none'`; alles andere
  läuft über `'self'`. Ein `style="…"` greift schlicht nicht.
- **Ausnahme:** die JSON-LD-Blöcke in `index.html` und `workshops/index.html` sind jeweils per `'sha256-…'` freigegeben. Wird ein JSON
  geändert, muss dessen Hash neu — `python3 .github/scripts/check-csp.py` gibt den korrekten Wert aus
  und lässt sonst den Build fehlschlagen.
- **Fonts bleiben selbst gehostet.** Kein Google-Fonts-CDN (DSGVO) und keine weiteren
  Dritt-Requests. **Ausnahmen, beide auf eigener Infrastruktur des Betreibers:** `ip.sgr.ski`
  (siehe Workshops) und die Besuchsstatistik **Umami** (`umami.patchletter.com`, Website-ID
  `a9dbeae1-3e8d-4a32-9c86-647bfbb62c09`, auf Wunsch des Betreibers seit 2026-09-30) auf allen
  drei Seiten — cookielos, mit `data-domains="sgr.ski"`, `data-do-not-track`,
  `data-exclude-search`; in jeder CSP unter `script-src` und `connect-src` freigegeben. Texte, die
  „speichert nichts“ behaupten, sind deshalb angepasst — nicht zurückschreiben.
- **Impressum ja, Datenschutzseite nein.** Am 2026-08-30 hatte der Betreiber beides abgelehnt;
  am 2026-09-29 ausdrücklich ein kleines Impressum unter `/impressum/` gewünscht (Pflichtangaben
  wie patchletter.com/de/impressum, verlinkt im Footer von `/workshops`). Eine Datenschutzseite
  weiterhin nicht ungefragt einbauen.
- **`--faint` und `--faint-text` sind nicht dasselbe.** `--faint` (#a3a39c / #5a616a) ist der
  Originalton des Entwurfs und bleibt den dekorativen, `aria-hidden`-Pfeilen vorbehalten.
  Sichtbarer Text nutzt `--faint-text`, das WCAG AA (4.5:1) erfüllt. Text nie auf `--faint`
  umstellen — die Fußzeile lag damit bei 2.45:1.
- `scripts/build.sh` ist eine **Allow-List**. Neue Dateien, die veröffentlicht werden sollen,
  müssen dort eingetragen werden, sonst fehlen sie live. Eine Deny-List wäre gefährlicher: dann
  landet jede Streudatei (auch `design/`) im Web-Root.
- `frame-ancestors` gehört nicht in die Meta-CSP (Browser ignorieren es dort). Es steht im
  HTTP-Header in `_headers`, zusammen mit HSTS, `X-Frame-Options` usw. Beide CSPs (Header + Meta)
  gelten gleichzeitig; seitenspezifisches (Script-Hashes) bleibt im Meta-Tag.

## DNS-Härtung (Stand 2026-09-29)

DNSSEC aktiv. CAA: `issue letsencrypt.org` + `pki.goog` (Cloudflare) + `iodef
mailto:kolja@sagorski.org`; Cloudflare hängt für eigene Zertifikate automatisch weitere CAs an.
Mail: SPF `-all`, DMARC `p=quarantine` (Reports an Cloudflare DMARC Management). MTA-STS im Modus
`testing` über `mta-sts-worker/` (mta-sts.sgr.ski), TLS-RPT an kolja@sagorski.org. Nach ein paar
sauberen Wochen TLS-Reports: Policy auf `enforce`, `max_age` hoch, `id` in `_mta-sts` hochzählen;
DMARC dann auf `p=reject`. Details und Rückbau-Werte im Session-Memory `sgr-ski-dns-hosting`.

## Assets neu erzeugen

Quelle des Portraits ist `~/Desktop/ich hacker.png` (2048×2048, Split Anzug/Hoodie). Der
Avatar-Ausschnitt ist `x[188,1738], y[0,1550]` — mittig auf der Split-Linie bei x≈1018, Kopf
vollständig im Kreis. Bei Neu-Erzeugung diesen Ausschnitt beibehalten.

## Infrastruktur

Hosting seit 2026-09-30 auf **Cloudflare Workers** (reine Static Assets, kein Script), Worker
`sgr-ski`, Konfiguration in `wrangler.jsonc`. **Workers Builds zieht das Repo bei jedem Push auf
`main`** und führt `npx wrangler deploy` aus; das startet vorher `build.command`
(`sh scripts/build.sh` → CSP-Check + Allow-List nach `_site/`). GitHub Pages ist abgeschaltet;
`.github/workflows/check.yml` baut nur noch zur Kontrolle mit, deployt nichts. `www` leitet per
Cloudflare-Redirect-Regel (301) auf die Apex-Domain, „Always Use HTTPS“ an, TLS ≥ 1.2.
Zonen-Einstellungen (2026-09-30): SSL „Full (strict)“, TLS ≥ 1.2, HSTS zonenweit (1 Jahr,
includeSubDomains, nosniff; **kein** preload), Browser-Cache-TTL „Respect existing headers“ (0),
Cloudflare Managed Free Ruleset (WAF) aktiv, Rate-Limit 30 Req/10 s pro IP auf `ip.sgr.ski`
(die einzige Free-Regel; ersetzte das für diese Seite wirkungslose „Leaked credential check“).
**Bewusst aus — nicht wieder einschalten:** Web Analytics (fügt Inline-Skript + Beacon eines
Dritten ein), Bot Fight Mode (JS-Erkennung kollidiert mit der CSP und würde echte Besucher als Bots
werten), Email Obfuscation (bräuchte ein Skript, das die CSP blockt → kaputte mailto-Links),
Cloudflare-verwaltete robots.txt. Nach Änderungen an Zonen-Features immer im Browser auf
eingefügte Skripte prüfen (Konsole: CSP-Verstöße).
DNS-Details und die unantastbaren iCloud-Mail-Records im Session-Memory `sgr-ski-dns-hosting`.
