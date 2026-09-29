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
`codecs=`-Angabe). Die CSP enthält dafür `media-src 'self'`. Er läuft nur im Sichtbereich, nie bei
`prefers-reduced-motion`, und hat einen Pause-Schalter (WCAG 2.2.2).

## Harte Regeln

- **Keine Inline-Styles, keine Inline-Scripts.** Die CSP ist `default-src 'none'`; alles andere
  läuft über `'self'`. Ein `style="…"` greift schlicht nicht.
- **Ausnahme:** die JSON-LD-Blöcke in `index.html` und `workshops/index.html` sind jeweils per `'sha256-…'` freigegeben. Wird ein JSON
  geändert, muss dessen Hash neu — `python3 .github/scripts/check-csp.py` gibt den korrekten Wert aus
  und lässt sonst den Build fehlschlagen.
- **Fonts bleiben selbst gehostet.** Kein Google-Fonts-CDN (DSGVO) und keine weiteren
  Dritt-Requests.
- **Impressum ja, Datenschutzseite nein.** Am 2026-08-30 hatte der Betreiber beides abgelehnt;
  am 2026-09-29 ausdrücklich ein kleines Impressum unter `/impressum/` gewünscht (Pflichtangaben
  wie patchletter.com/de/impressum, verlinkt im Footer von `/workshops`). Eine Datenschutzseite
  weiterhin nicht ungefragt einbauen.
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
