#!/usr/bin/env node
/**
 * Quick Read generator — separate queue (content/quick-read-queue.json).
 * Does NOT consume full-story story-queue.json items.
 *
 * Env:
 *   OPENROUTER_API_KEY (required unless --dry-run)
 *   OPENROUTER_MODEL (optional)
 *   DRY_RUN=1 or --dry-run — select next topic only, write nothing
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { validateStory } from "./article-validation.mjs";
import { createGenerator } from "./story-generator.mjs";
import { attachLocImage } from "./story-images-loc.mjs";
import {
  loadQuickReadQueue,
  saveQuickReadQueue,
  pickNextQuickRead,
  markQuickReadPublished,
  countQrPending,
  MIN_QR_PENDING,
  REFILL_QR_THRESHOLD,
} from "./quick-read-queue.mjs";

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
  console.log("=== SeeStew Quick Read Generator ===\n");
  mkdirSync(CONTENT_DIR, { recursive: true });

  const queue = loadQuickReadQueue();
  const pending = countQrPending(queue);
  console.log(`QR queue pending: ${pending}`);
  if (pending < REFILL_QR_THRESHOLD) {
    console.warn(
      `::warning::Quick Read queue critically low (${pending} < ${REFILL_QR_THRESHOLD}). Add topics to content/quick-read-queue.json.`
    );
  } else if (pending < MIN_QR_PENDING) {
    console.warn(
      `::warning::Quick Read queue below healthy cadence (${pending} < ${MIN_QR_PENDING}).`
    );
  }

  const existingSlugs = getExistingSlugs();
  for (const item of queue.items || []) {
    if (item.status === "pending" && existingSlugs.has(item.id)) {
      item.status = "published";
      item.publishedSlug = item.id;
      item.publishedAt = item.publishedAt || new Date().toISOString();
    }
  }
  if (!DRY_RUN) saveQuickReadQueue(queue);

  const queueItem = pickNextQuickRead(queue, existingSlugs);
  if (!queueItem) {
    const msg =
      "No pending Quick Read topics available. Refill content/quick-read-queue.json — will not publish filler.";
    console.error(`ERROR: ${msg}`);
    console.error(`::error::${msg}`);
    process.exit(1);
  }

  console.log(`Queue topic: ${queueItem.id}`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Sources: ${(queueItem.requiredSources || []).length}`);

  if (DRY_RUN) {
    console.log("\nDRY_RUN=1 — selected topic only; no LLM call, no files written.");
    process.exit(0);
  }

  if (!OPENROUTER_API_KEY) {
    console.error("ERROR: OPENROUTER_API_KEY is required.");
    console.error("::error::OPENROUTER_API_KEY missing for Quick Read publish");
    process.exit(1);
  }

  const generator = createGenerator({ apiKey: OPENROUTER_API_KEY, primaryModel: PRIMARY_MODEL });
  let draft;
  try {
    draft = await generator.generateQuickReadForQueueItem(queueItem);
  } catch (e) {
    console.error(`\nFAILED: ${e.message}`);
    console.error(`::error::Quick Read generation failed: ${e.message}`);
    process.exit(1);
  }

  const validation = validateStory(draft, {
    allowedSources: queueItem.requiredSources,
    format: "quick-read",
  });
  if (!validation.ok) {
    console.error(`Validation failed: ${validation.errors.join("; ")}`);
    console.error(`::error::Quick Read quality gate failed — not publishing`);
    process.exit(1);
  }

  const stats = validation.stats;
  console.log(`\nFinal: ${stats.bodyWords} body words, ${stats.citations} citations, ${stats.refs} refs`);

  const image = await attachLocImage(queueItem, draft.title, draft.slug);
  if (!image.card) {
    console.error("ERROR: No story image available — refusing to publish Quick Read without image.");
    console.error("::error::Quick Read missing image");
    process.exit(1);
  }

  const bodyWords = stats.bodyWords;
  const readMinutes = Math.max(1, Math.min(3, Math.ceil(bodyWords / 200)));

  const article = {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    ...(draft.seoTitle ? { seoTitle: draft.seoTitle } : {}),
    ...(draft.seoDescription ? { seoDescription: draft.seoDescription } : {}),
    readMinutes,
    category: draft.category,
    format: "quick-read",
    ...(queueItem.eventYear ? { eventYear: queueItem.eventYear } : {}),
    ...(queueItem.historicalEra ? { historicalEra: queueItem.historicalEra } : {}),
    ...(queueItem.relatedArticleSlugs?.length
      ? { relatedArticleSlugs: queueItem.relatedArticleSlugs }
      : {}),
    content: draft.content,
    references: draft.references,
    image,
    relatedVideoId: null,
    createdAt: new Date().toISOString(),
  };

  writeFileSync(join(CONTENT_DIR, `${draft.slug}.json`), JSON.stringify(article, null, 2) + "\n", "utf-8");
  markQuickReadPublished(queue, queueItem.id, draft.slug);
  saveQuickReadQueue(queue);

  console.log(`\nSaved: content/articles/${draft.slug}.json`);
  console.log(`Updated: content/quick-read-queue.json`);
  console.log("Done.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  console.error(`::error::Quick Read fatal: ${e.message}`);
  process.exit(1);
});
