import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { getPopulatedHistoryHubs } from "@/lib/history-hubs";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "History Hubs — Decades, States & Eras",
  description:
    "Browse content-rich American history hubs by decade, state, and era — only topics with enough sourced SeeStew stories.",
  alternates: { canonical: `${siteConfig.url}/hubs` },
};

export default function HubsIndexPage() {
  const articles = getAllArticles();
  const hubs = getPopulatedHistoryHubs(articles);
  const url = `${siteConfig.url}/hubs`;

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Hubs", url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SeeStew history hubs",
            itemListElement: hubs.map((h, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: h.title,
              url: `${siteConfig.url}/hubs/${h.slug}`,
            })),
          },
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Hubs" }]} />
      <h1 className="font-heading text-4xl font-bold text-ink">History hubs</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">
        Decade, state, and era collections built only when SeeStew has at least three sourced
        stories that clearly fit. Empty hubs are never listed.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hubs.map((h) => (
          <li key={h.slug}>
            <Link
              href={`/hubs/${h.slug}`}
              className="block rounded-xl border border-brand-wash bg-white p-6 hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-brand-mid">{h.kind}</p>
              <h2 className="mt-1 font-heading text-xl font-bold text-ink">{h.title}</h2>
              <p className="mt-2 text-sm text-ink-muted line-clamp-3">{h.description}</p>
              <p className="mt-3 text-xs text-ink-muted">{h.count} stories</p>
            </Link>
          </li>
        ))}
      </ul>
      {hubs.length === 0 && (
        <p className="mt-8 text-ink-muted">No hubs meet the content threshold yet.</p>
      )}
    </div>
  );
}
