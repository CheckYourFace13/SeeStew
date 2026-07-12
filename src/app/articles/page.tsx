import type { Metadata } from "next";
import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import { getArticlesForStoriesPage } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { getYouTubeVideos } from "@/lib/youtube";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Unbelievable American History Stories",
  description:
    "True stories from American history — strange disasters, forgotten scandals, shocking politics, and hidden moments from the past. Read the wildest verified tales on SeeStew.",
  alternates: { canonical: `${siteConfig.url}/articles` },
};

export default async function ArticlesPage() {
  const articles = getArticlesForStoriesPage();
  const videos = await getYouTubeVideos();
  const thumbByVideoId = new Map(videos.map((v) => [v.id, v.thumbnail]));

  return (
    <div className="page-shell">
      <header className="mb-10 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
          Unbelievable True Stories from American History
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Hard-to-believe, fully documented moments from America&apos;s past — forgotten disasters,
          political twists, presidential oddities, and hidden history that sounds made up (but
          isn&apos;t). Every story lists named sources. New articles publish regularly.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          New stories land here regularly. Explore{" "}
          <Link href="/topics" className="underline">
            topics
          </Link>{" "}
          or{" "}
          <Link href="/videos" className="underline">
            watch history videos
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article, i) => (
            <StoryCard
              key={article.slug}
              article={article}
              youtubeThumbnail={
                article.relatedVideoId
                  ? thumbByVideoId.get(article.relatedVideoId)
                  : undefined
              }
              priority={i < 4}
            />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-ink-muted">
        Browse by subject on{" "}
        <Link href="/topics" className="font-semibold text-brand-mid underline">
          Topics
        </Link>
        .
      </p>
    </div>
  );
}
