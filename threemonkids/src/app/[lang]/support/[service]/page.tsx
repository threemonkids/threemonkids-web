import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { SERVICES } from "@/data/services";
import StaticLegalLayout from "@/components/public/StaticLegalLayout";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string; service: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, service } = await params;
  const found = SERVICES.find((s) => s.slug === service);
  const isKo = lang === "ko";
  return { title: `${isKo ? "고객지원" : "Support"} — ${isKo ? found?.name_ko : found?.name_en ?? service}` };
}

export default async function SupportPage({ params }: Props) {
  const { lang, service } = await params;
  if (!isValidLang(lang)) notFound();

  const found = SERVICES.find((s) => s.slug === service);
  if (!found) notFound();

  const l = lang as Lang;
  const isKo = l === "ko";
  const serviceName = isKo ? found.name_ko : found.name_en;

  // Per-service intro copy. Keep PerFact's wording untouched; add new services here.
  const INTRO_BY_SLUG: Record<string, { ko: string; en: string }> = {
    perfact: {
      ko: "PerFact 서비스 관련 문의는 아래 이메일로 연락해주세요.",
      en: "PerFact-related inquiries can be sent to the email below.",
    },
    "already-me": {
      ko: "Already Me 서비스 관련 문의는 아래 이메일로 연락해주세요.",
      en: "Already Me-related inquiries can be sent to the email below.",
    },
  };

  // Per-service "Last updated" overrides. PerFact uses the default in StaticLegalLayout.
  const UPDATED_DATE_BY_SLUG: Record<string, string> = {
    "already-me": "03/05/2026",
  };

  const intro = INTRO_BY_SLUG[found.slug]?.[isKo ? "ko" : "en"];
  const updatedDate = UPDATED_DATE_BY_SLUG[found.slug];

  return (
    <StaticLegalLayout
      lang={l}
      serviceSlug={found.slug}
      serviceName={serviceName}
      pageTitle={isKo ? "고객지원" : "Support"}
      intro={intro}
      updatedDate={updatedDate}
      sections={
        isKo
          ? [
              {
                heading: "이메일 문의",
                items: ["threemonkids@gmail.com"],
              },
              {
                heading: "문의 시 아래 정보를 함께 보내주시면 도움이 됩니다.",
                items: ["사용 중인 기기", "앱 버전", "발생한 문제 내용"],
              },
            ]
          : [
              {
                heading: "Email",
                items: ["threemonkids@gmail.com"],
              },
              {
                heading: "If possible, please include:",
                items: ["Your device", "App version", "A description of the issue"],
              },
            ]
      }
      backHref={`/${l}/works`}
      backLabel={isKo ? "서비스로 돌아가기" : "Back to Services"}
    />
  );
}
