import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AffiliateBlock } from "@/components/AffiliateBlock";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ReferencesList } from "@/components/ReferencesList";
import { RelatedContent } from "@/components/RelatedContent";
import { SocialIconLinks } from "@/components/SocialIcons";
import { StoryHero } from "@/components/StoryHero";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getRecommendedReadingForArticle } from "@/data/recommended-reading";
import { getAllArticles, getArticle } from "@/lib/articles";
import { prepareArticleBodyForDisplay } from "@/lib/article-content";
import { siteConfig } from "@/lib/config";
import { getPopulatedHistoryHubs, getArticlesForHub } from "@/lib/history-hubs";
import { relatedArticlesForArticle, relatedVideosForArticle } from "@/lib/related";
import { editorProfile } from "@/lib/editor-profile";
import { linkedVideoForArticle } from "@/lib/video-article-links";
import {
  buildArticleJsonLd,
  buildArticleMetaDescription,
  buildArticleSerpTitle,
  buildArticleSocialTitle,
  buildBreadcrumbJsonLd,
  referencesToCitationSchema,
} from "@/lib/seo";
import { getTopicHub } from "@/lib/topic-seo";
import { getVideoById, getYouTubeVideos } from "@/lib/youtube";

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
  const title = buildArticleSerpTitle(article);
  const socialTitle = buildArticleSocialTitle(article);
  const description = buildArticleMetaDescription(article);
  return applyManagedMetadata(`/articles/${slug}`, {
    title: { absolute: title },
    description,
    authors: [{ name: editorProfile.name, url: `${siteConfig.url}${editorProfile.aboutHref}` }],
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
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${siteConfig.url}/articles/${slug}`;
  const allVideos = await getYouTubeVideos();
  const linked = linkedVideoForArticle(article, allVideos);
  const relatedVideo =
    linked?.video ??
    (article.relatedVideoId ? await getVideoById(article.relatedVideoId) : undefined);
  const topicSlug = article.category.toLowerCase().replace(/\s+/g, "-");
  const allArticles = getAllArticles();
  const relatedStories = relatedArticlesForArticle(article, allArticles);
  const moreLabel = getTopicHub(topicSlug)?.moreLabel;
  const recommendedReading = getRecommendedReadingForArticle(article.slug);
  const relatedVideos = relatedVideosForArticle(article, allVideos);
  const storyHubs = getPopulatedHistoryHubs(allArticles).filter((hub) =>
    getArticlesForHub(hub, allArticles).some((a) => a.slug === article.slug)
  );

  const bodyContent = prepareArticleBodyForDisplay(article.content, {
    stripSources: Boolean(article.references?.length),
  });
  const publishedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <article className="page-shell-narrow" itemScope itemType="https://schema.org/Article">
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
        <p className="mt-4 text-sm text-ink-muted">
          {publishedDate && (
            <>
              <time dateTime={article.createdAt} itemProp="datePublished">
                {publishedDate}
              </time>
              {" · "}
            </>
          )}
          By{" "}
          <Link href={editorProfile.aboutHref} className="text-brand-mid underline" itemProp="author">
            {editorProfile.byline}
          </Link>
          {" · "}
          <Link href={editorProfile.editorialHref} className="text-brand-mid underline">
            Editorial standards
          </Link>
          {article.references && article.references.length > 0 && (
            <>
              {" · "}
              <a href="#refs-heading" className="text-brand-mid underline">
                {article.references.length} sources
              </a>
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Corrections?{" "}
          <Link href={editorProfile.contactHref} className="text-brand-mid underline">
            Contact us
          </Link>
          .
        </p>
      </header>

      <aside
        className="mt-6 rounded-xl border border-brand-wash bg-brand-wash/40 px-5 py-4 text-sm text-ink-muted"
        aria-label="Story at a glance"
      >
        <p className="text-ink">
          <span className="font-semibold">What happened:</span>{" "}
          {(article.seoDescription || article.excerpt)
            .replace(/\s*\([^)]{0,60}\)\s*$/, "")
            .trim()}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <span>
            <span className="font-semibold text-ink">Topic:</span>{" "}
            <Link href={`/topics/${topicSlug}`} className="text-brand-mid underline">
              {article.category}
            </Link>
          </span>
          <span>
            <span className="font-semibold text-ink">Read:</span> {article.readMinutes} min
          </span>
          {article.references && article.references.length > 0 && (
            <span>
              <span className="font-semibold text-ink">Sources:</span>{" "}
              <a href="#refs-heading" className="text-brand-mid underline">
                {article.references.length} cited
              </a>
            </span>
          )}
          {relatedVideo && (
            <span>
              <span className="font-semibold text-ink">Video:</span>{" "}
              <a href="#watch-companion" className="text-brand-mid underline">
                {relatedVideo.format === "short" ? "short available" : "companion episode"}
              </a>
            </span>
          )}
        </div>
        {storyHubs.length > 0 && (
          <p className="mt-3 text-sm">
            <span className="font-semibold text-ink">Also in:</span>{" "}
            {storyHubs.slice(0, 4).map((hub, i) => (
              <span key={hub.slug}>
                {i > 0 && " · "}
                <Link href={`/hubs/${hub.slug}`} className="text-brand-mid underline">
                  {hub.title}
                </Link>
              </span>
            ))}
          </p>
        )}
      </aside>

      <StoryHero
        article={article}
        youtubeThumbnail={relatedVideo?.thumbnail}
      />

      {relatedVideo && (
        <section className="my-10" id="watch-companion">
          <h2 className="mb-4 font-heading text-xl font-bold">
            {relatedVideo.format === "short" ? "Watch the short" : "Watch next"}
          </h2>
          <VideoPlayer videoId={relatedVideo.id} title={relatedVideo.title} />
          <p className="mt-3 text-sm text-ink-muted">
            <Link
              href={
                relatedVideo.format === "short"
                  ? `/shorts/${relatedVideo.slug}`
                  : `/videos/${relatedVideo.slug}`
              }
              className="text-brand-mid underline"
            >
              More notes on this episode →
            </Link>
          </p>
        </section>
      )}

      <div className="mt-10" itemProp="articleBody">
        <ArticleBody content={bodyContent} />
      </div>

      {article.references && article.references.length > 0 && (
        <ReferencesList references={article.references} />
      )}

      <aside
        className="mt-10 flex gap-4 rounded-xl border border-brand-wash bg-white p-5"
        aria-label="About the editor"
      >
        {/* Temporary site avatar — not a personal photo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={editorProfile.imageSrc}
          alt={editorProfile.imageAlt}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full border border-brand-wash object-cover bg-brand-wash"
        />
        <div className="text-sm">
          <p className="font-semibold text-ink">{editorProfile.byline}</p>
          <p className="mt-1 text-ink-muted">{editorProfile.bio}</p>
          <p className="mt-2 text-ink-muted">
            <Link href={editorProfile.aboutHref} className="text-brand-mid underline">
              About
            </Link>
            {" · "}
            <Link href={editorProfile.editorialHref} className="text-brand-mid underline">
              Editorial standards
            </Link>
            {" · "}
            <Link href={editorProfile.contactHref} className="text-brand-mid underline">
              Corrections
            </Link>
          </p>
        </div>
      </aside>

      <AdSlot className="mt-10" format="rectangle" label="Advertisement" />

      <RelatedContent
        category={article.category}
        currentSlug={article.slug}
        relatedStories={relatedStories}
        relatedVideos={relatedVideos}
        moreLabel={moreLabel}
      />

      {/* After the article, sources, and related links — never above the body. */}
      <AffiliateBlock heading="Read more about this story" items={recommendedReading} />

      <nav className="mt-12 rounded-xl bg-brand-wash p-6 text-sm" aria-label="SeeStew channels">
        <p className="font-semibold text-ink">SeeStew elsewhere</p>
        <div className="mt-3">
          <SocialIconLinks variant="inline" />
        </div>
        <ul className="mt-4 space-y-2 text-ink-muted">
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
