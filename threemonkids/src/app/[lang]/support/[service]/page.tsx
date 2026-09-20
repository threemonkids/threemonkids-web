import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { SERVICES } from "@/data/services";
import StaticLegalLayout from "@/components/public/StaticLegalLayout";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string; service: string }> };

type Section = { heading: string; items: string[] };

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
  najeon: {
    ko: "나전은 사전의 뜻을 나의 언어로 다시 쓰는 앱입니다.",
    en: "Najeon lets you rewrite dictionary definitions in your own words.",
  },
};

// Per-service "Last updated" overrides. PerFact uses the default in StaticLegalLayout.
const UPDATED_DATE_BY_SLUG: Record<string, string> = {
  "already-me": "2026.05.03",
  najeon: "2026.09.20",
};

// Shared support copy — used by any service without its own entry below.
const DEFAULT_SECTIONS: Record<Lang, Section[]> = {
  ko: [
    {
      heading: "이메일 문의",
      items: ["threemonkids@gmail.com"],
    },
    {
      heading: "문의 시 아래 정보를 함께 보내주시면 도움이 됩니다.",
      items: ["사용 중인 기기", "앱 버전", "발생한 문제 내용"],
    },
  ],
  en: [
    {
      heading: "Email",
      items: ["threemonkids@gmail.com"],
    },
    {
      heading: "If possible, please include:",
      items: ["Your device", "App version", "A description of the issue"],
    },
  ],
};

// Per-service support copy. Only services that need more than the default appear here.
const SECTIONS_BY_SLUG: Record<string, Record<Lang, Section[]>> = {
  najeon: {
    ko: [
      {
        heading: "나전은 어떤 앱인가요?",
        items: [
          "단어를 찾아보고, 그 뜻을 직접 겪은 것으로 다시 쓰는 사전 앱입니다.",
          "사전이 알려주는 뜻 위에 나의 정의를 덧씁니다.",
        ],
      },
      {
        heading: "기록은 어디에 저장되나요?",
        items: [
          "쓴 글은 기기 안에만 저장되며, 서버로 전송되지 않습니다.",
          "앱을 삭제하면 모든 기록이 함께 사라지고 복구할 수 없습니다.",
          "중요한 기록은 따로 옮겨두는 것을 권합니다.",
        ],
      },
      {
        heading: "사전에 없는 단어를 검색했어요",
        items: [
          "사전에 등재되지 않은 단어는 뜻풀이가 나오지 않습니다.",
          "이 경우에도 단어를 그대로 두고 나의 정의를 직접 쓸 수 있습니다.",
        ],
      },
      {
        heading: "이메일 문의",
        items: ["threemonkids@gmail.com"],
      },
      {
        heading: "문의 시 아래 정보를 함께 보내주시면 도움이 됩니다.",
        items: ["사용 중인 기기", "앱 버전", "발생한 문제 내용"],
      },
    ],
    en: [
      {
        heading: "What is Najeon?",
        items: [
          "A dictionary app where you look up a word, then rewrite its meaning from your own experience.",
          "Your definition is written over the one the dictionary gives you.",
        ],
      },
      {
        heading: "Where is my writing stored?",
        items: [
          "Everything you write stays on your device and is never sent to a server.",
          "Deleting the app deletes all of it permanently, with no way to recover it.",
          "We recommend keeping a separate copy of anything important.",
        ],
      },
      {
        heading: "The word I searched isn't in the dictionary",
        items: [
          "Words not listed in the dictionary have no definition to show.",
          "You can still keep the word and write your own definition for it.",
        ],
      },
      {
        heading: "Email",
        items: ["threemonkids@gmail.com"],
      },
      {
        heading: "If possible, please include:",
        items: ["Your device", "App version", "A description of the issue"],
      },
    ],
  },
};

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

  const intro = INTRO_BY_SLUG[found.slug]?.[isKo ? "ko" : "en"];
  const updatedDate = UPDATED_DATE_BY_SLUG[found.slug];
  const sections = SECTIONS_BY_SLUG[found.slug]?.[l] ?? DEFAULT_SECTIONS[l];

  return (
    <StaticLegalLayout
      lang={l}
      serviceSlug={found.slug}
      serviceName={serviceName}
      pageTitle={isKo ? "고객지원" : "Support"}
      intro={intro}
      updatedDate={updatedDate}
      sections={sections}
      backHref={`/${l}/works`}
      backLabel={isKo ? "서비스로 돌아가기" : "Back to Services"}
    />
  );
}
