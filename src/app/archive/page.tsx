import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { HISTORICAL_ERAS } from "@/lib/historical-eras";
import { getPopulatedHistoryHubs } from "@/lib/history-hubs";
import {
  datePathSlug,
  liveAnniversaries,
  monthName,
  onThisDayEnabled,
} from "@/lib/on-this-day";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getPopulatedTopics } from "@/lib/topic-seo";
import { getQuickReads } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Browse the SeeStew archive",
  description:
    "Browse sourced American history stories by era, state, topic, and curated anniversary — complementary to the full story library.",
  alternates: { canonical: `${siteConfig.url}/archive` },
};

export default function ArchivePage() {
  const articles = getAllArticles();
  const topics = getPopulatedTopics(articles);
  const hubs = getPopulatedHistoryHubs(articles);
  const decades = hubs.filter((h) => h.kind === "decade");
  const states = hubs.filter((h) => h.kind === "state");
  const historicalEras = hubs.filter((h) =>
    HISTORICAL_ERAS.some((e) => e.slug === h.slug)
  );
  const lists = hubs.filter(
    (h) =>
      h.kind === "city" ||
      h.kind === "list" ||
      (h.kind === "era" && !HISTORICAL_ERAS.some((e) => e.slug === h.slug))
  );
  const slugSet = new Set(articles.map((a) => a.slug));
  const showOnThisDay = onThisDayEnabled(slugSet);
  const anniversaries = showOnThisDay ? liveAnniversaries(slugSet).slice(0, 12) : [];
  const recent = articles.slice(0, 12);
  const quickReads = getQuickReads(6);
  const url = `${siteConfig.url}/archive`;

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Archive", url },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Archive" }]} />
      <h1 className="font-heading text-4xl font-bold text-ink">Browse the archive</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        Jump into SeeStew by decade, state, topic, or anniversary. The full story library
        stays at{" "}
        <Link href="/articles" className="text-brand-mid underline">
          /articles
        </Link>
        — this page only links existing content-rich hubs.
      </p>

      <section className="mt-12" aria-labelledby="archive-recent">
        <h2 id="archive-recent" className="font-heading text-2xl font-bold text-ink">
          Recent stories
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {recent.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="text-brand-mid underline hover:text-brand-bright"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/articles" className="text-brand-mid underline">
            All stories →
          </Link>
        </p>
      </section>

      {quickReads.length > 0 && (
        <section className="mt-12" aria-labelledby="archive-quick">
          <h2 id="archive-quick" className="font-heading text-2xl font-bold text-ink">
            Quick Reads
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickReads.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="text-brand-mid underline hover:text-brand-bright"
                >
                  {a.title}
                </Link>
                <span className="ml-2 text-xs text-ink-muted">{a.readMinutes} min</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/articles?format=quick-read" className="text-brand-mid underline">
              All Quick Reads →
            </Link>
          </p>
        </section>
      )}

      {historicalEras.length > 0 && (
        <section className="mt-12" aria-labelledby="archive-eras">
          <h2 id="archive-eras" className="font-heading text-2xl font-bold text-ink">
            Browse by era
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Historical eras use event dates, not publish dates. Only eras with enough sourced
            stories are listed.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {historicalEras.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/hubs/${h.slug}`}
                  className="inline-flex rounded-md border border-brand-wash bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-brand-mid"
                >
                  {h.title}
                  <span className="ml-2 text-ink-muted">({h.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topics.length > 0 && (
        <section className="mt-12" aria-labelledby="archive-topics">
          <h2 id="archive-topics" className="font-heading text-2xl font-bold text-ink">
            Major topics
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/topics/${t.slug}`}
                  className="inline-flex rounded-md border border-brand-wash bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-brand-mid"
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {decades.length > 0 && (
        <section className="mt-12" aria-labelledby="archive-decades">
          <h2 id="archive-decades" className="font-heading text-2xl font-bold text-ink">
            By era / decade
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {decades.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/hubs/${h.slug}`}
                  className="inline-flex rounded-md border border-brand-wash bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-brand-mid"
                >
                  {h.title}
                  <span className="ml-2 text-ink-muted">({h.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {states.length > 0 && (
        <section className="mt-12" aria-labelledby="archive-states">
          <h2 id="archive-states" className="font-heading text-2xl font-bold text-ink">
            Populated states
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {states.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/hubs/${h.slug}`}
                  className="inline-flex rounded-md border border-brand-wash bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-brand-mid"
                >
                  {h.title}
                  <span className="ml-2 text-ink-muted">({h.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lists.length > 0 && (
        <section className="mt-12" aria-labelledby="archive-lists">
          <h2 id="archive-lists" className="font-heading text-2xl font-bold text-ink">
            Curated hubs
          </h2>
          <ul className="mt-4 space-y-2">
            {lists.map((h) => (
              <li key={h.slug}>
                <Link href={`/hubs/${h.slug}`} className="text-brand-mid underline">
                  {h.title}
                </Link>
                <span className="text-sm text-ink-muted"> — {h.count} stories</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showOnThisDay && (
        <section className="mt-12" aria-labelledby="archive-otd">
          <h2 id="archive-otd" className="font-heading text-2xl font-bold text-ink">
            Anniversaries
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Only dates with curated stories.{" "}
            <Link href="/on-this-day" className="text-brand-mid underline">
              Full on-this-day archive
            </Link>
            {" · "}
            <Link href="/today" className="text-brand-mid underline">
              Today
            </Link>
          </p>
          <ul className="mt-4 space-y-2">
            {anniversaries.map((a) => (
              <li key={`${a.slug}-${a.month}-${a.day}`}>
                <Link
                  href={`/on-this-day/${datePathSlug(a.month, a.day)}`}
                  className="text-brand-mid underline"
                >
                  {monthName(a.month)} {a.day}
                </Link>
                <span className="text-ink-muted"> — {a.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
