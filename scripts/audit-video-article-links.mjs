#!/usr/bin/env node
/**
 * Deterministic video ↔ article link audit.
 * Writes docs/video-article-link-audit.md
 *
 * Usage: node scripts/audit-video-article-links.mjs
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, "content", "articles");
const DOCS_DIR = join(ROOT, "docs");
const OUT = join(DOCS_DIR, "video-article-link-audit.md");

/** Keep in sync with src/lib/video-article-links.ts EXPLICIT_VIDEO_TO_ARTICLE */
const EXPLICIT_VIDEO_TO_ARTICLE = {};

function loadArticles() {
  if (!existsSync(ARTICLES_DIR)) return [];
  return readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const a = JSON.parse(readFileSync(join(ARTICLES_DIR, f), "utf-8"));
      return { ...a, slug: a.slug || f.replace(/\.json$/, "") };
    });
}

function slugify(title, id) {
  const base = String(title || "")
    .toLowerCase()
    .replace(/#shorts?/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || id;
}

async function loadVideosFromRss(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();
  const entries = xml.split("<entry>").slice(1);
  const videos = [];
  for (const entry of entries) {
    const block = "<entry>" + entry;
    const id = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const titleRaw = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1];
    if (!id || !titleRaw) continue;
    const title = titleRaw.replace(/^[^-]+-\s*/, "").trim();
    videos.push({
      id,
      title,
      slug: slugify(title, id),
      format: /#shorts?/i.test(title) || /youtube\.com\/shorts\//i.test(block) ? "short" : "long",
    });
  }
  return videos;
}

async function loadVideos() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "";
  if (channelId) {
    try {
      const videos = await loadVideosFromRss(channelId);
      if (videos.length) return { live: true, videos };
    } catch (e) {
      console.warn("YouTube RSS failed:", e.message);
    }
  }
  return loadVideosFallback();
}

function loadVideosFallback() {
  return {
    live: false,
    videos: [
      {
        id: "BrNGqid8_tY",
        title: "Teddy Roosevelt: Big Stick Diplomacy",
        slug: "teddy-roosevelt-big-stick-diplomacy",
        format: "long",
      },
    ],
  };
}

function matchArticle(article, videos) {
  const byId = new Map(videos.map((v) => [v.id, v]));
  const bySlug = new Map(videos.map((v) => [v.slug, v]));
  const hits = [];

  const push = (v, reason) => {
    if (!v) return;
    if (hits.some((h) => h.videoId === v.id)) return;
    hits.push({
      articleSlug: article.slug,
      videoId: v.id,
      videoSlug: v.slug,
      format: v.format,
      reason,
    });
  };

  if (article.relatedVideoId) push(byId.get(article.relatedVideoId), "relatedVideoId");
  if (article.relatedShortId) push(byId.get(article.relatedShortId), "relatedShortId");
  if (article.sourceVideoId) push(byId.get(article.sourceVideoId), "sourceVideoId");
  push(bySlug.get(article.slug), "exactSlug");

  for (const [key, slug] of Object.entries(EXPLICIT_VIDEO_TO_ARTICLE)) {
    if (slug !== article.slug) continue;
    push(byId.get(key) || bySlug.get(key), "explicitMap");
  }

  return hits;
}

async function main() {
  const articles = loadArticles();
  const { live, videos } = await loadVideos();
  const matched = [];
  const matchedVideoIds = new Set();
  const matchedArticleSlugs = new Set();

  for (const article of articles) {
    for (const hit of matchArticle(article, videos)) {
      matched.push(hit);
      matchedVideoIds.add(hit.videoId);
      matchedArticleSlugs.add(hit.articleSlug);
    }
  }

  for (const video of videos) {
    if (matchedVideoIds.has(video.id)) continue;
    const explicit =
      EXPLICIT_VIDEO_TO_ARTICLE[video.id] || EXPLICIT_VIDEO_TO_ARTICLE[video.slug];
    if (explicit && articles.some((a) => a.slug === explicit)) {
      matched.push({
        articleSlug: explicit,
        videoId: video.id,
        videoSlug: video.slug,
        format: video.format,
        reason: "explicitMap",
      });
      matchedVideoIds.add(video.id);
      matchedArticleSlugs.add(explicit);
      continue;
    }
    if (articles.some((a) => a.slug === video.slug)) {
      matched.push({
        articleSlug: video.slug,
        videoId: video.id,
        videoSlug: video.slug,
        format: video.format,
        reason: "exactSlug",
      });
      matchedVideoIds.add(video.id);
      matchedArticleSlugs.add(video.slug);
    }
  }

  const unmatchedVideos = videos.filter((v) => !matchedVideoIds.has(v.id));
  const unmatchedArticles = articles.filter((a) => !matchedArticleSlugs.has(a.slug));

  const lines = [];
  lines.push("# Video ↔ article link audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Video catalog: ${live ? "live YouTube API sample" : "fallback / offline catalog"} (${videos.length} items)`);
  lines.push(`Articles: ${articles.length}`);
  lines.push("");
  lines.push("Matching rules (deterministic only — no fuzzy title overlap):");
  lines.push("1. `relatedVideoId` / `relatedShortId` / `sourceVideoId` on the article");
  lines.push("2. Exact slug match (`article.slug` === `video.slug`)");
  lines.push("3. Explicit map in `src/lib/video-article-links.ts` (`EXPLICIT_VIDEO_TO_ARTICLE`)");
  lines.push("");
  lines.push("## Matched pairs");
  lines.push("");
  if (matched.length === 0) {
    lines.push("_None yet. Most SeeStew articles are research pieces without a same-slug YouTube counterpart._");
  } else {
    lines.push("| Article | Video / short | Format | Reason |");
    lines.push("| --- | --- | --- | --- |");
    for (const m of matched.sort((a, b) => a.articleSlug.localeCompare(b.articleSlug))) {
      lines.push(
        `| \`${m.articleSlug}\` | \`${m.videoSlug}\` (\`${m.videoId}\`) | ${m.format} | ${m.reason} |`
      );
    }
  }
  lines.push("");
  lines.push("## Unmatched videos / shorts");
  lines.push("");
  lines.push("Do **not** force weak links. Add an explicit map entry or `relatedVideoId` only when verified.");
  lines.push("");
  if (unmatchedVideos.length === 0) {
    lines.push("_All catalog videos matched._");
  } else {
    for (const v of unmatchedVideos) {
      lines.push(`- \`${v.slug}\` (\`${v.id}\`, ${v.format}) — ${v.title}`);
    }
  }
  lines.push("");
  lines.push("## Unmatched articles (no verified companion video)");
  lines.push("");
  lines.push(`${unmatchedArticles.length} of ${articles.length} articles have no deterministic video/short pair.`);
  lines.push("That is expected for research-first stories. Link when a true companion exists.");
  lines.push("");
  lines.push("<details><summary>Unmatched article slugs</summary>");
  lines.push("");
  for (const a of unmatchedArticles.sort((x, y) => x.slug.localeCompare(y.slug))) {
    lines.push(`- \`${a.slug}\``);
  }
  lines.push("");
  lines.push("</details>");
  lines.push("");

  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });
  writeFileSync(OUT, lines.join("\n"), "utf-8");
  console.log(`Wrote ${OUT}`);
  console.log(`Matched: ${matched.length}; unmatched videos: ${unmatchedVideos.length}; unmatched articles: ${unmatchedArticles.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
