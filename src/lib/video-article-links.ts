/**
 * Deterministic article ↔ video/short links.
 * Order: explicit IDs/slugs → exact slug match. No fuzzy/weak title overlap.
 */

import type { Article } from "./articles";
import type { YouTubeVideo } from "./youtube";
import { isLongFormVideo, isShortFormVideo } from "./youtube";

/**
 * Curated overrides when slug/IDs do not line up but the pair is verified.
 * Keys: video.id or video.slug → article.slug
 */
export const EXPLICIT_VIDEO_TO_ARTICLE: Record<string, string> = {
  // Add only verified pairs, e.g.:
  // "BrNGqid8_tY": "some-article-slug",
};

export type VideoArticleLink = {
  articleSlug: string;
  videoId: string;
  videoSlug: string;
  format: YouTubeVideo["format"];
  reason: "relatedVideoId" | "relatedShortId" | "sourceVideoId" | "exactSlug" | "explicitMap";
};

function articleBySlug(articles: Article[]): Map<string, Article> {
  return new Map(articles.map((a) => [a.slug, a]));
}

function videoById(videos: YouTubeVideo[]): Map<string, YouTubeVideo> {
  return new Map(videos.map((v) => [v.id, v]));
}

function videoBySlug(videos: YouTubeVideo[]): Map<string, YouTubeVideo> {
  return new Map(videos.map((v) => [v.slug, v]));
}

/** Resolve a single video/short for an article, or null if none is certain. */
export function linkedVideoForArticle(
  article: Article,
  videos: YouTubeVideo[]
): { video: YouTubeVideo; reason: VideoArticleLink["reason"] } | null {
  const byId = videoById(videos);
  const bySlug = videoBySlug(videos);

  if (article.relatedVideoId) {
    const v = byId.get(article.relatedVideoId);
    if (v && isLongFormVideo(v)) return { video: v, reason: "relatedVideoId" };
  }
  if (article.relatedShortId) {
    const v = byId.get(article.relatedShortId);
    if (v && isShortFormVideo(v)) return { video: v, reason: "relatedShortId" };
  }
  if (article.sourceVideoId) {
    const v = byId.get(article.sourceVideoId);
    if (v) return { video: v, reason: "sourceVideoId" };
  }

  const exact = bySlug.get(article.slug);
  if (exact) return { video: exact, reason: "exactSlug" };

  for (const [key, articleSlug] of Object.entries(EXPLICIT_VIDEO_TO_ARTICLE)) {
    if (articleSlug !== article.slug) continue;
    const v = byId.get(key) ?? bySlug.get(key);
    if (v) return { video: v, reason: "explicitMap" };
  }

  return null;
}

/** All deterministically linked videos/shorts for an article (deduped). */
export function linkedVideosForArticle(
  article: Article,
  videos: YouTubeVideo[]
): YouTubeVideo[] {
  const byId = videoById(videos);
  const bySlug = videoBySlug(videos);
  const out: YouTubeVideo[] = [];
  const seen = new Set<string>();

  const push = (v: YouTubeVideo | undefined) => {
    if (!v || seen.has(v.id)) return;
    seen.add(v.id);
    out.push(v);
  };

  if (article.relatedVideoId) push(byId.get(article.relatedVideoId));
  if (article.relatedShortId) push(byId.get(article.relatedShortId));
  if (article.sourceVideoId) push(byId.get(article.sourceVideoId));
  push(bySlug.get(article.slug));

  for (const [key, articleSlug] of Object.entries(EXPLICIT_VIDEO_TO_ARTICLE)) {
    if (articleSlug !== article.slug) continue;
    push(byId.get(key) ?? bySlug.get(key));
  }

  return out;
}

/** Deterministically linked articles for a video/short. */
export function linkedArticlesForVideo(
  video: YouTubeVideo,
  articles: Article[]
): Article[] {
  const bySlug = articleBySlug(articles);
  const out: Article[] = [];
  const seen = new Set<string>();

  const push = (a: Article | undefined) => {
    if (!a || seen.has(a.slug)) return;
    seen.add(a.slug);
    out.push(a);
  };

  const explicit =
    EXPLICIT_VIDEO_TO_ARTICLE[video.id] ?? EXPLICIT_VIDEO_TO_ARTICLE[video.slug];
  if (explicit) push(bySlug.get(explicit));

  push(bySlug.get(video.slug));

  for (const article of articles) {
    if (
      article.relatedVideoId === video.id ||
      article.relatedShortId === video.id ||
      article.sourceVideoId === video.id
    ) {
      push(article);
    }
  }

  return out;
}

export function auditVideoArticleLinks(
  articles: Article[],
  videos: YouTubeVideo[]
): {
  matched: VideoArticleLink[];
  unmatchedVideos: YouTubeVideo[];
  unmatchedArticles: Article[];
} {
  const matched: VideoArticleLink[] = [];
  const matchedVideoIds = new Set<string>();
  const matchedArticleSlugs = new Set<string>();

  for (const article of articles) {
    const links = linkedVideosForArticle(article, videos);
    for (const video of links) {
      const primary = linkedVideoForArticle(article, videos);
      const reason = primary?.video.id === video.id ? primary.reason : "exactSlug";
      matched.push({
        articleSlug: article.slug,
        videoId: video.id,
        videoSlug: video.slug,
        format: video.format,
        reason,
      });
      matchedVideoIds.add(video.id);
      matchedArticleSlugs.add(article.slug);
    }
  }

  // Videos with explicit map / slug match that somehow skipped article loop
  for (const video of videos) {
    if (matchedVideoIds.has(video.id)) continue;
    const arts = linkedArticlesForVideo(video, articles);
    for (const article of arts) {
      matched.push({
        articleSlug: article.slug,
        videoId: video.id,
        videoSlug: video.slug,
        format: video.format,
        reason: EXPLICIT_VIDEO_TO_ARTICLE[video.id] || EXPLICIT_VIDEO_TO_ARTICLE[video.slug]
          ? "explicitMap"
          : "exactSlug",
      });
      matchedVideoIds.add(video.id);
      matchedArticleSlugs.add(article.slug);
    }
  }

  return {
    matched,
    unmatchedVideos: videos.filter((v) => !matchedVideoIds.has(v.id)),
    unmatchedArticles: articles.filter((a) => !matchedArticleSlugs.has(a.slug)),
  };
}
