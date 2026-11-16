# Startseite nach Carrd #318, Seite /leistungen/, Impressum, SEO Ruhrgebiet/NRW

Stand: 2026-11-16 · Branch `redesign-318-leistungen` · vom Betreiber im Chat freigegeben („ja alles top“)

## Absicht

sgr.ski soll Aufträge bringen. Firmen im Ruhrgebiet/NRW, die nach IT-Sicherheit, Microsoft-365-Betreuung
oder Alternativen zur Big-Tech-Cloud suchen, sollen Kolja finden, verstehen, was er anbietet, und ihn
anschreiben (Mail, bei Bedarf verschlüsselt) oder über LinkedIn kontaktieren.

## Ziele

1. Startseite im Look von Carrd-Template #318 (`https://bb17e50b963c5e74.demo.carrd.co`): dunkle Karte,
   links Name zweifarbig (weiß / gold), Untertitel, kurzer Text; rechts das geteilte Gesicht
   (`assets/portrait.webp`, Anzug/Hoodie); Fußleiste: links „LinkedIn · Buchen Sie meine
   Dienstleistungen“, rechts goldener Button `kolja@sagorski.org`.
2. Untertitel: **„Seit über 20 Jahren auf beiden Seiten der Firewall.“** Diese Formulierung steht wortgleich
   in HTML, JSON-LD, `llms.txt` und den OG-Texten.
3. PGP-Hinweis am Mail-Button: „Verschlüsselt schreiben? Mein Schlüssel liegt auf keys.openpgp.org“ mit Link auf
   `https://keys.openpgp.org/search?q=kolja%40sagorski.org`. Desktop: Panel bei `:hover`/`:focus-within`, in das
   man mit der Maus hineinfahren kann (es enthält einen Link). Touch/schmal: als sichtbare Zeile unter dem
   Button, weil ein Tipp sofort `mailto:` auslöst. Ohne JavaScript.
4. Neue Seite **`/leistungen/`** (deutsch), Ziel von „Buchen Sie meine Dienstleistungen“, mit fünf Abschnitten:
   - **IT-Sicherheitsberatung**: klassische Cyber-Security-Beratung, Risikoanalyse, Härtung, Incident Response
   - **KI-gestützte Sicherheitstests**: Pentests/Schwachstellenanalysen, KI-unterstützt, manuell verifiziert
   - **Microsoft-365-Betreuung**: Betreuung, Sicherheits-Check, Härtung (MFA, Conditional Access,
     Defender, Entra ID, Intune), Optimierung
   - **Digitale Souveränität**: selbst betriebene Dienste (Mailserver, Dateiablage/Kollaboration usw.)
     statt Big-Tech-Cloud, Migration und Betrieb
   - **Workshops für Teams**: sicher im Netz unterwegs, digitale Selbstverteidigung, Link auf `/workshops/`
   Dazu ein Abschnitt „Kostenlose Werkzeuge“ (paste., IP-Leak-Test, VPN Matrix, bisher auf der Startseite),
   ein kurzer Ablauf („Erstgespräch → Angebot → Umsetzung“), Kontakt-CTA (Mail + PGP) und eine kleine FAQ.
5. **Impressum** mit den Pflichtangaben der patchletter UG, also *inklusive* USt-IdNr. DE466427019, die bisher
   fehlt. Der Link ist von Startseite, `/leistungen/` und `/workshops/` aus erreichbar, auf der Startseite **sehr
   klein am Rand** (unter der Karte, z. B. rechts unten, gedämpft, aber ≥ 4.5:1 Kontrast und ≥ 24 px Tippfläche).
6. **OG-Bilder** (Start, Leistungen) und neues **Favicon/Icon-Set** mit Higgsfield.
7. **SEO 1a** für Ruhrgebiet/NRW (siehe unten).

## Nicht-Ziele / Anti-Ziele

- Keine Datenschutzseite (weiterhin vom Betreiber nicht gewünscht).
- Kein Framework, kein Build-Step, kein Kontaktformular, keine Dritt-Requests außer Umami und `ip.sgr.ski`.
- **Nichts erfinden:** keine Preise, keine Kundennamen/Referenzen, keine Partnerstatus (z. B. „Microsoft
  Partner“), keine Zertifikate außer **„Certified Security Analyst“** (so lautet die Zertifizierung; das bisherige
  „Certified IT Security Analyst“ ist falsch und wird überall korrigiert: Start, `/workshops/`, Quiz,
  `workshops/index.md`, `llms.txt`, `site.webmanifest`, JSON-LD `jobTitle` inkl. neuer CSP-Hashes; OG-Bild
  `og-workshops.png`/`og-quiz.png` prüfen und ggf. neu rendern).
- Keine Städte-Doorway-Seiten („IT-Sicherheit Essen“, „… Bochum“ als Klone). Die Region steht im Text,
  im Schema (`areaServed`) und in der Adresse.
- Das echte Gesicht wird nicht durch KI ersetzt. Auf der Seite steht das echte Portrait.
- Die `/workshops`-Seite bleibt inhaltlich unverändert (nur Footer-Link/Brotkrumen, falls nötig).

## Rahmenbedingungen (aus CLAUDE.md, gelten unverändert)

- CSP `default-src 'none'`, keine Inline-Styles/-Scripts. JSON-LD nur per Hash. `.github/scripts/check-csp.py`
  hat eine fest verdrahtete Seitenliste (`PAGES`), dort `leistungen/index.html` ergänzen.
- `scripts/build.sh` ist eine Allow-List: `leistungen` eintragen.
- Fonts selbst gehostet. #318 nutzt **Sora** (Überschriften) und **Inter** (Text), beide OFL: WOFF2 (Latin),
  Lizenzdateien nach `assets/fonts/`. Hack/Jersey 10 werden nur von der jetzigen Startseite genutzt und
  fliegen samt Lizenz raus, falls keine andere Seite sie lädt (vorher per grep prüfen).
- Der Hintergrund von #318 (geometrische Dreiecke) ist dort ein `data:`-SVG. Hier wird er eine Datei
  `assets/bg318.svg` per CSS-`url()`.
- Kontrast: alle Texte ≥ 4.5:1; Gold `#E3BD52` auf `#282830` und dunkle Schrift auf dem Gold-Button nachrechnen.
- Umami + Recorder auch auf `/leistungen/` (gleiche Attribute wie auf den anderen Seiten).
- Bilder ohne Metadaten (`cwebp -metadata none`, PNG über `oxipng`/`pngcrush` oder Re-Encode).
- Push auf `main` deployt sofort (Workers Builds). Darum: Arbeit auf diesem Branch, nach jedem Commit den
  Branch pushen, Merge nach `main` erst nach grünem Build und Sichtprüfung. Commits nur mit Pfadangabe stagen,
  damit `SGR.ski Redesign-Vorschläge.zip` (untracked, fremd) nie mitkommt.

## Ansätze (entschieden)

| Ansatz | Bewertung |
|---|---|
| **A: Eigene Seite `/leistungen/`** ✅ | Rankt eigenständig mit eigenem Titel, eigener Description, eigenem Schema und OG-Bild. Teilbar per Link. |
| B: Pop-up/`popover` auf der Startseite | Ginge ohne JS, aber der Inhalt hätte keine eigene URL, Google gewichtet versteckten Text schwächer, und das Teilen ist schlechter. |
| C: Eine Unterseite pro Leistung | Am stärksten für einzelne Suchbegriffe, aber fünf dünne Seiten ohne echte Inhalte (Fallbeispiele, Preise) sind riskant. Später möglich, wenn Traffic da ist. |

Der Betreiber hat A gewählt. Die Startseite wird deutsch (`lang="de"`, `og:locale de_DE`). Die drei Werkzeug-Links ziehen auf
`/leistungen/` um.

## SEO-Konzept Ruhrgebiet/NRW

### Wettbewerbslage (Stichprobe von Live-Suchen am 2026-11-16, nicht repräsentativ)

Regionale Suchen („IT-Sicherheitsberatung Gelsenkirchen“, „Penetrationstest Ruhrgebiet“, „Microsoft 365
Betreuung Essen/Bochum“) liefern vor allem Verzeichnisse, Jobbörsen, Ratgeber und überregionale Anbieter.
Als echte lokale Wettbewerber tauchen AWARE7 (Gelsenkirchen) und das if(is) der Westfälischen Hochschule
auf. Zu „digitale Souveränität / eigener Mailserver statt M365“ gibt es fast nur Produkt-Blogs (Nextcloud,
Tuta, mailbox.org) und **keinen regionalen Dienstleister**. Das ist die größte Lücke.
**Suchvolumina sind nicht gemessen** (kein Ahrefs/DataForSEO angebunden). Die Gewichtung unten ist eine
begründete Hypothese, die per Search Console nach 6–8 Wochen geprüft wird.

### Keyword-Karte

| Seite | Hauptbegriff | Nebenbegriffe |
|---|---|---|
| `/` | Kolja Sagorski · **IT-Sicherheitsberater Ruhrgebiet** | IT-Security Berater Gelsenkirchen, Cybersecurity Experte NRW |
| `/leistungen/` (Hub) | **IT-Sicherheitsberatung Ruhrgebiet & NRW** | IT-Sicherheit für Unternehmen / KMU, Cybersecurity Beratung Gelsenkirchen Essen Bochum Dortmund |
| › Sicherheitstests | **Penetrationstest Ruhrgebiet** | Pentest NRW, Schwachstellenanalyse, Sicherheitstest Webanwendung, KI-gestützter Pentest |
| › Microsoft 365 | **Microsoft 365 Betreuung Ruhrgebiet** | Microsoft 365 Sicherheit / Security-Check, M365 Härtung, Conditional Access, Entra ID, Intune, Exchange Online |
| › Souveränität | **Digitale Souveränität für Unternehmen** | eigener Mailserver Unternehmen, Microsoft 365 Alternative, Self-Hosting, raus aus der US-Cloud, DSGVO-konforme E-Mail |
| › Workshops | **Security-Awareness-Schulung Ruhrgebiet** | IT-Sicherheit Schulung Mitarbeiter, Phishing-Schulung, Workshop digitale Selbstverteidigung (Hauptseite `/workshops/`) |

Städte im Text (natürlich, nicht als Liste zum Stopfen): Gelsenkirchen (Sitz), Essen, Bochum, Dortmund,
Duisburg, Oberhausen, Bottrop, Gladbeck, Herne, Recklinghausen, dazu „vor Ort im Ruhrgebiet, remote in ganz
NRW und Deutschland“.

### Umsetzung on-page

- **Titel/Description**
  - `/`: „Kolja Sagorski – IT-Sicherheitsberater im Ruhrgebiet“ / „Seit über 20 Jahren auf beiden Seiten der
    Firewall: IT-Sicherheitsberatung, Sicherheitstests und Microsoft-365-Betreuung aus Gelsenkirchen für das
    Ruhrgebiet und NRW.“
  - `/leistungen/`: „IT-Sicherheitsberatung Ruhrgebiet & NRW · Kolja Sagorski“ / ~150 Zeichen mit
    Pentests, M365, digitaler Souveränität, Workshops.
- Eine H1 pro Seite. Auf `/leistungen/` eine H2 je Leistung mit Anker-ID (`#sicherheitstests`, `#microsoft-365`,
  `#souveraenitaet`, …), damit Sitelinks/Deep-Links möglich sind.
- Interne Links: Start ↔ Leistungen ↔ Workshops ↔ Quiz, Impressum überall.
- **Strukturierte Daten**
  - `/`: `Person` (Kolja; `jobTitle`, `worksFor` → patchletter UG, `knowsAbout`, `sameAs` LinkedIn +
    keys.openpgp.org, `address` = Impressum-Adresse).
  - `/leistungen/`: `ProfessionalService` (patchletter UG; `address` **exakt wie im Impressum**,
    `areaServed` Ruhrgebiet-Städte + NRW + DE, `founder`/`employee` → Person, `hasOfferCatalog` mit fünf
    `Service`-Einträgen, ohne Preise), `BreadcrumbList`, `FAQPage` (Google zeigt es kaum noch als Rich Result,
    aber KI-Suchen lesen es).
  - Mehrere JSON-LD-Objekte in **einem** `@graph`-Block, damit `check-csp.py` (prüft den ersten Block) passt.
- `sitemap.xml` (+ `/leistungen/`, `/impressum/`, `lastmod` aktualisieren), `llms.txt` (Leistungen,
  deutsche Startseite), Markdown-Spiegel `leistungen/index.md` per `rel="alternate" type="text/markdown"`.
- OG/Twitter je Seite mit eigenem Bild, `og:locale de_DE`.
- Core Web Vitals: Portrait `fetchpriority="high"`, feste `width/height`, Fonts preload, kein JS.

### Außerhalb der Website (Aufgabe des Betreibers, ich liefere eine Checkliste)

Google-Unternehmensprofil (Kategorie „IT-Sicherheitsberater“/„Computerberater“, Servicegebiet Ruhrgebiet, Adresse
wie im Impressum), Search Console + Bing Webmaster (Sitemap einreichen), LinkedIn-Profil verlinkt auf
`/leistungen/`, Einträge bei IHK-Marktplatz IT-Sicherheit / Cyberwehr-Netzwerk prüfen.

## Grafiken (Higgsfield)

- Higgsfield-Guthaben vor dem Generieren prüfen.
- **OG-Bilder 1200×630** (`assets/og.png` neu, `assets/og-leistungen.png`): Higgsfield erzeugt die Bildwelt
  (dunkel, Gold-Akzent, Firewall/Netz-Motiv). Das **echte Portrait** und der **exakte Text** (Name,
  Untertitel) werden danach per HTML/Chromium darübergelegt, weil KI-Text und KI-Gesichter nicht verlässlich
  stimmen. Die Hintergrund-Grafik selbst stammt aus Higgsfield.
- **Favicon/Icons** (`favicon.ico` 32, `apple-touch-icon.png` 180, `icon-192/512.png`): Higgsfield-Monogramm
  „KS“ bzw. Split-Motiv in Gold auf Anthrazit, auf kleine Größen heruntergerechnet und geprüft, dass es bei
  16/32 px lesbar bleibt. `site.webmanifest` + `theme-color` auf die neue Palette.

## Impressum (Entscheidung von Claude)

Übernommen aus patchletter.com/de/impressum: Firma, Anschrift, Vertretung, Register, **USt-IdNr.**, Kontakt
(hello@/Telefon/legal@), Verantwortlich nach § 18 Abs. 2 MStV. **Nicht** übernommen: Markenhinweis,
„Haftung für Inhalte“ zu Release-Daten und der PGP-Block für hello@. Diese Abschnitte betreffen nur das
patchletter-Produkt. Das Impressum bekommt den neuen Look (gleiches CSS-Grundgerüst), Rücklink zur Startseite.

## Dateien

`index.html`, `assets/card.css` (neu für #318), `assets/bg318.svg`, `assets/fonts/` (Sora, Inter + Lizenzen;
Hack/Jersey raus), `leistungen/index.html`, `leistungen/index.md`, `assets/leistungen.css` (oder gemeinsames
CSS), `impressum/index.html`, `workshops/index.html` (nur Footer-Links), `scripts/build.sh`,
`.github/scripts/check-csp.py`, `sitemap.xml`, `llms.txt`, `site.webmanifest`, `favicon.ico`,
`apple-touch-icon.png`, `assets/icon-192.png`, `assets/icon-512.png`, `assets/og.png`,
`assets/og-leistungen.png`, `scripts/home-social.html` (Overlay-Vorlage), `CLAUDE.md`, `README.md`.

## Was dem Builder überlassen bleibt

Genaue Abstände, Größen und Breakpoints nach #318 · Formulierung der Leistungstexte im Rahmen der Ziele
und Anti-Ziele (sachlich, Sie-Form, keine Superlative) · FAQ-Fragen (4–6, z. B. „Arbeiten Sie auch remote?“,
„Was passiert bei einem Sicherheitstest?“, „Können wir Microsoft 365 behalten und trotzdem souveräner werden?“).

## Prüfung vor dem Merge

`sh scripts/build.sh` grün · Screenshots Desktop 1440 + Mobil 390 (Start, Leistungen, Impressum, Hover-Zustand)
· Konsole ohne CSP-Verstöße · Kontraste gemessen · JSON-LD validiert (Schema.org-Validator-Struktur) ·
Lighthouse SEO/A11y ≥ 95.
