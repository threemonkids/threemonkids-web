import Link from "next/link";
import type { Lang } from "@/types/i18n";

type Section = {
  heading: string;
  items: string[];
};

type Props = {
  lang: Lang;
  serviceSlug: string;
  serviceName: string;
  pageTitle: string;
  intro?: string;
  sections: Section[];
  backHref: string;
  backLabel: string;
};

const EMAIL = "threemonkids@gmail.com";

export default function StaticLegalLayout({
  lang,
  serviceName,
  pageTitle,
  intro,
  sections,
  backHref,
  backLabel,
}: Props) {
  const updatedDate = "2026.04.18";

  return (
    <div className="px-6 pt-14 pb-28 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors duration-150 mb-12"
      >
        <span aria-hidden>←</span>
        {backLabel}
      </Link>

      {/* Header */}
      <header className="mb-10">
        <p className="text-lg md:text-xl font-bold text-[var(--color-accent)] tracking-wide mb-3">
          {serviceName}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xs text-[var(--color-muted-dark)] mt-4">
          {lang === "ko" ? "최종 업데이트" : "Last updated"}: {updatedDate}
        </p>
      </header>

      {/* Content */}
      <div className="border-t border-[var(--color-border)] pt-10 flex flex-col gap-8">
        {intro && (
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            {intro}
          </p>
        )}

        {sections.map((section, i) => (
          <div key={i} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              {section.heading}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {section.items.map((item, j) => (
                <li
                  key={j}
                  className="text-sm text-[var(--color-muted)] leading-relaxed pl-3 border-l border-[var(--color-border)]"
                >
                  {item.includes(EMAIL) ? (
                    <>
                      {item.split(EMAIL)[0]}
                      <a
                        href={`mailto:${EMAIL}`}
                        className="text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)] underline underline-offset-2 transition-colors duration-150"
                      >
                        {EMAIL}
                      </a>
                      {item.split(EMAIL)[1]}
                    </>
                  ) : (
                    item
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
