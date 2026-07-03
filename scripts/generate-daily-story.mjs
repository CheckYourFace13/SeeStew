#!/usr/bin/env node
/**
 * Daily story generator — curated queue + Markdown-only model output.
 * Generation core lives in story-generator.mjs; this script owns the queue,
 * image handling, and final JSON assembly.
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { validateStory } from "./article-validation.mjs";
import {
  initQueueFileIfNeeded,
  loadQueue,
  saveQueue,
  pickNextQueueItem,
  markQueueItemPublished,
} from "./story-queue.mjs";
import { createGenerator } from "./story-generator.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const PUBLIC_STORIES = join(process.cwd(), "public", "stories");
const MIN_IMAGE_BYTES = 15000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

if (!OPENROUTER_API_KEY) {
  console.error("ERROR: OPENROUTER_API_KEY is required.");
  process.exit(1);
}

function getExistingSlugs() {
  if (!existsSync(CONTENT_DIR)) return new Set();
  return new Set(
    readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

async function searchLocImage(terms) {
  const query = (Array.isArray(terms) ? terms.join(" ") : terms || "").slice(0, 120);
  try {
    const params = new URLSearchParams({ q: query, fo: "json", at: "results", c: "5", sp: "1" });
    const res = await fetch(`https://www.loc.gov/search/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.results || []) {
      const raw = item.image_url;
      const imageUrl = Array.isArray(raw) ? raw[0] : raw;
      if (imageUrl?.includes("loc.gov")) {
        return { imageUrl, pageUrl: item.url, title: item.title };
      }
    }
  } catch {}
  return null;
}

async function downloadLocalCard(slug, remoteUrl) {
  if (!remoteUrl?.startsWith("https://")) return null;
  const variants = [
    remoteUrl.split("#")[0],
    remoteUrl.replace(/_150px\.jpg/, "r.jpg").split("#")[0],
    remoteUrl.replace(/t\.gif/, "r.jpg").split("#")[0],
  ];
  const seen = new Set();
  for (const url of variants) {
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const res = await fetch(url, { headers: { "User-Agent": "SeeStew/1.0" } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_IMAGE_BYTES) continue;
      const dir = join(PUBLIC_STORIES, slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "card.jpg"), buf);
      return `/stories/${slug}/card.jpg`;
    } catch {
      /* try next variant */
    }
  }
  return null;
}

async function attachImage(queueItem, title, slug) {
  const loc = await searchLocImage(queueItem.imageSearchTerms);
  if (loc?.imageUrl) {
    const localPath = await downloadLocalCard(slug, loc.imageUrl);
    const card = localPath || loc.imageUrl;
    return {
      card,
      hero: card,
      alt: loc.title || title,
      credit: "Library of Congress",
      sourcePageUrl: loc.pageUrl,
    };
  }
  return {
    imagePrompt: `Historic editorial illustration: ${queueItem.title}. ${queueItem.angle}. Period-accurate, muted tones, no text, no logos.`,
    alt: title,
  };
}

async function main() {
  console.log("=== SeeStew Daily Story Generator (Markdown) ===\n");

  mkdirSync(CONTENT_DIR, { recursive: true });
  initQueueFileIfNeeded();

  const queue = loadQueue();
  const existingSlugs = getExistingSlugs();
  const queueItem = pickNextQueueItem(queue, existingSlugs);

  if (!queueItem) {
    console.error("No pending queue topics available.");
    console.error(`  Pending: ${queue.items.filter((i) => i.status === "pending").length}`);
    process.exit(1);
  }

  console.log(`Queue topic: ${queueItem.id}`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Curated sources: ${queueItem.requiredSources.length}`);
  console.log(`Primary model: ${PRIMARY_MODEL}\n`);

  const generator = createGenerator({ apiKey: OPENROUTER_API_KEY, primaryModel: PRIMARY_MODEL });

  let draft;
  try {
    draft = await generator.generateForQueueItem(queueItem);
  } catch (e) {
    console.error(`\nFAILED: ${e.message}`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const stats = validateStory(draft, { allowedSources: queueItem.requiredSources }).stats;

  console.log(`\nFinal: ${stats.words} words, ${stats.citations} citations, ${stats.refs} refs`);

  const image = await attachImage(queueItem, draft.title, draft.slug);
  console.log(
    `Image: ${
      image.card?.startsWith("/stories/")
        ? "local LOC"
        : image.card
          ? "remote LOC (fetch step will localize)"
          : "no match (fetch step will search LOC + Wikimedia)"
    }`
  );

  const article = {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    readMinutes: Math.max(5, Math.ceil(stats.words / 220)),
    category: draft.category,
    content: draft.content,
    references: draft.references,
    image,
    relatedVideoId: null,
    createdAt: now,
  };

  writeFileSync(join(CONTENT_DIR, `${draft.slug}.json`), JSON.stringify(article, null, 2), "utf-8");
  markQueueItemPublished(queue, queueItem.id, draft.slug);
  saveQueue(queue);

  console.log(`\nSaved: content/articles/${draft.slug}.json`);
  console.log(`Updated: content/story-queue.json`);
  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
