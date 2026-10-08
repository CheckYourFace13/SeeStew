import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles, getArticle } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import {
  liveAnniversaries,
  onThisDayEnabled,
  upcomingAnniversaries,
} from "@/lib/on-this-day";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const slugs = new Set(getAllArticles().map((a) => a.slug));
  if (!onThisDayEnabled(slugs)) {
    return { title: "On This Day", robots: { index: false, follow: true } };
  }
  return {
    title: "On This Day in American History",
    description:
      "Upcoming American history anniversaries tied to sourced SeeStew stories — disasters, scandals, and turning points with named citations.",
    alternates: { canonical: `${siteConfig.url}/on-this-day` },
  };
}

export default function OnThisDayPage() {
  const articles = getAllArticles();
  const slugs = new Set(articles.map((a) => a.slug));
  if (!onThisDayEnabled(slugs)) notFound();

  const upcoming = upcomingAnniversaries(slugs, new Date(), 14);
  const all = liveAnniversaries(slugs);
  const url = `${siteConfig.url}/on-this-day`;

  const monthName = (m: number) =>
    new Date(Date.UTC(2000, m - 1, 1)).toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC",
    });

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "On This Day", url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "On this day — SeeStew anniversaries",
            itemListElement: upcoming.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.label,
              url: `${siteConfig.url}/articles/${a.slug}`,
            })),
          },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "On This Day" }]} />
      <h1 className="font-heading text-4xl font-bold text-ink">On this day</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        Anniversaries tied to full SeeStew articles — not thin date stubs. Each link opens a sourced
        story. Dates are curated from well-established historical calendars for stories we already
        publish.
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-ink">Coming up</h2>
        <ul className="mt-6 space-y-4">
          {upcoming.map((ann) => {
            const article = getArticle(ann.slug);
            if (!article) return null;
            return (
              <li key={`${ann.slug}-${ann.month}-${ann.day}`}>
                <Link
                  href={`/articles/${ann.slug}`}
                  className="block rounded-xl border border-brand-wash bg-white p-6 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-mid">
                    {monthName(ann.month)} {ann.day}
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-ink">{article.title}</h3>
                  <p className="mt-2 text-ink-muted">{article.excerpt}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-bold text-ink">Full anniversary list</h2>
        <p className="mt-2 text-sm text-ink-muted">{all.length} curated dates with live articles.</p>
        <ul className="mt-6 columns-1 gap-4 sm:columns-2 text-sm">
          {all.map((ann) => (
            <li key={ann.slug} className="mb-2 break-inside-avoid">
              <Link href={`/articles/${ann.slug}`} className="text-brand-mid underline">
                {monthName(ann.month)} {ann.day}: {ann.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
