"use client";

import { usePathname, useRouter } from "next/navigation";
import { getLocalizedPath, getOtherLang } from "@/lib/utils/lang";
import { extractLang } from "@/lib/utils/lang";
import type { Lang } from "@/types/i18n";

export default function LangSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLang: Lang = extractLang(pathname);
  const otherLang = getOtherLang(currentLang);

  function handleSwitch() {
    const newPath = getLocalizedPath(pathname, otherLang);
    router.push(newPath);
  }

  return (
    <button
      onClick={handleSwitch}
      aria-label={`Switch to ${otherLang === "ko" ? "Korean" : "English"}`}
      className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors duration-150 tracking-wide uppercase"
    >
      {otherLang === "ko" ? "KO" : "EN"}
    </button>
  );
}
