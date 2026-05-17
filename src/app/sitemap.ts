import type { MetadataRoute } from "next";
import { getAllArticles, getAllCategories } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { getLongFormVideos, getShortFormVideos } from "@/lib/youtube";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const longForm = await getLongFormVideos();
  const shorts = await getShortFormVideos();
  const articles = getAllArticles();
  const categories = getAllCategories();

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/videos",
    "/shorts",
    "/articles",
    "/topics",
    "/social",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.9,
  }));

  const topicPages = categories.map((cat) => ({
    url: `${base}/topics/${cat.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const videoPages = longForm.map((v) => ({
    url: `${base}/videos/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const shortPages = shorts.map((v) => ({
    url: `${base}/shorts/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const articlePages = articles.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.createdAt ? new Date(a.createdAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...topicPages, ...videoPages, ...shortPages, ...articlePages];
}
