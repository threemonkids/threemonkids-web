import React from "react";

/**
 * Inline highlight parser — [word] → <span class="text-white">word</span>.
 * Used for service copy on both the Home showcase and the Services page.
 */
export function highlightBrackets(text: string): React.ReactNode {
  const parts = text.split(/\[([^\]]+)\]/);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="text-white">{part}</span>
      : part
  );
}
