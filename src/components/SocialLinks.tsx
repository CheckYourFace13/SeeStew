import { siteConfig } from "@/lib/config";

const platforms = [
  {
    name: "YouTube",
    href: siteConfig.social.youtubeSubscribe,
    description: "Full documentaries and weekly uploads",
    cta: "Subscribe on YouTube",
  },
  {
    name: "Instagram",
    href: siteConfig.social.instagram,
    description: "Daily reels on American history",
    cta: "Follow @see.stew",
  },
  {
    name: "TikTok",
    href: siteConfig.social.tiktok,
    description: "Quick history clips",
    cta: "Follow @see.stew",
  },
  {
    name: "Facebook",
    href: siteConfig.social.facebook,
    description: "Updates and community",
    cta: "Follow on Facebook",
  },
];

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-bright px-4 py-2 text-sm font-medium text-white hover:bg-brand-mid"
          >
            {p.name}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {platforms.map((p) => (
        <a
          key={p.name}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col rounded-xl border border-surface-muted bg-surface p-6 text-center shadow-sm transition hover:border-brand-bright hover:shadow-md"
        >
          <p className="font-heading text-lg font-semibold text-brand-primary">{p.name}</p>
          <p className="mt-2 flex-1 text-sm text-ink-muted">{p.description}</p>
          <span className="mt-4 text-sm font-medium text-brand-bright">{p.cta} →</span>
        </a>
      ))}
    </div>
  );
}
