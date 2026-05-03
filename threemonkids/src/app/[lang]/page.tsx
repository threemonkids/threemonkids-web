import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getFeaturedPublishedWorks } from "@/lib/db/public";
import MonkeyHero from "@/components/public/MonkeyHero";
import ServicesShowcase from "@/components/public/ServicesShowcase";
import type { ServiceItem } from "@/components/public/ServicesShowcase";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";
import type { PublicWorkListItem, WorkStatus, PlatformType } from "@/types/work";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};
  const dict = await getDictionary(lang as Lang);
  return {
    title: "Threemonkids",
    description: dict.home.hero_subheading,
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const [dict, featuredWorks] = await Promise.all([
    getDictionary(lang as Lang),
    getFeaturedPublishedWorks(3),
  ]);

  const l = lang as Lang;
  const h = dict.home;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <MonkeyHero headline={h.hero_heading} />

      {/* ── Services Showcase ────────────────────────────────────────────── */}
      {(() => {
        const services: ServiceItem[] = l === "ko"
          ? [
              {
                id: "already-me",
                cardSrc: "/services/already_me.png",
                name: "Already Me",
                statusLabel: "Coming Soon",
                mainCopy: "일기? 계획? 미래.",
                supportCopy: "오늘을 계획하지 않습니다.\n미래를 기록합니다.\n\n당신의 글이 현실이 됩니다.",
                ctaInactive: true,
                hoverTypingText: "From Future to Past",
              },
              {
                id: "perfact",
                cardSrc: "/services/perfact_card.png",
                cardWidth: 315,
                cardHeight: 439,
                name: "PerFact 카드",
                statusLabel: "Coming Soon",
                mainCopy: "카드 한장, 팩트 하나.",
                supportCopy: "장황한 글 뉴스 대신,\n컴팩트하게 팩트만 카드로 정리합니다.",
                avatarSrc: "/services/on_monkey.png",
                avatarAlt: "ON",
                href: `/${l}/works#perfact`,
              },
            ]
          : [
              {
                id: "already-me",
                cardSrc: "/services/already_me.png",
                name: "Already Me",
                statusLabel: "Coming Soon",
                mainCopy: "Diary? Plan? Future.",
                supportCopy: "Don't plan your day.\nWrite your future.\n\nYour words become reality.",
                ctaInactive: true,
                hoverTypingText: "From Future to Past",
              },
              {
                id: "perfact",
                cardSrc: "/services/perfact_card.png",
                cardWidth: 315,
                cardHeight: 439,
                name: "PerFact Card",
                statusLabel: "Coming Soon",
                mainCopy: "One Card, One Fact.",
                supportCopy: "Instead of long, wordy news,\nwe turn facts into compact cards.",
                avatarSrc: "/services/on_monkey.png",
                avatarAlt: "ON",
                href: `/${l}/works#perfact`,
              },
            ];
        return (
          <ServicesShowcase
            services={services}
            eyebrow={l === "ko" ? "서비스" : "Services"}
          />
        );
      })()}

      {/* ── Featured Works ───────────────────────────────────────────────── */}
      {featuredWorks.length > 0 && (
        <section className="px-6 py-24 md:py-32 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10 gap-4">
              <p className="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest">
                {h.featured_works_heading}
              </p>
              <Link
                href={`/${l}/works`}
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors shrink-0"
              >
                {dict.common.learn_more} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorks.map((work) => (
                <WorkCard key={work.id} work={work} lang={l} dict={dict.works} />
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  );
}

/* ── WorkCard ────────────────────────────────────────────────────────────── */

type WorkDict = Awaited<ReturnType<typeof getDictionary>>["works"];

const STATUS_STYLES: Record<WorkStatus, string> = {
  live:         "bg-emerald-950/50 text-emerald-400 border-emerald-800/50",
  coming_soon:  "bg-blue-950/50 text-blue-400 border-blue-800/50",
  archived:     "bg-amber-950/40 text-amber-500 border-amber-800/40",
  draft:        "bg-zinc-800 text-zinc-400 border-zinc-700",
};

function WorkCard({
  work,
  lang,
  dict,
}: {
  work: PublicWorkListItem;
  lang: Lang;
  dict: WorkDict;
}) {
  const title = (lang === "ko" ? work.title_ko : work.title_en) ?? work.slug;
  const summary = lang === "ko" ? work.summary_ko : work.summary_en;

  const statusLabel = {
    live:        dict.status_live,
    coming_soon: dict.status_coming_soon,
    archived:    dict.status_archived,
    draft:       dict.status_draft,
  }[work.status];

  const platformLabel: Record<PlatformType, string> = {
    web:     dict.platform_web,
    ios:     dict.platform_ios,
    android: dict.platform_android,
    desktop: dict.platform_desktop,
    hybrid:  dict.platform_hybrid,
  };

  return (
    <Link
      href={`/${lang}/works/${work.slug}`}
      className="group flex flex-col border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-raised)] transition-colors duration-200 overflow-hidden"
    >
      {/* Logo / thumbnail placeholder */}
      <div className="h-36 bg-[var(--color-surface-raised)] flex items-center justify-center border-b border-[var(--color-border)]">
        {work.thumbnail_url || work.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.logo_url ?? work.thumbnail_url ?? ""}
            alt={title}
            className="max-h-16 max-w-[60%] object-contain"
          />
        ) : (
          <span className="text-xl font-bold text-[var(--color-border)] tracking-tighter select-none">
            {title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[work.status]}`}
          >
            {statusLabel}
          </span>
          {work.platforms.slice(0, 2).map((p) => (
            <span
              key={p}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs text-[var(--color-muted-dark)] border border-[var(--color-border)]"
            >
              {platformLabel[p]}
            </span>
          ))}
        </div>
        <h3 className="text-base font-semibold text-[var(--color-foreground)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h3>
        {summary && (
          <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
            {summary}
          </p>
        )}
      </div>
    </Link>
  );
}

