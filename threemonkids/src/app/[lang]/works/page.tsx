import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { SERVICES } from "@/data/services";
import { DownloadButton } from "@/components/public/DownloadButton";
import type { Service, ServiceCategory, ServiceStatus } from "@/data/services";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};
  const dict = await getDictionary(lang as Lang);
  return {
    title: dict.works.heading,
    description: dict.works.subheading,
  };
}

export default async function WorksPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const dict = await getDictionary(lang as Lang);
  const l = lang as Lang;

  return (
    <div className="px-6 pt-14 pb-24 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-accent)] tracking-tight mb-3">
          {dict.works.heading}
        </h1>
        <p className="text-[var(--color-muted)]">{dict.works.subheading}</p>
      </div>

      {/* Services list */}
      <div className="flex flex-col gap-24">
        {SERVICES.map((service) => (
          <ServiceSection key={service.id} service={service} lang={l} />
        ))}
      </div>
    </div>
  );
}

/* ── Inline highlight parser — [word] → <span class="text-white">word</span> ── */

function highlightBrackets(text: string): React.ReactNode {
  const parts = text.split(/\[([^\]]+)\]/);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="text-white">{part}</span>
      : part
  );
}

/* ── ServiceSection ──────────────────────────────────────────────────────── */

function ServiceSection({ service, lang }: { service: Service; lang: Lang }) {
  const name = lang === "ko" ? service.name_ko : service.name_en;
  const tagline = lang === "ko" ? service.tagline_ko : service.tagline_en;
  const description = lang === "ko" ? service.description_ko : service.description_en;
  const descriptionLines = description.split("\n");

  return (
    <section
      id={service.slug}
      className="flex flex-col md:flex-row md:items-stretch gap-10 md:gap-0 scroll-mt-20"
    >
      {/* Column 1: card */}
      <div className="md:w-[42%] shrink-0 flex items-start justify-center md:justify-end md:pr-16 lg:pr-20">
        {service.cardSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.cardSrc}
            alt={name}
            width={service.cardWidth}
            height={service.cardHeight}
            className="w-[220px] md:w-[260px] h-auto object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="w-[260px] h-[360px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center">
            <span className="text-3xl font-bold text-[var(--color-border)] tracking-tighter select-none">
              {name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Column 2: text + links — stretches to card height, links at bottom via mt-auto */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Category tags + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={service.status} />
          {service.categories.map((cat) => (
            <CategoryTag key={cat} category={cat} />
          ))}
        </div>

        {/* Name + tagline */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] leading-snug">
            {name}
          </h2>
          <p className="mt-1 text-base font-semibold text-[var(--color-accent)]">
            {tagline}
          </p>
        </div>

        {/* Description — one sentence per line */}
        <div className="flex flex-col gap-2">
          {descriptionLines.map((line, i) => (
            <p key={i} className="text-sm md:text-base text-[var(--color-muted)] leading-relaxed">
              {highlightBrackets(line)}
            </p>
          ))}
        </div>

        {/* Links — mt-auto pins this to the bottom of the column = card baseline */}
        <div className="mt-auto flex items-center gap-5 pt-3">
          <DownloadButton lang={lang} />
          <Link
            href={`/${lang}/support/${service.slug}`}
            className="text-xs font-medium text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)] transition-colors duration-150"
          >
            {lang === "ko" ? "고객지원" : "Support"}
          </Link>
          <Link
            href={`/${lang}/privacy/${service.slug}`}
            className="text-xs font-medium text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)] transition-colors duration-150"
          >
            {lang === "ko" ? "개인정보 처리방침" : "Privacy"}
          </Link>
          <Link
            href={`/${lang}/terms/${service.slug}`}
            className="text-xs font-medium text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)] transition-colors duration-150"
          >
            {lang === "ko" ? "이용약관" : "Terms of Use"}
          </Link>
        </div>
      </div>

      {/* Column 3: avatar — separate column, bottom-aligned, outside text flow */}
      {service.avatarSrc && (
        <div className="hidden md:flex items-end justify-end pl-6 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.avatarSrc}
            alt="creator"
            className="w-20 md:w-24 h-auto object-contain select-none opacity-80"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
          />
        </div>
      )}
    </section>
  );
}

/* ── StatusBadge ─────────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<ServiceStatus, string> = {
  live: "bg-emerald-950/50 text-emerald-400 border-emerald-800/50",
  coming_soon: "bg-blue-950/50 text-blue-400 border-blue-800/50",
  archived: "bg-amber-950/40 text-amber-500 border-amber-800/40",
  draft: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  live: "Live",
  coming_soon: "Coming Soon",
  archived: "Archived",
  draft: "Draft",
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ── CategoryTag ─────────────────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  desktop: "Desktop",
  app: "App",
  news: "News",
  utility: "Utility",
  productivity: "Productivity",
  diary: "Diary",
};

const WHITE_CATEGORIES = new Set<ServiceCategory>(["ios", "app", "news", "diary"]);

function CategoryTag({ category }: { category: ServiceCategory }) {
  const isWhite = WHITE_CATEGORIES.has(category);
  return (
    <span
      className={
        isWhite
          ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-[var(--color-surface)] text-white border-white/20 hover:border-white/40 transition-colors duration-150"
          : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-[var(--color-muted)] border border-[var(--color-border)] bg-[var(--color-surface)]"
      }
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
