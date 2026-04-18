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

  return (
    <StaticLegalLayout
      lang={l}
      serviceSlug={found.slug}
      serviceName={serviceName}
      pageTitle={isKo ? "이용약관" : "Terms of Use"}
      intro={
        isKo
          ? "본 서비스는 Three Monkids에서 제공합니다."
          : "This service is provided by Three Monkids."
      }
      sections={
        isKo
          ? [
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
            ]
          : [
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
            ]
      }
      backHref={`/${l}/works`}
      backLabel={isKo ? "서비스로 돌아가기" : "Back to Services"}
    />
  );
}
