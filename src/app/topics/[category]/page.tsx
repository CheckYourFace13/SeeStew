import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getTopicHub, getTopicHubForCategory } from "@/lib/topic-seo";

type Props = { params: Promise<{ category: string }> };

function slugToCategory(slug: string): string | undefined {
  const articles = getAllArticles();
  return articles.find(
    (a) => a.category.toLowerCase().replace(/\s+/g, "-") === slug
  )?.category;
}

export async function generateStaticParams() {
  const cats = new Set(getAllArticles().map((a) => a.category));
  return [...cats].map((c) => ({
    category: c.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const hub = getTopicHub(slug);
  const name = slugToCategory(slug) ?? hub?.title;
  if (!name) return { title: "Topic not found" };
  return {
    title: hub?.title ?? `${name} — American History Stories`,
    description:
      hub?.description ??
      `SeeStew stories about ${name}: sourced U.S. history facts with citations and documentaries.`,
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
  const url = `${siteConfig.url}/topics/${slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
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
        {hub?.intro ??
          `Sourced SeeStew stories about ${displayName} with cited facts and references.`}
      </p>

      {hub?.searchAngles && hub.searchAngles.length > 0 && (
        <p className="mt-4 text-sm text-ink-muted">
          Readers search for: {hub.searchAngles.join(" · ")}.
        </p>
      )}

      <AdSlot className="mt-8" format="horizontal" label="Advertisement" />

      <p className="mt-6 text-ink-muted">
        {articles.length} stor{articles.length === 1 ? "y" : "ies"} with citations.{" "}
        <Link href="/videos" className="text-brand-mid underline">
          Watch documentaries
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

      {articles.length === 0 && (
        <p className="mt-10 text-ink-muted">
          Stories for this topic are coming soon. Browse{" "}
          <Link href="/articles" className="underline">
            all stories
          </Link>
          .
        </p>
      )}
    </div>
  );
}
