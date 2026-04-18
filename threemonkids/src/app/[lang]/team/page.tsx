import { redirect } from "next/navigation";
import { isValidLang } from "@/lib/i18n/config";

type Props = { params: Promise<{ lang: string }> };

export default async function TeamPage({ params }: Props) {
  const { lang } = await params;
  redirect(`/${isValidLang(lang) ? lang : "ko"}/about`);
}
