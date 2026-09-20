"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Najeon service card.

   Unlike every other service card this is a live component, not a PNG, because
   its whole point is the 덧쓰기 reveal: the dictionary definition recedes and the
   user's own sentence is typed over it. See CLAUDE.md for why it is built this
   way and why the aspect ratio is not the phone's.

   Laid out at a fixed 315×439 design size — the same ratio as the sibling cards —
   and scaled to whatever slot it lands in via the `--najeon-scale` custom
   property, which each call site sets per breakpoint.

   Motion lives in globals.css under `.najeon-*`. Desktop drives it with :hover;
   touch devices get one automatic play, armed below.
   ───────────────────────────────────────────────────────────────────────────── */

const WORD = "낭만";
const PART_OF_SPEECH = "「명사」";
const DATE = "9월 20일";
const ENTRY_LABEL = "나의 첫 번째 말";
const SOURCE = "국립국어원 한국어기초사전";

const DEFINITION_LINES = [
  "현실에 매이지 않고 감정적이고 이상적으로",
  "사물을 대하는 심리 상태. 또는 그러한",
  "분위기.",
];

const OWN_WRITING = "지금 내가 이 앱을 만드는 과정";

export default function NajeonCard({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    // Pointer devices drive the reveal with :hover. Touch has no hover, so play
    // it once when the card first scrolls into view, then stop observing.
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
      className={`najeon-card ${played ? "najeon-card--played" : ""} ${className}`}
    >
      <div className="najeon-card-inner flex flex-col px-[26px] pt-[24px] pb-[20px]">

        {/* Entry label + date */}
        <div className="flex items-baseline justify-between text-[9px] tracking-[0.18em] text-[var(--najeon-meta)]">
          <span>{ENTRY_LABEL}</span>
          <span className="tracking-[0.04em]">{DATE}</span>
        </div>

        {/* Headword */}
        <div className="mt-[44px] flex items-baseline gap-[10px]">
          <span className="text-[38px] leading-none">{WORD}</span>
          <span className="text-[11px] text-[var(--najeon-meta)]">{PART_OF_SPEECH}</span>
        </div>

        {/* Dictionary definition — recedes on reveal, one line at a time */}
        <div className="mt-[40px] text-[13px] leading-[1.95]">
          {DEFINITION_LINES.map((line, i) => (
            <span
              key={i}
              className="najeon-def-line"
              style={{ "--i": i } as React.CSSProperties}
            >
              {line}
            </span>
          ))}
        </div>

        {/* Own writing — typed over the definition, one character every 90ms */}
        <p className="najeon-type mt-[30px] text-[15px] leading-[1.7] text-[var(--najeon-ink-blue)]">
          {Array.from(OWN_WRITING).map((char, i) => (
            <span
              key={i}
              className="najeon-type-char"
              style={{ "--i": i } as React.CSSProperties}
            >
              {char}
            </span>
          ))}
        </p>

        {/* Source credit */}
        <p className="mt-auto pt-[16px] text-[8.5px] tracking-[0.02em] text-[var(--najeon-meta)]">
          {SOURCE}
        </p>

      </div>
    </div>
  );
}
