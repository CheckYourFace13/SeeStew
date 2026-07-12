import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";
import { SocialLinks } from "@/components/SocialLinks";
import { VideoCard } from "@/components/VideoCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { siteConfig } from "@/lib/config";
import { buildBreadcrumbJsonLd, buildVideoObjectJsonLd } from "@/lib/seo";
import { getVideoEditorial } from "@/lib/video-editorial";
import { getLongFormVideos, getVideoBySlug, isLongFormVideo } from "@/lib/youtube";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const videos = await getLongFormVideos();
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || !isLongFormVideo(video)) return { title: "Video not found" };

  return {
    title: video.title,
    description:
      video.description?.slice(0, 155) ||
      `Watch ${video.title} — a SeeStew story from American history.`,
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
  if (!video || !isLongFormVideo(video)) notFound();

  const editorial = getVideoEditorial(video);
  const related = (await getLongFormVideos())
    .filter((v) => v.id !== video.id)
    .slice(0, 3);

  return (
    <article className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Videos", url: `${siteConfig.url}/videos` },
            { name: video.title, url: `${siteConfig.url}/videos/${slug}` },
          ]),
          buildVideoObjectJsonLd(video),
        ]}
      />

      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/videos" className="hover:text-brand-mid">
          Videos
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
          <div className="prose-history mt-10">
            <h2 className="!mt-0 font-heading text-2xl font-bold">Notes</h2>
            <MarkdownContent content={editorial} />
            <p className="mt-6">
              <Link href="/articles" className="text-brand-mid underline">
                Prefer the full researched article? Browse Stories →
              </Link>
            </p>
          </div>
        </div>

        <aside className="space-y-8">
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
