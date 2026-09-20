import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { SERVICES } from "@/data/services";
import StaticLegalLayout from "@/components/public/StaticLegalLayout";
import type { Metadata } from "next";
import type { Lang } from "@/types/i18n";

type Props = { params: Promise<{ lang: string; service: string }> };

type Section = { heading: string; items: string[] };

// Shared terms — used by any service without its own entry in *_BY_SLUG below.
const DEFAULT_INTRO: Record<Lang, string> = {
  ko: "본 서비스는 Three Monkids에서 제공합니다.",
  en: "This service is provided by Three Monkids.",
};

const DEFAULT_SECTIONS: Record<Lang, Section[]> = {
  ko: [
    {
      heading: "1. 서비스 이용",
      items: ["사용자는 본 서비스를 자유롭게 이용할 수 있습니다."],
    },
    {
      heading: "2. 책임 제한",
      items: ["제공되는 정보는 참고용이며, 최종 판단은 사용자에게 있습니다."],
    },
    {
      heading: "3. 금지 사항",
      items: ["서비스의 정상적인 운영을 방해하는 행위는 금지됩니다."],
    },
    {
      heading: "4. 정책 변경",
      items: ["본 약관은 변경될 수 있습니다."],
    },
    {
      heading: "5. 문의",
      items: ["threemonkids@gmail.com"],
    },
  ],
  en: [
    {
      heading: "1. Use of Service",
      items: ["Users may use this service freely in accordance with these terms."],
    },
    {
      heading: "2. Limitation of Liability",
      items: [
        "The information provided is for reference only, and final judgment remains with the user.",
      ],
    },
    {
      heading: "3. Prohibited Conduct",
      items: ["Any act that interferes with the normal operation of the service is prohibited."],
    },
    {
      heading: "4. Policy Changes",
      items: ["These terms may be updated from time to time."],
    },
    {
      heading: "5. Contact",
      items: ["threemonkids@gmail.com"],
    },
  ],
};

// Per-service overrides. Najeon runs entirely on-device, so it needs two clauses the
// shared terms lack: the user owns what they write, and there is no backup or recovery.
// It also credits the dictionary data source.
const INTRO_BY_SLUG: Record<string, Record<Lang, string>> = {
  najeon: {
    ko: "나전은 Three Monkids에서 제공하며, 계정과 서버 없이 기기에서만 동작합니다.",
    en: "Najeon is provided by Three Monkids and runs entirely on your device, with no account and no server.",
  },
};

// Services with their own terms also carry their own date; the rest use the
// project-wide default in StaticLegalLayout.
const UPDATED_DATE_BY_SLUG: Record<string, string> = {
  najeon: "2026.09.20",
};

const SECTIONS_BY_SLUG: Record<string, Record<Lang, Section[]>> = {
  najeon: {
    ko: [
      {
        heading: "1. 서비스 이용",
        items: [
          "사용자는 본 서비스를 자유롭게 이용할 수 있습니다.",
          "이용에 계정이나 회원가입이 필요하지 않습니다.",
        ],
      },
      {
        heading: "2. 이용자가 작성한 내용",
        items: [
          "이용자가 쓴 정의는 이용자 본인의 것입니다.",
          "Three Monkids는 이에 대한 어떠한 권리도 갖지 않으며, 접근할 수도 없습니다.",
        ],
      },
      {
        heading: "3. 기록의 보관 책임",
        items: [
          "모든 기록은 이용자의 기기에만 저장됩니다.",
          "앱 삭제, 기기 분실 또는 초기화 시 기록은 복구할 수 없습니다.",
          "백업 수단을 제공하지 않으므로, 중요한 기록은 별도로 보관해 주세요.",
        ],
      },
      {
        heading: "4. 사전 데이터",
        items: [
          "단어 뜻풀이는 국립국어원 「한국어기초사전」에서 제공받습니다.",
          "사전 내용의 정확성이나 지속적인 제공 여부는 보장되지 않습니다.",
        ],
      },
      {
        heading: "5. 책임 제한",
        items: ["제공되는 정보는 참고용이며, 최종 판단은 사용자에게 있습니다."],
      },
      {
        heading: "6. 정책 변경",
        items: ["본 약관은 변경될 수 있습니다."],
      },
      {
        heading: "7. 문의",
        items: ["threemonkids@gmail.com"],
      },
    ],
    en: [
      {
        heading: "1. Use of Service",
        items: [
          "Users may use this service freely in accordance with these terms.",
          "No account or sign-up is required.",
        ],
      },
      {
        heading: "2. What You Write",
        items: [
          "The definitions you write are yours.",
          "Three Monkids claims no rights over them and cannot access them.",
        ],
      },
      {
        heading: "3. Responsibility for Your Records",
        items: [
          "Everything you write is stored only on your device.",
          "If you delete the app, lose your device or reset it, your writing cannot be recovered.",
          "We provide no backup, so please keep a separate copy of anything important.",
        ],
      },
      {
        heading: "4. Dictionary Data",
        items: [
          "Word definitions are provided by the National Institute of Korean Language's Korean Basic Dictionary.",
          "We cannot guarantee the accuracy or continued availability of that data.",
        ],
      },
      {
        heading: "5. Limitation of Liability",
        items: [
          "The information provided is for reference only, and final judgment remains with the user.",
        ],
      },
      {
        heading: "6. Policy Changes",
        items: ["These terms may be updated from time to time."],
      },
      {
        heading: "7. Contact",
        items: ["threemonkids@gmail.com"],
      },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, service } = await params;
  const found = SERVICES.find((s) => s.slug === service);
  const isKo = lang === "ko";
  return { title: `${isKo ? "이용약관" : "Terms of Use"} — ${isKo ? found?.name_ko : found?.name_en ?? service}` };
}

export default async function TermsPage({ params }: Props) {
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
      pageTitle={isKo ? "이용약관" : "Terms of Use"}
      intro={intro}
      updatedDate={UPDATED_DATE_BY_SLUG[found.slug]}
      sections={sections}
      backHref={`/${l}/works`}
      backLabel={isKo ? "서비스로 돌아가기" : "Back to Services"}
    />
  );
}
