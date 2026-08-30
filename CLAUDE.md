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

## Harte Regeln

- **Keine Inline-Styles, keine Inline-Scripts.** Die CSP ist `default-src 'none'`; alles andere
  läuft über `'self'`. Ein `style="…"` greift schlicht nicht.
- **Ausnahme:** der JSON-LD-Block in `index.html` ist per `'sha256-…'` freigegeben. Wird das JSON
  geändert, muss der Hash neu — `python3 .github/scripts/check-csp.py` gibt den korrekten Wert aus
  und lässt sonst den Build fehlschlagen.
- **Fonts bleiben selbst gehostet.** Kein Google-Fonts-CDN (DSGVO) und keine weiteren
  Dritt-Requests.
- **Kein Impressum, keine Datenschutzseite.** Ausdrückliche Entscheidung des Betreibers am
  2026-08-30 — nicht ungefragt wieder einbauen.
- **`--faint` und `--faint-text` sind nicht dasselbe.** `--faint` (#a3a39c / #5a616a) ist der
  Originalton des Entwurfs und bleibt den dekorativen, `aria-hidden`-Pfeilen vorbehalten.
  Sichtbarer Text nutzt `--faint-text`, das WCAG AA (4.5:1) erfüllt. Text nie auf `--faint`
  umstellen — die Fußzeile lag damit bei 2.45:1.
- Die Assemble-Stufe in `deploy.yml` ist eine **Allow-List**. Neue Dateien, die veröffentlicht
  werden sollen, müssen dort eingetragen werden, sonst fehlen sie live. Eine Deny-List wäre
  gefährlicher: dann landet jede Streudatei im Web-Root.
- `frame-ancestors` gehört nicht in die Meta-CSP: Browser ignorieren es dort und loggen einen
  Fehler. GitHub Pages kann keine HTTP-Header setzen, echter Clickjacking-Schutz ist damit nicht
  möglich.

## Assets neu erzeugen

Quelle des Portraits ist `~/Desktop/ich hacker.png` (2048×2048, Split Anzug/Hoodie). Der
Avatar-Ausschnitt ist `x[188,1738], y[0,1550]` — mittig auf der Split-Linie bei x≈1018, Kopf
vollständig im Kreis. Bei Neu-Erzeugung diesen Ausschnitt beibehalten.

## Infrastruktur

DNS auf Cloudflare, Hosting GitHub Pages — Details und die unantastbaren iCloud-Mail-Records
stehen im Session-Memory unter `sgr-ski-dns-hosting`.
