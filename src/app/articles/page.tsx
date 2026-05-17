import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "American History Articles",
  description:
    "Written companions to SeeStew videos — presidents, revolution, scandal, and the details textbooks skip.",
  alternates: { canonical: `${siteConfig.url}/articles` },
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-ink">Articles</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Read alongside our{" "}
          <Link href="/videos" className="text-brand-mid underline">
            documentaries
          </Link>{" "}
          and{" "}
          <Link href="/shorts" className="text-brand-mid underline">
            shorts
          </Link>
          .
        </p>
      </header>

      <AdSlot format="horizontal" />

      <div className="mt-10 space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="block rounded-xl border border-brand-wash bg-white p-6 shadow-sm transition hover:shadow-md md:p-8"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-brand-mid">
              {article.category}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink">
              {article.title}
            </h2>
            <p className="mt-2 text-ink-muted">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
