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
  ensureQrQueueDepth,
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
const MAX_ATTEMPTS = Number(process.env.SEESTEW_QR_MAX_ATTEMPTS || 3);

function getExistingSlugs() {
  if (!existsSync(CONTENT_DIR)) return new Set();
  return new Set(
    readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

function holdQrItem(queue, queueItem, draft, gate) {
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
  if (!TEST_MODE) {
    markHeldForReview({
      slug: draft?.slug || queueItem.id,
      title: draft?.title || queueItem.title,
      format: "quick-read",
      action: gate.action,
      queueId: queueItem.id,
      blocks: gate.report.blocks,
      holds: gate.report.holds,
    });
  }
}

async function attemptQr(queueItem, queue, generator) {
  console.log(`\n--- Attempt: ${queueItem.id} ---`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Sources: ${(queueItem.requiredSources || []).length}`);

  let draft;
  try {
    draft = await generator.generateQuickReadForQueueItem(queueItem);
  } catch (e) {
    console.error(`Generation failed for ${queueItem.id}: ${e.message}`);
    console.error(`::warning::Quick Read generation failed for ${queueItem.id}: ${e.message}`);
    return { ok: false };
  }

  const validation = validateStory(draft, {
    allowedSources: queueItem.requiredSources,
    format: "quick-read",
  });
  if (!validation.ok) {
    console.error(`Validation failed: ${validation.errors.join("; ")}`);
    holdQrItem(queue, queueItem, draft, {
      action: "hold_for_review",
      report: {
        blocks: validation.errors.map((e) => ({ reason: "quality_gate", detail: e })),
        holds: [{ reason: "quality_gate", errors: validation.errors }],
      },
    });
    console.error(`::warning::Quick Read quality gate — held ${queueItem.id}; trying next`);
    return { ok: false };
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
    holdQrItem(queue, queueItem, draft, gate);
    console.error(
      `::warning::Quick Read editorial gate — ${gate.action} for ${queueItem.id}; held; trying next`
    );
    return { ok: false };
  }
  console.log("Editorial originality + fact gate: PASS");

  const stats = validation.stats;
  console.log(`\nFinal: ${stats.bodyWords} body words, ${stats.citations} citations, ${stats.refs} refs`);

  const image = await attachLocImage(queueItem, draft.title, draft.slug);
  const asset = assertLocalStoryCard(draft.slug, image);
  if (!asset.ok) {
    console.error(`ERROR: No local story image — ${asset.errors.join("; ")}`);
    holdQrItem(queue, queueItem, draft, {
      action: "hold_for_review",
      report: {
        blocks: [],
        holds: [{ reason: "missing_image", errors: asset.errors }],
      },
    });
    const createdCardDir = join(process.cwd(), "public", "stories", draft.slug);
    if (existsSync(createdCardDir)) rmSync(createdCardDir, { recursive: true, force: true });
    console.error(`::warning::Quick Read missing image for ${queueItem.id}; held; trying next`);
    return { ok: false };
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
    holdQrItem(queue, queueItem, draft, {
      action: "hold_for_review",
      report: {
        blocks: fileCheck.errors.map((e) => ({ reason: "file_validation", detail: e })),
        holds: [{ reason: "file_validation", errors: fileCheck.errors }],
      },
    });
    return { ok: false };
  }

  if (TEST_MODE) {
    const tmpDir = join(process.cwd(), "tmp", "qr-test");
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, `${draft.slug}.json`), JSON.stringify(article, null, 2) + "\n", "utf-8");
    console.log(`\nTEST wrote tmp/qr-test/${draft.slug}.json`);
    const createdCardDir = join(process.cwd(), "public", "stories", draft.slug);
    if (existsSync(createdCardDir)) {
      rmSync(createdCardDir, { recursive: true, force: true });
      console.log(`TEST cleanup: removed ${createdCardDir}`);
    }
    console.log("TEST_MODE complete — queue and index unchanged; nothing published.");
    return { ok: true, test: true, slug: draft.slug };
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
  return { ok: true, slug: draft.slug };
}

async function main() {
  console.log("=== SeeStew Quick Read Generator ===\n");
  mkdirSync(CONTENT_DIR, { recursive: true });

  const queue = loadQuickReadQueue();
  const depth = ensureQrQueueDepth(queue);
  if (depth.added > 0) {
    if (!DRY_RUN && !TEST_MODE) saveQuickReadQueue(queue);
    console.log(`Merged ${depth.added} curated Quick Read topic(s).`);
  }
  const pending = countQrPending(queue);
  console.log(`QR queue pending: ${pending} (target ≥ ${MIN_QR_PENDING})`);
  if (pending < REFILL_QR_THRESHOLD) {
    console.warn(
      `::warning::Quick Read queue critically low (${pending} < ${REFILL_QR_THRESHOLD}). Run replenish-queues.`
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

  if (DRY_RUN) {
    const queueItem = pickNextQuickRead(
      {
        ...queue,
        items: (queue.items || []).filter((i) => !skipHeld.has(i.id)),
      },
      existingSlugs
    );
    if (!queueItem) {
      console.error("ERROR: No pending Quick Read topics available.");
      process.exit(1);
    }
    console.log(`Queue topic: ${queueItem.id}`);
    console.log(`Title: ${queueItem.title}`);
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
  const tried = new Set();
  let published = null;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    const queueItem = pickNextQuickRead(
      {
        ...queue,
        items: (queue.items || []).filter((i) => !tried.has(i.id) && !skipHeld.has(i.id)),
      },
      existingSlugs
    );
    if (!queueItem) break;
    tried.add(queueItem.id);
    attempts += 1;
    const result = await attemptQr(queueItem, queue, generator);
    if (result.ok) {
      published = result;
      break;
    }
    for (const i of queue.items || []) {
      if (i.status === "editorial_review") skipHeld.add(i.id);
    }
  }

  if (!published) {
    const msg = `No Quick Read published this run after ${attempts} attempt(s). Holds persisted; will not publish filler.`;
    console.error(`ERROR: ${msg}`);
    console.error(`::error::${msg}`);
    process.exit(1);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  console.error(`::error::Quick Read fatal: ${e.message}`);
  process.exit(1);
});
