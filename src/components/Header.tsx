"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Stories" },
  { href: "/videos", label: "Videos" },
  { href: "/#subscribe", label: "Subscribe" },
];

export function Header() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    const path = href.split("#")[0];
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-muted bg-surface shadow-sm">
      <div className="container-page flex items-center justify-between gap-4 py-3 md:py-4">
        <Logo variant="header" />

        <nav
          className="flex max-w-full flex-1 items-center justify-end gap-1 overflow-x-auto sm:gap-6"
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
      </div>
    </header>
  );
}
