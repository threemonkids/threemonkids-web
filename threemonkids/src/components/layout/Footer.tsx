import Link from "next/link";
import Image from "next/image";
import type { Dictionary, Lang } from "@/types/i18n";

const MONKEYS = [
  { src: "/monkeys/dont_see.png?v=2",   alt: "Don't See"   },
  { src: "/monkeys/dont_hear.png?v=2",  alt: "Don't Hear"  },
  { src: "/monkeys/dont_speak.png?v=2", alt: "Don't Speak" },
] as const;

type Props = {
  lang: Lang;
  dict: Dictionary;
};

export default function Footer({ lang, dict }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Main row: brand left, monkeys right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">

          {/* Brand: logo + slogan side by side */}
          <div className="flex items-center gap-6">
            <Link href={`/${lang}`} className="inline-flex shrink-0 hover:opacity-75 transition-opacity duration-150">
              <div className="h-7 md:h-9">
                <Image
                  src="/brand/logo.png"
                  alt="Threemonkids"
                  width={522}
                  height={275}
                  style={{ height: "100%", width: "auto", display: "block" }}
                />
              </div>
            </Link>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              See Less, Hear Less, Say Less.<br />
              Think like Kids.
            </p>
          </div>

          {/* Three monkey avatars */}
          <div className="flex items-end gap-4 sm:gap-6">
            {MONKEYS.map((m) => (
              <div
                key={m.src}
                className="opacity-60 hover:opacity-90 transition-opacity duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={m.alt}
                  className="h-14 md:h-16 w-auto object-contain select-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-muted-dark)]">
            &copy; {year} {dict.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
