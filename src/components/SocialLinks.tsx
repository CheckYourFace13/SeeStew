import { PlatformIcon, SocialIconLinks } from "@/components/SocialIcons";
import { siteConfig } from "@/lib/config";

type PlatformCard = {
  id: "youtube" | "instagram" | "tiktok" | "facebook";
  href: string;
  name: string;
  description: string;
};

const cards: PlatformCard[] = [
  {
    id: "youtube",
    href: siteConfig.social.youtubeUrl,
    name: "YouTube",
    description: "Full documentaries and weekly uploads",
  },
  {
    id: "instagram",
    href: siteConfig.social.instagramUrl,
    name: "Instagram",
    description: "Daily reels on American history",
  },
  {
    id: "tiktok",
    href: siteConfig.social.tiktokUrl,
    name: "TikTok",
    description: "Quick history clips",
  },
  {
    id: "facebook",
    href: siteConfig.social.facebookUrl,
    name: "Facebook",
    description: "Updates and community",
  },
];

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <SocialIconLinks variant="card" />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((p) => (
        <a
          key={p.id}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`SeeStew on ${p.name}`}
          className="flex flex-col items-center rounded-xl border border-surface-muted bg-surface p-6 text-center shadow-sm transition hover:border-brand-bright hover:shadow-md"
        >
          <span className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-lg bg-brand-bright text-white">
            <PlatformIcon platform={p.id} className="h-5 w-5" />
          </span>
          <p className="mt-3 font-heading text-lg font-semibold text-brand-primary">{p.name}</p>
          <p className="mt-2 text-sm text-ink-muted">{p.description}</p>
        </a>
      ))}
    </div>
  );
}
