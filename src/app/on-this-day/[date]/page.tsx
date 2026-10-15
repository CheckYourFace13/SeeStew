import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles, getArticle } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import {
  adjacentContentRichDates,
  anniversariesForDate,
  contentRichDateSlugs,
  monthName,
  onThisDayEnabled,
  parseDatePathSlug,
} from "@/lib/on-this-day";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ date: string }> };

export function generateStaticParams() {
  const slugs = new Set(getAllArticles().map((a) => a.slug));
  if (!onThisDayEnabled(slugs)) return [];
  return contentRichDateSlugs(slugs).map((date) => ({ date }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const parsed = parseDatePathSlug(date);
  const articleSlugs = new Set(getAllArticles().map((a) => a.slug));
  if (!parsed || !onThisDayEnabled(articleSlugs)) {
    return { title: "On This Day", robots: { index: false, follow: true } };
  }
  const items = anniversariesForDate(parsed.month, parsed.day, articleSlugs);
  if (items.length === 0) {
    return { title: "On This Day", robots: { index: false, follow: true } };
  }
  const label = `${monthName(parsed.month)} ${parsed.day}`;
  return {
    title: `On This Day — ${label}`,
    description: `American history on ${label}: sourced SeeStew stories for this anniversary date.`,
    alternates: { canonical: `${siteConfig.url}/on-this-day/${date}` },
  };
}

export default async function OnThisDayDatePage({ params }: Props) {
  const { date } = await params;
  const parsed = parseDatePathSlug(date);
  const articleSlugs = new Set(getAllArticles().map((a) => a.slug));
  if (!parsed || !onThisDayEnabled(articleSlugs)) notFound();

  const items = anniversariesForDate(parsed.month, parsed.day, articleSlugs);
  // Valid calendar slug with no curated content → friendly archive, not thin 404.
  if (items.length === 0) redirect("/on-this-day");

  const label = `${monthName(parsed.month)} ${parsed.day}`;
  const url = `${siteConfig.url}/on-this-day/${date}`;
  const stories = items
    .map((ann) => ({ ann, article: getArticle(ann.slug) }))
    .filter((x): x is { ann: (typeof items)[0]; article: NonNullable<ReturnType<typeof getArticle>> } =>
      Boolean(x.article)
    );

  if (stories.length === 0) redirect("/on-this-day");

  const { prev, next } = adjacentContentRichDates(
    parsed.month,
    parsed.day,
    articleSlugs
  );

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "On This Day", url: `${siteConfig.url}/on-this-day` },
            { name: label, url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `On this day — ${label}`,
            itemListElement: stories.map(({ article }, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: article.title,
              url: `${siteConfig.url}/articles/${article.slug}`,
            })),
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "On This Day", href: "/on-this-day" },
          { label },
        ]}
      />
      <h1 className="font-heading text-4xl font-bold text-ink">
        On this day — {label}
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        Curated American history anniversaries for {label}, each linked to a full
        SeeStew article with named sources. Empty calendar stubs are not published.
      </p>

      {(prev || next) && (
        <nav
          className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"
          aria-label="Adjacent anniversary dates"
        >
          {prev ? (
            <Link href={`/on-this-day/${prev}`} className="text-brand-mid underline">
              ← {formatDateSlugLabel(prev)}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/on-this-day/${next}`} className="text-brand-mid underline">
              {formatDateSlugLabel(next)} →
            </Link>
          ) : null}
        </nav>
      )}

      <ul className="mt-10 space-y-4">
        {stories.map(({ ann, article }) => (
          <li key={ann.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="block rounded-xl border border-brand-wash bg-white p-6 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-mid">
                {ann.label}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-ink">{article.title}</h2>
              <p className="mt-2 text-ink-muted">{article.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm">
        <Link href="/on-this-day" className="text-brand-mid underline">
          ← All curated anniversaries
        </Link>
        {" · "}
        <Link href="/today" className="text-brand-mid underline">
          Today&apos;s anniversaries
        </Link>
      </p>
    </div>
  );
}

function formatDateSlugLabel(slug: string): string {
  const parsed = parseDatePathSlug(slug);
  if (!parsed) return slug;
  return `${monthName(parsed.month)} ${parsed.day}`;
}
