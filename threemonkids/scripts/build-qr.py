"""Generate a service's App Store QR code as an SVG, in the site's QR style.

The style is taken from the existing public/services/already_me_qr.png:
black background, lime modules, a 2-module quiet zone. It is an inverted QR
(light modules on a dark field); modern phone cameras read those, but keep that
in mind before shrinking the display slot any further.

Needs segno:  python -m pip install segno
Run:          python scripts/build-qr.py
"""
import os
import urllib.parse

import segno

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Sampled from already_me_qr.png, not the brand token. The site accent is
# #C8FF00; the QR asset that shipped first uses this slightly softer lime, and
# the two codes sit next to each other on /works, so they have to match.
LIME = "#D2FA2E"
BLACK = "#000000"

# Two modules rather than the spec's four: the code renders in an 80px slot, and
# at four the modules get too tight to scan. The render container's `p-1` padding
# makes up the difference. already_me_qr.png does the same.
BORDER = 2

# Korean in the path is percent-encoded so the payload is pure ASCII and no
# scanner has to guess a charset. It decodes back to the URL in services.ts.
TARGETS = [
    ("najeon_qr.svg", "https://apps.apple.com/us/app/나전/id6814106977"),
]


def main():
    for filename, url in TARGETS:
        payload = urllib.parse.quote(url, safe=":/")
        qr = segno.make(payload, error="M")
        out = os.path.join(ROOT, "public", "services", filename)
        qr.save(
            out,
            kind="svg",
            scale=1,
            border=BORDER,
            dark=LIME,
            light=BLACK,
            omitsize=True,
            svgversion=None,
            xmldecl=True,
            nl=False,
        )
        size = qr.symbol_size(border=BORDER)[0]
        print(f"wrote {out}")
        print(f"  {payload}")
        print(f"  version {qr.version}, ecc M, {size} modules incl. border, "
              f"{os.path.getsize(out)/1024:.1f} KB")


main()
