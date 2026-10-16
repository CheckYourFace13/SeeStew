/**
 * Reusable library event index for duplicate / overlap detection.
 * Deterministic, incremental, no LLM required.
 * Articles live as content/articles/*.json (not Markdown).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  stripMarkdown,
  tokenize,
  shingles,
  extractPlaces,
  extractNamedHints,
  openingSentences,
  canonicalEventIdFromSlug,
  titleEventKey,
  yearFromText,
} from "./normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const INDEX_PATH = path.join(ROOT, "content", "editorial-event-index.json");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const QUEUE_PATH = path.join(ROOT, "content", "story-queue.json");
const QR_QUEUE_PATH = path.join(ROOT, "content", "quick-read-queue.json");

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

export function articleToIndexEntry(data, body, source = "published") {
  const title = data.title || "";
  const excerpt = data.excerpt || "";
  const slug = data.slug || "";
  const eventYear =
    data.eventYear ?? yearFromText(title) ?? yearFromText(String(body || "").slice(0, 800));
  const format = data.format === "quick-read" ? "quick-read" : "full";
  const plain = stripMarkdown(body || "");
  const blob = `${title} ${excerpt} ${plain.slice(0, 2500)}`;
  const tokens = tokenize(blob);
  const parent =
    data.parentArticleSlug ||
    (Array.isArray(data.relatedArticleSlugs) && data.relatedArticleSlugs[0]) ||
    null;
  return {
    slug,
    title,
    excerpt,
    format,
    source,
    eventYear: eventYear ?? null,
    publishedAt: data.publishedAt || data.createdAt || null,
    parentArticleSlug: parent,
    editorialAngle: data.editorialAngle || data.angle || null,
    canonicalEventId:
      data.canonicalEventId || canonicalEventIdFromSlug(slug, eventYear),
    titleEventKey: titleEventKey(title, eventYear),
    places: extractPlaces(blob),
    namedHints: extractNamedHints(title),
    opening: openingSentences(body || "", 2),
    tokenSet: [...new Set(tokens)].slice(0, 400),
    shingleSet: [...new Set(shingles(tokens, 3))].slice(0, 500),
    contentChars: plain.length,
  };
}

export function loadPublishedArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = loadJson(path.join(ARTICLES_DIR, f), null);
      if (!data) return null;
      if (!data.slug) data.slug = f.replace(/\.json$/, "");
      return articleToIndexEntry(data, data.content || "", "published");
    })
    .filter(Boolean);
}

function queueItemToEntry(item, source, defaultFormat) {
  const slug = item.id || item.slug;
  const body = [
    item.hook || "",
    item.angle || "",
    item.excerpt || "",
    ...(item.keywords || []),
  ].join("\n");
  return articleToIndexEntry(
    {
      slug,
      title: item.title,
      excerpt: item.hook || item.excerpt || "",
      eventYear: item.eventYear,
      format: item.format || defaultFormat,
      canonicalEventId: item.canonicalEventId,
      parentArticleSlug:
        item.parentArticleSlug ||
        (item.relatedArticleSlugs && item.relatedArticleSlugs[0]) ||
        null,
      editorialAngle: item.editorialAngle || item.angle || null,
      relatedArticleSlugs: item.relatedArticleSlugs,
    },
    body,
    source
  );
}

export function loadQueueCandidates() {
  const out = [];
  const fullQ = loadJson(QUEUE_PATH, { items: [] });
  for (const s of fullQ.items || []) {
    if (s.status && s.status !== "pending") continue;
    out.push(queueItemToEntry(s, "queue-full", "full"));
  }
  const qrQ = loadJson(QR_QUEUE_PATH, { items: [] });
  for (const s of qrQ.items || []) {
    if (s.status && s.status !== "pending") continue;
    out.push(queueItemToEntry(s, "queue-quick-read", "quick-read"));
  }
  return out;
}

export function buildEventIndex({ includeQueues = true } = {}) {
  const published = loadPublishedArticles();
  const queued = includeQueues ? loadQueueCandidates() : [];
  const bySlug = {};
  for (const e of published) bySlug[e.slug] = e;
  // Queued topics use id as slug; do not overwrite published
  for (const e of queued) {
    if (!bySlug[e.slug]) bySlug[e.slug] = e;
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    publishedCount: published.length,
    queueCount: queued.length,
    entries: Object.values(bySlug),
  };
}

/** Persist metadata only — rebuild token/shingle sets from articles on load. */
export function saveEventIndex(index, filePath = INDEX_PATH) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const compact = {
    version: index.version || 1,
    generatedAt: index.generatedAt || new Date().toISOString(),
    publishedCount: index.publishedCount,
    queueCount: index.queueCount,
    entries: (index.entries || []).map((e) => ({
      slug: e.slug,
      title: e.title,
      excerpt: e.excerpt,
      format: e.format,
      source: e.source,
      eventYear: e.eventYear,
      publishedAt: e.publishedAt,
      parentArticleSlug: e.parentArticleSlug,
      editorialAngle: e.editorialAngle,
      canonicalEventId: e.canonicalEventId,
      titleEventKey: e.titleEventKey,
      places: e.places || [],
      namedHints: e.namedHints || [],
      opening: e.opening || "",
      contentChars: e.contentChars || 0,
    })),
  };
  fs.writeFileSync(filePath, JSON.stringify(compact, null, 2) + "\n", "utf8");
  return filePath;
}

/**
 * Load index. For the production path, rebuild from articles/queues so
 * token/shingle sets are fresh without storing them in git.
 * Custom paths (tests) return the compact file as written.
 */
export function loadEventIndex(filePath = INDEX_PATH) {
  if (!fs.existsSync(filePath)) return null;
  if (path.resolve(filePath) === path.resolve(INDEX_PATH)) {
    return buildEventIndex({ includeQueues: true });
  }
  return loadJson(filePath, null);
}

/** Upsert one published entry and rewrite index (incremental after publish). */
export function upsertPublishedEntry(entry, filePath = INDEX_PATH) {
  const isProd = path.resolve(filePath) === path.resolve(INDEX_PATH);
  let index = isProd
    ? buildEventIndex({ includeQueues: true })
    : loadEventIndex(filePath) || { version: 1, entries: [] };
  const others = (index.entries || []).filter((e) => e.slug !== entry.slug);
  entry.source = "published";
  others.push(entry);
  index.entries = others;
  index.publishedCount = others.filter((e) => e.source === "published").length;
  index.queueCount = others.filter((e) => String(e.source).startsWith("queue")).length;
  index.generatedAt = new Date().toISOString();
  saveEventIndex(index, filePath);
  // Return in-memory index (with tokens) for callers/tests
  return index;
}

export function getIndexPath() {
  return INDEX_PATH;
}

export { ROOT, ARTICLES_DIR, QUEUE_PATH, QR_QUEUE_PATH };
