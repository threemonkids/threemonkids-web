import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { SERVICES } from "@/data/services";
import StaticLegalLayout from "@/components/public/StaticLegalLayout";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string; service: string }> };

type Section = { heading: string; items: string[] };

// Shared policy — used by any service without its own entry in *_BY_SLUG below.
const DEFAULT_INTRO: Record<Lang, string> = {
  ko: "Three Monkids는 사용자의 개인정보를 중요하게 생각합니다.",
  en: "Three Monkids values your privacy.",
};

const DEFAULT_SECTIONS: Record<Lang, Section[]> = {
  ko: [
    {
      heading: "1. 수집하는 정보",
      items: ["이메일 (회원가입 시)", "서비스 이용 데이터 (분석 및 개선 목적)"],
    },
    {
      heading: "2. 사용 목적",
      items: ["서비스 제공", "기능 개선"],
    },
    {
      heading: "3. 제3자 공유",
      items: ["사용자의 개인정보를 제3자에게 제공하지 않습니다."],
    },
    {
      heading: "4. 데이터 보관",
      items: ["필요한 기간 동안만 보관 후 삭제합니다."],
    },
    {
      heading: "5. 문의",
      items: ["threemonkids@gmail.com"],
    },
  ],
  en: [
    {
      heading: "1. Information We Collect",
      items: [
        "Email address (when signing up)",
        "Service usage data (for analytics and improvement)",
      ],
    },
    {
      heading: "2. How We Use Information",
      items: ["To provide the service", "To improve features and usability"],
    },
    {
      heading: "3. Third-Party Sharing",
      items: [
        "We do not share personal information with third parties unless required by law or necessary for service operation.",
      ],
    },
    {
      heading: "4. Data Retention",
      items: ["We keep data only as long as necessary and delete it afterward."],
    },
    {
      heading: "5. Contact",
      items: ["threemonkids@gmail.com"],
    },
  ],
};

// Per-service overrides. Najeon has no account, no server and no analytics, so the
// shared policy above does not describe it — it gets its own text.
const INTRO_BY_SLUG: Record<string, Record<Lang, string>> = {
  najeon: {
    ko: "나전은 이용자의 어떤 개인정보도 수집하지 않습니다.",
    en: "Najeon does not collect any personal information.",
  },
};

// Services with their own policy also carry their own date; the rest use the
// project-wide default in StaticLegalLayout.
const UPDATED_DATE_BY_SLUG: Record<string, string> = {
  najeon: "2026.09.20",
};

const SECTIONS_BY_SLUG: Record<string, Record<Lang, Section[]>> = {
  najeon: {
    ko: [
      {
        heading: "1. 수집하는 정보",
        items: [
          "나전은 어떤 개인정보도 수집하지 않습니다.",
          "계정, 로그인, 서버가 없습니다.",
        ],
      },
      {
        heading: "2. 기록의 저장 위치",
        items: [
          "모든 기록은 기기 내부의 SQLite 데이터베이스에만 저장됩니다.",
          "Three Monkids는 이용자의 기록에 접근할 수 없습니다.",
        ],
      },
      {
        heading: "3. 외부로 전송되는 정보",
        items: [
          "단어를 검색할 때, 검색한 단어만 국립국어원 「한국어기초사전」 API로 전송됩니다.",
          "이 요청에는 개인을 식별할 수 있는 정보가 포함되지 않습니다.",
          "이용자가 직접 쓴 정의는 외부로 전송되지 않습니다.",
        ],
      },
      {
        heading: "4. 제3자 제공",
        items: [
          "제3자에게 제공하는 정보가 없습니다.",
          "광고, 분석, 추적 도구를 사용하지 않습니다.",
        ],
      },
      {
        heading: "5. 데이터 보관 및 삭제",
        items: [
          "앱을 삭제하면 모든 기록이 기기에서 영구적으로 삭제됩니다.",
          "백업이나 복구 수단이 없으므로 삭제된 기록은 되돌릴 수 없습니다.",
        ],
      },
      {
        heading: "6. 문의",
        items: ["threemonkids@gmail.com"],
      },
    ],
    en: [
      {
        heading: "1. Information We Collect",
        items: [
          "Najeon collects no personal information.",
          "There are no accounts, no sign-in and no server.",
        ],
      },
      {
        heading: "2. Where Your Writing Is Stored",
        items: [
          "Everything you write is stored only in a SQLite database on your device.",
          "Three Monkids cannot access what you write.",
        ],
      },
      {
        heading: "3. What Leaves Your Device",
        items: [
          "When you look up a word, only that word is sent to the National Institute of Korean Language's Korean Basic Dictionary API.",
          "This request contains no personally identifiable information.",
          "The definitions you write are never sent anywhere.",
        ],
      },
      {
        heading: "4. Third-Party Sharing",
        items: [
          "There is nothing to share with third parties.",
          "We use no advertising, analytics or tracking tools.",
        ],
      },
      {
        heading: "5. Data Retention and Deletion",
        items: [
          "Deleting the app permanently deletes everything stored on your device.",
          "There is no backup or recovery, so deleted writing cannot be restored.",
        ],
      },
      {
        heading: "6. Contact",
        items: ["threemonkids@gmail.com"],
      },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, service } = await params;
  const found = SERVICES.find((s) => s.slug === service);
  const isKo = lang === "ko";
  return { title: `${isKo ? "개인정보 처리방침" : "Privacy Policy"} — ${isKo ? found?.name_ko : found?.name_en ?? service}` };
}

export default async function PrivacyPage({ params }: Props) {
  const { lang, service } = await params;
  if (!isValidLang(lang)) notFound();

  const found = SERVICES.find((s) => s.slug === service);
  if (!found) notFound();

  const l = lang as Lang;
  const isKo = l === "ko";
  const serviceName = isKo ? found.name_ko : found.name_en;

  const intro = INTRO_BY_SLUG[found.slug]?.[l] ?? DEFAULT_INTRO[l];
  const sections = SECTIONS_BY_SLUG[found.slug]?.[l] ?? DEFAULT_SECTIONS[l];

  return (
    <StaticLegalLayout
      lang={l}
      serviceSlug={found.slug}
      serviceName={serviceName}
      pageTitle={isKo ? "개인정보 처리방침" : "Privacy Policy"}
      intro={intro}
      updatedDate={UPDATED_DATE_BY_SLUG[found.slug]}
      sections={sections}
      backHref={`/${l}/works`}
      backLabel={isKo ? "서비스로 돌아가기" : "Back to Services"}
    />
  );
}
