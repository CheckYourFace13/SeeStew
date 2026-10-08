import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import {
  getArticlesForHub,
  getHistoryHub,
  getPopulatedHistoryHubs,
  HUB_MIN_ARTICLES,
} from "@/lib/history-hubs";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPopulatedHistoryHubs(getAllArticles()).map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getHistoryHub(slug);
  const articles = hub ? getArticlesForHub(hub, getAllArticles()) : [];
  if (!hub || articles.length < HUB_MIN_ARTICLES) {
    return { title: "Hub not found", robots: { index: false, follow: true } };
  }
  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical: `${siteConfig.url}/hubs/${slug}` },
  };
}

export default async function HistoryHubPage({ params }: Props) {
  const { slug } = await params;
  const hub = getHistoryHub(slug);
  if (!hub) notFound();
  const articles = getArticlesForHub(hub, getAllArticles());
  if (articles.length < HUB_MIN_ARTICLES) notFound();

  const url = `${siteConfig.url}/hubs/${slug}`;
  const relatedHubs = getPopulatedHistoryHubs(getAllArticles())
    .filter((h) => h.slug !== slug)
    .slice(0, 4);

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", url: siteConfig.url },
            { name: "Hubs", url: `${siteConfig.url}/hubs` },
            { name: hub.title, url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: hub.title,
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.title,
              url: `${siteConfig.url}/articles/${a.slug}`,
            })),
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Hubs", href: "/hubs" },
          { label: hub.title },
        ]}
      />
      <h1 className="font-heading text-4xl font-bold text-ink">{hub.title}</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-muted">{hub.intro}</p>
      <p className="mt-3 text-sm text-ink-muted">
        {articles.length} documented stories.{" "}
        <Link href="/articles" className="text-brand-mid underline">
          All stories
        </Link>
        {" · "}
        <Link href="/topics" className="text-brand-mid underline">
          Topics
        </Link>
      </p>

      <ul className="mt-10 space-y-4">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="block rounded-xl border border-brand-wash bg-white p-6 hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-brand-mid">
                {a.category}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-ink">{a.title}</h2>
              <p className="mt-2 text-ink-muted">{a.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>

      {relatedHubs.length > 0 && (
        <nav className="mt-12" aria-label="Related hubs">
          <h2 className="font-heading text-lg font-bold text-ink">Related hubs</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {relatedHubs.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/hubs/${h.slug}`}
                  className="rounded-md border border-brand-wash bg-white px-3 py-1.5 text-brand-mid hover:border-brand-mid"
                >
                  {h.title} ({h.count})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
