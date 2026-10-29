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

import { readdirSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { validateStory, validateArticleFile } from "./article-validation.mjs";
import { createGenerator } from "./story-generator.mjs";
import { attachLocImage, assertLocalStoryCard } from "./story-images-loc.mjs";
import {
  loadQuickReadQueue,
  saveQuickReadQueue,
  pickNextQuickRead,
  markQuickReadPublished,
  countQrPending,
  MIN_QR_PENDING,
  REFILL_QR_THRESHOLD,
} from "./quick-read-queue.mjs";
import {
  runPrepublishGate,
  recordSuccessfulPublication,
  isHeld,
  markHeldForReview,
} from "./editorial/prepublish-gate.mjs";
import { canonicalEventIdFromSlug } from "./editorial/normalize.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const DRY_RUN =
  process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");
const TEST_MODE =
  process.env.SEESTEW_QR_TEST === "1" || process.argv.includes("--test");
if (TEST_MODE) process.env.SEESTEW_EDITORIAL_TEST = "1";
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
  if (!DRY_RUN && !TEST_MODE) saveQuickReadQueue(queue);

  const skipHeld = new Set(
    (queue.items || [])
      .filter((i) => i.status === "editorial_review" || isHeld(i.id))
      .map((i) => i.id)
  );
  const queueItem = pickNextQuickRead(
    {
      ...queue,
      items: (queue.items || []).filter((i) => !skipHeld.has(i.id)),
    },
    existingSlugs
  );
  if (!queueItem) {
    const msg =
      "No pending Quick Read topics available (or all held for review). Refill content/quick-read-queue.json — will not publish filler.";
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

  if (TEST_MODE) {
    console.log("\nTEST_MODE — full generation, no queue/index publish, artifacts cleaned up.");
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

  const parentArticleSlug =
    queueItem.parentArticleSlug ||
    (queueItem.relatedArticleSlugs && queueItem.relatedArticleSlugs[0]) ||
    null;
  const editorialAngle = queueItem.editorialAngle || queueItem.angle || null;
  const eventYear = queueItem.eventYear;
  const canonicalEventId =
    queueItem.canonicalEventId || canonicalEventIdFromSlug(draft.slug, eventYear);

  const gate = runPrepublishGate({
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    body: draft.content,
    eventYear,
    format: "quick-read",
    parentArticleSlug,
    editorialAngle,
    canonicalEventId,
    references: draft.references,
  });
  if (!gate.ok) {
    console.error(`\nEditorial gate: ${gate.action.toUpperCase()}`);
    console.error(JSON.stringify(gate.report.blocks.concat(gate.report.holds), null, 2));
    const qi = (queue.items || []).find((i) => i.id === queueItem.id);
    if (qi && !TEST_MODE) {
      qi.status = "editorial_review";
      qi.editorialHold = {
        action: gate.action,
        at: new Date().toISOString(),
        blocks: gate.report.blocks,
        holds: gate.report.holds,
        conflictSlug:
          gate.report.blocks[0]?.conflictSlug || gate.report.holds[0]?.conflictSlug || null,
      };
      saveQuickReadQueue(queue);
    }
    if (!TEST_MODE) markHeldForReview({
      slug: draft.slug,
      title: draft.title,
      format: "quick-read",
      action: gate.action,
      queueId: queueItem.id,
      blocks: gate.report.blocks,
      holds: gate.report.holds,
    });
    console.error(
      `::error::Quick Read editorial originality/fact gate — ${gate.action}; not publishing; marked for review`
    );
    process.exit(1);
  }
  console.log("Editorial originality + fact gate: PASS");

  const stats = validation.stats;
  console.log(`\nFinal: ${stats.bodyWords} body words, ${stats.citations} citations, ${stats.refs} refs`);

  const image = await attachLocImage(queueItem, draft.title, draft.slug);
  const asset = assertLocalStoryCard(draft.slug, image);
  if (!asset.ok) {
    console.error(`ERROR: No local story image — ${asset.errors.join("; ")}`);
    console.error(`::error::Quick Read missing image — ${asset.errors.join("; ")}`);
    process.exit(1);
  }
  console.log(`Local card: public/stories/${draft.slug}/card.jpg`);

  const bodyWords = stats.bodyWords;
  const readMinutes = Math.max(1, Math.min(3, Math.ceil(bodyWords / 200)));
  const now = new Date().toISOString();

  const article = {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    ...(draft.seoTitle ? { seoTitle: draft.seoTitle } : {}),
    ...(draft.seoDescription ? { seoDescription: draft.seoDescription } : {}),
    readMinutes,
    category: draft.category,
    format: "quick-read",
    ...(eventYear ? { eventYear } : {}),
    ...(queueItem.historicalEra ? { historicalEra: queueItem.historicalEra } : {}),
    ...(parentArticleSlug ? { parentArticleSlug } : {}),
    ...(editorialAngle ? { editorialAngle } : {}),
    canonicalEventId,
    ...(queueItem.relatedArticleSlugs?.length
      ? { relatedArticleSlugs: queueItem.relatedArticleSlugs }
      : parentArticleSlug
        ? { relatedArticleSlugs: [parentArticleSlug] }
        : {}),
    content: draft.content,
    references: draft.references,
    image,
    relatedVideoId: null,
    createdAt: now,
  };

  const fileCheck = validateArticleFile(article);
  if (!fileCheck.ok) {
    console.error(`ERROR: Article file validation failed: ${fileCheck.errors.join("; ")}`);
    console.error(`::error::Quick Read article validation failed — ${fileCheck.errors.join("; ")}`);
    process.exit(1);
  }

  if (TEST_MODE) {
    const tmpDir = join(process.cwd(), "tmp", "qr-test");
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, `${draft.slug}.json`), JSON.stringify(article, null, 2) + "\n", "utf-8");
    console.log(`\nTEST wrote tmp/qr-test/${draft.slug}.json`);
    console.log("Would commit:");
    console.log(`  content/articles/${draft.slug}.json`);
    console.log(`  public/stories/${draft.slug}/card.jpg`);
    console.log("  content/quick-read-queue.json");
    console.log("  content/editorial-event-index.json");
    const createdCardDir = join(process.cwd(), "public", "stories", draft.slug);
    if (existsSync(createdCardDir)) {
      rmSync(createdCardDir, { recursive: true, force: true });
      console.log(`TEST cleanup: removed ${createdCardDir}`);
    }
    console.log("TEST_MODE complete — queue and index unchanged; nothing published.");
    process.exit(0);
  }

  writeFileSync(join(CONTENT_DIR, `${draft.slug}.json`), JSON.stringify(article, null, 2) + "\n", "utf-8");
  markQuickReadPublished(queue, queueItem.id, draft.slug);
  saveQuickReadQueue(queue);
  recordSuccessfulPublication({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.content,
    eventYear,
    format: "quick-read",
    publishedAt: now,
    parentArticleSlug,
    editorialAngle,
    canonicalEventId,
  });

  console.log(`\nSaved: content/articles/${draft.slug}.json`);
  console.log(`Updated: content/quick-read-queue.json`);
  console.log("Updated: content/editorial-event-index.json");
  console.log("Done.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  console.error(`::error::Quick Read fatal: ${e.message}`);
  process.exit(1);
});
