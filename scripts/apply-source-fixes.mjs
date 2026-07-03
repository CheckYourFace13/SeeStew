#!/usr/bin/env node
/**
 * Apply verified source-URL replacements from scripts/source-fixes.json.
 *
 * Map shape (keyed by the exact dead URL):
 *   { "https://dead": { "url": "https://verified", "title"?: "...", "publisher"?: "..." } }
 *
 * For every article that has a matching reference, the URL (and optionally
 * title/publisher) is replaced in place — preserving reference count and order
 * so inline [n] citation markers stay valid — and the trailing ## Sources block
 * is rebuilt to match.
 *
 * Usage: node scripts/apply-source-fixes.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { finalizeMarkdownContent } from "./article-validation.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const MAP_PATH = join(process.cwd(), "scripts", "source-fixes.json");

const map = JSON.parse(readFileSync(MAP_PATH, "utf-8"));
const usedKeys = new Set();

let changedFiles = 0;
let changedRefs = 0;

for (const file of readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"))) {
  const path = join(CONTENT_DIR, file);
  const article = JSON.parse(readFileSync(path, "utf-8"));
  const refs = article.references || [];
  let touched = false;

  const updatedRefs = refs.map((r) => {
    const fix = map[r.url];
    if (!fix) return r;
    usedKeys.add(r.url);
    touched = true;
    changedRefs++;
    return {
      title: fix.title || r.title,
      publisher: fix.publisher || r.publisher,
      url: fix.url,
      ...(r.year ? { year: r.year } : {}),
    };
  });

  if (!touched) continue;

  const { content, references } = finalizeMarkdownContent(article.content, updatedRefs);
  article.references = references;
  article.content = content;
  writeFileSync(path, JSON.stringify(article, null, 2), "utf-8");
  changedFiles++;
  console.log(`fixed ${file}: ${updatedRefs.filter((r, i) => r.url !== refs[i].url).length} link(s)`);
}

const unused = Object.keys(map).filter((k) => !usedKeys.has(k));
console.log(`\nChanged ${changedRefs} reference(s) across ${changedFiles} file(s).`);
if (unused.length) {
  console.log(`\nWARNING: ${unused.length} map key(s) never matched (check for typos):`);
  unused.forEach((u) => console.log(`  ${u}`));
}
