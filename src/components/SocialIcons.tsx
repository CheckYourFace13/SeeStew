import type { ReactNode } from "react";
import { siteConfig } from "@/lib/config";

export type SocialPlatform = "youtube" | "instagram" | "tiktok";

const platforms: Array<{
  id: SocialPlatform;
  href: string;
  label: string;
}> = [
  {
    id: "youtube",
    href: siteConfig.social.youtubeUrl,
    label: "SeeStew on YouTube",
  },
  {
    id: "instagram",
    href: siteConfig.social.instagramUrl,
    label: "SeeStew on Instagram",
  },
  {
    id: "tiktok",
    href: siteConfig.social.tiktokUrl,
    label: "SeeStew on TikTok",
  },
];

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12 9.6 15.6Z"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2c2.7 0 3 .01 4 .06 1.1.05 1.8.2 2.5.45.7.26 1.2.6 1.8 1.1.5.5.9 1.1 1.1 1.8.25.7.4 1.4.45 2.5.05 1.1.06 1.3.06 4s-.01 3-.06 4c-.05 1.1-.2 1.8-.45 2.5a4.6 4.6 0 0 1-1.1 1.8 4.6 4.6 0 0 1-1.8 1.1c-.7.25-1.4.4-2.5.45-1.1.05-1.3.06-4 .06s-3-.01-4-.06c-1.1-.05-1.8-.2-2.5-.45a4.6 4.6 0 0 1-1.8-1.1 4.6 4.6 0 0 1-1.1-1.8c-.25-.7-.4-1.4-.45-2.5-.05-1.1-.06-1.3-.06-4s.01-3 .06-4c.05-1.1.2-1.8.45-2.5.26-.7.6-1.2 1.1-1.8.5-.5 1.1-.9 1.8-1.1.7-.25 1.4-.4 2.5-.45 1-.05 1.3-.06 4-.06Zm0 1.8c-2.6 0-2.9.01-3.9.06-.9.04-1.4.2-1.8.33-.5.18-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.13.4-.29.9-.33 1.8-.05 1-.06 1.3-.06 3.9s.01 2.9.06 3.9c.04.9.2 1.4.33 1.8.18.5.4.8.8 1.2.4.4.7.6 1.2.8.4.13.9.29 1.8.33 1 .05 1.3.06 3.9.06s2.9-.01 3.9-.06c.9-.04 1.4-.2 1.8-.33.5-.18.8-.4 1.2-.8.4-.4.6-.7.8-1.2.13-.4.29-.9.33-1.8.05-1 .06-1.3.06-3.9s-.01-2.9-.06-3.9c-.04-.9-.2-1.4-.33-1.8a3.2 3.2 0 0 0-.8-1.2 3.2 3.2 0 0 0-1.2-.8c-.4-.13-.9-.29-1.8-.33-1-.05-1.3-.06-3.9-.06Zm0 3.4a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm5.9-4.4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"
      />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.6 7.4a5.4 5.4 0 0 1-3.3-1.1v7.5a6.2 6.2 0 1 1-5.5-6.2v2a4.2 4.2 0 1 0 3 4v-9.2h2.2a3.3 3.3 0 0 0 3.3 3.3V7.4Z"
      />
    </svg>
  );
}

const iconMap = {
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
} as const;

export function PlatformIcon({
  platform,
  className = "h-5 w-5",
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const Icon = iconMap[platform];
  return <Icon className={className} />;
}

type SocialIconLinksProps = {
  variant?: "header" | "inline" | "card";
  className?: string;
  /** Subset of platforms; defaults to YouTube, Instagram, TikTok */
  include?: SocialPlatform[];
};

export function SocialIconLinks({
  variant = "inline",
  className = "",
  include = ["youtube", "instagram", "tiktok"],
}: SocialIconLinksProps) {
  const items = platforms.filter((p) => include.includes(p.id));

  const linkClass =
    variant === "header"
      ? "flex h-9 w-9 items-center justify-center rounded-lg text-nav transition hover:bg-brand-wash hover:text-brand-bright"
      : variant === "card"
        ? "flex h-11 w-11 items-center justify-center rounded-lg bg-brand-bright text-white transition hover:bg-brand-mid"
        : "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-wash text-brand-primary transition hover:border-brand-bright hover:text-brand-bright";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {items.map((p) => {
        const Icon = iconMap[p.id];
        return (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.label}
            className={linkClass}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}

/** Icon + short handle for inline prose (e.g. “also on” lines). */
export function SocialInlineLink({
  platform,
  href,
  children,
  className = "",
}: {
  platform: SocialPlatform;
  /** Override default channel URL (e.g. /shorts playlist). */
  href?: string;
  children?: ReactNode;
  className?: string;
}) {
  const p = platforms.find((x) => x.id === platform)!;
  const Icon = iconMap[platform];
  return (
    <a
      href={href ?? p.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={p.label}
      className={`inline-flex items-center gap-1.5 font-semibold text-brand-mid underline decoration-brand-mid/40 underline-offset-2 hover:text-brand-bright ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </a>
  );
}

/** Subscribe CTA with YouTube icon (not the word “Subscribe” in nav). */
export function YouTubeSubscribeLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={siteConfig.social.youtubeSubscribeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Subscribe to SeeStew on YouTube"
      className={className}
    >
      <YouTubeIcon className="h-5 w-5" />
    </a>
  );
}
