#!/usr/bin/env python3
"""Guard the HTML pages against the site's hard rules and the redesign copy.

Runs from scripts/build.sh right after check-csp.py. For every page in PAGES:

  (a) no inline style attribute            (the CSP has no 'unsafe-inline')
  (b) no data: URI in src/href/url(...)    (img-src is 'self' only)
  (c) every local reference exists         (src/href starting with "/", and
                                            url(...) in the linked CSS files)
  (d) never "Certified IT Security Analyst" (the title is "Certified Security
                                            Analyst")
  (e) exactly one <h1>
  (f) every pattern listed for the page in RULES occurs in its HTML

A local URL ending in "/" resolves to "<path>/index.html" ("/" -> index.html);
query and fragment are dropped before the file is looked up.

RULES is the extension point: later tasks append (description, regex) pairs for
more pages. Exits 1 on any failure, 0 otherwise.
"""
import pathlib
import re
import sys
from html.parser import HTMLParser

root = pathlib.Path(__file__).resolve().parents[2]

PAGES = [
    "index.html",
    "leistungen/index.html",
    "impressum/index.html",
    "workshops/index.html",
    "workshops/quiz/index.html",
]

# page -> [(description, regex that must match somewhere in the page)]
RULES: dict[str, list[tuple[str, str]]] = {
    "index.html": [
        # Anchored to <html>: a bare lang="de" also matches hreflang="de".
        ("German page language on <html>", r'<html[^>]*\slang="de"'),
        (
            "tagline, word for word",
            r"Seit über 20 Jahren auf beiden Seiten der Firewall\.",
        ),
        ("mail link", r'href="mailto:kolja@sagorski\.org"'),
        ("PGP key link", r"keys\.openpgp\.org/search\?q=kolja%40sagorski\.org"),
        ("link to /leistungen/", r'href="/leistungen/"'),
        ("link to /impressum/", r'href="/impressum/"'),
        ("LinkedIn profile", r"linkedin\.com/in/koljasagorski"),
    ],
    "leistungen/index.html": [
        (
            "page title",
            r"<title>IT-Sicherheitsberatung Ruhrgebiet &amp; NRW · Kolja Sagorski</title>",
        ),
        ("anchor #beratung", r'id="beratung"'),
        ("anchor #sicherheitstests", r'id="sicherheitstests"'),
        ("anchor #microsoft-365", r'id="microsoft-365"'),
        ("anchor #souveraenitaet", r'id="souveraenitaet"'),
        ("anchor #workshops", r'id="workshops"'),
        ("anchor #werkzeuge", r'id="werkzeuge"'),
        ("anchor #faq", r'id="faq"'),
        ("link to /workshops/", r'href="/workshops/"'),
        ("paste. tool", r"p\.sgr\.ski"),
        ("IP leak test", r"ipleak\.sgr\.ski"),
        ("VPN Matrix", r"vpn-matrix\.com"),
        ("patchletter", r"patchletter\.com/de/"),
        ("ProfessionalService schema", r'"@type": "ProfessionalService"'),
        ("areaServed in the schema", r'"areaServed"'),
        ("link to /impressum/", r'href="/impressum/"'),
        ("Markdown alternate", r'rel="alternate" type="text/markdown"'),
    ],
    "impressum/index.html": [
        ("VAT ID (UStG § 27a)", r"DE466427019"),
        ("commercial register number", r"HRB 20118"),
        ("street address", r"Meisterweg 16"),
        ("responsible person (MStV)", r"§ 18 Abs\. 2 MStV"),
        ("link back to the home page", r'href="/"'),
        ("noindex (operator's wish)", r'<meta name="robots" content="noindex, follow">'),
    ],
    "workshops/index.html": [
        ("footer link to /leistungen/", r'href="/leistungen/"'),
        ("footer link to /impressum/", r'href="/impressum/"'),
    ],
    "workshops/quiz/index.html": [
        ("footer link to /impressum/", r'href="/impressum/"'),
    ],
}

FORBIDDEN_TITLE = "Certified IT Security Analyst"

# HTML attributes that hold a URL (checked for data: and local existence).
URL_ATTRS = ("src", "href", "poster")

CSS_COMMENT = re.compile(r"/\*.*?\*/", re.S)
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
CSS_URL = re.compile(r"""url\(\s*(['"]?)(.*?)\1\s*\)""", re.S | re.I)


class PageScan(HTMLParser):
    """Collects what the checks need from one HTML document."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.style_attrs = []  # tag names carrying a style="…" attribute
        self.urls = []  # (attribute, value) for src/href/poster
        self.stylesheets = []  # href of <link rel="stylesheet">

    def handle_starttag(self, tag, attrs):
        attrs = {k: (v or "") for k, v in attrs}
        if tag == "h1":
            self.h1 += 1
        if "style" in attrs:
            self.style_attrs.append(tag)
        for name in URL_ATTRS:
            if name in attrs:
                self.urls.append((name, attrs[name].strip()))
        if tag == "link" and "stylesheet" in attrs.get("rel", "").lower().split():
            self.stylesheets.append(attrs.get("href", "").strip())

    handle_startendtag = handle_starttag


def resolve_local(url, base_dir):
    """Map a URL to a repo path, or None if it is not a local file reference.

    base_dir is the directory the URL is relative to, as a repo-relative
    PurePosixPath ("" for the repo root). Only "/…" and (when base_dir is
    given) plain relative URLs are local; "//host", "scheme:…" and "#frag" are not.
    """
    url = re.split(r"[?#]", url, maxsplit=1)[0]
    if not url or url.startswith("//") or re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", url):
        return None
    if url.startswith("/"):
        rel = url.lstrip("/")
    elif base_dir is None:
        return None
    else:
        rel = (base_dir / url).as_posix()
    if rel == "" or rel.endswith("/"):
        rel += "index.html"
    return pathlib.PurePosixPath(rel)


def exists(rel):
    # Resolve ".." and refuse to leave the repo.
    path = (root / rel).resolve()
    return root in path.parents and path.is_file()


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def check_css(css_rel, problems):
    """(b) and (c) for one stylesheet linked from a page."""
    path = root / css_rel
    if not path.is_file():
        problems.append(f"linked stylesheet {css_rel} does not exist")
        return
    css = CSS_COMMENT.sub("", path.read_text(encoding="utf-8"))
    base = pathlib.PurePosixPath(css_rel).parent
    for _, value in CSS_URL.findall(css):
        value = value.strip()
        if value.lower().startswith("data:"):
            problems.append(f"{css_rel}: data: URI in url(...)")
            continue
        target = resolve_local(value, base)
        if target is not None and not exists(target):
            problems.append(f"{css_rel}: url({value}) -> {target} does not exist")


def check_page(rel):
    path = root / rel
    if not path.is_file():
        return ["page does not exist"]

    raw = path.read_text(encoding="utf-8")
    # Commented-out markup is not served. Keep its newlines so line numbers hold.
    html = HTML_COMMENT.sub(lambda m: "\n" * m.group().count("\n"), raw)
    problems = []

    scan = PageScan()
    scan.feed(html)
    scan.close()

    # (a) inline styles
    if scan.style_attrs:
        problems.append(
            "inline style attribute on <" + ">, <".join(scan.style_attrs) + ">"
        )

    # (b) data: URIs
    for name, value in scan.urls:
        if value.lower().startswith("data:"):
            problems.append(f'data: URI in {name}="{value[:40]}…"')
    for _, value in CSS_URL.findall(html):
        if value.strip().lower().startswith("data:"):
            problems.append("data: URI in url(...)")

    # (c) local references: page, then url(...) inside linked stylesheets
    for name, value in scan.urls:
        if not value.startswith("/") or value.startswith("//"):
            continue
        if value in scan.stylesheets:
            continue  # reported below with the stylesheet check
        target = resolve_local(value, None)
        if target is not None and not exists(target):
            problems.append(f'{name}="{value}" -> {target} does not exist')
    for href in scan.stylesheets:
        css_rel = resolve_local(href, pathlib.PurePosixPath(rel).parent)
        if css_rel is None:
            continue  # external stylesheet: not ours to resolve
        check_css(css_rel.as_posix(), problems)

    # (d) the certification title
    hits = [line_of(html, m.start()) for m in re.finditer(re.escape(FORBIDDEN_TITLE), html)]
    if hits:
        lines = ", ".join(f"L{n}" for n in hits)
        problems.append(
            f'"{FORBIDDEN_TITLE}" x{len(hits)} at {lines}; '
            'the title is "Certified Security Analyst"'
        )

    # (e) exactly one h1
    if scan.h1 != 1:
        problems.append(f"expected exactly one <h1>, found {scan.h1}")

    # (f) required content
    for description, pattern in RULES.get(rel, []):
        if not re.search(pattern, html):
            problems.append(f"missing {description}: /{pattern}/")

    return problems


failed = False

for rel in sorted(set(RULES) - set(PAGES)):
    print(f"FAIL {rel}: RULES names a page that is not in PAGES, so it is never checked")
    failed = True

for rel in PAGES:
    problems = check_page(rel)
    if problems:
        failed = True
        print(f"FAIL {rel}:")
        for problem in problems:
            print(f"  - {problem}")
    else:
        print(f"OK {rel}")

sys.exit(1 if failed else 0)
