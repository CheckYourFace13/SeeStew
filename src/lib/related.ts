import type { Article } from "./articles";
import type { YouTubeVideo } from "./youtube";
import { isLongFormVideo, isShortFormVideo } from "./youtube";

const STOPWORDS = new Set([
  "that",
  "this",
  "from",
  "with",
  "after",
  "before",
  "about",
  "into",
  "over",
  "under",
  "their",
  "them",
  "they",
  "were",
  "been",
  "have",
  "american",
  "america",
  "history",
  "story",
  "stories",
  "video",
  "videos",
  "short",
  "shorts",
  "seestew",
  "documentary",
  "episode",
  "watch",
  "true",
  "facts",
  "fact",
  "full",
  "clip",
  "clips",
  "explained",
  "disaster",
  "disasters",
  "scandal",
  "scandals",
  "forgotten",
  "unbelievable",
  "united",
  "states",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/#shorts?/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

function overlapScore(a: string, b: string): number {
  const left = tokens(a);
  const right = new Set(tokens(b));
  if (left.length === 0 || right.size === 0) return 0;
  let score = 0;
  for (const t of left) {
    if (right.has(t)) score += t.length >= 7 ? 2 : 1;
  }
  return score;
}

function articleSearchText(article: Article): string {
  return `${article.title} ${article.slug} ${article.category}`;
}

function videoSearchText(video: YouTubeVideo): string {
  return `${video.title} ${video.slug}`;
}

function isLinkedPair(article: Article, video: YouTubeVideo): boolean {
  return article.relatedVideoId === video.id || article.sourceVideoId === video.id;
}

/** Enough overlap to count as the same story — never a generic channel dump. */
function isStrongMatch(article: Article, video: YouTubeVideo): boolean {
  if (isLinkedPair(article, video)) return true;
  return overlapScore(articleSearchText(article), videoSearchText(video)) >= 2;
}

/**
 * 2–4 related stories for an article: same-topic stories ranked by real title/slug overlap,
 * plus strong cross-topic matches. Falls back to the newest same-topic stories so there are
 * always at least two links when the topic has them. Never includes the article itself.
 */
export function relatedArticlesForArticle(
  article: Article,
  all: Article[],
  limit = 4
): Article[] {
  const pool = all.filter((a) => a.slug !== article.slug);
  const scored = pool
    .map((a) => {
      const sameTopic = a.category === article.category;
      const overlap = overlapScore(articleSearchText(article), articleSearchText(a));
      return { a, sameTopic, score: overlap + (sameTopic ? 1 : 0) };
    })
    // cross-topic stories need genuine overlap; same-topic ones always qualify
    .filter((x) => x.sameTopic || x.score >= 3)
    .sort((x, y) => y.score - x.score || (y.a.createdAt ?? "").localeCompare(x.a.createdAt ?? ""));
  return scored.slice(0, limit).map((x) => x.a);
}

export function relatedVideosForArticle(
  article: Article,
  videos: YouTubeVideo[]
): YouTubeVideo[] {
  return videos.filter((v) => isStrongMatch(article, v));
}

export function relatedArticlesForVideo(
  video: YouTubeVideo,
  articles: Article[]
): Article[] {
  return articles.filter((a) => isStrongMatch(a, video));
}

export function relatedVideosForVideo(
  video: YouTubeVideo,
  videos: YouTubeVideo[],
  format?: YouTubeVideo["format"]
): YouTubeVideo[] {
  const pool = videos.filter((v) => v.id !== video.id && (!format || v.format === format));
  return pool
    .map((v) => ({ v, score: overlapScore(videoSearchText(video), videoSearchText(v)) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.v);
}

export function videosRelatedToArticles(
  articles: Article[],
  videos: YouTubeVideo[]
): YouTubeVideo[] {
  const seen = new Set<string>();
  const out: YouTubeVideo[] = [];
  for (const article of articles) {
    for (const video of relatedVideosForArticle(article, videos)) {
      if (seen.has(video.id)) continue;
      seen.add(video.id);
      out.push(video);
    }
  }
  return out;
}

export function splitRelatedMedia(videos: YouTubeVideo[]): {
  long: YouTubeVideo[];
  shorts: YouTubeVideo[];
} {
  return {
    long: videos.filter(isLongFormVideo),
    shorts: videos.filter(isShortFormVideo),
  };
}
