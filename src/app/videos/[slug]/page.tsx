import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";
import { SocialLinks } from "@/components/SocialLinks";
import { VideoCard } from "@/components/VideoCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { siteConfig } from "@/lib/config";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getVideoEditorial } from "@/lib/video-editorial";
import {
  getLongFormVideos,
  getVideoBySlug,
  youtubeWatchUrl,
} from "@/lib/youtube";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const videos = await getLongFormVideos();
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || video.format !== "long") return { title: "Video not found" };

  return {
    title: video.title,
    description:
      video.description?.slice(0, 155) ||
      `Watch ${video.title} — a SeeStew documentary on American history.`,
    alternates: { canonical: `${siteConfig.url}/videos/${slug}` },
    openGraph: {
      type: "video.other",
      title: video.title,
      images: [video.thumbnail],
    },
  };
}

export default async function VideoWatchPage({ params }: Props) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || video.format !== "long") notFound();

  const editorial = getVideoEditorial(video);
  const related = (await getLongFormVideos())
    .filter((v) => v.id !== video.id)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Documentaries", url: `${siteConfig.url}/videos` },
            { name: video.title, url: `${siteConfig.url}/videos/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnail,
            embedUrl: `https://www.youtube.com/embed/${video.id}`,
            contentUrl: youtubeWatchUrl(video.id),
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              logo: `${siteConfig.url}${siteConfig.logo}`,
            },
          },
        ]}
      />

      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/videos" className="hover:text-brand-mid">
          Documentaries
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{video.title}</span>
      </nav>

      <h1 className="max-w-3xl font-heading text-3xl font-bold text-ink md:text-4xl">
        {video.title}
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          <VideoPlayer videoId={video.id} title={video.title} />
          <AdSlot className="mt-8" format="rectangle" />
          <div className="prose-history mt-10">
            <h2 className="!mt-0 font-heading text-2xl font-bold">Notes</h2>
            <MarkdownContent content={editorial} />
          </div>
        </div>

        <aside className="space-y-8">
          <AdSlot format="vertical" label="Sponsored" />
          {related.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">More episodes</h2>
              <div className="mt-4 space-y-4">
                {related.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </div>
          )}
          <SocialLinks compact />
        </aside>
      </div>
    </article>
  );
}
