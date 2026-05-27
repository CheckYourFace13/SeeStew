#!/usr/bin/env node
/**
 * Validate all content/articles/*.json against publish rules.
 * Usage: npm run validate:articles
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { validateArticleFile } from "./article-validation.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");

if (!existsSync(CONTENT_DIR)) {
  console.error("No content/articles directory found.");
  process.exit(1);
}

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json")).sort();
let failed = 0;

console.log("slug\twords\trefs\tcitations\tstatus");
console.log("-".repeat(72));

for (const file of files) {
  const path = join(CONTENT_DIR, file);
  let article;
  try {
    article = JSON.parse(readFileSync(path, "utf-8"));
  } catch (e) {
    console.log(`${file}\t-\t-\t-\tFAIL (invalid JSON file)`);
    failed++;
    continue;
  }

  const slug = article.slug || file.replace(/\.json$/, "");
  const result = validateArticleFile(article);
  const { words, refs, citations } = result.stats;
  const status = result.ok ? "PASS" : `FAIL: ${result.errors.join("; ")}`;

  console.log(`${slug}\t${words}\t${refs}\t${citations}\t${status}`);
  if (!result.ok) failed++;
}

console.log("-".repeat(72));
console.log(`Checked ${files.length} article(s). ${files.length - failed} passed, ${failed} failed.`);

process.exit(failed > 0 ? 1 : 0);
