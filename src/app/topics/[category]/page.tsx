import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

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
  const name = slugToCategory(slug);
  if (!name) return { title: "Topic not found" };
  return {
    title: `${name} — American History Articles`,
    description: `SeeStew articles about ${name}: sourced US history stories, scandals, and documentaries.`,
    alternates: { canonical: `${siteConfig.url}/topics/${slug}` },
  };
}

export default async function TopicCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const categoryName = slugToCategory(slug);
  if (!categoryName) notFound();

  const articles = getArticlesByCategory(categoryName);
  const url = `${siteConfig.url}/topics/${slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Topics", url: `${siteConfig.url}/topics` },
          { name: categoryName, url },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Topics", href: "/topics" },
          { label: categoryName },
        ]}
      />
      <h1 className="font-heading text-4xl font-bold text-ink">{categoryName}</h1>
      <p className="mt-3 text-ink-muted">
        {articles.length} article{articles.length === 1 ? "" : "s"} with citations.
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
    </div>
  );
}
