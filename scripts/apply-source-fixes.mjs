#!/usr/bin/env node
/**
 * Apply verified source-URL replacements from scripts/source-fixes.json.
 *
 * Map shape (keyed by article slug, then by the exact dead/fabricated URL):
 *   {
 *     "<article-slug>": {
 *       "https://dead-or-fabricated": { "url": "https://verified", "title"?: "...", "publisher"?: "..." }
 *     }
 *   }
 *
 * For every matching reference, the URL (and optionally title/publisher) is
 * replaced in place — preserving reference count and order so inline [n]
 * citation markers stay valid — and the trailing ## Sources block is rebuilt.
 *
 * Usage: node scripts/apply-source-fixes.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { finalizeMarkdownContent } from "./article-validation.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const MAP_PATH = join(process.cwd(), "scripts", "source-fixes.json");

const map = JSON.parse(readFileSync(MAP_PATH, "utf-8"));

let changedFiles = 0;
let changedRefs = 0;
const problems = [];

for (const [slug, fixes] of Object.entries(map)) {
  const path = join(CONTENT_DIR, `${slug}.json`);
  if (!existsSync(path)) {
    problems.push(`Missing article file: ${slug}.json`);
    continue;
  }
  const article = JSON.parse(readFileSync(path, "utf-8"));
  const refs = article.references || [];
  const matched = new Set();

  const updatedRefs = refs.map((r) => {
    const fix = fixes[r.url];
    if (!fix) return r;
    matched.add(r.url);
    changedRefs++;
    return {
      title: fix.title || r.title,
      publisher: fix.publisher || r.publisher,
      url: fix.url,
      ...(r.year ? { year: r.year } : {}),
    };
  });

  for (const oldUrl of Object.keys(fixes)) {
    if (!matched.has(oldUrl)) problems.push(`${slug}: map key never matched -> ${oldUrl}`);
  }

  if (matched.size === 0) continue;

  const { content, references } = finalizeMarkdownContent(article.content, updatedRefs);
  article.references = references;
  article.content = content;
  writeFileSync(path, JSON.stringify(article, null, 2), "utf-8");
  changedFiles++;
  console.log(`fixed ${slug}.json: ${matched.size} link(s)`);
}

console.log(`\nChanged ${changedRefs} reference(s) across ${changedFiles} file(s).`);
if (problems.length) {
  console.log(`\nWARNING: ${problems.length} issue(s):`);
  problems.forEach((p) => console.log(`  ${p}`));
}
