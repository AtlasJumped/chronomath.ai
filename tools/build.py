#!/usr/bin/env python3
"""Wrap each src/<name>.body.html in the shared header and footer.

Usage: python3 tools/build.py
The first line of a body file is a comment holding the page title and the
description: <!-- title | description -->
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

NAV = [
    ("index.html", "Home"),
    ("assumptions.html", "Assumptions"),
    ("map.html", "Where it runs away"),
    ("open-problems.html", "Open problems"),
    ("primer.html", "Primer"),
    ("other-math.html", "Other math"),
    ("tracker.html", "Tracker"),
    ("glossary.html", "Glossary"),
]
PHYS = [
    ("physics.html", "HMR physics: overview"),
    ("physics.html#unit", "What one thought is worth"),
    ("physics.html#matches", "Where HMR and physics agree"),
    ("physics.html#negative", "The two negative results"),
    ("physics.html#gravity", "The route to gravity"),
    ("physics.html#stress", "The stress test"),
    ("tracker.html?col=physics", "Physics column of the tracker"),
]


def ver(name):
    return hashlib.sha1((ROOT / name).read_bytes()).hexdigest()[:8]


CAPTION = '<div class="elv8-cap" data-elv8-cap role="note" style="font:13px/1.45 system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;text-align:center;padding:6px 12px;background:#fffdf8;color:#4a4760;border-bottom:1px solid #e8e3d6;position:relative;z-index:30">This website is owned by the person who owns this website. <a href="https://elevat.ing/" style="color:inherit;font-weight:700">elevat.ing</a></div>\n'


def header(page, cap=CAPTION):
    links = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == page else ""
        links.append(f'<a href="{href}"{cur}>{label}</a>')
    on = " on" if page == "physics.html" else ""
    drop = "".join(f'<a href="{h}">{l}</a>' for h, l in PHYS)
    return (
        '<a class="skip" href="#main">Skip to content</a>\n'
        + cap +
        '<header class="site-head"><div class="wrap">\n'
        '<a class="brand" href="index.html"><span class="lg" aria-hidden="true"></span><span>HMR Math</span></a>\n'
        '<button class="menu" type="button" aria-expanded="false" aria-controls="nav">Menu</button>\n'
        '<nav class="nav" id="nav" aria-label="Main">' + "".join(links) +
        f'<div class="grp{on}"><button type="button" class="grpbtn" aria-haspopup="true" aria-expanded="false">'
        'HMR physics<span aria-hidden="true">&#9662;</span></button>'
        f'<div class="drop">{drop}</div></div></nav>\n'
        '</div></header>\n'
    )


FOOT = (
    '<footer><div class="wrap">\n'
    '<p>A map of the mathematics and physics of the Holistic Model of Reality (HMR). '
    ''
    'Everything here is a working draft, labeled by how firmly it stands.</p>\n'
    '<p>'
    ''
    '<a href="https://github.com/AtlasJumped/hmr-math">Proofs and checks</a> &middot; '
    '<a href="https://github.com/AtlasJumped/hmr-physics">Runs</a></p>\n'
    '<p>Key partner: <a href="https://claudebomb.com/">claudebomb.com</a>, the free, open prompt bank.</p>\n'
    '</div></footer>\n'
)

# Scripts after the footer (design picker, shared dock, audience paths). The
# shared dock is updated by the dock team directly in the built pages, so the
# build keeps whatever script lines a page already has after its footer.
TAIL = (
    '<script src="designs.js" defer></script>\n'
    '<script src="hmr-dock.js?v=6.10.2" data-site="chronomath.ai" data-design="#dp-btn" data-design-panel="#dp-panel" defer></script>\n'
    '<script src="https://hmrfamily.life/x/hmr-aud.js?v=1" defer></script>\n'
)


def kept(name):
    """Caption line and post-footer scripts of the page as it is now, if built before."""
    out = ROOT / name
    if not out.exists():
        return CAPTION, TAIL
    old = out.read_text()
    cap = next((l + "\n" for l in old.split("\n") if "data-elv8-cap" in l), CAPTION)
    tail = old.split("</footer>\n", 1)[1].split("</body>", 1)[0] if "</footer>\n" in old else TAIL
    return cap, tail


def build():
    css, js = ver("style.css"), ver("site.js")
    n = 0
    for body in sorted(SRC.glob("*.body.html")):
        name = body.name.replace(".body.html", ".html")
        text = body.read_text()
        m = re.match(r"<!--\s*(.*?)\s*\|\s*(.*?)\s*-->\n", text)
        if not m:
            sys.exit(f"{body.name}: first line must be <!-- title | description -->")
        title, desc = m.group(1), m.group(2)
        text = text[m.end():]
        extra = ""
        if name == "tracker.html":
            extra = f'<script src="tracker-data.js?v={ver("tracker-data.js")}" defer></script>\n'
        cap, tail = kept(name)
        html = (
            '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>{title} | HMR Math</title>\n'
            f'<meta name="description" content="{desc}">\n'
            '<link rel="icon" href="favicon.svg" type="image/svg+xml">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700;750&display=swap" rel="stylesheet">\n'
            f'<link rel="stylesheet" href="style.css?v={css}">\n'
            f'{extra}<script src="site.js?v={js}" defer></script>\n'
            '</head>\n<body>\n' + header(name, cap) + '<main id="main">\n' + text + '</main>\n' + FOOT + tail +
            '</body>\n</html>\n'
        )
        (ROOT / name).write_text(html)
        n += 1
    print(f"built {n} pages")


if __name__ == "__main__":
    build()
