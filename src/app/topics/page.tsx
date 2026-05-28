import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles, getAllCategories } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { topicHubs } from "@/lib/topic-seo";

export const metadata: Metadata = {
  title: "American History Topics — Stories & Facts",
  description:
    "Browse SeeStew topics: presidential history facts, Revolutionary War stories, political scandals, and strange American history — each story cites sources.",
  alternates: { canonical: `${siteConfig.url}/topics` },
};

export default function TopicsPage() {
  const categories = getAllCategories();
  const articles = getAllArticles();
  const knownSlugs = new Set(topicHubs.map((t) => t.slug));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SeeStew history topics",
    itemListElement: categories.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat,
      url: `${siteConfig.url}/topics/${cat.toLowerCase().replace(/\s+/g, "-")}`,
    })),
  };

  return (
    <div className="page-shell">
      <JsonLd data={itemList} />
      <h1 className="font-heading text-4xl font-bold text-ink">American History Topics</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        Explore unbelievable American history by subject — forgotten disasters, presidential
        drama, Revolutionary War twists, and shocking political history. Strange facts and true
        stories you will want to share.
      </p>

      <AdSlot className="mt-8" format="horizontal" label="Advertisement" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topicHubs.map((hub) => {
          const count = articles.filter(
            (a) => a.category.toLowerCase().replace(/\s+/g, "-") === hub.slug
          ).length;
          return (
            <Link
              key={hub.slug}
              href={`/topics/${hub.slug}`}
              className="rounded-xl border border-brand-wash bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="font-heading text-xl font-bold text-brand-primary">{hub.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{hub.description}</p>
              <p className="mt-3 text-xs text-brand-mid">{count} stories</p>
            </Link>
          );
        })}
        {categories
          .filter((cat) => !knownSlugs.has(cat.toLowerCase().replace(/\s+/g, "-")))
          .map((cat) => {
            const slug = cat.toLowerCase().replace(/\s+/g, "-");
            const count = articles.filter((a) => a.category === cat).length;
            return (
              <Link
                key={cat}
                href={`/topics/${slug}`}
                className="rounded-xl border border-brand-wash bg-white p-6 shadow-sm hover:shadow-md"
              >
                <h2 className="font-heading text-xl font-bold text-brand-primary">{cat}</h2>
                <p className="mt-2 text-sm text-ink-muted">{count} stories with citations</p>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

