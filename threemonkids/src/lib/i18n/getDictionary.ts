import type { Lang, Dictionary } from "@/types/i18n";

const dictionaries: Record<Lang, () => Promise<{ default: Dictionary }>> = {
  ko: () => import("./dictionaries/ko"),
  en: () => import("./dictionaries/en"),
};

export async function getDictionary(lang: Lang): Promise<Dictionary> {
  const loader = dictionaries[lang];
  const module = await loader();
  return module.default;
}
