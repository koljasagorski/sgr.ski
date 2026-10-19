# Prompt für Claude Code — sgr.ski Redesign (5 Designs, zufällig pro Besuch)

Baue die Landingpage https://sgr.ski neu. Es gibt 5 Designs. Bei jedem Seitenaufruf wird eins zufällig ausgespielt. Referenz-Mockup: `sgr.ski Redesign.dc.html` (liegt bei; nur als visuelle Vorlage, nicht den Code übernehmen).

## Rahmenbedingungen

- Statische Seite: eine `index.html`, CSS, ein kleines Vanilla-JS. Kein Framework, kein Build-Step, keine Tracker, keine externen Requests außer Fonts (Fonts möglichst self-hosten: JetBrains Mono 400/500/700/800, IBM Plex Mono 400/500/600, Space Grotesk 400/500/700).
- Bestehende Assets wiederverwenden: `/assets/avatar.webp` (geteiltes Gesicht: links Anzug, rechts Hoodie — bitte prüfen und ggf. Labels tauschen), `/assets/og.png`, `/kolja-sagorski.asc`.
- Alle bestehenden `<head>`-Metadaten (title, description, OG, Twitter, canonical, theme-color, profile:*) 1:1 übernehmen.
- „Skip to content“-Link und `<main id="main">` beibehalten.

## Inhalt (in allen Designs identisch, wörtlich)

- Name: **Kolja Sagorski**
- Rolle: **Certified IT Security Analyst**
- Slogan: **20+ years on both sides of the firewall.**
- Links: LinkedIn `https://www.linkedin.com/in/koljasagorski/` (target=_blank, rel=noopener), Mail `mailto:kolja@sagorski.org`, PGP `https://sgr.ski/kolja-sagorski.asc` (ID `0x5EFB194EAD8BC39F`)
- Footer: `SGR.SKI — LOCALHOST`
- Avatar-Alt-Text: „Portrait of Kolja Sagorski, split down the middle: business attire on one side, hoodie on the other.“

## Architektur

- Ein gemeinsames semantisches HTML-Grundgerüst; die Designs unterscheiden sich über `data-theme="1a|1b|1c|2a|2b"` am `<html>`-Element plus theme-spezifische Deko-Elemente (per JS eingefügt oder per CSS ein-/ausgeblendet). Inhalte nicht duplizieren, wo es vermeidbar ist; Screenreader sollen in jedem Design dasselbe hören. Rein dekorativer Text (Prompts, Hexdump, Key-Block, Nmap-Header) bekommt `aria-hidden="true"`.
- Auswahl-Logik (inline im `<head>`, vor dem ersten Paint, damit kein Flackern entsteht):
  1. `?theme=1a` (etc.) in der URL erzwingt ein Design (zum Testen/Teilen).
  2. Sonst zufällig aus den 5 Designs, aber nicht dasselbe wie beim letzten Besuch (letztes Design in `localStorage` unter `sgr.theme.last` merken).
  3. Ohne JS: Fallback auf `1a`.
- Kleiner unauffälliger Hinweis im Footer, z. B. `theme: 2b · [reroll]` — Klick lädt ein anderes zufälliges Design.
- Responsive: Mockups sind 1200×760 Desktop-Artboards. Auf Mobil (<760px) jeweils einspaltig stapeln: Avatar oben, dann Name, Rolle, Slogan, Links. Keine festen Höhen auf Mobil.
- `prefers-reduced-motion`: Cursor-Blinken und Uhr-Animationen aus.
- Kontrast mindestens 4.5:1 für Fließtext; sichtbare Fokus-Styles für alle Links.
- Lighthouse 100 / 100 / 100 / 100 anpeilen; Gesamtgewicht ohne Avatar < 60 KB.

## Die 5 Designs

### 1a — Terminal Session
- Hintergrund `#0a0c0b`, Text `#c9d4cc`, Akzent `#7CFC9A`, gedimmt `#5d6b62`, hell `#eef5f0`. Font: JetBrains Mono.
- Oben schmale Statusleiste mit Trennlinie `#1a201c`: links `kolja@sgr.ski: ~`, rechts `tty1 · ssh · 443/tcp open`.
- Zweispaltig (Text | Avatar 380px). Text als Shell-Session, Prompt `kolja@sgr.ski` (grün) + `:~$` (grau):
  - `whoami` → Name in 64px / 800
  - `cat role.txt` → Rolle
  - `cat motto.txt` → Slogan 30px in Grün
  - `ls ./contact` → Links nebeneinander: `linkedin/`, `kolja@sagorski.org`, `0x5EFB194EAD8BC39F.asc`
  - letzte Zeile: Prompt mit blinkendem grünem Block-Cursor (11×22px, 1s steps)
- Avatar quadratisch, mit vier grünen Eck-Brackets (28px, 2px). Darunter klein: `avatar.webp` / `2 sides · 1 operator`.
- Footer mit Trennlinie: `SGR.SKI — LOCALHOST` · `[q] quit`.

### 1b — Blue Team / Red Team
- Seite vertikal 50/50 geteilt, die Teilung liegt exakt auf der Gesichtsteilung. Links `#0b1424` (Text `#d6e3f5`, Akzent `#5fa8ff`), rechts `#1c0a0c` (Text `#f5d9da`, Akzent `#ff5a5f`). Mittellinie 1px `#ffffff22`.
- Ecken: links oben `// BLUE TEAM`, rechts oben `RED TEAM //` (Mono, 13px, letter-spacing .14em, Akzentfarbe). Links unten `defend / harden / detect`, rechts unten `attack / exploit / pivot` (gestapelt, gedämpft).
- Zentriert gestapelt: `KOLJA SAGORSKI` (Mono, .2em Spacing) → runder Avatar 300px mit Schatten links blau / rechts rot (`box-shadow:-12px 0 0 #5fa8ff, 12px 0 0 #ff5a5f`) → Slogan geteilt an der Mittelachse: „20+ years on“ rechtsbündig links, „both sides of the firewall.“ linksbündig rechts (Space Grotesk 46px/700) → Rolle → Links zentriert in einer Reihe.
- Mobil: Hintergrund wird horizontal geteilt (oben blau, unten rot) oder diagonal; Slogan einzeilig zentriert.

### 1c — Hexdump / Phosphor
- Hintergrund `#0d0a06`, Bernstein `#ffb340`, hell `#ffd27a`, gedimmt `#8a6427`, Hex `#c98a2a`. Font: IBM Plex Mono. Innere Vignette (`box-shadow: inset 0 0 160px #000`).
- Links: `$ xxd kolja.bin | head`, darunter ein echter Hexdump (per JS aus dem String `"Kolja Sagorski..Certified IT Security Analyst..20+ years on both sides of the firewall........."` erzeugt: Offset 8-stellig + `:`, 16 Bytes als 2-Byte-Gruppen, ASCII-Spalte). Unten: Rolle, Name 58px/600, Slogan 26px, Links als `[linkedin] [kolja@sagorski.org] [pgp 0x5EFB194EAD8BC39F]` über gestrichelter Linie `#4a3514`.
- Rechts 400px vollhoher Avatar mit `filter: sepia(.6) saturate(1.3) contrast(1.05)` und Scanlines (`repeating-linear-gradient(0deg,#0d0a0655 0 2px,transparent 2px 4px)`). Unten Label `0x00 ← suit` / `hoodie → 0xFF`.

### 2a — PGP Key Block
- Hintergrund `#0f0e13`, Text `#e6e3ee`, Akzent Violett `#b18cff`, gedimmt `#8d86a3` / `#5b5470`, Rahmen `#3a3450`.
- Vollflächig im Hintergrund (aria-hidden): `-----BEGIN PGP PUBLIC KEY BLOCK-----`, Base64-artiger Füllblock in `#2a2733` (deterministisch, pseudozufällig; alternativ den echten Inhalt aus `kolja-sagorski.asc` einlesen und anzeigen — bevorzugt), unten `-----END PGP PUBLIC KEY BLOCK-----`.
- Zentrierte Karte 820px, Hintergrund wie Seite, 1px Rahmen: links Avatar 300px, rechts `uid [ultimate]` (Violett, klein), Name Space Grotesk 44px/700, Rolle, Slogan 26px violett, dann Liste `mail` / `web` / `key` mit Fingerprint `5EFB 194E AD8B C39F ↓`.

### 2b — Nmap Scan Report
- Hintergrund `#08080a`, Text `#d8d8de`, hell `#f4f4f8`, gedimmt `#6b6b78`, Akzente Cyan `#00e5ff` und Magenta `#ff4fd8`.
- Links: `$ nmap -sV --script=whoami sgr.ski`, `Nmap scan report for sgr.ski (127.0.0.1)`, Name zweizeilig Space Grotesk 96px/700 mit chromatischer Verschiebung (`text-shadow:-3px 0 #00e5ff, 3px 0 #ff4fd8`), `Service Info: Certified IT Security Analyst`, Slogan 32px.
- Port-Tabelle (PORT / STATE / SERVICE / VERSION), jede Zeile ist ein Link mit Hover-Hintergrund `#141418`:
  - `443/tcp open https linkedin.com/in/koljasagorski ↗`
  - `25/tcp open smtp kolja@sagorski.org`
  - `11371/tcp open hkp pgp 0x5EFB194EAD8BC39F`
- Footerzeile: `Nmap done: 1 IP address (1 host up) — SGR.SKI — LOCALHOST`.
- Rechts 440px vollhoher Avatar, magenta leuchtende Linie exakt auf der Gesichtsteilung (2px, `box-shadow:0 0 12px #ff4fd8`), Labels `eth0 / inside` (cyan, links oben) und `outside / tun0` (magenta, rechts oben).

## Abnahme
- Jedes Design per `?theme=` aufrufbar und auf 375px, 768px, 1280px, 1920px geprüft.
- Kein Layout-Shift beim Laden (Theme vor dem Rendern gesetzt, Avatar mit width/height).
- `theme-color` Meta wird passend zum Theme gesetzt.
