import Link from "next/link";
import type { Lang } from "@/types/i18n";
import type { WorkLegalContent } from "@/lib/db/public";

interface LegalPageProps {
  lang: Lang;
  legal: WorkLegalContent;
  heading: string;
  content: string | null;
  backLabel: string;
  lastUpdatedLabel: string;
}

/**
 * Shared layout for /[lang]/[service]/(support|privacy|terms).
 * All three pages have identical structure — only the heading and content differ.
 * Server component — no client state needed.
 */
export default function LegalPage({
  lang,
  legal,
  heading,
  content,
  backLabel,
  lastUpdatedLabel,
}: LegalPageProps) {
  const workTitle =
    (lang === "ko" ? legal.title_ko : legal.title_en) ?? legal.slug;

  const updatedDate = new Date(legal.pages_updated_at).toLocaleDateString(
    lang === "ko" ? "ko-KR" : "en-AU",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="px-6 py-20 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href={`/${lang}/works/${legal.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors mb-12"
      >
        <span aria-hidden>←</span>
        {backLabel}
      </Link>

      {/* Work context + page heading */}
      <header className="mb-10">
        <p className="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest mb-3">
          {workTitle}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] tracking-tight">
          {heading}
        </h1>
        <p className="text-xs text-[var(--color-muted-dark)] mt-4">
          {lastUpdatedLabel}: {updatedDate}
        </p>
      </header>

      {/* Content */}
      <div className="border-t border-[var(--color-border)] pt-10">
        {content ? (
          <div className="text-[var(--color-muted)] text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <p className="text-[var(--color-muted-dark)] text-sm italic">
            Content not yet available.
          </p>
        )}
      </div>
    </div>
  );
}
