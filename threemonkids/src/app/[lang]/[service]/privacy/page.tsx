import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getPublishedWorkLegal } from "@/lib/db/public";
import LegalPage from "@/components/public/LegalPage";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string; service: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, service } = await params;
  if (!isValidLang(lang)) return {};

  const [dict, legal] = await Promise.all([
    getDictionary(lang as Lang),
    getPublishedWorkLegal(service),
  ]);

  if (!legal) return { title: dict.legal.privacy_heading };

  const l = lang as Lang;
  const workTitle = (l === "ko" ? legal.title_ko : legal.title_en) ?? service;
  return { title: `${dict.legal.privacy_heading} — ${workTitle}` };
}

export default async function PrivacyPage({ params }: Props) {
  const { lang, service } = await params;
  if (!isValidLang(lang)) notFound();

  const [dict, legal] = await Promise.all([
    getDictionary(lang as Lang),
    getPublishedWorkLegal(service),
  ]);

  if (!legal) notFound();

  const l = lang as Lang;
  const content = l === "ko" ? legal.privacy_ko : legal.privacy_en;

  return (
    <LegalPage
      lang={l}
      legal={legal}
      heading={dict.legal.privacy_heading}
      content={content}
      backLabel={dict.legal.back_to_works}
      lastUpdatedLabel={dict.legal.last_updated}
    />
  );
}
