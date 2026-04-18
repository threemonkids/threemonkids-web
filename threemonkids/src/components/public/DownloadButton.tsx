"use client";

import { useState, useEffect } from "react";
import type { Lang } from "@/types/i18n";

export function DownloadButton({ lang }: { lang: Lang }) {
  const label   = lang === "ko" ? "다운로드" : "Download";
  const message = lang === "ko" ? "앱 출시 준비 중입니다." : "App launching soon.";

  const [visible, setVisible] = useState(false);

  function handleClick() {
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <>
      <button
        onClick={handleClick}
        className="text-xs font-medium text-[var(--color-accent)]/70 hover:text-[var(--color-accent)] transition-colors duration-150 cursor-pointer"
      >
        {label}
      </button>

      {/* Toast */}
      <div
        aria-live="polite"
        className={[
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-3 px-5 py-3",
          "bg-[var(--color-surface-raised)] border border-[var(--color-border-light)]",
          "rounded-lg shadow-2xl",
          "text-sm font-medium text-[var(--color-foreground)]",
          "transition-all duration-300 ease-out pointer-events-none",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" aria-hidden />
        {message}
      </div>
    </>
  );
}
