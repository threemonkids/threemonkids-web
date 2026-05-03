import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};
  const dict = await getDictionary(lang as Lang);
  return {
    title: dict.about.heading,
    description: dict.about.intro_body,
  };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const dict = await getDictionary(lang as Lang);
  const l = lang as Lang;
  const a = dict.about;
  const h = dict.home;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-foreground)] leading-[1.05] mb-8">
            {l === "ko" ? (
              <>
                <span className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-2 py-1">
                  Threemonkids
                </span>
                에 대하여
              </>
            ) : (
              <>
                About{" "}
                <span className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-2 py-1">
                  Threemonkids
                </span>
              </>
            )}
          </h1>
          <div className="flex flex-col gap-2 text-lg md:text-xl text-[var(--color-muted)] max-w-3xl leading-relaxed">
            {l === "ko" ? (
              <>
                <p>Three Monkids는 하나의 브랜드 아래 다양한 서비스를 만들어내는 스튜디오입니다.</p>
                <p>생각에 머물지 않고, 직접 만듭니다.</p>
              </>
            ) : (
              <>
                <p>Three Monkids is a studio that creates a range of services under one brand.</p>
                <p>We don&apos;t stop at ideas. We make them.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── The Name ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left column — self-contained, right column cannot affect its spacing */}
          <div className="flex flex-col gap-5">
            <p className="text-base font-semibold text-[var(--color-accent)] tracking-wide">
              {a.name_meaning_heading}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] tracking-tight leading-tight">
              Three Monkeys
              <span className="text-[var(--color-muted)]"> + </span>
              Kids
            </h2>
            <p className="text-base md:text-lg text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
              {l === "ko"
                ? "Threemonkids는 Three Monkeys와 Kids의 합성어입니다.\n세 마리의 원숭이처럼 남의 시선, 남의 의견, 남의 기준에 흔들리지 않고\n어린아이처럼 눈치 보지 않고 만들고 싶은 것을 만드는 팀입니다."
                : a.name_meaning_body}
            </p>
          </div>

          {/* Right column — independent, does not push left column content */}
          <div className="flex flex-col gap-3">
            {l === "ko" ? (
              ["눈치 보지 않고,", "평가에 흔들리지 않고,", "포장하지 않고,", "우리가 만들고 싶은 걸 만든다."].map((line, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <p key={i} className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                    {isLast ? (
                      <span className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-2 py-1">
                        {line}
                      </span>
                    ) : (
                      <span className="text-white">{line}</span>
                    )}
                  </p>
                );
              })
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {[
                    "Senses over gaze.",
                    "Focus over opinions.",
                    "Action over persuasion.",
                  ].map((line, i) => (
                    <p key={i} className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                      <span className="text-white">{line}</span>
                    </p>
                  ))}
                </div>
                <div className="mt-6">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                    <span className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-2 py-1">
                      We make what we want.
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </section>

      {/* ── Three Monkeys ────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <p className="text-base font-semibold text-[var(--color-accent)] tracking-wide mb-12">
            {h.monkey_section_heading}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {([
              {
                src: "/monkeys/dont_see.png?v=2",
                caption: l === "ko" ? "덜 보고, 더 생각한다" : "See Less, Think More",
              },
              {
                src: "/monkeys/dont_hear.png?v=2",
                caption: l === "ko" ? "덜 듣고, 더 집중한다" : "Hear Less, Focus More",
              },
              {
                src: "/monkeys/dont_speak.png?v=2",
                caption: l === "ko" ? "덜 말하고, 더 행동한다" : "Say Less, Action More",
              },
            ] as const).map((monkey) => (
              <div key={monkey.src} className="flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={monkey.src}
                  alt=""
                  className="h-[200px] md:h-[240px] w-auto object-contain select-none opacity-90"
                />
                <p className="mt-5 text-sm font-semibold text-white leading-relaxed">{monkey.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 원숭이들 / Monkeys ───────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <p className="text-base font-semibold text-[var(--color-accent)] tracking-wide mb-12">
            {l === "ko" ? "원숭이들" : "Monkeys"}
          </p>
          <div className="flex items-start gap-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/services/on_monkey.png"
              alt="ON"
              className="w-36 md:w-44 h-auto object-contain shrink-0 opacity-90"
              style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.55))" }}
            />
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)]">ON</p>
              <p className="text-sm md:text-base text-[var(--color-muted)] leading-relaxed">
                {l === "ko"
                  ? "우리 삶을 조금 더 장난스럽고 재미있게 만들고 싶다."
                  : "I want to make life a little more playful and fun."}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs font-semibold text-white uppercase tracking-widest">
                  {l === "ko" ? "작업물" : "Works"}
                </p>
                <ul className="flex flex-col gap-1.5">
                  <li className="text-sm">
                    <Link
                      href={`/${l}/works#already-me`}
                      className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
                    >
                      Already Me
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link
                      href={`/${l}/works#perfact`}
                      className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
                    >
                      {l === "ko" ? "PerFact 카드" : "PerFact Card"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center md:justify-end">
            <Link
              href={`/${l}/works`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm font-semibold hover:bg-[var(--color-accent-dim)] transition-colors duration-150"
            >
              {a.cta_works}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
