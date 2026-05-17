import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

type LogoProps = {
  variant?: "header" | "hero" | "footer";
  showText?: boolean;
  className?: string;
};

export function Logo({
  variant = "header",
  showText = variant === "header",
  className = "",
}: LogoProps) {
  const src =
    variant === "footer" ? siteConfig.logoLight : siteConfig.logoLight;

  const imageSize =
    variant === "hero"
      ? "h-24 w-auto md:h-32"
      : variant === "footer"
        ? "h-12 w-auto"
        : "h-11 w-auto";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src={src}
        alt={`${siteConfig.name} logo`}
        width={variant === "hero" ? 280 : 120}
        height={variant === "hero" ? 120 : 48}
        className={`${imageSize} object-contain`}
        priority={variant === "hero" || variant === "header"}
      />
      {showText && (
        <span className="hidden sm:block">
          <span className="block font-heading text-xl font-semibold leading-tight text-nav group-hover:text-nav-hover">
            {siteConfig.name}
          </span>
          <span className="block text-xs font-medium text-ink-soft">
            {siteConfig.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
