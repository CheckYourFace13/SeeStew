import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "American History Stories & Facts",
  description:
    "Read sourced American history stories with cited facts — presidents, scandals, Revolution, and forgotten U.S. events. Every SeeStew story links credible references.",
  alternates: { canonical: `${siteConfig.url}/articles` },
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-10 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-ink">American History Stories</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Sourced stories with cited facts — strange episodes, presidential history, Revolutionary War
          events, and American politics explained. Each piece names archives, museums, or established
          histories. Pair with our{" "}
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

      <AdSlot format="horizontal" label="Advertisement" />

      {articles.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          New stories publish regularly. Browse{" "}
          <Link href="/topics" className="underline">
            topics
          </Link>{" "}
          or watch{" "}
          <Link href="/videos" className="underline">
            documentaries
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block rounded-xl border border-brand-wash bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="text-xs font-medium uppercase text-brand-bright">
                {article.category}
              </span>
              <h2 className="mt-2 font-heading text-xl font-bold text-ink">{article.title}</h2>
              <p className="mt-2 line-clamp-3 text-ink-muted">{article.excerpt}</p>
              <p className="mt-3 text-sm text-brand-mid">Read story →</p>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-ink-muted">
        Browse by subject on{" "}
        <Link href="/topics" className="font-semibold text-brand-mid underline">
          Topics
        </Link>
        .
      </p>
    </div>
  );
}
