import { SocialIconLinks } from "@/components/SocialIcons";
import { siteConfig } from "@/lib/config";

type PlatformCard = {
  id: "youtube" | "instagram" | "tiktok";
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
];

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <SocialIconLinks variant="card" />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {cards.map((p) => (
        <a
          key={p.id}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`SeeStew on ${p.name}`}
          className="flex flex-col items-center rounded-xl border border-surface-muted bg-surface p-6 text-center shadow-sm transition hover:border-brand-bright hover:shadow-md"
        >
          <SocialIconLinks variant="card" include={[p.id]} className="pointer-events-none" />
          <p className="mt-3 font-heading text-lg font-semibold text-brand-primary">{p.name}</p>
          <p className="mt-2 text-sm text-ink-muted">{p.description}</p>
        </a>
      ))}
      <a
        href={siteConfig.social.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="SeeStew on Facebook"
        className="flex flex-col items-center rounded-xl border border-surface-muted bg-surface p-6 text-center shadow-sm transition hover:border-brand-bright hover:shadow-md"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-bright text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07C2 17.1 5.66 21.24 10.44 22v-7.03H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22C18.34 21.24 22 17.1 22 12.07Z"
            />
          </svg>
        </span>
        <p className="mt-3 font-heading text-lg font-semibold text-brand-primary">Facebook</p>
        <p className="mt-2 text-sm text-ink-muted">Updates and community</p>
      </a>
    </div>
  );
}
