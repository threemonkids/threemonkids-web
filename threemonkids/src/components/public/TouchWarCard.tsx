"use client";

import { useEffect, useRef, useState } from "react";
import { TOUCH_WAR_ARCS, VIEW_BOX } from "./touchWarArcs";

/* ─────────────────────────────────────────────────────────────────────────────
   Touch War service card.

   Like NajeonCard this is a live component rather than a PNG, because what is
   worth showing is motion. The app's DESIGN.md describes it exactly:

     "Live attacks: a dotted pencil curve draws itself from attacker to target
      and fades."
     "grey flash, crack shoots out in 0.1s and fades after ~2.5s"

   The card reproduces that. Nothing else is on it — the map fills the whole card,
   as the app's landscape mode does.

   Geometry and timings come from the app, not from guesswork:
   - shapes and country centres from ww/src/map.json, via scripts/build-touchwar-map.py
   - crack shapes from the same crackPath() the app uses
   - timings from ww/src/live.ts (LIVE.DRAW_MS 400, ARC_MS 1300) and WorldMap.tsx
     (CRACK_MS 2600 = 1.6s held then 1s fade, 450ms flash, 100ms crack grow)

   See CLAUDE.md.
   ───────────────────────────────────────────────────────────────────────────── */

// User units, at the card's 1.254 px per unit. See the generator's stroke table.
const ARC_STROKE = 1.9;   // 2.4px
const ARC_DASH = "4 7.2"; // 5px on, 9px off
const MASK_STROKE = 6.4;  // 8px, comfortably wider than the curve it reveals
const CRACK_STROKE = 1.28;
const FLASH_STROKE = 1.9;

const INK = "#000000";
const FLASH = "#BDBDBD";

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
      <div className="touchwar-card-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/services/touch_war_map.svg"
          alt="World map"
          width={315}
          height={439}
          className="block w-full h-full select-none"
          draggable={false}
        />

        <svg
          viewBox={VIEW_BOX}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <defs>
            {TOUCH_WAR_ARCS.map((arc, i) => (
              <g key={arc.id}>
                {/* The reveal: a fat white line uncovering the dotted curve as its
                    dash offset runs to zero. One path cannot both be dotted and
                    draw itself, hence the mask. */}
                <mask id={`touchwar-mask-${arc.id}`} maskUnits="userSpaceOnUse"
                      x="455" y="50" width="251.1" height="350">
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
                {/* Keeps the crack inside the country it cracked, as the app does. */}
                <clipPath id={`touchwar-clip-${arc.id}`}>
                  <path d={arc.target} />
                </clipPath>
              </g>
            ))}
          </defs>

          {/* Grey flash on the country being hit */}
          {TOUCH_WAR_ARCS.map((arc, i) => (
            <path
              key={`flash-${arc.id}`}
              className="touchwar-flash"
              d={arc.target}
              fill={FLASH}
              stroke={INK}
              strokeWidth={FLASH_STROKE}
              strokeLinejoin="round"
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}

          {/* Crack, shooting out from where the curve landed */}
          {TOUCH_WAR_ARCS.map((arc, i) => (
            <g key={`crack-${arc.id}`} clipPath={`url(#touchwar-clip-${arc.id})`}>
              <g transform={`translate(${arc.hit[0]} ${arc.hit[1]})`}>
                <g
                  className="touchwar-crack"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <path
                    d={arc.crack}
                    fill="none"
                    stroke={INK}
                    strokeWidth={CRACK_STROKE}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </g>
          ))}

          {/* The attack curve itself */}
          {TOUCH_WAR_ARCS.map((arc, i) => (
            <path
              key={arc.id}
              className="touchwar-arc"
              d={arc.d}
              fill="none"
              stroke={INK}
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
    </div>
  );
}
