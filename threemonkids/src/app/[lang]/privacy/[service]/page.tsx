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

  return (
    <StaticLegalLayout
      lang={l}
      serviceSlug={found.slug}
      serviceName={serviceName}
      pageTitle={isKo ? "개인정보 처리방침" : "Privacy Policy"}
      intro={
        isKo
          ? "Three Monkids는 사용자의 개인정보를 중요하게 생각합니다."
          : "Three Monkids values your privacy."
      }
      sections={
        isKo
          ? [
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
            ]
          : [
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
            ]
      }
      backHref={`/${l}/works`}
      backLabel={isKo ? "서비스로 돌아가기" : "Back to Services"}
    />
  );
}
