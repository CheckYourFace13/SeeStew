import type { Metadata } from "next";
import Link from "next/link";
import { SocialInlineLink } from "@/components/SocialIcons";
import { VideoCard } from "@/components/VideoCard";
import { siteConfig } from "@/lib/config";
import { getShortFormVideos } from "@/lib/youtube";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "American History Shorts — SeeStew",
  description:
    "Quick American history clips from SeeStew — companion shorts for our researched hard-to-believe true stories.",
  alternates: { canonical: `${siteConfig.url}/shorts` },
};

export default async function ShortsPage() {
  const shorts = await getShortFormVideos();

  return (
    <div className="page-shell">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-ink">Shorts</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Quick clips from{" "}
          <SocialInlineLink platform="youtube" href={siteConfig.social.youtubeShortsUrl}>
            @SeeStew Shorts
          </SocialInlineLink>
          . For the full researched write-up, read our{" "}
          <Link href="/articles" className="text-brand-mid underline">
            Stories
          </Link>
          .
        </p>
      </header>

      {shorts.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          No shorts in the feed yet. Add <code className="text-brand-mid">YOUTUBE_CHANNEL_ID</code>{" "}
          and <code className="text-brand-mid">YOUTUBE_API_KEY</code> to pull them automatically, or
          check{" "}
          <SocialInlineLink platform="youtube" href={siteConfig.social.youtubeShortsUrl}>
            YouTube Shorts
          </SocialInlineLink>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shorts.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-ink-muted">
        Want the full story? Browse{" "}
        <Link href="/videos" className="font-semibold text-brand-mid underline">
          history videos
        </Link>
        .
      </p>
    </div>
  );
}
