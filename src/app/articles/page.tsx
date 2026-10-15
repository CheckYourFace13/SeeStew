import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { StoryCard } from "@/components/StoryCard";
import {
  getAllArticles,
  getArticlesByEra,
  getFullArticles,
  getQuickReads,
  isQuickRead,
  STORIES_PAGE_SIZE,
} from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { HISTORICAL_ERAS, getHistoricalEra } from "@/lib/historical-eras";
import { getPopulatedHistoryHubs } from "@/lib/history-hubs";
import { getPopulatedTopics } from "@/lib/topic-seo";
import { getYouTubeVideos } from "@/lib/youtube";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Unbelievable American History Stories",
  description:
    "True stories from American history — strange disasters, forgotten scandals, shocking politics, and Quick Reads. Every piece lists named sources.",
  alternates: { canonical: `${siteConfig.url}/articles` },
};

type Props = {
  searchParams: Promise<{ format?: string; era?: string }>;
};

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const format = params.format === "quick-read" ? "quick-read" : params.format === "full" ? "full" : "all";
  const eraSlug = params.era && getHistoricalEra(params.era) ? params.era : undefined;

  let articles = getAllArticles();
  if (eraSlug) articles = getArticlesByEra(eraSlug);
  if (format === "quick-read") articles = articles.filter(isQuickRead);
  if (format === "full") articles = articles.filter((a) => !isQuickRead(a));

  const shown = articles.slice(0, STORIES_PAGE_SIZE);
  const topics = getPopulatedTopics(getAllArticles());
  const eraHubs = getPopulatedHistoryHubs(getAllArticles()).filter((h) =>
    HISTORICAL_ERAS.some((e) => e.slug === h.slug)
  );
  const quickCount = getQuickReads().length;
  const videos = await getYouTubeVideos();
  const thumbByVideoId = new Map(videos.map((v) => [v.id, v.thumbnail]));

  const filterBase = "/articles";
  const eraParam = eraSlug ? `&era=${eraSlug}` : "";
  const activeEra = eraSlug ? getHistoricalEra(eraSlug) : undefined;

  return (
    <div className="page-shell">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: activeEra
            ? `${activeEra.title} stories`
            : format === "quick-read"
              ? "SeeStew Quick Reads"
              : "Latest SeeStew history stories",
          itemListElement: shown.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: a.title,
            url: `${siteConfig.url}/articles/${a.slug}`,
          })),
        }}
      />
      <header className="mb-10 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
          {activeEra
            ? activeEra.title
            : format === "quick-read"
              ? "Quick Reads"
              : "Unbelievable True Stories from American History"}
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          {activeEra
            ? activeEra.intro
            : format === "quick-read"
              ? "Short, sourced American history — about 1–3 minutes each. Not teasers: complete Quick Reads with named sources."
              : "Hard-to-believe, fully documented moments from America's past. Every story lists named sources. New full articles publish daily; Quick Reads land a few times a week when they meet quality checks."}
        </p>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Reading format">
          <Link
            href={eraSlug ? `${filterBase}?era=${eraSlug}` : filterBase}
            className={`rounded-full border px-3 py-1 text-sm ${
              format === "all"
                ? "border-brand-bright bg-brand-wash text-brand-mid"
                : "border-brand-wash bg-white text-brand-mid hover:border-brand-bright"
            }`}
          >
            All stories
          </Link>
          <Link
            href={`${filterBase}?format=full${eraParam}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              format === "full"
                ? "border-brand-bright bg-brand-wash text-brand-mid"
                : "border-brand-wash bg-white text-brand-mid hover:border-brand-bright"
            }`}
          >
            Full articles
          </Link>
          <Link
            href={`${filterBase}?format=quick-read${eraParam}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              format === "quick-read"
                ? "border-brand-bright bg-brand-wash text-brand-mid"
                : "border-brand-wash bg-white text-brand-mid hover:border-brand-bright"
            }`}
          >
            Quick Reads{quickCount > 0 ? ` (${quickCount})` : ""}
          </Link>
        </nav>

        {topics.length > 0 && (
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Story topics">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="rounded-full border border-brand-wash bg-white px-3 py-1 text-sm text-brand-mid hover:border-brand-bright"
              >
                {topic.title}
              </Link>
            ))}
          </nav>
        )}

        {eraHubs.length > 0 && (
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Historical eras">
            <span className="w-full text-xs font-medium uppercase tracking-wide text-ink-muted">
              Historical era
            </span>
            <Link
              href={format === "all" ? filterBase : `${filterBase}?format=${format}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                !eraSlug
                  ? "border-brand-bright bg-brand-wash text-brand-mid"
                  : "border-brand-wash bg-white text-brand-mid hover:border-brand-bright"
              }`}
            >
              All eras
            </Link>
            {eraHubs.map((hub) => (
              <Link
                key={hub.slug}
                href={`/hubs/${hub.slug}`}
                className={`rounded-full border px-3 py-1 text-sm ${
                  eraSlug === hub.slug
                    ? "border-brand-bright bg-brand-wash text-brand-mid"
                    : "border-brand-wash bg-white text-brand-mid hover:border-brand-bright"
                }`}
              >
                {hub.title}
                <span className="ml-1 text-ink-muted">({hub.count})</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          {format === "quick-read"
            ? "Quick Reads publish when they clear research and quality checks — not on a forced quota. Meanwhile explore "
            : "No stories match this filter. Explore "}
          <Link href="/topics" className="underline">
            topics
          </Link>{" "}
          or{" "}
          <Link href="/archive" className="underline">
            the archive
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((article, i) => (
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
        {" · "}
        by era in the{" "}
        <Link href="/archive" className="font-semibold text-brand-mid underline">
          Archive
        </Link>
        . Full library has {getFullArticles().length} long-form stories
        {quickCount > 0 ? ` and ${quickCount} Quick Reads` : ""}.
      </p>
    </div>
  );
}
