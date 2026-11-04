import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { getPopulatedHistoryHubs } from "@/lib/history-hubs";
import {
  indexableAnniversaryDateSlugs,
  onThisDayEnabled,
} from "@/lib/on-this-day";
import { emailSignupConfig } from "@/lib/email-signup";
import { getPopulatedTopics } from "@/lib/topic-seo";
import { getLongFormVideos } from "@/lib/youtube";
import { getManagedFeed } from "@/lib/gravyblock-managed";
import { isIndexableHistoryHub } from "@/lib/history-hubs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  // Soft-fail external feeds so a YouTube/GravyBlock outage cannot 500 the sitemap.
  let longForm: Awaited<ReturnType<typeof getLongFormVideos>> = [];
  try {
    longForm = await getLongFormVideos();
  } catch {
    longForm = [];
  }
  const articles = getAllArticles();
  const topics = getPopulatedTopics(articles);
  const hubs = getPopulatedHistoryHubs(articles).filter((hub) =>
    isIndexableHistoryHub(hub, articles)
  );
  const slugSet = new Set(articles.map((a) => a.slug));
  const includeOnThisDay = onThisDayEnabled(slugSet);
  // Only multi-event anniversary dates are indexable; single-event dates stay
  // reachable with noindex,follow and are omitted here.
  let onThisDayDates: string[] = [];
  try {
    onThisDayDates = includeOnThisDay
      ? indexableAnniversaryDateSlugs(slugSet)
      : [];
  } catch {
    onThisDayDates = [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/videos",
    "/shorts",
    "/articles",
    "/archive",
    "/topics",
    "/hubs",
    ...(includeOnThisDay ? ["/on-this-day"] : []),
    ...(emailSignupConfig.isReady ? ["/newsletter"] : []),
    "/social",
    "/about",
    "/editorial",
    // /contact stays linked from the footer but is noindex utility copy.
    "/privacy",
    "/terms",
    "/faq",
    "/affiliate-disclosure",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.9,
  }));

  const topicPages = topics.map((topic) => ({
    url: `${base}/topics/${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const hubPages = hubs.map((hub) => ({
    url: `${base}/hubs/${hub.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const onThisDayDatePages = onThisDayDates.map((date) => ({
    url: `${base}/on-this-day/${date}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const videoPages = longForm.map((v) => ({
    url: `${base}/videos/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const articlePages = articles.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.createdAt ? new Date(a.createdAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  let managedItems: { slug: string; publishedAt: string }[] = [];
  try {
    managedItems = (await getManagedFeed())?.items ?? [];
  } catch {
    managedItems = [];
  }
  const managedPages: MetadataRoute.Sitemap = managedItems.length
    ? [
        { url: `${base}/insights`, changeFrequency: "weekly" as const, priority: 0.5 },
        ...managedItems.map((i) => ({ url: `${base}/insights/${i.slug}`, lastModified: new Date(i.publishedAt), changeFrequency: "monthly" as const, priority: 0.5 })),
      ]
    : [];

  // Short detail pages are thin syndicated clips — kept accessible via /shorts
  // but excluded from the sitemap and noindexed to avoid low-value-content signals.
  return [
    ...staticPages,
    ...topicPages,
    ...hubPages,
    ...onThisDayDatePages,
    ...videoPages,
    ...articlePages,
    ...managedPages,
  ];
}
