#!/usr/bin/env node
/**
 * Validate content/story-queue.json
 * Usage: npm run validate:queue
 */

import { existsSync } from "fs";
import {
  QUEUE_PATH,
  loadQueue,
  initQueueFileIfNeeded,
  mergeMissingSeedItems,
  saveQueue,
  MIN_PENDING_TOPICS,
} from "./story-queue.mjs";
import { countCredibleRefs, normalizeUrl } from "./article-validation.mjs";

const NON_US_PATTERNS = [
  /\bkyshtym\b/i,
  /\bchernobyl\b/i,
  /\bsoviet\b/i,
  /\bukraine\b/i,
  /\bnon[- ]?u\.?s\.?\b/i,
];

if (!existsSync(QUEUE_PATH)) {
  initQueueFileIfNeeded();
}

const queue = loadQueue();
const merged = mergeMissingSeedItems(queue);
if (merged > 0) {
  saveQueue(queue);
  console.log(`Merged ${merged} new curated topic(s) into story-queue.json before validate.\n`);
}

const ids = new Set();
const slugs = new Set();
let failed = 0;

console.log("id\tsources\tcredible\tstatus\tresult");
console.log("-".repeat(80));

for (const item of queue.items) {
  const issues = [];

  if (ids.has(item.id)) issues.push("duplicate id");
  ids.add(item.id);

  if (item.publishedSlug) {
    if (slugs.has(item.publishedSlug)) issues.push("duplicate publishedSlug");
    slugs.add(item.publishedSlug);
  }

  const titleBlob = `${item.id} ${item.title} ${item.hook} ${item.angle}`;
  if (NON_US_PATTERNS.some((p) => p.test(titleBlob))) {
    issues.push("possible non-U.S. topic flag");
  }

  const sources = item.requiredSources || [];
  if (sources.length < 4) issues.push(`only ${sources.length} sources (need 4+)`);

  const httpsCount = sources.filter((s) => s.url?.startsWith("https://")).length;
  if (httpsCount < sources.length) issues.push("source missing https URL");

  const credible = countCredibleRefs(sources);
  if (credible < 2) issues.push(`only ${credible} credible sources (need 2+)`);

  const urlSet = new Set();
  for (const s of sources) {
    const n = normalizeUrl(s.url);
    if (urlSet.has(n)) issues.push(`duplicate source URL: ${s.url}`);
    urlSet.add(n);
    if (!s.title || s.title.length < 4) issues.push("source missing title");
    if (!s.publisher || s.publisher.length < 2) issues.push("source missing publisher");
  }

  if (!item.title || item.title.length < 10) issues.push("title too short");
  if (!item.hook || item.hook.length < 20) issues.push("hook too short");
  if (!item.category) issues.push("missing category");
  if (!item.imageSearchTerms?.length) issues.push("missing imageSearchTerms");

  const ok = issues.length === 0;
  const status = item.status || "pending";
  console.log(
    `${item.id}\t${sources.length}\t${credible}\t${status}\t${ok ? "PASS" : `FAIL: ${issues.join("; ")}`}`
  );
  if (!ok) failed++;
}

const pending = queue.items.filter((i) => i.status === "pending").length;
console.log("-".repeat(80));
console.log(`Checked ${queue.items.length} queue items (${pending} pending). ${queue.items.length - failed} passed, ${failed} failed.`);
if (pending < MIN_PENDING_TOPICS) {
  console.warn(
    `WARNING: only ${pending} pending topics (want ≥ ${MIN_PENDING_TOPICS}). Add scripts/story-queue-batch-*.mjs and register it in story-queue.mjs.`
  );
}

process.exit(failed > 0 ? 1 : 0);
