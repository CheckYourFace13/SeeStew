import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ReferencesList } from "@/components/ReferencesList";
import { RelatedContent } from "@/components/RelatedContent";
import { StoryHero } from "@/components/StoryHero";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getAllArticles, getArticle, getArticlesByCategory } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  referencesToCitationSchema,
} from "@/lib/seo";
import { getLongFormVideos, getVideoById } from "@/lib/youtube";

type Props = { params: Promise<{ slug: string }> };

/** New cron-published stories appear within ~10 min without a full rebuild. */
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Story not found" };
  const url = `${siteConfig.url}/articles/${slug}`;
  return {
    title: article.title,
    description: `${article.excerpt} — unbelievable true stories from American history on SeeStew.`,
    keywords: [
      article.category,
      "American history facts",
      "American history stories",
      article.title,
      "SeeStew",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${siteConfig.url}/articles/${slug}`;
  const relatedVideo = article.relatedVideoId
    ? await getVideoById(article.relatedVideoId)
    : undefined;
  const topicSlug = article.category.toLowerCase().replace(/\s+/g, "-");
  const relatedStories = getArticlesByCategory(article.category);
  const relatedVideos = (await getLongFormVideos()).slice(0, 4);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6" itemScope itemType="https://schema.org/Article">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Stories", url: `${siteConfig.url}/articles` },
            { name: article.title, url },
          ]),
          buildArticleJsonLd(article, url),
          ...(article.references?.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: "Sources",
                  itemListElement: referencesToCitationSchema(article.references),
                },
              ]
            : []),
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Stories", href: "/articles" },
          { label: article.category, href: `/topics/${topicSlug}` },
          { label: article.title },
        ]}
      />

      <header>
        <Link
          href={`/topics/${topicSlug}`}
          className="text-xs font-medium uppercase text-brand-mid hover:underline"
        >
          {article.category}
        </Link>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ink" itemProp="headline">
          {article.title}
        </h1>
        <p className="mt-3 text-ink-muted" itemProp="description">
          {article.excerpt}
        </p>
      </header>

      <StoryHero
        article={article}
        youtubeThumbnail={relatedVideo?.thumbnail}
      />

      <AdSlot className="mt-8" format="horizontal" label="Advertisement" />

      {relatedVideo && (
        <section className="my-10">
          <h2 className="mb-4 font-heading text-xl font-bold">Watch the full video</h2>
          <VideoPlayer videoId={relatedVideo.id} title={relatedVideo.title} />
          <p className="mt-3 text-sm text-ink-muted">
            <Link href={`/videos/${relatedVideo.slug}`} className="text-brand-mid underline">
              More notes on this episode →
            </Link>
          </p>
        </section>
      )}

      <div className="mt-10" itemProp="articleBody">
        <ArticleBody content={article.content} />
      </div>

      {article.references && article.references.length > 0 && (
        <ReferencesList references={article.references} />
      )}

      <AdSlot className="mt-10" format="rectangle" label="Advertisement" />

      <RelatedContent
        category={article.category}
        currentSlug={article.slug}
        relatedStories={relatedStories}
        relatedVideos={relatedVideos}
      />

      <nav className="mt-12 rounded-xl bg-brand-wash p-6 text-sm" aria-label="SeeStew channels">
        <p className="font-semibold text-ink">SeeStew elsewhere</p>
        <ul className="mt-3 space-y-2 text-ink-muted">
          <li>
            <a href={siteConfig.social.youtubeSubscribe} className="text-brand-mid underline" target="_blank" rel="noopener noreferrer">
              Subscribe on YouTube
            </a>
          </li>
          <li>
            <Link href="/shorts" className="text-brand-mid underline">
              History shorts
            </Link>
          </li>
          <li>
            <Link href="/videos" className="text-brand-mid underline">
              History videos
            </Link>
          </li>
        </ul>
      </nav>
    </article>
  );
}
