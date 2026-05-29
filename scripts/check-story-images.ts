#!/usr/bin/env node
/**
 * Verify every published story has a real local card image (no purple placeholders).
 * Usage: npm run check:story-images
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, "content", "articles");
const PUBLIC_DIR = join(ROOT, "public");

/** Minimum file size — catches tiny thumbs and empty files. */
const MIN_BYTES = 12_000;

const PLACEHOLDER_PREFIX = "/stories/defaults/";

const BAD_REMOTE_HOSTS = ["guides.loc.gov"];

type ArticleImage = {
  card?: string;
  hero?: string;
  alt?: string;
  imagePrompt?: string;
};

type Article = {
  slug: string;
  title: string;
  image?: ArticleImage;
  imagePrompt?: string;
};

function isPlaceholderPath(path: string): boolean {
  return path.includes(PLACEHOLDER_PREFIX) || path.endsWith(".svg");
}

function publicPathFromUrl(url: string): string | null {
  if (!url.startsWith("/")) return null;
  return join(PUBLIC_DIR, url.replace(/^\//, ""));
}

function isBadRemoteUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return BAD_REMOTE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function checkArticle(article: Article): string[] {
  const errors: string[] = [];
  const slug = article.slug;
  const card = article.image?.card;

  if (!card) {
    errors.push("missing image.card");
    return errors;
  }

  if (isPlaceholderPath(card)) {
    errors.push(`image.card is placeholder: ${card}`);
  }

  if (card.startsWith("https://")) {
    if (isBadRemoteUrl(card)) {
      errors.push(`image.card uses disallowed remote host: ${card}`);
    } else {
      errors.push(
        `image.card is remote URL (expected local /stories/${slug}/card.jpg): ${card.slice(0, 80)}`
      );
    }
    return errors;
  }

  if (!card.startsWith("/stories/")) {
    errors.push(`image.card must be under /stories/: ${card}`);
    return errors;
  }

  const filePath = publicPathFromUrl(card);
  if (!filePath || !existsSync(filePath)) {
    errors.push(`file not found in /public: ${card}`);
    return errors;
  }

  const size = statSync(filePath).size;
  if (size < MIN_BYTES) {
    errors.push(`image file too small (${size} bytes, min ${MIN_BYTES}): ${card}`);
  }

  if (article.image?.imagePrompt || article.imagePrompt) {
    errors.push("imagePrompt still set — local card image should replace it");
  }

  const alt = article.image?.alt?.trim();
  if (!alt || alt.length < 12) {
    errors.push("image.alt missing or too short");
  }

  return errors;
}

function main(): void {
  const files = readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  let failed = 0;

  console.log("slug\tcard\tbytes\tstatus");
  console.log("-".repeat(80));

  for (const file of files) {
    const path = join(ARTICLES_DIR, file);
    let article: Article;
    try {
      article = JSON.parse(readFileSync(path, "utf-8")) as Article;
    } catch {
      console.log(`${file}\t-\t-\tFAIL (invalid JSON)`);
      failed++;
      continue;
    }

    const slug = article.slug || file.replace(/\.json$/, "");
    const card = article.image?.card ?? "-";
    const filePath = card.startsWith("/") ? publicPathFromUrl(card) : null;
    const bytes = filePath && existsSync(filePath) ? statSync(filePath).size : 0;

    const errors = checkArticle({ ...article, slug });
    const status = errors.length === 0 ? "PASS" : `FAIL: ${errors.join("; ")}`;

    if (errors.length > 0) failed++;
    console.log(`${slug}\t${card}\t${bytes || "-"}\t${status}`);
  }

  console.log("-".repeat(80));
  if (failed > 0) {
    console.error(`\n${failed} article(s) failed image checks.`);
    process.exit(1);
  }
  console.log(`\nAll ${files.length} articles passed image checks.`);
}

main();
