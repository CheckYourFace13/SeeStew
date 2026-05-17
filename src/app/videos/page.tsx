import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { VideoCard } from "@/components/VideoCard";
import { siteConfig } from "@/lib/config";
import { getLongFormVideos } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "American History Documentaries",
  description:
    "Watch SeeStew long-form documentaries on American history and politics. Stream here or on YouTube @SeeStew.",
  alternates: { canonical: `${siteConfig.url}/videos` },
};

export default async function VideosPage() {
  const videos = await getLongFormVideos();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-ink">Documentaries</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Long-form episodes synced from{" "}
          <a
            href={siteConfig.social.youtubeVideos}
            className="text-brand-mid underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @SeeStew on YouTube
          </a>
          . Each page includes notes you can read with the video.
        </p>
      </header>

      <AdSlot format="horizontal" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-ink-muted">
        Looking for quick clips? See{" "}
        <Link href="/shorts" className="font-semibold text-brand-mid underline">
          Shorts
        </Link>
        .
      </p>
    </div>
  );
}
