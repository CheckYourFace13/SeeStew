#!/usr/bin/env node
/**
 * Daily story generator — curated queue + Markdown-only model output.
 * Generation core lives in story-generator.mjs; this script owns the queue,
 * image handling, and final JSON assembly.
 *
 * On editorial gate failure: hold the candidate, continue to the next pending
 * topic (cost-capped). Never bypass gates. Never retry the same held id.
 *
 * DRY_RUN=1 / --dry-run — select next topic only (no LLM, no write).
 */

import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  rmSync,
} from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
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
import { attachLocImage, assertLocalStoryCard } from "./story-images-loc.mjs";
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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
/** Max full generations per run after holds (cost control). */
const MAX_ATTEMPTS = Number(process.env.SEESTEW_DAILY_MAX_ATTEMPTS || 3);

function getExistingSlugs() {
  if (!existsSync(CONTENT_DIR)) return new Set();
  return new Set(
    readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

function holdQueueItem(queue, queueItem, draft, gate) {
  const qi = queue.items.find((i) => i.id === queueItem.id);
  if (qi) {
    qi.status = "editorial_review";
    qi.editorialHold = {
      action: gate.action,
      at: new Date().toISOString(),
      blocks: gate.report.blocks,
      holds: gate.report.holds,
      conflictSlug:
        gate.report.blocks[0]?.conflictSlug || gate.report.holds[0]?.conflictSlug || null,
    };
    saveQueue(queue);
  }
  markHeldForReview({
    slug: draft?.slug || queueItem.id,
    title: draft?.title || queueItem.title,
    format: "full",
    action: gate.action,
    queueId: queueItem.id,
    blocks: gate.report.blocks,
    holds: gate.report.holds,
  });
}

function holdForImage(queue, queueItem, draft, errors) {
  const qi = queue.items.find((i) => i.id === queueItem.id);
  if (qi) {
    qi.status = "editorial_review";
    qi.editorialHold = {
      action: "hold_for_review",
      at: new Date().toISOString(),
      blocks: [],
      holds: [{ reason: "missing_image", errors }],
    };
    saveQueue(queue);
  }
  markHeldForReview({
    slug: draft.slug,
    title: draft.title,
    format: "full",
    action: "hold_for_review",
    queueId: queueItem.id,
    blocks: [],
    holds: [{ reason: "missing_image", errors }],
  });
}

function cleanupFailedArticle(slug) {
  const art = join(CONTENT_DIR, `${slug}.json`);
  if (existsSync(art)) unlinkSync(art);
  const dir = join(process.cwd(), "public", "stories", slug);
  if (existsSync(dir)) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function fetchImageForSlug(slug) {
  const r = spawnSync(
    process.execPath,
    ["scripts/fetch-all-story-images.mjs", `--only=${slug}`],
    { cwd: process.cwd(), encoding: "utf8", env: process.env }
  );
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status === 0;
}

async function attemptPublish(queueItem, queue, generator, existingSlugs) {
  console.log(`\n--- Attempt: ${queueItem.id} ---`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Curated sources: ${queueItem.requiredSources.length}`);

  let draft;
  try {
    draft = await generator.generateForQueueItem(queueItem);
  } catch (e) {
    console.error(`Generation failed for ${queueItem.id}: ${e.message}`);
    console.error(`::warning::Daily story generation failed for ${queueItem.id}: ${e.message}`);
    return { ok: false, retryable: true, reason: "generation_failed" };
  }

  const validation = validateStory(draft, { allowedSources: queueItem.requiredSources });
  if (!validation.ok) {
    console.error(`Validation failed: ${validation.errors.join("; ")}`);
    holdQueueItem(queue, queueItem, draft, {
      action: "hold_for_review",
      report: {
        blocks: validation.errors.map((e) => ({ reason: "quality_gate", detail: e })),
        holds: [{ reason: "quality_gate", errors: validation.errors }],
      },
    });
    console.error(
      `::warning::Daily story quality gate — held ${queueItem.id}; trying next candidate`
    );
    return { ok: false, retryable: true, reason: "quality_gate" };
  }

  const eventYear =
    queueItem.eventYear ??
    (() => {
      const m = `${draft.slug} ${draft.title}`.match(/\b((?:1[6-9]\d{2}|20[0-2]\d))\b/);
      return m ? Number(m[1]) : undefined;
    })();
  const historicalEra = queueItem.historicalEra || undefined;
  const canonicalEventId =
    queueItem.canonicalEventId || canonicalEventIdFromSlug(draft.slug, eventYear);

  const gate = runPrepublishGate({
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    body: draft.content,
    eventYear,
    format: "full",
    canonicalEventId,
    references: draft.references,
  });
  if (!gate.ok) {
    console.error(`\nEditorial gate: ${gate.action.toUpperCase()}`);
    console.error(JSON.stringify(gate.report.blocks.concat(gate.report.holds), null, 2));
    holdQueueItem(queue, queueItem, draft, gate);
    console.error(
      `::warning::Daily story editorial gate — ${gate.action} for ${queueItem.id}; held; trying next approved candidate`
    );
    return { ok: false, retryable: true, reason: "editorial_gate" };
  }
  console.log("Editorial originality + fact gate: PASS");

  const now = new Date().toISOString();
  const stats = validation.stats;
  console.log(`\nFinal: ${stats.words} words, ${stats.citations} citations, ${stats.refs} refs`);

  let image = await attachLocImage(queueItem, draft.title, draft.slug);
  let asset = assertLocalStoryCard(draft.slug, image);

  const articlePath = join(CONTENT_DIR, `${draft.slug}.json`);
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
    canonicalEventId,
    content: draft.content,
    references: draft.references,
    image,
    relatedVideoId: null,
    createdAt: now,
  };

  // Write draft so fetch-all can update image metadata; do NOT mark published yet.
  writeFileSync(articlePath, JSON.stringify(article, null, 2), "utf-8");

  if (!asset.ok) {
    console.warn(
      `Local card missing after LOC attach (${asset.errors.join("; ")}); running targeted image fetch...`
    );
    fetchImageForSlug(draft.slug);
    try {
      const reloaded = JSON.parse(readFileSync(articlePath, "utf-8"));
      image = reloaded.image || image;
    } catch {
      /* keep */
    }
    asset = assertLocalStoryCard(draft.slug, image);
  }

  if (!asset.ok) {
    console.error(`ERROR: No local story image — ${asset.errors.join("; ")}`);
    cleanupFailedArticle(draft.slug);
    holdForImage(queue, queueItem, draft, asset.errors);
    console.error(
      `::warning::Daily story missing image for ${queueItem.id}; held; trying next candidate`
    );
    return { ok: false, retryable: true, reason: "missing_image" };
  }

  article.image = image;
  writeFileSync(articlePath, JSON.stringify(article, null, 2), "utf-8");
  markQueueItemPublished(queue, queueItem.id, draft.slug);
  saveQueue(queue);
  recordSuccessfulPublication({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.content,
    eventYear,
    format: "full",
    publishedAt: now,
    canonicalEventId,
  });
  existingSlugs.add(draft.slug);

  console.log(`Local card: public/stories/${draft.slug}/card.jpg`);
  console.log(`\nSaved: content/articles/${draft.slug}.json`);
  console.log(`Updated: content/story-queue.json`);
  console.log("Updated: content/editorial-event-index.json");
  return { ok: true, slug: draft.slug };
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
      `::warning::Story queue below refill threshold (${depth.pending} < ${REFILL_PENDING_THRESHOLD}). Run replenish-queues.`
    );
  } else if (!depth.ok) {
    console.warn(
      `::warning::Story queue below reserve (${depth.pending} < ${MIN_PENDING_TOPICS}). Run replenish-queues.`
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

  const skipHeld = new Set(
    (queue.items || [])
      .filter((i) => i.status === "editorial_review" || isHeld(i.id))
      .map((i) => i.id)
  );

  if (DRY_RUN) {
    const next = pickNextQueueItem(
      {
        ...queue,
        items: queue.items.filter((i) => !skipHeld.has(i.id)),
      },
      existingSlugs
    );
    if (!next) {
      console.error("ERROR: No selectable pending full-story topic.");
      process.exit(1);
    }
    console.log(`Queue topic: ${next.id}`);
    console.log(`Title: ${next.title}`);
    console.log("DRY_RUN=1 — selected topic only; no LLM call, no article written.");
    process.exit(0);
  }

  if (!OPENROUTER_API_KEY) {
    console.error("ERROR: OPENROUTER_API_KEY is required.");
    console.error("::error::OPENROUTER_API_KEY missing for daily story publish");
    process.exit(1);
  }

  const generator = createGenerator({ apiKey: OPENROUTER_API_KEY, primaryModel: PRIMARY_MODEL });
  console.log(`Primary model: ${PRIMARY_MODEL}`);
  console.log(`Max attempts this run: ${MAX_ATTEMPTS}\n`);

  const tried = new Set();
  let published = null;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    const next = pickNextQueueItem(
      {
        ...queue,
        items: queue.items.filter((i) => !tried.has(i.id) && !skipHeld.has(i.id)),
      },
      existingSlugs
    );
    if (!next) break;
    tried.add(next.id);
    attempts += 1;

    const result = await attemptPublish(next, queue, generator, existingSlugs);
    if (result.ok) {
      published = result;
      break;
    }
    for (const i of queue.items) {
      if (i.status === "editorial_review") skipHeld.add(i.id);
    }
  }

  if (!published) {
    const pending = countPending(queue);
    const msg = `No full story published this run after ${attempts} attempt(s) (pending marker count=${pending}). Holds persisted; will not publish filler.`;
    console.error(`ERROR: ${msg}`);
    console.error(`::error::${msg}`);
    process.exit(1);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  console.error(`::error::Daily story fatal: ${e.message}`);
  process.exit(1);
});
