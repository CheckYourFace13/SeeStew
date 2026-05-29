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
  getShortFormVideos,
  getVideoBySlug,
  isShortFormVideo,
  youtubeWatchUrl,
} from "@/lib/youtube";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const videos = await getShortFormVideos();
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || !isShortFormVideo(video)) return { title: "Short not found" };

  return {
    title: video.title,
    description:
      video.description?.slice(0, 155) ||
      `Watch ${video.title} — a SeeStew history short.`,
    alternates: { canonical: `${siteConfig.url}/shorts/${slug}` },
    openGraph: {
      type: "video.other",
      title: video.title,
      images: [video.thumbnail],
    },
  };
}

export default async function ShortWatchPage({ params }: Props) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || !isShortFormVideo(video)) notFound();

  const editorial = getVideoEditorial(video);
  const related = (await getShortFormVideos())
    .filter((v) => v.id !== video.id)
    .slice(0, 4);

  return (
    <article className="page-shell max-w-4xl">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Shorts", url: `${siteConfig.url}/shorts` },
            { name: video.title, url: `${siteConfig.url}/shorts/${slug}` },
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
        <Link href="/shorts" className="hover:text-brand-mid">
          Shorts
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{video.title}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-ink md:text-4xl">
        {video.title}
      </h1>

      <div className="mt-8">
        <VideoPlayer videoId={video.id} title={video.title} />
      </div>

      <AdSlot className="mt-8" format="rectangle" />

      <div className="prose-history mt-10">
        <MarkdownContent content={editorial} />
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-heading text-xl font-bold text-ink">More shorts</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <SocialLinks compact />
      </div>
    </article>
  );
}
