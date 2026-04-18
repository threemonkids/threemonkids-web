import { SUPPORTED_LANGS, DEFAULT_LANG } from "@/lib/i18n/config";
import type { Lang } from "@/types/i18n";

/**
 * Detects preferred language from Accept-Language header.
 * Falls back to DEFAULT_LANG if no match found.
 */
export function detectLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase().slice(0, 2));

  for (const code of preferred) {
    if (SUPPORTED_LANGS.includes(code as Lang)) {
      return code as Lang;
    }
  }

  return DEFAULT_LANG;
}

/**
 * Returns the alternate language for the given lang.
 */
export function getOtherLang(lang: Lang): Lang {
  return lang === "ko" ? "en" : "ko";
}

/**
 * Rewrites a pathname's lang segment to a new lang.
 * /ko/works/memozip → /en/works/memozip
 */
export function getLocalizedPath(pathname: string, newLang: Lang): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${newLang}`;

  const [first, ...rest] = segments;
  if (SUPPORTED_LANGS.includes(first as Lang)) {
    return `/${newLang}${rest.length ? "/" + rest.join("/") : ""}`;
  }

  return `/${newLang}/${segments.join("/")}`;
}

/**
 * Extracts the lang segment from a pathname.
 * Returns DEFAULT_LANG if not found.
 */
export function extractLang(pathname: string): Lang {
  const first = pathname.split("/").filter(Boolean)[0];
  return SUPPORTED_LANGS.includes(first as Lang) ? (first as Lang) : DEFAULT_LANG;
}
