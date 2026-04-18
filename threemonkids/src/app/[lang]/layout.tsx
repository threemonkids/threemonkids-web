import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Lang } from "@/types/i18n";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    // Sets document lang for SEO — actual html[lang] is handled via suppressHydrationWarning
    alternates: {
      canonical: `https://threemonkids.com/${lang}`,
      languages: {
        ko: "https://threemonkids.com/ko",
        en: "https://threemonkids.com/en",
      },
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Lang);

  return (
    <>
      <Header lang={lang as Lang} dict={dict} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer lang={lang as Lang} dict={dict} />
    </>
  );
}
