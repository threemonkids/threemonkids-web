"""Generate the Touch War card's artwork from the app's own map.json.

Reads C:/Users/61478/ww/src/map.json — already projected onto a 1000x520 canvas
with the hand-drawn jitter baked in by the app's scripts/build-map.mjs — and writes:

  public/services/touch_war_map.svg       the base map, cropped to the card
  src/components/public/touchWarArcs.ts  arc, crack and target-shape data

Both are generated; edit this script, not them.

The crop is portrait so the map fills the card edge to edge. A 1000x520 world is
2:1, so a 315x439 card can only hold a slice of it: Europe, Africa, the Middle
East and western Asia, which is the densest part of the map.

Run:  python scripts/build-touchwar-map.py
"""
import json, math, io, os, random

SRC = r"C:\Users\61478\ww\src\map.json"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "services", "touch_war_map.svg")
OUT_TS = os.path.join(ROOT, "src", "components", "public", "touchWarArcs.ts")

CARD_W, CARD_H = 315.0, 439.0

# Portrait crop. Chosen by rendering candidates: this one fills the frame with
# land and leaves the least empty ocean.
X0, Y0 = 455.0, 50.0
VH = 350.0
VW = VH * CARD_W / CARD_H          # 251.1
X1, Y1 = X0 + VW, Y0 + VH

PX = CARD_W / VW                   # 1.254 CSS px per user unit, at card scale 1

INK, PAPER, FLASH = "#000000", "#FFFFFF", "#BDBDBD"

# Attacker -> target. Every endpoint has to sit inside the crop; the script says
# so below. Targets also get a crack, so pick countries big enough to hold one.
PAIRS = [("GB", "EG"), ("ZA", "TR"), ("NG", "SA"), ("FR", "KE"), ("DZ", "IR")]
BOW = 0.22                         # LIVE.ARC_BOW
STEPS = 24
CRACK_PX = 26.0                    # crack reach in CSS px, app uses 24
SEED = 7                           # fixed so the build is reproducible


def num(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return s if s else "0"


def ring_path(ring):
    out = []
    for i in range(0, len(ring), 2):
        out.append(("M" if i == 0 else "L") + num(ring[i]) + " " + num(ring[i + 1]))
    return "".join(out) + "Z"


def shape_path(c):
    return "".join(ring_path(r) for r in c["r"])


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


def crack_path(size, rng):
    """The app's crackPath (ww/src/map.ts), drawn around the origin so the card
    can place it with a translate and scale it about its own centre."""
    rand = lambda lo, hi: lo + rng.random() * (hi - lo)
    d = ""
    n = 2 + rng.randrange(5)
    turn = rng.random() * math.pi * 2
    for i in range(n):
        a = turn + (i / n) * math.pi * 2 + rand(-0.7, 0.7)
        cx = cy = 0.0
        segs = 3 + rng.randrange(3)
        step = size * rand(0.4, 1.3) / segs
        d += "M0 0"
        for s in range(segs):
            a += rand(-0.9, 0.9)
            cx += math.cos(a) * step * rand(0.6, 1.3)
            cy += math.sin(a) * step * rand(0.6, 1.3)
            d += f"L{num(cx)} {num(cy)}"
            if 0 < s < segs - 1 and rng.random() < 0.35:
                b = a + (1 if rng.random() < 0.5 else -1) * rand(0.6, 1.1)
                d += (f"L{num(cx + math.cos(b) * step * 0.7)} "
                      f"{num(cy + math.sin(b) * step * 0.7)}M{num(cx)} {num(cy)}")
    return d


def main():
    data = json.load(io.open(SRC, encoding="utf-8"))
    countries = data["countries"]
    by_code = {c["c"]: c for c in countries}
    center = {c["c"]: (c.get("l") or c.get("d")) for c in countries}

    pad = 30
    def in_crop(x, y, p=0):
        return X0 - p <= x <= X1 + p and Y0 - p <= y <= Y1 + p

    # ── base map ──────────────────────────────────────────────────────────
    paths = []
    for c in countries:
        if "r" not in c or c["c"] == "AQ":
            continue
        if any(in_crop(r[i], r[i + 1], pad) for r in c["r"] for i in range(0, len(r), 2)):
            paths.append(shape_path(c))

    # 0.8 CSS px would be 0.64 user units; 1.1 keeps the coastline readable once
    # the card is scaled down into the smaller slots.
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{num(X0)} {num(Y0)} {num(VW)} {num(VH)}" '
        'preserveAspectRatio="xMidYMid slice">'
        f'<rect x="{num(X0 - pad)}" y="{num(Y0 - pad)}" width="{num(VW + pad * 2)}" '
        f'height="{num(VH + pad * 2)}" fill="{PAPER}"/>'
        f'<g fill="{PAPER}" stroke="{INK}" stroke-width="1.1" stroke-linejoin="round">'
        + "".join(f'<path d="{d}"/>' for d in paths)
        + "</g></svg>"
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, "w", encoding="utf-8").write(svg)
    print(f"wrote {OUT}  {len(svg)/1024:.0f} KB  {len(paths)} countries")
    print(f'VIEW_BOX = "{num(X0)} {num(Y0)} {num(VW)} {num(VH)}"   '
          f"({num(VW)}x{num(VH)} units -> {CARD_W:.0f}x{CARD_H:.0f}px, {PX:.3f} px/unit)\n")

    # ── arcs + cracks ─────────────────────────────────────────────────────
    rng = random.Random(SEED)
    rows, notes = [], []
    for a, b in PAIRS:
        pa, pb = center.get(a), center.get(b)
        if not pa or not pb:
            raise SystemExit(f"no centre for {a if not pa else b}")
        pts = arc_points(pa, pb)
        d = "M" + num(pts[0][0]) + " " + num(pts[0][1]) + "".join(
            "L" + num(x) + " " + num(y) for x, y in pts[1:])
        length = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
        if not all(in_crop(x, y) for x, y in pts):
            raise SystemExit(f"arc {a}->{b} leaves the crop; pick another pair")
        tgt = by_code[b]
        if "r" not in tgt:
            raise SystemExit(f"target {b} has no shape to crack")
        rows.append(
            '  {\n'
            f'    id: "{a}{b}",\n'
            f'    label: "{by_code[a]["n"]} \u2192 {tgt["n"]}",\n'
            f'    len: {length:.0f},\n'
            f'    d: "{d}",\n'
            f'    hit: [{num(pb[0])}, {num(pb[1])}],\n'
            f'    crack: "{crack_path(CRACK_PX / PX, rng)}",\n'
            f'    target: "{shape_path(tgt)}",\n'
            '  },'
        )
        notes.append(f'{by_code[a]["n"]} -> {tgt["n"]}')

    ts = (
        "// GENERATED by scripts/build-touchwar-map.py - do not edit by hand.\n"
        "// Geometry comes from the Touch War app's own src/map.json, so the card\n"
        "// shows the shapes the game shows. Coordinates are in the map's user units.\n\n"
        f'export const VIEW_BOX = "{num(X0)} {num(Y0)} {num(VW)} {num(VH)}";\n\n'
        "export type TouchWarArc = {\n"
        "  id: string;\n"
        "  /** Accessible description, e.g. \"France \u2192 Kenya\". */\n"
        "  label: string;\n"
        "  /** Path length, for the dash-offset reveal. */\n"
        "  len: number;\n"
        "  /** The bowed attack curve. */\n"
        "  d: string;\n"
        "  /** Where the curve lands: the flash and crack sit here. */\n"
        "  hit: [number, number];\n"
        "  /** Crack drawn around the origin, translated onto `hit`. */\n"
        "  crack: string;\n"
        "  /** Outline of the country hit, for the flash and the crack's clip. */\n"
        "  target: string;\n"
        "};\n\n"
        "export const TOUCH_WAR_ARCS: TouchWarArc[] = [\n"
        + "\n".join(rows)
        + "\n];\n"
    )
    io.open(OUT_TS, "w", encoding="utf-8").write(ts)
    print(f"wrote {OUT_TS}  {len(ts)/1024:.0f} KB  {len(rows)} arcs")
    for n in notes:
        print(f"  {n}")

    print(f"\nstroke sizes at {PX:.3f} px/unit:")
    print(f"  arc 2.4px   -> {2.4/PX:.2f}   dash 5px/9px -> {5/PX:.1f} {9/PX:.1f}")
    print(f"  mask 8px    -> {8/PX:.1f}")
    print(f"  crack 1.6px -> {1.6/PX:.2f}   flash border 2.4px -> {2.4/PX:.2f}")


main()
