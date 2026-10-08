#!/usr/bin/env node
/**
 * Draft a weekly SeeStew digest from the last 7 days of articles.
 * Paste into SendFable manually until API automation exists.
 *
 * Usage: npm run digest:draft
 * Output: docs/latest-weekly-digest.md
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, "content", "articles");
const OUT = join(ROOT, "docs", "latest-weekly-digest.md");
const BASE = "https://seestew.com";
const DAYS = 7;

function loadArticles() {
  if (!existsSync(ARTICLES_DIR)) return [];
  return readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const a = JSON.parse(readFileSync(join(ARTICLES_DIR, f), "utf-8"));
      return { ...a, slug: a.slug || f.replace(/\.json$/, "") };
    });
}

function main() {
  const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  const all = loadArticles();
  const recent = all
    .filter((a) => {
      if (!a.createdAt) return false;
      const t = Date.parse(a.createdAt);
      return Number.isFinite(t) && t >= cutoff;
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const weekOf = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# SeeStew weekly history digest`);
  lines.push("");
  lines.push(`Draft generated: ${weekOf}`);
  lines.push(`Window: last ${DAYS} days`);
  lines.push("");
  lines.push("Hard-to-believe American history stories from SeeStew — sourced articles first.");
  lines.push("");
  lines.push("## This week’s stories");
  lines.push("");

  if (recent.length === 0) {
    lines.push("_No new articles in the last 7 days. Pick 3–5 evergreen stories from https://seestew.com/articles or widen the window._");
    lines.push("");
    lines.push("### Suggested evergreen picks");
    lines.push("");
    for (const a of all.slice(0, 5)) {
      lines.push(`- **${a.title}** — ${BASE}/articles/${a.slug}`);
      if (a.excerpt) lines.push(`  ${String(a.excerpt).replace(/\s*\([^)]{0,60}\)\s*$/, "").trim()}`);
    }
  } else {
    for (const a of recent) {
      lines.push(`### ${a.title}`);
      lines.push("");
      if (a.excerpt) {
        lines.push(String(a.excerpt).replace(/\s*\([^)]{0,60}\)\s*$/, "").trim());
        lines.push("");
      }
      lines.push(`[Read the story](${BASE}/articles/${a.slug})`);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push("Also on SeeStew:");
  lines.push(`- Videos: ${BASE}/videos`);
  lines.push(`- Shorts: ${BASE}/shorts`);
  lines.push(`- On this day: ${BASE}/on-this-day`);
  lines.push("");
  lines.push("_Paste into SendFable → create campaign → send. Unsubscribe footer is handled by SendFable._");
  lines.push("");

  const docs = join(ROOT, "docs");
  if (!existsSync(docs)) mkdirSync(docs, { recursive: true });
  writeFileSync(OUT, lines.join("\n"), "utf-8");
  console.log(`Wrote ${OUT} (${recent.length} article(s) in window)`);
}

main();
