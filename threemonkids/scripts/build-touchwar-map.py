"""Generate the Touch War card's base world map SVG from the app's own map.json.

Reads C:/Users/61478/ww/src/map.json (already projected to a 1000x520 canvas with
hand-drawn jitter baked in by the app's scripts/build-map.mjs) and writes a static
SVG cropped to the card, plus the attack-arc path data to paste into TouchWarCard.
"""
import json, math, io, os

SRC = r"C:\Users\61478\ww\src\map.json"
OUT = r"C:\Users\61478\ThreeMonkids\threemonkids\public\services\touch_war_map.svg"

# Crop: drop Antarctica and the empty Pacific margins, keep every other landmass.
X0, X1 = 120.0, 930.0
Y0, Y1 = 8.0, 438.0
VW, VH = X1 - X0, Y1 - Y0

CARD_W = 315.0                 # card design width; the map runs edge to edge
PX_PER_UNIT = CARD_W / VW      # 0.389 -> user units to CSS px at card scale 1

INK, PAPER = "#000000", "#FFFFFF"

# Attack pairs, spread across the map. Same bow as the app (LIVE.ARC_BOW).
PAIRS = [("BR", "NG"), ("US", "RU"), ("IN", "AU"), ("FR", "EG"), ("CA", "GB")]
BOW = 0.22
STEPS = 24


def num(v):
    """Compact number: 1 decimal, no trailing .0, no leading 0 in -0.5/0.5."""
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return s if s else "0"


def ring_to_path(ring):
    out = []
    for i in range(0, len(ring), 2):
        x, y = ring[i], ring[i + 1]
        out.append(("M" if i == 0 else "L") + num(x) + " " + num(y))
    return "".join(out) + "Z"


def arc_points(a, b, bow=BOW, steps=STEPS):
    dx, dy = b[0] - a[0], b[1] - a[1]
    ln = math.hypot(dx, dy) or 1.0
    cx = (a[0] + b[0]) / 2 - (dy / ln) * ln * bow
    cy = (a[1] + b[1]) / 2 + (dx / ln) * ln * bow
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        pts.append((u * u * a[0] + 2 * u * t * cx + t * t * b[0],
                    u * u * a[1] + 2 * u * t * cy + t * t * b[1]))
    return pts


def main():
    data = json.load(io.open(SRC, encoding="utf-8"))
    countries = data["countries"]

    # ── base map ──────────────────────────────────────────────────────────
    paths = []
    for c in countries:
        if "r" not in c or c["c"] == "AQ":
            continue
        # keep a country when any of its points falls inside the crop
        keep = any(X0 - 40 <= r[i] <= X1 + 40 and Y0 - 40 <= r[i + 1] <= Y1 + 40
                   for r in c["r"] for i in range(0, len(r), 2))
        if not keep:
            continue
        paths.append("".join(ring_to_path(r) for r in c["r"]))

    # 0.8 CSS px at card scale 1 would be 2.06 user units; 2.4 keeps the line
    # readable once the card is scaled down into the smaller slots.
    svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{num(X0)} {num(Y0)} {num(VW)} {num(VH)}" '
        'preserveAspectRatio="xMidYMid meet">',
        f'<rect x="{num(X0)}" y="{num(Y0)}" width="{num(VW)}" height="{num(VH)}" fill="{PAPER}"/>',
        f'<g fill="{PAPER}" stroke="{INK}" stroke-width="2.4" stroke-linejoin="round">',
    ]
    svg += [f'<path d="{d}"/>' for d in paths]
    svg += ["</g>", "</svg>"]
    out = "".join(svg)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, "w", encoding="utf-8").write(out)
    print(f"wrote {OUT}  {len(out)/1024:.0f} KB  {len(paths)} countries")
    print(f"viewBox = {num(X0)} {num(Y0)} {num(VW)} {num(VH)}   "
          f"card height = {CARD_W * VH / VW:.1f}px")

    # ── attack arcs ───────────────────────────────────────────────────────
    center = {c["c"]: (c.get("l") or c.get("d")) for c in countries}
    name = {c["c"]: c["n"] for c in countries}
    print("\n--- arcs (paste into TouchWarCard) ---")
    for a, b in PAIRS:
        pa, pb = center.get(a), center.get(b)
        if not pa or not pb:
            print(f"  !! missing {a if not pa else b}")
            continue
        pts = arc_points(pa, pb)
        d = "M" + num(pts[0][0]) + " " + num(pts[0][1]) + "".join(
            "L" + num(x) + " " + num(y) for x, y in pts[1:])
        length = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
        inside = all(X0 <= x <= X1 and Y0 <= y <= Y1 for x, y in pts)
        print(f'  {{ id: "{a}{b}", len: {length:.0f}, d: "{d}" }},'
              f'   // {name[a]} -> {name[b]}{"" if inside else "   !! leaves the crop"}')

    px = PX_PER_UNIT
    print(f"\npx per user unit = {px:.3f}")
    print(f"  arc stroke 1.0px  -> {1.0/px:.2f} units")
    print(f"  dash 3px/5px      -> {3/px:.1f} {5/px:.1f} units")
    print(f"  mask stroke 6px   -> {6/px:.1f} units")


main()
