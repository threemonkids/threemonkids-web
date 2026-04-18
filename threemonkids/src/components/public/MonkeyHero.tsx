"use client";

/* ─── Headline highlight helper ──────────────────────────────────────────── */
const TARGET = "Think like Kids.";

function WithAccentWord({ line }: { line: string }) {
  const idx = line.indexOf(TARGET);
  if (idx === -1) return <>{line}</>;
  return (
    <>
      {line.slice(0, idx)}
      <span className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-1.5 py-px">
        {TARGET}
      </span>
      {line.slice(idx + TARGET.length)}
    </>
  );
}

/* ─── Monkey images ───────────────────────────────────────────────────────── */

const MONKEYS = [
  { src: "/monkeys/dont_see.png?v=2",   alt: "Don't See"   },
  { src: "/monkeys/dont_hear.png?v=2",  alt: "Don't Hear"  },
  { src: "/monkeys/dont_speak.png?v=2", alt: "Don't Speak" },
] as const;

/* ─── MonkeyHero ─────────────────────────────────────────────────────────── */

type Props = {
  headline: string;
};

export default function MonkeyHero({ headline }: Props) {
  const [line1 = "", line2 = ""] = headline.split("\n");

  return (
    <section className="px-6 pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">

        {/* Supporting headline — deliberately smaller, secondary to the images */}
        <h1 className="flex flex-col items-center gap-4 md:gap-6 text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-8 md:mb-10">
          <span><WithAccentWord line={line1} /></span>
          <span className="mt-1 md:mt-2"><WithAccentWord line={line2} /></span>
        </h1>

        {/* Monkey images — primary visual focus */}
        <div className="flex items-end justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16">
          {MONKEYS.map((m) => (
            <div key={m.src} className="h-[160px] sm:h-[220px] md:h-[290px] lg:h-[320px] transition-[transform,filter] duration-300 ease-out hover:scale-[1.04] active:scale-[1.04] hover:[filter:brightness(1.1)_drop-shadow(0_0_18px_rgba(0,0,0,0.6))] active:[filter:brightness(1.1)_drop-shadow(0_0_18px_rgba(0,0,0,0.6))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.src}
                alt={m.alt}
                style={{ height: "100%", width: "auto", display: "block" }}
                className="object-contain select-none"
              />
            </div>
          ))}
        </div>

        {/* Supporting statement */}
        <p className="text-lg md:text-xl font-semibold text-white tracking-wide leading-relaxed">
          Less Noise. More Ideas.
        </p>

      </div>
    </section>
  );
}
