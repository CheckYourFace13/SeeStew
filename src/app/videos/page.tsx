import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SocialInlineLink } from "@/components/SocialIcons";
import { VideoIndexCard } from "@/components/VideoIndexCard";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { relatedArticlesForVideo } from "@/lib/related";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getLongFormVideos } from "@/lib/youtube";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "American History Documentaries",
  description:
    "Companion long-form SeeStew episodes — full-length YouTube videos that expand the researched stories. Prefer a clip? Use Shorts. Prefer to read? Start with Stories.",
  alternates: { canonical: `${siteConfig.url}/videos` },
};

export default async function VideosPage() {
  const videos = await getLongFormVideos();
  const articles = getAllArticles();

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
          Companion long-form episodes
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          These are full-length SeeStew documentaries, not shorts. Each episode sits next to the
          written archive: play one here, then read the sourced story when a match exists. Also on{" "}
          <SocialInlineLink platform="youtube">@SeeStew</SocialInlineLink>.
        </p>
        <p className="mt-3 text-ink-muted">
          <Link href="/shorts" className="font-semibold text-brand-mid underline">
            Prefer quick clips?
          </Link>{" "}
          Go to Shorts.{" "}
          <Link href="/articles" className="font-semibold text-brand-mid underline">
            Prefer to read?
          </Link>{" "}
          Open Stories.
        </p>
      </header>

      {videos.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Videos are loading — visit{" "}
          <SocialInlineLink platform="youtube">@SeeStew</SocialInlineLink> in the meantime, or{" "}
          <Link href="/articles" className="text-brand-mid underline">
            read the stories
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoIndexCard
              key={video.id}
              video={video}
              relatedArticle={relatedArticlesForVideo(video, articles)[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
