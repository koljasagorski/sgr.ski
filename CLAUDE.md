# sgr.ski — Repo-Konventionen

Private Ein-Seiten-Website. **Statisch, kein Build-Step, keine Dependencies.** Nicht auf ein
Framework migrieren, ohne dass es ausdrücklich gewünscht ist.

## Linear

Für dieses Repo existiert **kein** Linear-Projekt (Stand 2026-08-30, Team `KOL` geprüft). Falls
substanzielle Arbeit ansteht, zuerst prüfen, ob inzwischen eines angelegt wurde.

## Startseite: Carrd-Template #318 (seit 2026-11-16)

`index.html` setzt das Carrd-Template #318 um (`https://bb17e50b963c5e74.demo.carrd.co`; Entwurf und
Begründungen: `docs/superpowers/specs/2026-11-16-startseite-318-leistungen-design.md`). Deutsch
(`lang="de"`, `og:locale de_DE`). Aufbau: dunkle Karte (`.card`, max. 800 px, Radius 16) auf
facettiertem Hintergrund; links der Name zweifarbig (weiß / Gold), Untertitel und ein kurzer Text,
rechts das geteilte Portrait (`assets/portrait.webp`, 1200×1200, `fetchpriority="high"`, feste
`width`/`height`); darunter die Leiste (`.card__bar`) mit „LinkedIn · Buchen Sie meine
Dienstleistungen“ (→ `/leistungen/`) links und dem goldenen Mail-Button rechts. Der Hintergrund ist
`assets/bg.svg`, per `url()` in `body::before` (im Template ein `data:`-SVG, das die CSP verbietet).

**Wortlaut, überall gleich:** Untertitel „Seit über 20 Jahren auf beiden Seiten der Firewall.“ (HTML,
JSON-LD, Meta, `llms.txt`, `site.webmanifest`, OG-Bilder). Die Zertifizierung heißt „Certified
Security Analyst“ — nie „Certified IT Security Analyst“ (`check-pages.py` bricht sonst den Build ab).

Palette (Tokens in `assets/card.css`): `--bg #282830`, `--bg-top #36363b`, `--card #424247`, `--text
#fff`, `--muted #b7b7b9`, `--gold #E3BD52`, `--gold-light #FFEBA3`, `--on-gold #443e35`, `--panel
#1f1f25`. Kontraste (WCAG, aus dem Kommentar in `card.css`; bei neuen Farben nachrechnen): Text auf
Karte 10,0:1, `--muted` auf Karte 5,0:1, Gold auf Karte 5,5:1, `--on-gold` auf Gold 5,9:1. Auf dem
goldenen Ende der Leiste (`#5b5039`) bestehen nur `--text` (7,9:1) und `--gold-light` (6,7:1) — dort nie
`--gold` oder `--muted`. Tippflächen ≥ 24×24 px.

Fonts: **Sora** 600/700 (Überschriften) und **Inter** 400/600 (Text), Latin-WOFF2 unter
`assets/fonts/`, beide OFL 1.1 (`sora.LICENSE.txt`, `inter.LICENSE.txt`), selbst gehostet und im
`<head>` per `preload` geladen. Hack und Jersey 10 (40C3-Stand) sind samt Lizenzen entfernt.
JetBrains Mono bleibt für `/workshops`.

**PGP-Hinweis am Mail-Button:** „Lieber verschlüsselt? Mein PGP-Schlüssel liegt auf
keys.openpgp.org“ mit Link auf `https://keys.openpgp.org/search?q=kolja%40sagorski.org`. Ohne
JavaScript. Markup-Vertrag: `.mail` (`position: relative`) enthält `a.btn-gold` und `p.pgp > span`.
Ab 860 px mit `(hover: hover)` ist `.pgp` ein Panel über dem Button, sichtbar bei `.mail:hover` und
`.mail:focus-within`; sein Innenabstand unten (12 px) gehört zum Panel, damit die Maus ohne Lücke in
den Link fahren kann. Sonst (Touch, schmal, kein Hover) steht der Hinweis als sichtbare Zeile unter
dem Button, weil ein Tipp auf den Button sofort `mailto:` auslöst. Bekannte Grenzen: kein Esc zum
Schließen, und das Panel ist bis zum Fokus auf dem Button für Screenreader nicht im Baum
(`visibility: hidden`). Auf `/leistungen/` zeigt `.cta .pgp` (`leistungen.css`) die Zeile in jeder
Breite dauerhaft, ohne Panel.

**Impressum-Link am Rand:** `a.legal-link`, 12 px, `--muted`, unter der Karte rechts, mit ≥ 24 px
Höhe als Tippfläche. Bewusst klein, aber lesbar (≥ 4,5:1) und von jeder anderen Seite verlinkt.

Kein JavaScript auf der Seite (außer dem selbst gehosteten Umami), die CSP braucht nur
`connect-src https://umami.patchletter.com`. JSON-LD `Person` mit `@id https://sgr.ski/#person`
(`jobTitle`, `worksFor` patchletter UG, `knowsAbout`, `sameAs` LinkedIn + keys.openpgp.org,
`address`). Die Adresse steht in **allen** Schemas exakt so: patchletter UG (haftungsbeschränkt),
Meisterweg 16, 45896 Gelsenkirchen, DE. `avatar.webp` bleibt für `/workshops`, `/leistungen/` und
`/impressum/`; Bilder ohne Metadaten ablegen (`cwebp -metadata none`).

**Grafiken kommen aus Higgsfield** (Wunsch des Betreibers vom 2026-11-16), selbst gehostet und ohne
Metadaten — nie von Higgsfield/CloudFront einbetten. OG-Hintergrund: `scripts/og/bg.png`
(`gpt_image_2_6`, Job `811f5f23-8b0a-462c-8cd7-d6e11089eff5`, ohne Text und Personen, 1200×630). Darauf
legen `scripts/home-social.html` und `scripts/og-leistungen.html` das echte Portrait und den exakten
Text (Sora/Inter) — KI-Schrift und KI-Gesichter stimmen nicht verlässlich — und rendern
`assets/og.png` bzw. `assets/og-leistungen.png` (Chrome, 1200×630, Faktor 1, Befehl im
Dateikopf). Bei Textänderung neu rendern; LinkedIn cacht Vorschauen (Post Inspector). Favicon und Icons
(`favicon.ico` 16+32, `apple-touch-icon.png`, `assets/icon-192.png`, `assets/icon-512.png`): Monogramm
„KS“ in Gold auf `#282830`, Higgsfield-Job `77af68f5-9da1-46c7-9804-bae3e3e41cfc`, auf zwei Farben
gesnappt und heruntergerechnet. Dieser 1024-px-Master liegt **nicht** im Repo; für Änderungen neu
generieren. `site.webmanifest`: `lang de`, `theme_color`/`background_color` `#282830`.

Frühere Stände: 40C3-Styleguide „Model Citizens“ (Grün `#75b44b`, Jersey 10 + Hack; Stand von Commit
`88f0a6b`, 2026-11-06, ansehen mit `git show 88f0a6b:index.html`), Retro-Fenster nach Carrd-Template
#328 (Commit `6d82564`), Glas-Karte nach Template #294 (Commit `49fe2ab`), fünf Zufallsdesigns
(Commit `1cc6c2f`). Alle stehen in der Git-Historie, die Zufallsdesigns zusätzlich unter `handoff/`.

## Unterseite /leistungen/ (seit 2026-11-16)

`leistungen/index.html` (deutsch) ist das Ziel von „Buchen Sie meine Dienstleistungen“ und der
SEO-Hub für Ruhrgebiet und NRW. Gleiche Basis wie die Startseite: `assets/card.css` (Tokens, Fonts,
`.btn-gold`, `.pgp`, `.legal-link`) plus `assets/leistungen.css` (Kopfkarte, Blatt, Abschnitte, FAQ,
Kontaktblock; `/impressum/` lädt dasselbe Paar). Reihenfolge: Kopfkarte, H1, Inhaltsleiste, fünf
Leistungen, Ablauf (Erstgespräch → Angebot → Umsetzung), Kostenlose Werkzeuge (paste., IP-Leak-Test,
VPN Matrix — vorher auf der Startseite), FAQ, Kontakt (Mail + PGP-Zeile + LinkedIn).

Anker, die `check-pages.py` erzwingt und die das JSON-LD (`url`) nutzt: `#beratung`,
`#sicherheitstests`, `#microsoft-365`, `#souveraenitaet`, `#workshops`, `#werkzeuge`, `#faq`. Nicht
umbenennen. Eine H1; Titel „IT-Sicherheitsberatung Ruhrgebiet & NRW · Kolja Sagorski“.

Keyword-Karte, Kurzform (Spec: „Keyword-Karte“). **Suchvolumen sind nicht gemessen**, die Gewichtung
ist eine begründete Hypothese — nach 6–8 Wochen in der Search Console prüfen:

| Seite / Abschnitt | Hauptbegriff |
|---|---|
| `/` | IT-Sicherheitsberater Ruhrgebiet |
| `/leistungen/` (Hub) | IT-Sicherheitsberatung Ruhrgebiet & NRW |
| `#sicherheitstests` | Penetrationstest Ruhrgebiet (Pentest NRW, Schwachstellenanalyse) |
| `#microsoft-365` | Microsoft 365 Betreuung Ruhrgebiet (Security-Check, Conditional Access, Entra ID, Intune) |
| `#souveraenitaet` | Digitale Souveränität für Unternehmen (eigener Mailserver, Microsoft-365-Alternative) |
| `#workshops` | Security-Awareness-Schulung Ruhrgebiet (Hauptseite bleibt `/workshops/`) |

`#souveraenitaet` ist die größte Lücke: in der Stichprobe vom 2026-11-16 gab es dazu keinen regionalen
Dienstleister. Städte stehen natürlich im Fließtext und in `areaServed`, keine Städte-Doorway-Seiten
(„IT-Sicherheit Essen“ als Klon). Text, `areaServed` und `index.md` halten dieselbe Städteliste.

Schema: **ein** `@graph`-Block mit `ProfessionalService` (patchletter UG, Adresse wie im Impressum,
`areaServed`, `founder` → Person `#person`, `hasOfferCatalog` mit fünf `Service`, ohne Preise),
`BreadcrumbList` und `FAQPage`. Ein Block, weil `check-csp.py` nur den ersten JSON-LD-Block je Seite
prüft.

KI-Lesbarkeit: `leistungen/index.md` ist der Markdown-Spiegel (`rel="alternate" type="text/markdown"`).
**Inhaltsänderungen an `leistungen/index.html` auch in `index.md` nachziehen.** Die FAQ-Texte stehen
an drei Stellen (`<details>`, JSON-LD `FAQPage`, `index.md`) — alle drei ändern, danach den Hash neu
setzen. Dazu `llms.txt` („Services“), Titel, Description und OG-Text im Blick behalten.

**Nichts erfinden:** keine Preise, keine Kundennamen oder Referenzen, keinen Partnerstatus (z. B.
„Microsoft Partner“), keine weiteren Zertifikate. Das schließt der Spec aus; erst aufnehmen, wenn der Betreiber es
ausdrücklich liefert. Auch die Aussagen zu den Tests bleiben bei dem, was die Seite sagt: schriftliche Freigabe, vereinbarter Umfang,
jeder Befund manuell verifiziert. Die Schritte außerhalb der Website (Google-Unternehmensprofil,
Search Console und Bing mit `sitemap.xml`, LinkedIn-Link auf `/leistungen/`) macht der Betreiber; die
Liste steht im Spec unter „Außerhalb der Website“.

## Seitenprüfung: check-pages.py (seit 2026-11-16)

`.github/scripts/check-pages.py` läuft in `scripts/build.sh` direkt nach `check-csp.py` (also lokal,
in Workers Builds und in `check.yml`) und bricht den Build bei jedem Fehler ab. Für jede Seite in
`PAGES`: kein `style="…"`, kein `data:`-URI (auch nicht in `url(…)` der verlinkten CSS), jeder lokale
Verweis existiert (`/x/` → `x/index.html`), nie „Certified IT Security Analyst“, genau eine `<h1>`, und
die Muster aus `RULES` (Untertitel wortgleich, Mail-, PGP- und LinkedIn-Link, Anker der Leistungen,
Impressum-Pflichtangaben, Footer-Links). Neue Seite: in `PAGES` und `RULES` von `check-pages.py`
eintragen, bei JSON-LD auch in `PAGES` von `check-csp.py`, und in `scripts/build.sh`. `workshops/index.md`
und `leistungen/index.md` prüft das Skript nicht.

## Design-Herkunft (alter Stand, Variante 1d)

Die Seite setzte Variante **1d „Status Page"** aus dem Claude-Design-Projekt
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
exakt ist. Quelle: `scripts/workshops-social.html` (Chrome, 1200×630, Faktor 1, seit 2026-11-16 im
Repo). Bei Textänderung neu rendern; LinkedIn cacht Vorschauen (Post Inspector nutzen).

KI-Lesbarkeit: `/llms.txt` (Allow-List in `scripts/build.sh`!) und `workshops/index.md` als Markdown-Spiegel der
Workshop-Seite, verlinkt per `rel="alternate" type="text/markdown"`. **Inhaltliche Änderungen an
`workshops/index.html` auch in `index.md` nachziehen** — sonst widersprechen sich die Fassungen.
Kein Ranking-Hebel für Google (laut Google selbst), aber Agenten lesen es.

## Harte Regeln

- **Keine Inline-Styles, keine Inline-Scripts.** Die CSP ist `default-src 'none'`; alles andere
  läuft über `'self'`. Ein `style="…"` greift schlicht nicht.
- **Ausnahme:** die JSON-LD-Blöcke in `index.html`, `leistungen/index.html` und `workshops/index.html` sind jeweils per
  `'sha256-…'` freigegeben. Wird ein JSON geändert, muss dessen Hash neu — `python3 .github/scripts/check-csp.py` gibt den korrekten Wert aus
  und lässt sonst den Build fehlschlagen.
- **Fonts bleiben selbst gehostet.** Kein Google-Fonts-CDN (DSGVO) und keine weiteren
  Dritt-Requests. **Ausnahmen, beide auf eigener Infrastruktur des Betreibers:** `ip.sgr.ski`
  (siehe Workshops) und die Besuchsstatistik **Umami** (`umami.patchletter.com`, Website-ID
  `a9dbeae1-3e8d-4a32-9c86-647bfbb62c09`, auf Wunsch des Betreibers seit 2026-09-30) auf allen
  drei Seiten — cookielos, mit `data-domains="sgr.ski"`, `data-do-not-track`,
  `data-exclude-search`. Das Tracker-Skript ist **selbst gehostet** (`assets/umami.js`, per
  `data-host-url` an die Instanz): so darf `umami.patchletter.com` in der CSP nur unter
  `connect-src` stehen, nie unter `script-src` — ein kompromittierter Umami-Server kann damit keinen
  Code auf sgr.ski ausführen. Bei Umami-Updates das Skript neu herunterladen. Texte, die
  „speichert nichts“ behaupten, sind deshalb angepasst — nicht zurückschreiben.
  Heatmaps und Sitzungsaufzeichnungen sind seit 2026-09-30 ebenfalls gewünscht.
  `assets/umami-recorder.js` wird lokal ausgeliefert, nach `umami.js` auf allen vier
  Seiten. Update nur über `scripts/prepare-umami-recorder.py`: der Patch respektiert
  DNT, beschränkt auf sgr.ski und lässt auch Heatmap-Klicks `.rr-block` ausnehmen.
  Quiz-Antworten, Ergebnisse und `[data-bv]`/`[data-net]` tragen `.rr-block`; diese
  Ausschlüsse erhalten. Die CSP braucht weiterhin keine fremde Script-Quelle.
- **Impressum ja, Datenschutzseite nein.** Am 2026-08-30 hatte der Betreiber beides abgelehnt;
  am 2026-09-29 ausdrücklich ein kleines Impressum unter `/impressum/` gewünscht (Pflichtangaben
  wie patchletter.com/de/impressum). Seit 2026-11-16 vollständig, **mit USt-IdNr. DE466427019**
  (§ 27a UStG; dazu HRB 20118, Amtsgericht Gelsenkirchen, § 18 Abs. 2 MStV — `check-pages.py`
  erzwingt diese Angaben), und im Look der Startseite (`card.css` + `leistungen.css`). Der Link
  steht auf **allen** Seiten: Startseite (ganz klein am Rand unter der Karte), `/leistungen/`,
  `/workshops/` und Quiz im Footer; `/impressum/` selbst verlinkt zurück auf Start, Leistungen und
  Workshops. Nicht übernommen aus patchletter.com: Markenhinweis, „Haftung für Inhalte“ zu
  Release-Daten und der PGP-Block für hello@ (betreffen nur das Produkt). Eine Datenschutzseite
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
