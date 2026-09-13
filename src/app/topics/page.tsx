import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { getPopulatedTopics } from "@/lib/topic-seo";

export const metadata: Metadata = {
  title: "American History Topics — Stories & Facts",
  description:
    "Browse SeeStew topics with published stories: political scandals, military history, strange American disasters, and more — each story cites sources.",
  alternates: { canonical: `${siteConfig.url}/topics` },
};

export default function TopicsPage() {
  const articles = getAllArticles();
  const topics = getPopulatedTopics(articles);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SeeStew history topics",
    itemListElement: topics.map((topic, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: topic.title,
      url: `${siteConfig.url}/topics/${topic.slug}`,
    })),
  };

  return (
    <div className="page-shell">
      <JsonLd data={itemList} />
      <h1 className="font-heading text-4xl font-bold text-ink">American History Topics</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        Explore hard-to-believe American history by subject — forgotten disasters, military
        near-misses, political scandals, and shocking true stories. Only topics with published
        stories appear here. Every piece lists named sources.
      </p>

      {topics.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Stories are publishing regularly. Browse the{" "}
          <Link href="/articles" className="text-brand-mid underline">
            full archive
          </Link>{" "}
          in the meantime.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="rounded-xl border border-brand-wash bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="font-heading text-xl font-bold text-brand-primary">{topic.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{topic.description}</p>
              <p className="mt-3 text-xs text-brand-mid">
                {topic.count} {topic.count === 1 ? "story" : "stories"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
