import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { VideoCard } from "@/components/VideoCard";
import { siteConfig, youtubeConfig } from "@/lib/config";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getLongFormVideos } from "@/lib/youtube";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "American History Documentaries on SeeStew",
  description:
    "Watch SeeStew long-form documentaries on American history and politics. Free episodes with facts, context, and links to read more — synced from YouTube @SeeStew.",
  alternates: { canonical: `${siteConfig.url}/videos` },
};

export default async function VideosPage() {
  const videos = await getLongFormVideos();
  const usingFallback = !youtubeConfig.channelId || !youtubeConfig.apiKey;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Documentaries", url: `${siteConfig.url}/videos` },
        ])}
      />
      <header className="mb-10 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-ink">American History Documentaries</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Long-form SeeStew episodes on U.S. history and politics — watch here with notes, or on{" "}
          <a
            href={siteConfig.social.youtubeVideos}
            className="text-brand-mid underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @SeeStew on YouTube
          </a>
          . Each card links to a page with the embedded video and background facts.
        </p>
        {usingFallback && (
          <p className="mt-3 rounded-lg bg-brand-wash px-4 py-3 text-sm text-ink-muted">
            Showing featured SeeStew episodes. Add{" "}
            <code className="text-brand-mid">YOUTUBE_CHANNEL_ID</code> and{" "}
            <code className="text-brand-mid">YOUTUBE_API_KEY</code> in Hostinger env to sync your full
            channel automatically.
          </p>
        )}
      </header>

      <AdSlot format="horizontal" label="Advertisement" />

      {videos.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Videos could not be loaded. Visit{" "}
          <a
            href={siteConfig.social.youtubeVideos}
            className="font-semibold text-brand-mid underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube @SeeStew
          </a>{" "}
          to watch documentaries.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-ink-muted">
        Quick clips? Browse{" "}
        <Link href="/shorts" className="font-semibold text-brand-mid underline">
          Shorts
        </Link>
        . Read sourced{" "}
        <Link href="/articles" className="font-semibold text-brand-mid underline">
          history stories
        </Link>
        .
      </p>
    </div>
  );
}

