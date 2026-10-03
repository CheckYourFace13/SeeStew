import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateBlock } from "@/components/AffiliateBlock";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { VideoCard } from "@/components/VideoCard";
import { getRecommendedReadingForTopic } from "@/data/recommended-reading";
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

  const allArticles = getAllArticles();
  const populated = getPopulatedTopics(allArticles);
  const populatedSlugs = new Set(populated.map((t) => t.slug));
  const relatedTopics = (hub?.relatedSlugs ?? [])
    .filter((s) => s !== slug && populatedSlugs.has(s))
    .slice(0, 4)
    .map((s) => populated.find((t) => t.slug === s)!)
    .filter(Boolean);

  const videos = videosRelatedToArticles(articles, await getYouTubeVideos());
  const url = `${siteConfig.url}/topics/${slug}`;
  const startHere = hub?.startHereSlug
    ? articles.find((a) => a.slug === hub.startHereSlug)
    : undefined;
  const listArticles = startHere
    ? [startHere, ...articles.filter((a) => a.slug !== startHere.slug)]
    : articles;
  const recommended = getRecommendedReadingForTopic(slug);

  // Keep intro + overview in the 150–250 word band for unique hub copy.
  const introBlock = [hub?.intro, hub?.overview].filter(Boolean).join(" ");

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Topics", url: `${siteConfig.url}/topics` },
            { name: displayName, url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${hub?.title ?? displayName} stories on SeeStew`,
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.title,
              url: `${siteConfig.url}/articles/${a.slug}`,
            })),
          },
        ]}
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
        {introBlock ||
          `Shocking and forgotten ${displayName} stories from American history.`}
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        {articles.length} documented {articles.length === 1 ? "story" : "stories"} with named
        sources.{" "}
        <Link href="/articles" className="text-brand-mid underline">
          All stories
        </Link>
        {" · "}
        <Link href="/videos" className="text-brand-mid underline">
          Videos
        </Link>
        {" · "}
        <Link href="/shorts" className="text-brand-mid underline">
          Shorts
        </Link>
      </p>

      {startHere && (
        <section
          className="mt-8 max-w-3xl rounded-xl border border-brand-wash bg-brand-wash/40 p-6"
          aria-label="Start here"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-mid">
            Start here
          </p>
          <Link
            href={`/articles/${startHere.slug}`}
            className="mt-1 block font-heading text-xl font-bold text-ink hover:underline"
          >
            {startHere.title}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">{startHere.excerpt}</p>
          <p className="mt-2 text-xs text-ink-muted">
            {startHere.readMinutes} min read
            {startHere.references && startHere.references.length > 0
              ? ` · ${startHere.references.length} sources`
              : ""}
          </p>
        </section>
      )}

      {relatedTopics.length > 0 && (
        <nav className="mt-8 max-w-3xl" aria-label="Related topics">
          <h2 className="font-heading text-lg font-bold text-ink">Related topics</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {relatedTopics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/topics/${t.slug}`}
                  className="rounded-md border border-brand-wash bg-white px-3 py-1.5 text-brand-mid hover:border-brand-mid"
                >
                  {t.title} ({t.count})
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/topics"
                className="rounded-md border border-brand-wash bg-white px-3 py-1.5 text-brand-mid hover:border-brand-mid"
              >
                All topics
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <h2 className="mt-10 font-heading text-2xl font-bold text-ink">
        {hub?.moreLabel ?? `${displayName} stories`}
      </h2>
      <ul className="mt-6 space-y-4">
        {listArticles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="block rounded-xl border border-brand-wash bg-white p-6 hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-brand-mid">
                {a.category}
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold text-ink">{a.title}</h3>
              <p className="mt-2 text-ink-muted">{a.excerpt}</p>
              <p className="mt-3 text-xs text-ink-muted">
                {a.readMinutes} min read
                {a.references && a.references.length > 0
                  ? ` · ${a.references.length} sources`
                  : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <AffiliateBlock heading="Recommended reading" items={recommended} className="max-w-3xl" />

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
