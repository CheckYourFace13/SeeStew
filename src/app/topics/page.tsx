import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getAllCategories } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "American History Topics",
  description:
    "Browse SeeStew articles by topic: presidents, scandals, revolution, military history, and more.",
  alternates: { canonical: `${siteConfig.url}/topics` },
};

export default function TopicsPage() {
  const categories = getAllCategories();
  const articles = getAllArticles();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SeeStew history topics",
    itemListElement: categories.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat,
      url: `${siteConfig.url}/topics/${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, "-"))}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <JsonLd data={itemList} />
      <h1 className="font-heading text-4xl font-bold text-ink">Topics</h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Sourced articles grouped by subject. Each piece links primary references.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = articles.filter((a) => a.category === cat).length;
          const slug = cat.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={cat}
              href={`/topics/${slug}`}
              className="rounded-xl border border-brand-wash bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="font-heading text-xl font-bold text-brand-primary">{cat}</h2>
              <p className="mt-2 text-sm text-ink-muted">{count} articles</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
