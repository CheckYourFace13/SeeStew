"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SocialIconLinks } from "@/components/SocialIcons";

const nav = [
  { href: "/articles", label: "Stories" },
  { href: "/videos", label: "Videos" },
  { href: "/shorts", label: "Shorts" },
];

export function Header() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-muted bg-surface shadow-sm">
      <div className="container-page flex items-center justify-between gap-3 py-3 md:gap-4 md:py-4">
        <Logo variant="header" />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          <nav
            className="flex items-center gap-0.5 overflow-x-auto sm:gap-4"
            aria-label="Main"
          >
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-2 py-1.5 text-sm font-medium transition sm:text-base ${
                    active
                      ? "text-brand-bright"
                      : "text-nav hover:text-nav-hover"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <SocialIconLinks variant="header" className="shrink-0 border-l border-brand-wash pl-2 sm:pl-4" />
        </div>
      </div>
    </header>
  );
}
