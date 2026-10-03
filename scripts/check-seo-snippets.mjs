#!/usr/bin/env node
/**
 * Flag SERP/CTR issues in article titles, meta descriptions, and canons.
 * Usage: node scripts/check-seo-snippets.mjs
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, "content", "articles");
const SITE_URL = "https://seestew.com";

const TITLE_MIN = 45;
const TITLE_MAX = 65;
const DESC_MIN = 135;
const DESC_MAX = 160;

const PLACEHOLDER =
  /\b(lorem ipsum|placeholder|todo|tbd|xxx|insert (title|description)|coming soon)\b/i;
const EMAIL_LEAK = /mailto:|info@seestew\.com|@seestew\.com/i;
const VAGUE_TITLE =
  /\b(the forgotten story of|the untold story of|you won'?t believe|shocking truth about)\b/i;

function serpTitle(article) {
  return (article.seoTitle || article.title || "").trim();
}

function metaDescription(article) {
  return (article.seoDescription || article.excerpt || "").trim();
}

function main() {
  if (!existsSync(ARTICLES_DIR)) {
    console.error("Missing content/articles");
    process.exit(1);
  }

  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json")).sort();
  const titles = new Map();
  const descs = new Map();
  let failed = 0;
  let warned = 0;

  console.log("slug\tstatus\tissues");
  console.log("-".repeat(88));

  for (const file of files) {
    const path = join(ARTICLES_DIR, file);
    let article;
    try {
      article = JSON.parse(readFileSync(path, "utf-8"));
    } catch {
      console.log(`${file}\tFAIL\tinvalid JSON`);
      failed++;
      continue;
    }

    const slug = article.slug || file.replace(/\.json$/, "");
    const errors = [];
    const soft = [];
    const title = serpTitle(article);
    const desc = metaDescription(article);

    if (!title) errors.push("missing title");
    else {
      if (title.length < TITLE_MIN) soft.push(`title short (${title.length}<${TITLE_MIN})`);
      if (title.length > TITLE_MAX) soft.push(`title long (${title.length}>${TITLE_MAX})`);
      if (VAGUE_TITLE.test(title)) soft.push("vague title pattern");
      if (PLACEHOLDER.test(title)) errors.push("placeholder in title");
      const key = title.toLowerCase();
      if (!titles.has(key)) titles.set(key, []);
      titles.get(key).push(slug);
    }

    if (!desc) errors.push("missing meta description");
    else {
      if (desc.length < DESC_MIN) soft.push(`desc short (${desc.length}<${DESC_MIN})`);
      if (desc.length > DESC_MAX) soft.push(`desc long (${desc.length}>${DESC_MAX})`);
      if (PLACEHOLDER.test(desc)) errors.push("placeholder in description");
      const key = desc.toLowerCase();
      if (!descs.has(key)) descs.set(key, []);
      descs.get(key).push(slug);
    }

    // Canonical expectation for article pages (hardcoded pattern — runtime uses siteConfig)
    const expectedCanonical = `${SITE_URL}/articles/${slug}`;
    if (article.canonical) {
      if (!String(article.canonical).includes("/articles/")) {
        errors.push("canonical not using /articles/");
      }
      if (String(article.canonical) !== expectedCanonical) {
        soft.push(`canonical differs from ${expectedCanonical}`);
      }
    }

    const blob = JSON.stringify(article);
    if (EMAIL_LEAK.test(blob)) errors.push("raw public email/mailto");
    if (PLACEHOLDER.test(blob) && !PLACEHOLDER.test(title) && !PLACEHOLDER.test(desc)) {
      soft.push("placeholder word elsewhere in JSON");
    }

    const all = [...errors, ...soft.map((s) => `WARN: ${s}`)];
    if (errors.length) {
      console.log(`${slug}\tFAIL\t${all.join("; ")}`);
      failed++;
    } else if (soft.length) {
      console.log(`${slug}\tWARN\t${soft.join("; ")}`);
      warned++;
    } else {
      console.log(`${slug}\tPASS\t`);
    }
  }

  for (const [title, slugs] of titles) {
    if (slugs.length > 1) {
      console.log(`DUPLICATE_TITLE\tFAIL\t"${title}" -> ${slugs.join(", ")}`);
      failed++;
    }
  }
  for (const [desc, slugs] of descs) {
    if (slugs.length > 1) {
      console.log(`DUPLICATE_DESC\tFAIL\t"${desc.slice(0, 60)}…" -> ${slugs.join(", ")}`);
      failed++;
    }
  }

  console.log("-".repeat(88));
  console.log(
    `Checked ${files.length} article(s). ${failed} failed, ${warned} with length/CTR warnings.`
  );
  // Length warnings are soft — exit non-zero only on hard failures.
  process.exit(failed > 0 ? 1 : 0);
}

main();
