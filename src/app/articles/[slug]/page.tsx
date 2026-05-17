import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ReferencesList } from "@/components/ReferencesList";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getAllArticles, getArticle } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  referencesToCitationSchema,
} from "@/lib/seo";
import { getVideoById } from "@/lib/youtube";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  const url = `${siteConfig.url}/articles/${slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    keywords: [
      article.category,
      "American history",
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6" itemScope itemType="https://schema.org/Article">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Articles", url: `${siteConfig.url}/articles` },
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
          { label: "Articles", href: "/articles" },
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

      <AdSlot className="mt-8" format="horizontal" />

      {relatedVideo && (
        <section className="my-10">
          <h2 className="mb-4 font-heading text-xl font-bold">Watch the video</h2>
          <VideoPlayer videoId={relatedVideo.id} title={relatedVideo.title} />
        </section>
      )}

      <div className="prose-history mt-10" itemProp="articleBody">
        <MarkdownContent content={article.content} />
      </div>

      {article.references && article.references.length > 0 && (
        <ReferencesList references={article.references} />
      )}

      <AdSlot className="mt-10" />

      <nav className="mt-12 rounded-xl bg-brand-wash p-6 text-sm" aria-label="Related SeeStew links">
        <p className="font-semibold text-ink">SeeStew elsewhere</p>
        <ul className="mt-3 space-y-2 text-ink-muted">
          <li>
            <a href={siteConfig.social.youtubeSubscribe} className="text-brand-mid underline" target="_blank" rel="noopener noreferrer">
              Subscribe on YouTube
            </a>
          </li>
          <li>
            <a href={siteConfig.social.instagram} className="text-brand-mid underline" target="_blank" rel="noopener noreferrer">
              Instagram @see.stew
            </a>
          </li>
          <li>
            <a href={siteConfig.social.tiktok} className="text-brand-mid underline" target="_blank" rel="noopener noreferrer">
              TikTok @see.stew
            </a>
          </li>
          <li>
            <Link href="/videos" className="text-brand-mid underline">
              Documentaries on seestew.com
            </Link>
          </li>
        </ul>
      </nav>
    </article>
  );
}
