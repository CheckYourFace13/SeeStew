"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/videos", label: "Videos" },
  { href: "/shorts", label: "Shorts" },
  { href: "/articles", label: "Stories" },
  { href: "/social", label: "Connect" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-muted bg-surface">
      <div className="container-page flex items-center justify-between gap-4 py-4">
        <Logo variant="header" />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium transition ${
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

        <Link href="/videos" className="btn-primary hidden text-sm sm:inline-flex">
          Watch
        </Link>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto border-t border-surface-muted px-4 py-2 md:hidden"
        aria-label="Mobile"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-nav"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
