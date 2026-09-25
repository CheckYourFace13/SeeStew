#!/usr/bin/env node
/**
 * AdSense-oriented article hygiene: empty fields, duplicate titles,
 * missing sources, duplicate Sources headings, placeholder images.
 * Usage: npx tsx scripts/check-article-quality.ts
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, "content", "articles");
const PLACEHOLDER = "/stories/defaults/";
const MIN_PROSE_WORDS = 800;

/** Slugs under the prose minimum, with a written reason. Keep this list short. */
const WORD_ALLOWLIST: Record<string, string> = {};

const PROMPT_LEFTOVER =
  /\b(image prompt|as an ai|as a language model|chatgpt|you are a historian|historic editorial illustration)\b/i;
const EMAIL_LEAK = /mailto:|info@seestew\.com|@seestew\.com/i;
const BLOG_CANONICAL = /https?:\/\/(?:www\.)?seestew\.com\/blog\b|\]\(\/blog(?:\/|["')\s])|canonical[^<\n]{0,80}\/blog\b/i;

type Article = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  references?: Array<{ title?: string; url?: string }>;
  image?: { card?: string; imagePrompt?: string };
};

function proseWordCount(content: string): number {
  const body = content.split(/^##\s*Sources\b/im)[0] ?? content;
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`]/g, " ");
  return plain.split(/\s+/).filter(Boolean).length;
}

function main(): void {
  const files = readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const titles = new Map<string, string[]>();
  let failed = 0;

  console.log("slug\tstatus");
  console.log("-".repeat(72));

  for (const file of files) {
    const path = join(ARTICLES_DIR, file);
    const errors: string[] = [];
    let article: Article;
    try {
      article = JSON.parse(readFileSync(path, "utf-8")) as Article;
    } catch {
      console.log(`${file}\tFAIL (invalid JSON)`);
      failed++;
      continue;
    }

    const slug = article.slug || file.replace(/\.json$/, "");
    const title = (article.title ?? "").trim();
    const excerpt = (article.excerpt ?? "").trim();
    const content = (article.content ?? "").trim();
    const category = (article.category ?? "").trim();

    if (!title) errors.push("empty title");
    if (!excerpt) errors.push("empty description/excerpt");
    if (!content) errors.push("empty body");
    else {
      const words = proseWordCount(content);
      const exempt = WORD_ALLOWLIST[slug];
      if (words < MIN_PROSE_WORDS && !exempt) {
        errors.push(`body below ${MIN_PROSE_WORDS} prose words (${words})`);
      }
    }
    if (!category) errors.push("empty category");

    const key = title.toLowerCase();
    if (title) {
      const list = titles.get(key) ?? [];
      list.push(slug);
      titles.set(key, list);
    }

    const refs = article.references ?? [];
    const hasSourcesHeading = /^##\s*Sources\b/im.test(content);
    if (refs.length === 0 && !hasSourcesHeading) {
      errors.push("missing named sources/references");
    }

    const sourceHeadings = content.match(/^##\s*Sources\b/gim) ?? [];
    if (sourceHeadings.length > 1) {
      errors.push(`duplicate Sources headings (${sourceHeadings.length})`);
    }

    const card = article.image?.card ?? "";
    if (!card) errors.push("missing image.card");
    else if (card.includes(PLACEHOLDER) || card.endsWith(".svg")) {
      errors.push(`placeholder image: ${card}`);
    }

    const blob = `${title}\n${excerpt}\n${content}`;
    if (PROMPT_LEFTOVER.test(blob) || article.image?.imagePrompt) {
      errors.push("leftover AI or image prompt");
    }
    if (BLOG_CANONICAL.test(blob)) {
      errors.push("/blog URL instead of /articles canonical");
    }
    if (EMAIL_LEAK.test(blob)) {
      errors.push("public email or mailto link");
    }

    const status = errors.length === 0 ? "PASS" : `FAIL: ${errors.join("; ")}`;
    if (errors.length > 0) failed++;
    console.log(`${slug}\t${status}`);
  }

  console.log("-".repeat(72));
  for (const [title, slugs] of titles) {
    if (slugs.length > 1) {
      console.error(`Duplicate title "${title}" on: ${slugs.join(", ")}`);
      failed += slugs.length - 1;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} article quality issue(s).`);
    process.exit(1);
  }
  console.log(`\nAll ${files.length} articles passed quality checks.`);
}

if (!existsSync(ARTICLES_DIR)) {
  console.error("No content/articles directory found.");
  process.exit(1);
}

main();
