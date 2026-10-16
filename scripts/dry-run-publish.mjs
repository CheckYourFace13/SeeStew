#!/usr/bin/env node
/**
 * Non-publishing dry run: prove the next full story and/or Quick Read can be selected.
 * Does NOT call the LLM, does NOT write articles, does NOT mutate queues (except merge of new seed ids when validating depth).
 *
 * Usage:
 *   node scripts/dry-run-publish.mjs
 *   node scripts/dry-run-publish.mjs --full
 *   node scripts/dry-run-publish.mjs --quick-read
 */

import { readdirSync, existsSync } from "fs";
import { join } from "path";
import {
  loadQueue,
  ensureQueueDepth,
  pickNextQueueItem,
  countPending,
  MIN_PENDING_TOPICS,
  REFILL_PENDING_THRESHOLD,
} from "./story-queue.mjs";
import {
  loadQuickReadQueue,
  pickNextQuickRead,
  countQrPending,
  MIN_QR_PENDING,
} from "./quick-read-queue.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const args = new Set(process.argv.slice(2));
const wantFull = args.has("--full") || (!args.has("--quick-read") && !args.has("--full"));
const wantQr = args.has("--quick-read") || (!args.has("--quick-read") && !args.has("--full"));

function existingSlugs() {
  if (!existsSync(CONTENT_DIR)) return new Set();
  return new Set(
    readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  console.error(`::error::${msg}`);
  failed++;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

const slugs = existingSlugs();
console.log(`Existing article slugs: ${slugs.size}\n`);

if (wantFull) {
  console.log("=== Full-story dry run (select only) ===");
  const queue = loadQueue();
  const depth = ensureQueueDepth(queue);
  console.log(`Pending after seed merge: ${depth.pending} (target ≥ ${MIN_PENDING_TOPICS})`);
  if (depth.pending < REFILL_PENDING_THRESHOLD) {
    console.warn(
      `::warning::Full-story queue below refill threshold (${depth.pending} < ${REFILL_PENDING_THRESHOLD})`
    );
  }
  if (depth.pending < MIN_PENDING_TOPICS) {
    console.warn(`::warning::Full-story queue below reserve (${depth.pending} < ${MIN_PENDING_TOPICS})`);
  }
  // Simulate published sync without saving
  for (const item of queue.items) {
    if (item.status === "pending" && slugs.has(item.id)) {
      item.status = "published";
    }
  }
  const next = pickNextQueueItem(queue, slugs);
  if (!next) {
    fail("No pending full-story topic available for the next daily run");
  } else {
    pass(`Next full story: ${next.id}`);
    console.log(`  title: ${next.title}`);
    console.log(`  sources: ${(next.requiredSources || []).length}`);
    console.log(`  category: ${next.category}`);
    console.log(`  eventYear: ${next.eventYear ?? "(from title/slug)"}`);
    console.log(`  historicalEra: ${next.historicalEra ?? "(derive on publish)"}`);
  }
  console.log(`  selectable pending after slug sync: ${countPending(queue)}\n`);
}

if (wantQr) {
  console.log("=== Quick Read dry run (select only) ===");
  const qr = loadQuickReadQueue();
  const pending = countQrPending(qr);
  console.log(`QR pending: ${pending} (want ≥ ${MIN_QR_PENDING} for healthy cadence)`);
  if (pending < MIN_QR_PENDING) {
    console.warn(`::warning::Quick Read queue low (${pending} < ${MIN_QR_PENDING})`);
  }
  for (const item of qr.items || []) {
    if (item.status === "pending" && slugs.has(item.id)) {
      item.status = "published";
    }
  }
  const next = pickNextQuickRead(qr, slugs);
  if (!next) {
    fail("No pending Quick Read topic available for the next QR run");
  } else {
    pass(`Next Quick Read: ${next.id}`);
    console.log(`  title: ${next.title}`);
    console.log(`  sources: ${(next.requiredSources || []).length}`);
    console.log(`  eventYear: ${next.eventYear}`);
    console.log(`  historicalEra: ${next.historicalEra}`);
  }
  console.log();
}

console.log("-".repeat(60));
if (failed) {
  console.error(`${failed} dry-run check(s) failed — scheduled publish would fail-closed (no filler).`);
  process.exit(1);
}
console.log("Dry run OK — next topics selectable; no articles written.");
process.exit(0);
