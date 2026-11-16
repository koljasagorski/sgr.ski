# Startseite #318, /leistungen/, Impressum, SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Startseite bekommt den Look von Carrd #318 auf Deutsch, dazu eine SEO-starke Seite `/leistungen/`, ein vollständiges Impressum und Grafiken aus Higgsfield.

**Architecture:** Statische HTML-Seiten ohne Build-Step. Gemeinsames Grund-CSS `assets/card.css` (Startseite + Impressum), eigenes `assets/leistungen.css`. Getestet wird mit einem neuen Python-Prüfskript `.github/scripts/check-pages.py`, das `scripts/build.sh` neben `check-csp.py` aufruft, dazu Chromium-Screenshots und eine Kontrastrechnung.

**Tech Stack:** HTML, CSS, Python 3 (Standardbibliothek), Chrome headless, `cwebp`, Higgsfield-MCP, `pyftsubset` (fonttools).

**Spec:** `docs/superpowers/specs/2026-11-16-startseite-318-leistungen-design.md`

## Global Constraints

- CSP `default-src 'none'`; kein `style="…"`, kein Inline-Script außer dem JSON-LD-Block (per `sha256` freigegeben); `data:`-URIs verboten.
- Untertitel wortgleich überall: **„Seit über 20 Jahren auf beiden Seiten der Firewall.“**
- Titel der Zertifizierung: **„Certified Security Analyst“**, nie „Certified IT Security Analyst“.
- Nichts erfinden: keine Preise, Kunden, Partnerstatus, weiteren Zertifikate.
- Adresse in allen Schemas exakt: patchletter UG (haftungsbeschränkt), Meisterweg 16, 45896 Gelsenkirchen, DE.
- PGP-Link exakt: `https://keys.openpgp.org/search?q=kolja%40sagorski.org`.
- Mail exakt `kolja@sagorski.org`; LinkedIn `https://www.linkedin.com/in/koljasagorski/`.
- Fonts selbst gehostet (Sora 600/700, Inter 400/600, Latin-WOFF2, OFL-Lizenzen in `assets/fonts/`).
- Alle Texte ≥ 4.5:1 Kontrast; Tippflächen ≥ 24×24 px.
- Grafiken aus Higgsfield, ohne Metadaten, selbst gehostet.
- Arbeit auf Branch `redesign-318-leistungen`; nach jedem Commit `git push`; Stagen nur mit Pfaden (die untracked ZIP nie committen).

## Review Focus

1. Touch-Gerät tippt auf den Mail-Button → PGP-Hinweis war schon sichtbar (Mobil: statische Zeile), `mailto:` öffnet sich.
2. Tastaturnutzer tabbt auf den Mail-Button → das PGP-Panel erscheint (`:focus-within`), sein Link ist per Tab erreichbar.
3. Schmales Display (320 px) → kein horizontales Scrollen, Name bricht sauber um, Split-Linie im Portrait bleibt mittig.
4. Geänderter JSON-LD auf irgendeiner Seite → Build schlägt fehl, bis der Hash stimmt (gilt jetzt auch für `/leistungen/`).
5. Die Seite wird in die Allow-List aufgenommen, aber ein Asset fehlt (Font/SVG) → `check-pages.py` meldet jede lokal referenzierte Datei, die nicht existiert.

---

### Task 1: Prüfskript für die Seiten

**Files:**
- Create: `.github/scripts/check-pages.py`
- Modify: `scripts/build.sh` (nach `check-csp.py` aufrufen)

**Interfaces:**
- Produces: `python3 .github/scripts/check-pages.py`, Exit 0/1. Die Datenstruktur `RULES: dict[str, list[tuple[str, str]]]` ordnet jeder Seite (Pfad) Paare aus Beschreibung und Regex zu, die vorkommen müssen. Später kommen weitere Regeln hinzu.

- [ ] **Step 1:** Das Skript prüft für jede HTML-Datei in `index.html`, `leistungen/index.html`, `impressum/index.html`, `workshops/index.html` und `workshops/quiz/index.html`:
  (a) kein ` style="`;
  (b) kein `data:` in `src`/`href`/`url(`;
  (c) jede lokale Referenz (`src`/`href` beginnend mit `/`, ohne `#`/Query) existiert im Repo, ebenso `url(...)` in den verlinkten CSS-Dateien;
  (d) kein „Certified IT Security Analyst“;
  (e) genau eine `<h1`;
  (f) die Regeln aus `RULES`.
  Startregeln für `index.html`:
  - `lang="de"`
  - `Seit über 20 Jahren auf beiden Seiten der Firewall\.`
  - `href="mailto:kolja@sagorski\.org"`
  - `keys\.openpgp\.org/search\?q=kolja%40sagorski\.org`
  - `href="/leistungen/"`
  - `href="/impressum/"`
  - `linkedin\.com/in/koljasagorski`
  Fehlende Seiten melden FAIL.
- [ ] **Step 2:** Ausführen. Erwartet: FAIL (Startseite englisch, `leistungen/` fehlt, „Certified IT Security Analyst“ an 7 Stellen).
- [ ] **Step 3:** In `build.sh` direkt nach `check-csp.py` die Zeile `python3 .github/scripts/check-pages.py` einfügen.
- [ ] **Step 4:** Commit `Add page checks for the redesign` und pushen. Das Skript bleibt rot, bis Task 5 durch ist; das ist auf dem Branch beabsichtigt.

### Task 2: Zertifizierungstitel korrigieren

**Files:** Modify `workshops/index.html` (JSON-LD `jobTitle` + 3 sichtbare Stellen + CSP-Hash), `workshops/index.md`, `workshops/quiz/index.html`, `llms.txt`, `site.webmanifest`; prüfen `assets/og-workshops.png`, `assets/og-quiz.png`.

- [ ] **Step 1:** Überall „Certified IT Security Analyst“ durch „Certified Security Analyst“ ersetzen.
- [ ] **Step 2:** `python3 .github/scripts/check-csp.py` ausführen. Den ausgegebenen neuen Hash für `workshops/index.html` in dessen `script-src` einsetzen und erneut ausführen. Erwartet: `OK workshops/index.html`.
- [ ] **Step 3:** Die beiden OG-PNGs ansehen (Read). Steht der falsche Titel darin, das jeweilige Quell-HTML suchen (`git log --all -- assets/og-workshops.png`, Commit-Text) und neu rendern. Gibt es keine Quelle, im Abschlussbericht nennen.
- [ ] **Step 4:** Commit `Fix certification title: Certified Security Analyst`, push.

### Task 3: Fonts, Hintergrund, Startseite nach #318

**Files:**
- Create: `assets/fonts/sora-latin-600.woff2`, `sora-latin-700.woff2`, `inter-latin-400.woff2`, `inter-latin-600.woff2`, `sora.LICENSE.txt`, `inter.LICENSE.txt`, `assets/bg.svg`
- Rewrite: `assets/card.css`, `index.html`
- Delete (wenn `grep -r "hack-latin\|jersey-10" --exclude-dir=_site --exclude-dir=.git` danach nur noch `scripts/home-social.html` trifft): Hack- und Jersey-Fonts samt Lizenzen

**Interfaces:**
- Produces: CSS-Tokens in `card.css`, die Impressum und Leistungen wiederverwenden:
  - `--bg: #282830`, `--card: #3a3a42` (aus der Vorlage nachmessen), `--text: #fff`, `--muted` (≥ 4.5:1 auf `--card`), `--gold: #E3BD52`, `--gold-light: #FFEBA3`, `--head: "Sora"`, `--body: "Inter"`
  - Klassen `.card`, `.card__copy`, `.card__photo`, `.card__bar`, `.btn-gold`, `.pgp`, `.legal-link`

- [ ] **Step 1:** Die Fonts von Fontsource beziehen (`https://cdn.jsdelivr.net/npm/@fontsource/sora@5/files/sora-latin-700-normal.woff2` usw. per curl, nur als Download). Lizenz-Text der OFL aus dem jeweiligen Paket übernehmen.
- [ ] **Step 2:** `assets/bg.svg`: Das `data:`-SVG aus `demo318.html` dekodieren (die Dreiecks-Polygone mit den weißen Verläufen) und als Datei ablegen. In `card.css` per `background-image: url("/assets/bg.svg"), linear-gradient(...)` einbinden.
- [ ] **Step 3:** `index.html` neu schreiben:
  - `lang="de"`, `og:locale de_DE`, `theme-color #282830`.
  - Titel: „Kolja Sagorski – IT-Sicherheitsberater im Ruhrgebiet“.
  - Description wörtlich aus dem Spec.
  - JSON-LD `Person` gemäß Spec (`jobTitle "Certified Security Analyst"`, `worksFor` Organization mit Adresse, `sameAs` LinkedIn + keys.openpgp-Link).
  - Umami-Tags unverändert.
  - Aufbau:
    - `<main class="card">`: links `h1` mit „Kolja“ (weiß) und „Sagorski“ (gold); `p.lead` mit dem Untertitel (fett, weiß); `p` mit „Certified Security Analyst. IT-Sicherheitsberatung, Sicherheitstests und Microsoft-365-Betreuung aus Gelsenkirchen für das Ruhrgebiet und NRW.“
    - Rechts das Portrait-`img` (`object-fit: cover`, `object-position` so, dass die Split-Linie bei x≈50 % bleibt).
    - Darunter `.card__bar`: links LinkedIn, gold-Punkt, `<a href="/leistungen/">Buchen Sie meine Dienstleistungen</a>`; rechts `<div class="mail">` mit `a.btn-gold` (Briefumschlag-Icon + `kolja@sagorski.org`) und `p.pgp` („Lieber verschlüsselt? Mein PGP-Schlüssel liegt auf keys.openpgp.org“, verlinkt).
  - Nach `</main>`: `<a class="legal-link" href="/impressum/">Impressum</a>`, klein (12 px), unten rechts am Viewport-Rand.
- [ ] **Step 4:** CSS, Desktop (≥ 860 px):
  - Karte 800 px breit, 2 Spalten 50/50, Radius 16 px, Fußleiste über die volle Breite mit Gold-Verlauf rechts wie in der Vorlage.
  - `.pgp`: absolut über dem Button, `opacity:0; visibility:hidden`; sichtbar bei `.mail:hover .pgp, .mail:focus-within .pgp`. Zwischen Button und Panel keine Lücke, damit die Maus hineinfahren kann.
  - Mobil (< 860 px, sowie `@media (hover: none)`): Foto oben im Seitenverhältnis 4:3, Text zentriert, `.pgp` statisch sichtbar unter dem Button.
  - `prefers-reduced-motion` respektieren.
- [ ] **Step 5:** `python3 .github/scripts/check-csp.py` ausführen, den Hash für `index.html` eintragen, dann `python3 .github/scripts/check-pages.py`. Erwartet: `index.html` OK.
- [ ] **Step 6:** Screenshots mit Chrome headless (`--window-size=1440,900` und `390,844`, zusätzlich `320,700`) in den Scratchpad. Ansehen und mit `c318-desktop.png` vergleichen. Prüfen: kein horizontaler Scroll (Wert von `document.documentElement.scrollWidth` per `--dump-dom` ist nicht nötig, der Screenshot bei 320 reicht), Split-Linie mittig.
- [ ] **Step 7:** Kontraste rechnen (kleines Python-Snippet, WCAG-Formel):
  - Weiß auf `--card`
  - `--muted` auf `--card`
  - Gold auf `--card`
  - Button-Text auf `--gold`
  - `.legal-link` auf `--bg`
  Alle Werte ≥ 4.5.
- [ ] **Step 8:** Commit `Home page: card design after Carrd template #318, in German` (Fonts, SVG, CSS, HTML; alte Fonts entfernen), push.

### Task 4: Seite /leistungen/

**Files:**
- Create: `leistungen/index.html`, `leistungen/index.md`, `assets/leistungen.css`
- Modify: `scripts/build.sh` (Allow-List `leistungen`), `.github/scripts/check-csp.py` (`PAGES` += `leistungen/index.html`), `.github/scripts/check-pages.py` (`RULES` für Leistungen)

**Interfaces:**
- Consumes: Tokens, Fonts, `.btn-gold`, `.pgp` aus `card.css`; die Seite lädt `card.css` und danach `leistungen.css` per `<link>`.

- [ ] **Step 1:** `RULES["leistungen/index.html"]`:
  - `<title>IT-Sicherheitsberatung Ruhrgebiet &amp; NRW · Kolja Sagorski</title>`
  - die Anker `id="beratung"`, `id="sicherheitstests"`, `id="microsoft-365"`, `id="souveraenitaet"`, `id="workshops"`, `id="werkzeuge"`, `id="faq"`
  - `href="/workshops/"`, `p.sgr.ski`, `ipleak.sgr.ski`, `vpn-matrix.com`, `"@type": "ProfessionalService"`, `"areaServed"`, `href="/impressum/"`, `rel="alternate" type="text/markdown"`

  Ausführen. Erwartet: FAIL, die Seite fehlt.
- [ ] **Step 2:** Die Seite schreiben (Sie-Form, sachlich).
  - Kopf: kleine Karte mit Avatar, Name und Rücklink „← Start“.
  - H1 „IT-Sicherheit für Unternehmen im Ruhrgebiet und NRW“, darunter ein Intro-Absatz mit Untertitel-Satz, Gelsenkirchen als Sitz und den Städten Essen, Bochum, Dortmund, Duisburg, Oberhausen, Bottrop, Herne, Recklinghausen (in einem Satz). Dazu „vor Ort im Ruhrgebiet, remote in ganz NRW und Deutschland“.
  - Fünf `section` mit H2 und Anker. Je 2–4 Sätze plus eine Liste mit 3–5 konkreten Leistungen, wie im Spec benannt. Die Workshops-Sektion verlinkt auf `/workshops/` und das Quiz.
  - „So läuft die Zusammenarbeit“: 3 Schritte.
  - Werkzeuge: 3 Links mit `target="_blank" rel="noopener noreferrer"`.
  - FAQ mit 5 `<details>`.
  - Kontakt-CTA mit demselben Gold-Button und PGP-Satz.
  - Footer mit „Impressum“.
  - Head: Canonical `https://sgr.ski/leistungen/`, OG/Twitter mit `og-leistungen.png` (1200×630), `de_DE`, Umami-Tags, Markdown-Alternate.
  - **Ein** JSON-LD-Block mit `@graph`, bestehend aus:
    - `ProfessionalService` (`@id https://sgr.ski/leistungen/#service`, name „Kolja Sagorski – IT-Sicherheitsberatung“, `legalName` patchletter UG (haftungsbeschränkt), Adresse, `areaServed` als Liste von `City`-Objekten plus `State` NRW plus `Country` DE, `founder` → Person-@id `https://sgr.ski/#person`, `hasOfferCatalog` mit fünf `Offer.itemOffered` `Service` und `url` je Anker, keine Preise)
    - `BreadcrumbList` (Start › Leistungen)
    - `FAQPage` (dieselben 5 Fragen wortgleich)
  - Auf der Startseite bekommt die Person dieselbe `@id`.
- [ ] **Step 3:** `leistungen/index.md` als Markdown-Spiegel mit identischem Inhalt.
- [ ] **Step 4:** `build.sh`-Allow-List und `PAGES` in `check-csp.py` ergänzen. Den Hash eintragen. Beide Checks ausführen. Erwartet: OK für alle Seiten außer `impressum` (USt-Regel kommt in Task 5).
- [ ] **Step 5:** Screenshots 1440/390 ansehen. JSON-LD per `python3 -c "json.loads(...)"` parsen, das muss fehlerfrei durchlaufen.
- [ ] **Step 6:** Commit `Add /leistungen: services page for the Ruhr area`, push.

### Task 5: Impressum und Footer-Links

**Files:** Modify `impressum/index.html`, `workshops/index.html` (Footer: Link „Leistungen“), `workshops/quiz/index.html` (Footer: Impressum-Link, falls fehlend), `.github/scripts/check-pages.py`.

- [ ] **Step 1:** `RULES["impressum/index.html"]`: `DE466427019`, `HRB 20118`, `Meisterweg 16`, `§ 18 Abs\. 2 MStV`, `href="/"`. Ausführen → FAIL (USt fehlt).
- [ ] **Step 2:** Impressum auf `card.css`-Look umstellen: dunkle Karte, Sora-Überschriften. Rücklink „← Start“. Abschnitte laut Spec (mit USt-IdNr. „Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE466427019“). Alte `styles.css`/`theme.js`-Einbindung entfernen, wenn Impressum ihr einziger Nutzer ist (per grep prüfen, sonst lassen). `<meta name="robots" content="noindex">` bleibt weg, das Impressum soll auffindbar sein.
- [ ] **Step 3:** Footer-Links ergänzen. Checks ausführen → alles OK.
- [ ] **Step 4:** Commit `Impressum: full company details, new look; link services from /workshops`, push.

### Task 6: Grafiken aus Higgsfield (OG + Favicon/Icons)

**Files:**
- Create: `assets/og-leistungen.png`, `scripts/og-leistungen.html`, `scripts/og/bg.png` (Higgsfield-Quelle; unter `scripts/`, damit sie nicht veröffentlicht wird)
- Rewrite: `assets/og.png`, `scripts/home-social.html`, `favicon.ico`, `apple-touch-icon.png`, `assets/icon-192.png`, `assets/icon-512.png`, `site.webmanifest`

- [ ] **Step 1:** Higgsfield-Guthaben prüfen (`balance`). Wenn es für ca. 2 Bild-Batches nicht reicht, abbrechen und melden.
- [ ] **Step 2:** OG-Hintergrund generieren (16:9 oder 1200×630-nah, `gpt_image_2_6`). Prompt: dunkles Anthrazit `#282830`, abstrakte geometrische Dreiecksflächen wie in #318, ein gold glimmender Firewall-/Netzwerk-Riss als Trennlinie in der Bildmitte, links Platz für Text, kein Text, keine Personen. Zwei Varianten, die bessere wählen. Herunterladen nach `scripts/og/bg.png`.
- [ ] **Step 3:** `scripts/home-social.html` und `scripts/og-leistungen.html` (1200×630) bauen: Higgsfield-Hintergrund, echtes `portrait.webp` rechts, Text in Sora/Inter.
  - Start: „Kolja **Sagorski**“, Untertitel, „sgr.ski“.
  - Leistungen: „IT-Sicherheit für Unternehmen im Ruhrgebiet“, dazu die fünf Leistungen als kurze Zeile.
  - Mit Chrome headless rendern (`--window-size=1200,630 --force-device-scale-factor=1`) und mit `pngquant`/`oxipng` (falls vorhanden) verkleinern. Die Datei ist danach ohne Metadaten, Chrome schreibt keine.
- [ ] **Step 4:** Favicon generieren (Higgsfield, quadratisch): Monogramm „KS“, links hell, rechts dunkel geteilt (Split-Motiv), Gold `#E3BD52` auf `#282830`, flach, ohne Verlauf, gut lesbar bei 16 px. Zwei Varianten, die bessere wählen.
  - Mit `sips`/Python-PIL auf 512, 192, 180 und 32/16 skalieren.
  - `favicon.ico` aus 16+32 erzeugen (PIL `save(sizes=[(16,16),(32,32)])`).
  - Bei 32 px ansehen, ob es lesbar ist.
- [ ] **Step 5:** `site.webmanifest` anpassen:
  - `description` = „Certified Security Analyst. Seit über 20 Jahren auf beiden Seiten der Firewall.“
  - `background_color`/`theme_color` `#282830`
  - `"lang": "de"`
- [ ] **Step 6:** Alle neuen Bilder ansehen (Read). Checks + Build ausführen.
- [ ] **Step 7:** Commit `Social images and icons generated with Higgsfield`, push.

### Task 7: SEO-Dateien und Doku

**Files:** Modify `sitemap.xml`, `llms.txt`, `CLAUDE.md`, `README.md`.

- [ ] **Step 1:** `sitemap.xml`:
  - `/` (lastmod 2026-11-16)
  - `/leistungen/` (0.9)
  - `/workshops/` (lastmod 2026-11-16, wegen der Titelkorrektur)
  - `/workshops/quiz/`
  - `/impressum/` (0.2)
- [ ] **Step 2:** `llms.txt`:
  - Intro auf „Certified Security Analyst, seit über 20 Jahren …“ ändern und Region nennen.
  - Unter „Pages“ die Leistungen samt Markdown-Link aufnehmen.
  - Neue Sektion „Services“ mit den fünf Leistungen und dem Einsatzgebiet.
- [ ] **Step 3:** In `CLAUDE.md` den Abschnitt „Startseite“ durch die Beschreibung von #318 ersetzen:
  - Palette, Fonts, PGP-Panel-Verhalten, Impressum-Link am Rand
  - das 40C3-Design als früheren Stand mit Commit `88f0a6b` aufnehmen
  - neuer Abschnitt `/leistungen/` (Keyword-Karte in Kurzform, Inhaltsänderungen auch in `index.md` nachziehen, nichts erfinden)
  - Hinweis auf `check-pages.py`
  - Impressum-Regel aktualisieren (USt-IdNr., Links von allen Seiten)
  - JSON-LD-Ausnahme um `leistungen/index.html` ergänzen

  In `README.md` die Seitenliste anpassen.
- [ ] **Step 4:** `sh scripts/build.sh` ausführen. Erwartet: beide Checks OK, `_site/leistungen/index.html` ist im Tree.
- [ ] **Step 5:** Commit `SEO files and docs for the redesign`, push.

### Task 8: Abnahme und Merge

- [ ] **Step 1:** Seiten lokal per `python3 -m http.server -d _site 8787` ausliefern und mit Chrome headless screenshotten:
  - Start: 1440, 390, 320
  - Leistungen: 1440, 390
  - Impressum: 390
  - Hover-Zustand: mit dem `/browse`-Skill (gstack) die Startseite öffnen, über den Mail-Button hovern, Screenshot machen, die Konsole auf CSP-Fehler prüfen. Danach per Tab auf den Button fokussieren und prüfen, ob das Panel erscheint.
- [ ] **Step 2:** Code-Review des ganzen Branches durch einen frischen Reviewer (`ecc:code-reviewer`).
- [ ] **Step 3:** Findings fixen, Checks erneut ausführen.
- [ ] **Step 4:** `git switch main && git pull --ff-only && git merge --ff-only redesign-318-leistungen && git push`. Das deployt live.
- [ ] **Step 5:** Nach ca. 2 Minuten `curl -sI https://sgr.ski/leistungen/` (200) prüfen, `https://sgr.ski/` im Browser öffnen, Konsole ohne CSP-Verstöße.
- [ ] **Step 6:** `git fetch --prune` und prüfen, dass `main` gleich `origin/main` ist.
- [ ] **Step 7:** Abschlussbericht mit Checkliste für den Betreiber:
  - Google-Unternehmensprofil
  - Search Console + Bing Webmaster (Sitemap einreichen)
  - LinkedIn-Link auf `/leistungen/`
  - LinkedIn Post Inspector für das neue OG-Bild
  - Linear nicht erreichbar
