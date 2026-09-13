import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { VideoCard } from "@/components/VideoCard";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { videosRelatedToArticles } from "@/lib/related";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  categoryToSlug,
  getPopulatedTopics,
  getTopicHub,
  getTopicHubForCategory,
} from "@/lib/topic-seo";
import { getYouTubeVideos } from "@/lib/youtube";

type Props = { params: Promise<{ category: string }> };

function slugToCategory(slug: string): string | undefined {
  const articles = getAllArticles();
  return articles.find((a) => categoryToSlug(a.category) === slug)?.category;
}

export async function generateStaticParams() {
  return getPopulatedTopics(getAllArticles()).map((topic) => ({
    category: topic.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const hub = getTopicHub(slug);
  const name = slugToCategory(slug) ?? hub?.title;
  const articles = name ? getArticlesByCategory(name) : [];
  if (!name || articles.length === 0) return { title: "Topic not found" };
  const titles = articles
    .slice(0, 3)
    .map((a) => a.title)
    .join(", ");
  return {
    title: hub?.title ?? `${name} — American History Stories`,
    description:
      hub?.description ??
      `${articles.length} documented ${name} stories on SeeStew, including ${titles}.`,
    alternates: { canonical: `${siteConfig.url}/topics/${slug}` },
  };
}

export default async function TopicCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const categoryName = slugToCategory(slug);
  const hub = getTopicHub(slug) ?? (categoryName ? getTopicHubForCategory(categoryName) : undefined);

  if (!categoryName && !hub) notFound();

  const displayName = categoryName ?? hub!.title;
  const articles = categoryName ? getArticlesByCategory(categoryName) : [];
  if (articles.length === 0) notFound();

  const videos = videosRelatedToArticles(articles, await getYouTubeVideos());
  const url = `${siteConfig.url}/topics/${slug}`;
  const featuredTitles = articles.slice(0, 3).map((a) => a.title);

  return (
    <div className="page-shell">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Topics", url: `${siteConfig.url}/topics` },
          { name: displayName, url },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Topics", href: "/topics" },
          { label: displayName },
        ]}
      />
      <h1 className="font-heading text-4xl font-bold text-ink">
        {hub?.title ?? displayName}
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        {hub?.intro ?? `Shocking and forgotten ${displayName} stories from American history.`}{" "}
        This hub currently includes {articles.length} documented{" "}
        {articles.length === 1 ? "story" : "stories"}
        {featuredTitles.length > 0 ? `, including ${featuredTitles.join("; ")}` : ""}.
      </p>

      {hub?.searchAngles && hub.searchAngles.length > 0 && (
        <p className="mt-4 text-sm text-ink-muted">
          Readers search for: {hub.searchAngles.join(" · ")}.
        </p>
      )}

      <p className="mt-6 text-ink-muted">
        {articles.length} stor{articles.length === 1 ? "y" : "ies"} with citations.{" "}
        <Link href="/articles" className="text-brand-mid underline">
          All stories
        </Link>{" "}
        ·{" "}
        <Link href="/videos" className="text-brand-mid underline">
          Watch videos
        </Link>{" "}
        ·{" "}
        <Link href="/shorts" className="text-brand-mid underline">
          Shorts
        </Link>
      </p>

      <ul className="mt-10 space-y-4">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="block rounded-xl border border-brand-wash bg-white p-6 hover:shadow-md"
            >
              <h2 className="font-heading text-xl font-bold text-ink">{a.title}</h2>
              <p className="mt-2 text-ink-muted">{a.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>

      {videos.length > 0 && (
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-bold text-ink">Watch next</h2>
          <p className="mt-2 text-ink-muted">
            Matching SeeStew videos and shorts for these {displayName} stories.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.slice(0, 6).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
