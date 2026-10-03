#!/usr/bin/env node
/**
 * Write seoTitle / seoDescription for every article so SERP snippets stay
 * clickable (≈45–65 / ≈135–160) without changing the on-page H1.
 *
 * Usage: node scripts/improve-seo-snippets.mjs
 *        node scripts/improve-seo-snippets.mjs --dry-run
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const ARTICLES_DIR = join(process.cwd(), "content", "articles");
const DRY = process.argv.includes("--dry-run");

const TITLE_MIN = 45;
const TITLE_MAX = 65;
const DESC_MIN = 135;
const DESC_MAX = 160;

const CATEGORY_HOOK = {
  "Weird America": "weird American history",
  Military: "military history",
  Scandal: "American scandal",
  Crime: "true crime history",
  Politics: "American politics history",
  Revolution: "American Revolution history",
};

function yearFrom(text) {
  const m = String(text).match(/\b(1[789]\d{2}|20[0-2]\d)\b/);
  return m ? m[1] : null;
}

function cleanSpaces(s) {
  return s.replace(/\s+/g, " ").trim();
}

function truncateAtWord(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "").replace(/[,:;—\-–]\s*$/, "");
}

/**
 * Prefer the distinctive clause after a colon when the lead is long;
 * otherwise trim the full title. Keep years and proper nouns.
 */
function craftSeoTitle(article) {
  const raw = cleanSpaces(article.title || "");
  const existing = cleanSpaces(article.seoTitle || "");
  if (existing.length >= TITLE_MIN && existing.length <= TITLE_MAX) return existing;

  let candidate = raw;
  if (raw.includes(":")) {
    const [lead, ...rest] = raw.split(":");
    const after = rest.join(":").trim();
    // Prefer "Event: Hook" shortened, or hook alone if lead is thin.
    if (lead.length >= 20 && lead.length <= TITLE_MAX) candidate = lead.trim();
    else if (after.length >= TITLE_MIN && after.length <= TITLE_MAX) candidate = after;
    else if (lead.length + 2 + after.length > TITLE_MAX) {
      candidate = `${lead.trim()}: ${truncateAtWord(after, TITLE_MAX - lead.trim().length - 2)}`;
    }
  }

  candidate = cleanSpaces(candidate.replace(/^The\s+/i, (m) => (candidate.length > TITLE_MAX ? "" : m)));

  if (candidate.length > TITLE_MAX) candidate = truncateAtWord(candidate, TITLE_MAX);
  if (candidate.length < TITLE_MIN) {
    const year = yearFrom(raw) || yearFrom(article.excerpt || "");
    if (year && !candidate.includes(year)) {
      candidate = truncateAtWord(`${candidate} (${year})`, TITLE_MAX);
    }
  }
  if (candidate.length < TITLE_MIN) {
    candidate = truncateAtWord(`${candidate} — true story`, TITLE_MAX);
  }
  if (candidate.length > TITLE_MAX) candidate = truncateAtWord(candidate, TITLE_MAX);
  return candidate;
}

function craftSeoDescription(article) {
  const existing = cleanSpaces(article.seoDescription || "");
  if (existing.length >= DESC_MIN && existing.length <= DESC_MAX) return existing;

  let base = cleanSpaces(article.excerpt || "");
  // Strip trailing parenthetical slug echoes like "(Attica prison riot 1971)"
  base = base.replace(/\s*\([^)]{0,60}\)\s*$/, "").trim();

  const year = yearFrom(article.title) || yearFrom(base);
  const catHook = CATEGORY_HOOK[article.category] || "American history";

  if (base.length < DESC_MIN) {
    const closers = [
      `Documented ${catHook} with named sources.`,
      `A surprising true story from American history.`,
      year ? `What happened in ${year} — and why it still matters.` : `Why this forgotten history still matters.`,
    ];
    for (const c of closers) {
      const next = cleanSpaces(`${base} ${c}`);
      if (next.length >= DESC_MIN) {
        base = next;
        break;
      }
      base = next;
    }
  }

  if (base.length > DESC_MAX) {
    base = `${truncateAtWord(base, DESC_MAX - 3)}...`;
  }

  // Soft floor: if still short, append one more factual closer
  if (base.length < DESC_MIN) {
    base = truncateAtWord(
      `${base} Read the sourced true story on SeeStew.`,
      DESC_MAX
    );
  }

  return base;
}

function main() {
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json")).sort();
  let changed = 0;

  for (const file of files) {
    const path = join(ARTICLES_DIR, file);
    const article = JSON.parse(readFileSync(path, "utf-8"));
    const seoTitle = craftSeoTitle(article);
    const seoDescription = craftSeoDescription(article);

    const beforeT = article.seoTitle || "";
    const beforeD = article.seoDescription || "";
    if (beforeT === seoTitle && beforeD === seoDescription) continue;

    article.seoTitle = seoTitle;
    article.seoDescription = seoDescription;
    changed++;

    console.log(
      `${article.slug || file}\n  T[${seoTitle.length}] ${seoTitle}\n  D[${seoDescription.length}] ${seoDescription}`
    );

    if (!DRY) {
      writeFileSync(path, `${JSON.stringify(article, null, 2)}\n`, "utf-8");
    }
  }

  console.log(`\n${DRY ? "Would update" : "Updated"} ${changed} / ${files.length} article(s).`);
}

main();
