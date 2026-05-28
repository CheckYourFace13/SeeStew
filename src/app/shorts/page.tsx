import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { VideoCard } from "@/components/VideoCard";
import { siteConfig } from "@/lib/config";
import { getShortFormVideos } from "@/lib/youtube";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "American History Shorts — SeeStew",
  description:
    "Quick American history clips and facts from SeeStew — YouTube Shorts synced here, plus @see.stew on Instagram and TikTok.",
  alternates: { canonical: `${siteConfig.url}/shorts` },
};

export default async function ShortsPage() {
  const shorts = await getShortFormVideos();

  return (
    <div className="page-shell">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-ink">Shorts</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Quick clips pulled from{" "}
          <a
            href={siteConfig.social.youtubeShorts}
            className="text-brand-mid underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @SeeStew Shorts
          </a>
          . Same stories also post on{" "}
          <a
            href={siteConfig.social.instagram}
            className="text-brand-mid underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>{" "}
          and{" "}
          <a
            href={siteConfig.social.tiktok}
            className="text-brand-mid underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok
          </a>
          .
        </p>
      </header>

      <AdSlot format="horizontal" />

      {shorts.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          No shorts in the feed yet. Add <code className="text-brand-mid">YOUTUBE_CHANNEL_ID</code> and{" "}
          <code className="text-brand-mid">YOUTUBE_API_KEY</code> to pull them automatically, or check{" "}
          <a
            href={siteConfig.social.youtubeShorts}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
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
