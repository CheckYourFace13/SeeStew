import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SocialInlineLink } from "@/components/SocialIcons";
import { VideoCard } from "@/components/VideoCard";
import { siteConfig } from "@/lib/config";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getLongFormVideos } from "@/lib/youtube";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Interesting Stories from American History — SeeStew Videos",
  description:
    "Watch unbelievable true stories from American history on SeeStew. Long-form episodes on scandals, presidents, wars, and forgotten moments — free on seestew.com and YouTube.",
  alternates: { canonical: `${siteConfig.url}/videos` },
};

export default async function VideosPage() {
  const videos = await getLongFormVideos();

  return (
    <div className="page-shell">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Videos", url: `${siteConfig.url}/videos` },
        ])}
      />
      <header className="mb-10 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
          Interesting Stories from American History
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Companion documentaries for the same hard-to-believe true stories we publish in writing.
          Prefer the researched article? Start with{" "}
          <Link href="/articles" className="text-brand-mid underline">
            Stories
          </Link>
          . Also on{" "}
          <SocialInlineLink platform="youtube">@SeeStew</SocialInlineLink>.
        </p>
      </header>

      {videos.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Videos are loading — visit{" "}
          <SocialInlineLink platform="youtube">@SeeStew on YouTube</SocialInlineLink> in the
          meantime.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-ink-muted">
        Want the fast version?{" "}
        <Link href="/shorts" className="font-semibold text-brand-mid underline">
          Shorts
        </Link>
        . Prefer to read?{" "}
        <Link href="/articles" className="font-semibold text-brand-mid underline">
          History stories
        </Link>
        .
      </p>
    </div>
  );
}
