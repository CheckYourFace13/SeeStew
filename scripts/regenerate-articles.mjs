#!/usr/bin/env node
/**
 * Regenerate existing articles through the hardened generation pipeline.
 *
 * For each target slug it:
 *   1. Loads the existing article JSON (keeps title, excerpt, category,
 *      curated references, image, createdAt).
 *   2. Best-effort fetches the text of each cited source page so the model
 *      is grounded in real material (reduces hallucination).
 *   3. Regenerates the article body via story-generator.mjs (hardened prompt,
 *      cites ONLY the existing curated sources).
 *   4. Writes the JSON back, preserving image/createdAt/relatedVideoId.
 *
 * Usage:
 *   node scripts/regenerate-articles.mjs all-template
 *   node scripts/regenerate-articles.mjs slug-one,slug-two
 *   REGEN_SLUGS=slug-one,slug-two node scripts/regenerate-articles.mjs
 *   REGEN_DRY_RUN=1 node scripts/regenerate-articles.mjs all-template   (no model calls)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { validateStory, countWords } from "./article-validation.mjs";
import { createGenerator } from "./story-generator.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const DRY_RUN = process.env.REGEN_DRY_RUN === "1" || process.argv.includes("--dry-run");

/** Articles whose prose showed AI-template clichés (see content audit). */
const TEMPLATE_SLUGS = [
  "bath-school-disaster-1927",
  "black-sox-scandal-1919",
  "bonus-army-1932",
  "business-plot-1934",
  "castle-bravo-fallout-1954",
  "centralia-mine-fire-1962",
  "cocoanut-grove-fire-1942",
  "eastland-disaster-1915",
  "greenbrier-bunker",
  "hanford-radiation-releases",
  "hartford-circus-fire-1944",
  "japanese-balloon-bomb-oregon-1945",
  "lake-peigneur-1980",
  "love-canal-1978",
  "ludlow-massacre-1914",
  "minuteman-missile-accidents",
  "move-bombing-1985",
  "operation-northwoods-1962",
  "operation-paperclip",
  "osage-murders-reign-of-terror",
  "peshtigo-fire-1871",
  "poison-squad-wiley",
  "sultana-disaster-1865",
  "teapot-dome-scandal-1920s",
  "titan-ii-damascus-1980",
  "triangle-shirtwaist-fire-1911",
  "tulsa-race-massacre-1921",
  "tuskegee-syphilis-study",
  "wilmington-coup-1898",
  "wounded-knee-1973",
];

const STOPWORDS = new Set([
  "the", "and", "for", "that", "with", "when", "from", "into", "this", "was",
  "were", "how", "who", "a", "an", "of", "in", "on", "to", "s", "amp",
]);

function deriveKeywords(article) {
  const words = `${article.title} ${article.category}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 8);
}

function reconstructQueueItem(article) {
  return {
    id: article.slug,
    title: article.title,
    hook: article.excerpt,
    category: article.category,
    angle: article.excerpt,
    keywords: deriveKeywords(article),
    requiredSources: (article.references || []).map((r) => ({
      title: r.title,
      publisher: r.publisher,
      url: r.url,
      ...(r.year ? { year: r.year } : {}),
    })),
    sourceExcerpts: [],
  };
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchSourceText(url, maxChars = 2400) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SeeStewBot/1.0; +https://seestew.com) research fetch",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const type = res.headers.get("content-type") || "";
    if (!/text\/html|text\/plain|xhtml/i.test(type)) return "";
    const html = await res.text();
    const text = htmlToText(html);
    return text.slice(0, maxChars);
  } catch {
    return "";
  }
}

async function fetchSourceExcerpts(references) {
  const out = [];
  for (let i = 0; i < references.length; i++) {
    const ref = references[i];
    const text = await fetchSourceText(ref.url);
    out.push({ index: i + 1, title: ref.title, publisher: ref.publisher, text });
    await new Promise((r) => setTimeout(r, 400));
  }
  return out;
}

function resolveSlugs() {
  const arg = process.argv.find((a) => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1]);
  const raw = process.env.REGEN_SLUGS || arg || "all-template";
  if (raw.trim() === "all-template") return [...TEMPLATE_SLUGS];
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const slugs = resolveSlugs();
  console.log(`=== Regenerate Articles (${DRY_RUN ? "DRY RUN" : "LIVE"}) ===`);
  console.log(`Targets: ${slugs.length}\n`);

  if (!DRY_RUN && !OPENROUTER_API_KEY) {
    console.error("ERROR: OPENROUTER_API_KEY is required (or run with REGEN_DRY_RUN=1).");
    process.exit(1);
  }

  const generator = DRY_RUN
    ? null
    : createGenerator({ apiKey: OPENROUTER_API_KEY, primaryModel: PRIMARY_MODEL });

  const succeeded = [];
  const failed = [];

  for (const slug of slugs) {
    const path = join(CONTENT_DIR, `${slug}.json`);
    if (!existsSync(path)) {
      console.log(`SKIP ${slug}: file not found`);
      failed.push(slug);
      continue;
    }

    const article = JSON.parse(readFileSync(path, "utf-8"));
    const queueItem = reconstructQueueItem(article);
    console.log(`\n--- ${slug} (${queueItem.requiredSources.length} sources) ---`);

    if (!queueItem.requiredSources.length) {
      console.log("  SKIP: no references to ground on");
      failed.push(slug);
      continue;
    }

    console.log("  Fetching source material...");
    queueItem.sourceExcerpts = await fetchSourceExcerpts(queueItem.requiredSources);
    const grounded = queueItem.sourceExcerpts.filter((e) => e.text).length;
    console.log(`  Grounded on ${grounded}/${queueItem.requiredSources.length} source pages`);

    if (DRY_RUN) {
      console.log(`  [dry run] keywords: ${queueItem.keywords.join(", ")}`);
      succeeded.push(slug);
      continue;
    }

    let draft;
    try {
      draft = await generator.generateForQueueItem(queueItem);
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
      failed.push(slug);
      continue;
    }

    const stats = validateStory(draft, { allowedSources: queueItem.requiredSources }).stats;
    const updated = {
      ...article,
      content: draft.content,
      references: draft.references,
      readMinutes: Math.max(5, Math.ceil(countWords(draft.content) / 220)),
    };
    writeFileSync(path, JSON.stringify(updated, null, 2), "utf-8");
    console.log(`  OK: ${stats.words} words, ${stats.citations} citations, ${stats.refs} refs`);
    succeeded.push(slug);

    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("\n=== Summary ===");
  console.log(`Regenerated: ${succeeded.length}`);
  console.log(`Failed/skipped: ${failed.length}${failed.length ? ` (${failed.join(", ")})` : ""}`);

  if (!DRY_RUN && succeeded.length === 0) process.exit(1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
