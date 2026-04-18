import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getPublishedWorkBySlug } from "@/lib/db/public";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";
import type { WorkStatus, PlatformType, WorkMemberPreview } from "@/types/work";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isValidLang(lang)) return {};

  const work = await getPublishedWorkBySlug(slug);
  if (!work) return { title: "Not Found" };

  const l = lang as Lang;
  const title = (l === "ko" ? work.title_ko : work.title_en) ?? slug;
  const description =
    (l === "ko" ? work.summary_ko : work.summary_en) ?? undefined;

  return { title, description };
}

export default async function WorkDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isValidLang(lang)) notFound();

  const [dict, work] = await Promise.all([
    getDictionary(lang as Lang),
    getPublishedWorkBySlug(slug),
  ]);

  if (!work) notFound();

  const l = lang as Lang;

  const title = (l === "ko" ? work.title_ko : work.title_en) ?? slug;
  const summary = l === "ko" ? work.summary_ko : work.summary_en;
  const description = l === "ko" ? work.description_ko : work.description_en;
  const coreFeatures =
    l === "ko" ? work.core_features_ko : work.core_features_en;

  const w = dict.works;

  // Sort members: primary first, then alphabetical by localized name
  const members = [...(work.work_members ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    const nameA = l === "ko" ? a.team_members.name_ko : a.team_members.name_en;
    const nameB = l === "ko" ? b.team_members.name_ko : b.team_members.name_en;
    return nameA.localeCompare(nameB);
  });

  return (
    <article className="px-6 py-20 max-w-4xl mx-auto">
      {/* ── Back link ── */}
      <Link
        href={`/${l}/works`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors mb-12"
      >
        <span aria-hidden>←</span>
        {dict.works.heading}
      </Link>

      {/* ── Hero ── */}
      <header className="mb-12">
        {/* Status + platforms */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <StatusBadge status={work.status} dict={w} />
          {work.platforms.map((p) => (
            <PlatformTag key={p} platform={p} dict={w} />
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-foreground)] tracking-tight leading-tight mb-4">
          {title}
        </h1>

        {summary && (
          <p className="text-lg text-[var(--color-muted)] leading-relaxed max-w-2xl">
            {summary}
          </p>
        )}

        {/* ── CTAs ── */}
        {(work.official_url || work.app_store_url || work.play_store_url) && (
          <div className="flex flex-wrap gap-3 mt-8">
            {work.official_url && (
              <CtaButton href={work.official_url} primary>
                {w.cta_open_web}
              </CtaButton>
            )}
            {work.app_store_url && (
              <CtaButton href={work.app_store_url}>
                {w.cta_app_store}
              </CtaButton>
            )}
            {work.play_store_url && (
              <CtaButton href={work.play_store_url}>
                {w.cta_play_store}
              </CtaButton>
            )}
          </div>
        )}
      </header>

      {/* ── Description ── */}
      {description && (
        <section className="mb-12 border-t border-[var(--color-border)] pt-10">
          <div className="prose prose-sm prose-invert max-w-none text-[var(--color-muted)] leading-relaxed whitespace-pre-wrap">
            {description}
          </div>
        </section>
      )}

      {/* ── Core features ── */}
      {coreFeatures && coreFeatures.length > 0 && (
        <section className="mb-12 border-t border-[var(--color-border)] pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-5">
            {w.features_heading}
          </h2>
          <ul className="flex flex-col gap-3">
            {coreFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0"
                  aria-hidden
                />
                <span className="text-[var(--color-foreground)] text-sm leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Team members ── */}
      {members.length > 0 && (
        <section className="mb-12 border-t border-[var(--color-border)] pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-6">
            {w.team_heading}
          </h2>
          <div className="flex flex-col gap-4">
            {members.map((wm) => (
              <MemberRow key={wm.id} wm={wm} lang={l} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

type WorkDict = Awaited<ReturnType<typeof getDictionary>>["works"];

const STATUS_STYLES: Record<WorkStatus, string> = {
  live: "bg-emerald-950/50 text-emerald-400 border-emerald-800/50",
  coming_soon: "bg-blue-950/50 text-blue-400 border-blue-800/50",
  archived: "bg-amber-950/40 text-amber-500 border-amber-800/40",
  draft: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

function StatusBadge({ status, dict }: { status: WorkStatus; dict: WorkDict }) {
  const label = {
    live: dict.status_live,
    coming_soon: dict.status_coming_soon,
    archived: dict.status_archived,
    draft: dict.status_draft,
  }[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

function PlatformTag({
  platform,
  dict,
}: {
  platform: PlatformType;
  dict: WorkDict;
}) {
  const label = {
    web: dict.platform_web,
    ios: dict.platform_ios,
    android: dict.platform_android,
    desktop: dict.platform_desktop,
    hybrid: dict.platform_hybrid,
  }[platform];

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs text-[var(--color-muted-dark)] border border-[var(--color-border)]">
      {label}
    </span>
  );
}

function CtaButton({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150",
        primary
          ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-dim)]"
          : "border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-raised)]",
      ].join(" ")}
    >
      {children}
      <span aria-hidden className="text-xs opacity-60">
        ↗
      </span>
    </a>
  );
}

function MemberRow({ wm, lang }: { wm: WorkMemberPreview; lang: Lang }) {
  const m = wm.team_members;
  const name = lang === "ko" ? m.name_ko : m.name_en;
  const role = lang === "ko" ? m.role_ko : m.role_en;

  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center shrink-0 overflow-hidden">
        {m.profile_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.profile_image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-[var(--color-muted)]">
            {name.slice(0, 1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          {name}
          {wm.is_primary && (
            <span className="ml-2 text-xs text-[var(--color-accent)] font-normal">
              ★
            </span>
          )}
        </p>
        <p className="text-xs text-[var(--color-muted)]">{role}</p>
      </div>
    </div>
  );
}
