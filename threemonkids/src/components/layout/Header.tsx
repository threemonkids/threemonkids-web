"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LangSwitcher from "./LangSwitcher";
import type { Dictionary, Lang } from "@/types/i18n";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

export default function Header({ lang, dict }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${lang}`,       label: dict.nav.home  },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/works`, label: dict.nav.works },
  ];

  function isActive(href: string) {
    // Home must be exact-match so it doesn't highlight on every page
    if (href === `/${lang}`) return pathname === `/${lang}`;
    return pathname.startsWith(href);
  }

  // Shared nav link className builder
  function navClass(href: string) {
    return [
      "text-sm font-medium tracking-wide transition-colors duration-150",
      isActive(href)
        ? "text-[var(--color-accent)]"
        : "text-white hover:text-[var(--color-foreground)]",
    ].join(" ");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo — white-on-transparent PNG derived from threemonkids_black.png */}
        <Link
          href={`/${lang}`}
          className="flex items-center shrink-0 hover:opacity-75 transition-opacity duration-150"
        >
          <div className="h-10 md:h-14">
            <Image
              src="/brand/logo.png"
              alt="Threemonkids logo"
              width={522}
              height={275}
              priority
              style={{ height: "100%", width: "auto", display: "block" }}
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navClass(link.href)}>
              {link.label}
            </Link>
          ))}
          <LangSwitcher />
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-4">
          <LangSwitcher />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`py-1 ${navClass(link.href)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
