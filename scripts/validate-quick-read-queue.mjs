#!/usr/bin/env node
/**
 * Validate content/quick-read-queue.json topics (sources, duplicates, format).
 */

import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { countCredibleRefs, normalizeUrl } from "./article-validation.mjs";
import {
  loadQuickReadQueue,
  countQrPending,
  MIN_QR_PENDING,
  QR_QUEUE_PATH,
} from "./quick-read-queue.mjs";

const ARTICLES_DIR = join(process.cwd(), "content", "articles");

if (!existsSync(QR_QUEUE_PATH)) {
  console.error("FAIL: missing content/quick-read-queue.json");
  process.exit(1);
}

const queue = loadQuickReadQueue();
const articleSlugs = new Set(
  existsSync(ARTICLES_DIR)
    ? readdirSync(ARTICLES_DIR)
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""))
    : []
);

const ids = new Set();
let failed = 0;

console.log("id\tsources\tcredible\tstatus\tresult");
console.log("-".repeat(80));

for (const item of queue.items || []) {
  const issues = [];
  if (ids.has(item.id)) issues.push("duplicate id");
  ids.add(item.id);

  if (item.format && item.format !== "quick-read") {
    issues.push(`format must be quick-read (got ${item.format})`);
  }
  if (!item.title || item.title.length < 10) issues.push("title too short");
  if (!item.hook || item.hook.length < 20) issues.push("hook too short");
  if (!item.category) issues.push("missing category");
  if (!item.angle || item.angle.length < 20) issues.push("angle too short");
  if (!item.imageSearchTerms?.length) issues.push("missing imageSearchTerms");
  if (item.eventYear == null) issues.push("missing eventYear");
  if (!item.historicalEra) issues.push("missing historicalEra");

  const sources = item.requiredSources || [];
  if (sources.length < 2) issues.push(`only ${sources.length} sources (need 2+)`);
  const credible = countCredibleRefs(sources);
  if (credible < 2) issues.push(`only ${credible} credible sources (need 2+)`);

  const urlSet = new Set();
  for (const s of sources) {
    const n = normalizeUrl(s.url);
    if (urlSet.has(n)) issues.push(`duplicate source URL: ${s.url}`);
    urlSet.add(n);
    if (!s.url?.startsWith("https://")) issues.push("source missing https");
    if (!s.title || s.title.length < 4) issues.push("source missing title");
    if (!s.publisher || s.publisher.length < 2) issues.push("source missing publisher");
  }

  if (item.relatedArticleSlugs) {
    for (const s of item.relatedArticleSlugs) {
      if (!articleSlugs.has(s)) issues.push(`relatedArticleSlug missing on site: ${s}`);
    }
  }

  const parent = item.parentArticleSlug || item.relatedArticleSlugs?.[0];
  if (parent && !articleSlugs.has(parent)) {
    issues.push(`parentArticleSlug missing on site: ${parent}`);
  }
  if (parent && !(item.editorialAngle || item.angle)) {
    issues.push("companion Quick Read needs editorialAngle (or angle)");
  }
  if (item.parentArticleSlug && item.relatedArticleSlugs?.length) {
    if (!item.relatedArticleSlugs.includes(item.parentArticleSlug)) {
      issues.push("relatedArticleSlugs should include parentArticleSlug");
    }
  }

  if (item.status === "pending" && articleSlugs.has(item.id)) {
    issues.push("pending but article file already exists");
  }

  const ok = issues.length === 0;
  console.log(
    `${item.id}\t${sources.length}\t${credible}\t${item.status || "?"}\t${ok ? "PASS" : `FAIL: ${issues.join("; ")}`}`
  );
  if (!ok) failed++;
}

const pending = countQrPending(queue);
console.log("-".repeat(80));
console.log(
  `Checked ${(queue.items || []).length} Quick Read topics (${pending} pending). ${(queue.items || []).length - failed} passed, ${failed} failed.`
);
if (pending < MIN_QR_PENDING) {
  console.warn(
    `::warning::Only ${pending} pending Quick Reads (want ≥ ${MIN_QR_PENDING} for Tue/Thu/Sat cadence).`
  );
}
if (pending === 0) {
  console.error("::error::Zero pending Quick Reads — scheduled QR publish will fail-closed.");
  process.exit(1);
}

try {
  const { buildEventIndex } = await import("./editorial/event-index.mjs");
  const { findOverlaps, classifyOverlap } = await import("./editorial/overlap.mjs");
  const index = buildEventIndex({ includeQueues: true });
  let overlapFlags = 0;
  for (const item of (queue.items || []).filter((i) => i.status === "pending")) {
    const entry = index.entries.find(
      (e) => e.slug === item.id && e.source === "queue-quick-read"
    );
    if (!entry) continue;
    const best = findOverlaps(entry, index.entries)[0];
    const verdict = classifyOverlap(best, {
      format: "quick-read",
      parentArticleSlug: item.parentArticleSlug || item.relatedArticleSlugs?.[0],
    });
    if (verdict.action === "block") {
      overlapFlags++;
      console.warn(
        `::warning::Editorial overlap BLOCK risk for QR ${item.id} vs ${verdict.conflict?.slug} (${verdict.reason})`
      );
    }
  }
  console.log(`Editorial overlap scan: ${overlapFlags} Quick Read(s) at block risk.`);
} catch (e) {
  console.warn(`::warning::Editorial overlap scan skipped: ${e.message}`);
}

process.exit(failed > 0 ? 1 : 0);
