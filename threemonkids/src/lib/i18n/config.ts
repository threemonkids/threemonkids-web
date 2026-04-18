import type { Lang } from "@/types/i18n";

export const SUPPORTED_LANGS: Lang[] = ["ko", "en"];
export const DEFAULT_LANG: Lang = "ko";

export function isValidLang(value: unknown): value is Lang {
  return typeof value === "string" && SUPPORTED_LANGS.includes(value as Lang);
}
