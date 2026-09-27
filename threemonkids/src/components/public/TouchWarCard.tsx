"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Touch War service card.

   Like NajeonCard this is a live component rather than a PNG, because the thing
   worth showing is motion: the app draws a dotted pencil curve from the attacking
   country to the one being hit, then lets it fade. See CLAUDE.md.

   The base map is generated from the app's own src/map.json (already projected to
   a 1000x520 canvas with the hand-drawn jitter baked in), cropped to drop
   Antarctica and the empty Pacific margins. Regenerate with
   scripts/build-touchwar-map.py if the app's map changes.

   Timings and stroke pattern mirror the app's LIVE constants in ww/src/live.ts:
   400ms to draw, ~1300ms alive, 500ms fade, bow 0.22, dash 3px/5px.
   ───────────────────────────────────────────────────────────────────────────── */

// Must match the generated SVG's viewBox, or the curves drift off the map.
const VIEW_BOX = "120 8 810 430";
const MAP_W = 315;
const MAP_H = 167;

// User units per CSS px is 1 / 0.389, so these are ~1px stroke, 3px/5px dash.
const ARC_STROKE = 2.6;
const ARC_DASH = "7.7 12.9";
const MASK_STROKE = 15.4;

type Arc = { id: string; len: number; d: string; label: string };

const ARCS: Arc[] = [
  { id: "BRNG", len: 175, label: "Brazil → Nigeria", d: "M364.5 295.6L372.2 295.6L379.8 295.3L387.3 294.8L394.7 294.1L401.9 293.1L409.1 291.9L416.2 290.4L423.2 288.7L430.1 286.8L436.8 284.6L443.5 282.2L450.1 279.5L456.5 276.6L462.9 273.5L469.2 270.1L475.3 266.5L481.4 262.7L487.4 258.6L493.2 254.2L499 249.7L504.6 244.9L510.2 239.8L515.6 234.5L521 229" },
  { id: "USRU", len: 487, label: "USA → Russia", d: "M241.2 134.1L261.9 139.3L282.5 143.8L303 147.6L323.4 150.6L343.6 153L363.8 154.6L383.8 155.5L403.7 155.7L423.6 155.2L443.3 154L462.9 152.1L482.4 149.4L501.8 146.1L521 142L540.2 137.2L559.2 131.7L578.2 125.5L597 118.6L615.7 111L634.4 102.6L652.9 93.6L671.2 83.8L689.5 73.3L707.7 62.1" },
  { id: "INAU", len: 215, label: "India → Australia", d: "M715.6 188.7L719.1 197.4L722.8 206L726.8 214.3L731 222.4L735.4 230.2L740 237.8L744.9 245.2L749.9 252.4L755.3 259.4L760.8 266.1L766.6 272.6L772.5 278.9L778.8 285L785.2 290.8L791.9 296.4L798.8 301.8L805.9 307L813.2 311.9L820.8 316.7L828.6 321.2L836.7 325.4L844.9 329.5L853.4 333.3L862.1 336.9" },
  { id: "FREG", len: 103, label: "France → Egypt", d: "M505.6 108.3L507.5 112.4L509.4 116.4L511.5 120.3L513.7 124.1L516 127.8L518.3 131.4L520.8 134.8L523.4 138.1L526.1 141.4L528.9 144.5L531.8 147.5L534.8 150.4L537.9 153.2L541.1 155.8L544.5 158.4L547.9 160.8L551.4 163.1L555 165.4L558.8 167.5L562.6 169.5L566.6 171.3L570.6 173.1L574.7 174.8L579 176.3" },
  { id: "CAGB", len: 277, label: "Canada → UK", d: "M228.1 71.9L238.9 77.5L249.8 82.6L260.6 87.4L271.6 91.7L282.5 95.6L293.5 99.1L304.5 102.2L315.5 104.9L326.6 107.2L337.7 109.1L348.8 110.5L360 111.6L371.1 112.2L382.4 112.5L393.6 112.3L404.9 111.7L416.2 110.7L427.6 109.3L438.9 107.5L450.4 105.3L461.8 102.7L473.3 99.6L484.8 96.2L496.3 92.3" },
];

// A wobbly pencil rule, lifted from the app's pick-country screen — the app never
// draws a clean straight line.
const RULE = "M1 3.2 C60 1.8 120 4.4 180 2.9 S270 2.2 299 3.6";

export default function TouchWarCard({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    // Pointer devices drive the attacks with :hover. Touch has none, so play them
    // once the card scrolls into view. Same approach as NajeonCard.
    if (!window.matchMedia("(hover: none)").matches) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPlayed(true);
        observer.disconnect();
      },
      { threshold: 0.55 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`touchwar-card ${played ? "touchwar-card--played" : ""} ${className}`}
    >
      <div className="touchwar-card-inner flex flex-col pt-[34px] pb-[26px]">

        {/* Range tabs */}
        <div className="flex gap-[18px] px-[22px] text-[15px]">
          <span>Today</span>
          <span className="text-[var(--touchwar-graphite)]">Week</span>
          <span className="text-[var(--touchwar-graphite)]">Month</span>
        </div>

        {/* Tallies — the app puts flags here, but flags are its only colour and
            this card stays black and white, so the country codes stand in. */}
        <div className="mt-[16px] px-[22px] text-[13px] leading-[1.9]">
          <p>You hit:&nbsp;&nbsp; KR 12&nbsp;&nbsp; JP 8&nbsp;&nbsp; US 3</p>
          <p>Hit you:&nbsp;&nbsp; BR 20&nbsp;&nbsp; IN 4&nbsp;&nbsp; FR 1</p>
        </div>

        <Rule className="mt-[18px]" />

        {/* Map + live attack curves */}
        <div className="relative" style={{ width: MAP_W, height: MAP_H }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/services/touch_war_map.svg"
            alt="World map"
            width={MAP_W}
            height={MAP_H}
            className="block select-none"
            draggable={false}
          />

          <svg
            viewBox={VIEW_BOX}
            className="absolute inset-0 w-full h-full overflow-visible"
            aria-hidden
          >
            <defs>
              {ARCS.map((arc, i) => (
                <mask
                  key={arc.id}
                  id={`touchwar-mask-${arc.id}`}
                  maskUnits="userSpaceOnUse"
                  x="120"
                  y="8"
                  width="810"
                  height="430"
                >
                  {/* The reveal: a fat white line uncovering the dotted curve as
                      its dash offset runs to zero. A single path cannot both be
                      dotted and draw itself, hence the mask. */}
                  <path
                    className="touchwar-arc-draw"
                    d={arc.d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={MASK_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={arc.len}
                    style={{ "--len": arc.len, "--i": i } as React.CSSProperties}
                  />
                </mask>
              ))}
            </defs>

            {ARCS.map((arc, i) => (
              <path
                key={arc.id}
                className="touchwar-arc"
                d={arc.d}
                fill="none"
                stroke="var(--touchwar-ink)"
                strokeWidth={ARC_STROKE}
                strokeDasharray={ARC_DASH}
                strokeLinecap="round"
                mask={`url(#touchwar-mask-${arc.id})`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <title>{arc.label}</title>
              </path>
            ))}
          </svg>
        </div>

        <Rule />

        {/* Attacks left */}
        <p className="mt-auto pt-[20px] text-center text-[22px]">87 / 100</p>

      </div>
    </div>
  );
}

function Rule({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 6"
      className={`w-[271px] h-[6px] mx-[22px] ${className}`}
      aria-hidden
    >
      <path d={RULE} fill="none" stroke="var(--touchwar-ink)" strokeWidth={1} />
    </svg>
  );
}
