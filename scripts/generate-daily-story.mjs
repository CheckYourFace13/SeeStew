#!/usr/bin/env node
/**
 * Daily story generator — curated queue + Markdown-only model output.
 * Generation core lives in story-generator.mjs; this script owns the queue,
 * image handling, and final JSON assembly.
 *
 * DRY_RUN=1 / --dry-run — select next topic only (no LLM, no write).
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
  ensureQueueDepth,
  countPending,
  MIN_PENDING_TOPICS,
  REFILL_PENDING_THRESHOLD,
} from "./story-queue.mjs";
import { createGenerator } from "./story-generator.mjs";
import { attachLocImage } from "./story-images-loc.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const DRY_RUN =
  process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

function getExistingSlugs() {
  if (!existsSync(CONTENT_DIR)) return new Set();
  return new Set(
    readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

async function main() {
  console.log("=== SeeStew Daily Story Generator (Markdown) ===\n");

  mkdirSync(CONTENT_DIR, { recursive: true });
  initQueueFileIfNeeded();

  const queue = loadQueue();
  const depth = ensureQueueDepth(queue);
  if (depth.added > 0) {
    if (!DRY_RUN) saveQueue(queue);
    console.log(`Merged ${depth.added} new curated topic(s) into the story queue.`);
  }
  console.log(`Queue depth: ${depth.pending} pending (target ≥ ${MIN_PENDING_TOPICS}).`);

  if (depth.pending === 0) {
    const msg =
      "Story queue is EMPTY — no pending curated topics. Refusing to invent filler. Add scripts/story-queue-batch-*.mjs and register in story-queue.mjs.";
    console.error(`ERROR: ${msg}`);
    console.error(`::error::${msg}`);
    process.exit(1);
  }
  if (depth.pending < REFILL_PENDING_THRESHOLD) {
    console.warn(
      `::warning::Story queue below refill threshold (${depth.pending} < ${REFILL_PENDING_THRESHOLD}). Add another curated batch soon.`
    );
  } else if (!depth.ok) {
    console.warn(
      `::warning::Story queue below reserve (${depth.pending} < ${MIN_PENDING_TOPICS}). Add scripts/story-queue-batch-*.mjs.`
    );
  }

  const existingSlugs = getExistingSlugs();
  for (const item of queue.items) {
    if (item.status === "pending" && existingSlugs.has(item.id)) {
      item.status = "published";
      item.publishedSlug = item.id;
      item.publishedAt = item.publishedAt || new Date().toISOString();
    }
  }
  if (!DRY_RUN) saveQueue(queue);

  const queueItem = pickNextQueueItem(queue, existingSlugs);

  if (!queueItem) {
    const pending = countPending(queue);
    const msg = `No selectable pending full-story topic (pending marker count=${pending}; all may collide with existing slugs). Will not publish filler.`;
    console.error(`ERROR: ${msg}`);
    console.error(`::error::${msg}`);
    process.exit(1);
  }

  console.log(`Queue topic: ${queueItem.id}`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Curated sources: ${queueItem.requiredSources.length}`);
  console.log(`Primary model: ${PRIMARY_MODEL}\n`);

  if (DRY_RUN) {
    console.log("DRY_RUN=1 — selected topic only; no LLM call, no article written.");
    process.exit(0);
  }

  if (!OPENROUTER_API_KEY) {
    console.error("ERROR: OPENROUTER_API_KEY is required.");
    console.error("::error::OPENROUTER_API_KEY missing for daily story publish");
    process.exit(1);
  }

  const generator = createGenerator({ apiKey: OPENROUTER_API_KEY, primaryModel: PRIMARY_MODEL });

  let draft;
  try {
    draft = await generator.generateForQueueItem(queueItem);
  } catch (e) {
    console.error(`\nFAILED: ${e.message}`);
    console.error(`::error::Daily story generation failed: ${e.message}`);
    process.exit(1);
  }

  const validation = validateStory(draft, { allowedSources: queueItem.requiredSources });
  if (!validation.ok) {
    console.error(`Validation failed: ${validation.errors.join("; ")}`);
    console.error(`::error::Daily story quality gate failed — not publishing`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const stats = validation.stats;

  console.log(`\nFinal: ${stats.words} words, ${stats.citations} citations, ${stats.refs} refs`);

  const image = await attachLocImage(queueItem, draft.title, draft.slug);
  console.log(
    `Image: ${
      image.card?.startsWith("/stories/")
        ? "local LOC"
        : image.card
          ? "remote LOC (fetch step will localize)"
          : "no match (fetch step will search LOC + Wikimedia)"
    }`
  );

  const eventYear =
    queueItem.eventYear ??
    (() => {
      const m = `${draft.slug} ${draft.title}`.match(/\b((?:1[6-9]\d{2}|20[0-2]\d))\b/);
      return m ? Number(m[1]) : undefined;
    })();
  const historicalEra = queueItem.historicalEra || undefined;

  const article = {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    ...(draft.seoTitle ? { seoTitle: draft.seoTitle } : {}),
    ...(draft.seoDescription ? { seoDescription: draft.seoDescription } : {}),
    readMinutes: Math.max(5, Math.ceil(stats.words / 220)),
    category: draft.category,
    format: "full",
    ...(eventYear ? { eventYear } : {}),
    ...(historicalEra ? { historicalEra } : {}),
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
  console.error(`::error::Daily story fatal: ${e.message}`);
  process.exit(1);
});
