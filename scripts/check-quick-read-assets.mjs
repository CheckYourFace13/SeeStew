#!/usr/bin/env node
/**
 * Pre-publication Quick Read asset check.
 * Fail closed on missing local cards. Does not skip the editorial gate.
 *
 * Usage: node scripts/check-quick-read-assets.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { loadQuickReadQueue } from "./quick-read-queue.mjs";
import { assertLocalStoryCard } from "./story-images-loc.mjs";

const ROOT = process.cwd();
const ARTICLES = join(ROOT, "content", "articles");
const MIN_BYTES = 15000;
let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  console.error(`::error::${msg}`);
  failed++;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

function parentCardPath(slug) {
  return join(ROOT, "public", "stories", slug, "card.jpg");
}

const queue = loadQuickReadQueue();
const pending = (queue.items || []).filter((i) => i.status === "pending");
console.log(`Pending Quick Reads: ${pending.length}\n`);

for (const item of pending) {
  const parent = item.parentArticleSlug || item.relatedArticleSlugs?.[0];
  if (!parent) {
    fail(`${item.id}: pending companion has no parentArticleSlug`);
    continue;
  }
  const parentArticle = join(ARTICLES, `${parent}.json`);
  if (!existsSync(parentArticle)) {
    fail(`${item.id}: parent article missing (${parent})`);
    continue;
  }
  const card = parentCardPath(parent);
  if (!existsSync(card) || statSync(card).size < MIN_BYTES) {
    fail(`${item.id}: parent card missing or too small (public/stories/${parent}/card.jpg)`);
    continue;
  }
  pass(`${item.id}: parent ${parent} has a local card`);
}

if (existsSync(ARTICLES)) {
  const qrs = readdirSync(ARTICLES)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(ARTICLES, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter((a) => a && a.format === "quick-read");

  console.log(`\nPublished Quick Reads: ${qrs.length}`);
  for (const article of qrs) {
    const asset = assertLocalStoryCard(article.slug, article.image);
    if (!asset.ok) fail(`${article.slug}: ${asset.errors.join("; ")}`);
    else pass(`${article.slug}: local card`);
  }
}

console.log("-".repeat(60));
if (failed) {
  console.error(`${failed} Quick Read asset check(s) failed.`);
  process.exit(1);
}
console.log("Quick Read asset check passed.");
