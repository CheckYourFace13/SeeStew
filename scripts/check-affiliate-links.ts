#!/usr/bin/env node
/**
 * Affiliate guardrails (AdSense-safe monetization).
 * Usage: npm run check:affiliate-links   (npx tsx scripts/check-affiliate-links.ts)
 *
 * Flags:
 *  - Amazon links missing tag=seestew-20 (data, components, pages, article content)
 *  - affiliate links missing rel="sponsored" (nofollow noopener noreferrer)
 *  - missing /affiliate-disclosure route, Amazon Associate statement, or footer link
 *  - public raw email or mailto links
 *  - affiliate blocks/links on the homepage
 *  - affiliate block rendered above the article body
 *  - recommended-reading entries that point at missing articles or exceed the per-block cap
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import {
  AFFILIATE_DISCLOSURE_SHORT,
  AFFILIATE_REL,
  AMAZON_ASSOCIATE_STATEMENT,
  AMAZON_ASSOCIATE_TAG,
} from "../src/lib/affiliate-config";
import {
  MAX_RECOMMENDED_ITEMS,
  recommendedReading,
} from "../src/data/recommended-reading";

const ROOT = process.cwd();
const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

function read(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

const rel = (p: string) => relative(ROOT, p).replace(/\\/g, "/");

// 1. Amazon links must carry the tracking tag (everywhere a URL could live).
const AMAZON_URL = /https?:\/\/(?:www\.)?(?:amazon\.com|amzn\.to|amzn\.com)[^\s"'`)<>]*/gi;
const scanFiles = [
  ...walk(join(ROOT, "src"), [".ts", ".tsx"]),
  ...walk(join(ROOT, "content"), [".json"]),
  ...walk(join(ROOT, "public"), [".txt", ".xml", ".html"]),
];
for (const file of scanFiles) {
  const text = read(file);
  for (const m of text.matchAll(AMAZON_URL)) {
    const url = m[0];
    // The helper builds the query string at runtime; its template has no literal Amazon URL
    // except the search base, which is tagged via URLSearchParams in amazonSearchUrl().
    if (rel(file) === "src/lib/affiliate-config.ts") continue;
    if (!url.includes(`tag=${AMAZON_ASSOCIATE_TAG}`)) {
      fail(`${rel(file)}: Amazon link missing tag=${AMAZON_ASSOCIATE_TAG}: ${url}`);
    }
  }
}

// 2. Every mapped item (as actually generated) must be well formed.
for (const item of recommendedReading) {
  const label = `recommended-reading "${item.title}"`;
  if (item.url.includes("amazon.com") && !item.url.includes(`tag=${AMAZON_ASSOCIATE_TAG}`)) {
    fail(`${label}: Amazon URL missing tag=${AMAZON_ASSOCIATE_TAG}`);
  }
  if (!item.slug && !item.topic) fail(`${label}: needs a slug or topic`);
  if (item.slug && item.topic) fail(`${label}: set slug OR topic, not both`);
  if (!item.reason.trim()) fail(`${label}: missing reason`);
  if (!item.disclosureLabel.trim()) fail(`${label}: missing disclosureLabel`);
  if (/\$\s?\d/.test(JSON.stringify(item))) fail(`${label}: contains a price (not allowed)`);
  if (item.slug && !existsSync(join(ROOT, "content", "articles", `${item.slug}.json`))) {
    fail(`${label}: article "${item.slug}" does not exist`);
  }
}
const perKey = new Map<string, number>();
for (const item of recommendedReading) {
  const key = item.slug ? `article:${item.slug}` : `topic:${item.topic}`;
  perKey.set(key, (perKey.get(key) ?? 0) + 1);
}
for (const [key, n] of perKey) {
  if (n > MAX_RECOMMENDED_ITEMS) fail(`${key}: ${n} items exceeds max ${MAX_RECOMMENDED_ITEMS}`);
}

// 3. Affiliate rel must be the full sponsored set; AffiliateBlock must use it.
for (const token of ["sponsored", "nofollow", "noopener", "noreferrer"]) {
  if (!AFFILIATE_REL.includes(token)) fail(`AFFILIATE_REL missing ${token}`);
}
const block = read(join(ROOT, "src/components/AffiliateBlock.tsx"));
if (!block.includes("rel={AFFILIATE_REL}")) fail("AffiliateBlock: affiliate links must use rel={AFFILIATE_REL}");
if (!block.includes('target="_blank"')) fail('AffiliateBlock: affiliate links must open with target="_blank"');
if (!block.includes("AFFILIATE_DISCLOSURE_SHORT")) fail("AffiliateBlock: missing visible disclosure");

// Any hard-coded <a href="...amazon|bookshop|awin..."> in src must itself carry rel sponsored.
for (const file of walk(join(ROOT, "src"), [".tsx"])) {
  const text = read(file);
  for (const m of text.matchAll(/<a\b[^>]*href=["'{`][^>]*(?:amazon\.com|bookshop\.org|awin1\.com)[^>]*>/gi)) {
    if (!/rel=/.test(m[0]) || !/sponsored/.test(m[0])) {
      fail(`${rel(file)}: affiliate <a> without rel sponsored: ${m[0].slice(0, 80)}`);
    }
  }
}
if (AFFILIATE_DISCLOSURE_SHORT !== "Disclosure: SeeStew may earn from qualifying purchases.") {
  fail("AFFILIATE_DISCLOSURE_SHORT text changed");
}

// 4. Disclosure route, Amazon statement, footer link, sitemap entry.
const disclosurePage = read(join(ROOT, "src/app/affiliate-disclosure/page.tsx"));
if (!disclosurePage) fail("missing /affiliate-disclosure route (src/app/affiliate-disclosure/page.tsx)");
else if (!disclosurePage.includes("AMAZON_ASSOCIATE_STATEMENT")) {
  fail("/affiliate-disclosure must render AMAZON_ASSOCIATE_STATEMENT");
}
if (AMAZON_ASSOCIATE_STATEMENT !== "As an Amazon Associate, SeeStew earns from qualifying purchases.") {
  fail("AMAZON_ASSOCIATE_STATEMENT text changed");
}
if (!read(join(ROOT, "src/components/Footer.tsx")).includes('href="/affiliate-disclosure"')) {
  fail("Footer must link to /affiliate-disclosure");
}
if (!read(join(ROOT, "src/app/sitemap.ts")).includes("/affiliate-disclosure")) {
  fail("sitemap must include /affiliate-disclosure");
}

// 5. No public raw email or mailto in anything shipped to the browser.
const EMAIL = /mailto:|info@seestew\.com|[A-Za-z0-9._%+-]+@seestew\.com/i;
const publicFiles = [
  ...walk(join(ROOT, "src/app"), [".ts", ".tsx"]).filter((f) => !rel(f).startsWith("src/app/api/")),
  ...walk(join(ROOT, "src/components"), [".tsx"]),
  ...walk(join(ROOT, "content"), [".json"]),
  ...walk(join(ROOT, "public"), [".txt", ".xml", ".html", ".webmanifest"]),
];
for (const file of publicFiles) {
  if (EMAIL.test(read(file))) fail(`${rel(file)}: public raw email or mailto`);
}

// 6. Homepage must stay content-first: no affiliate components, links, or data.
const home = read(join(ROOT, "src/app/page.tsx"));
if (/AffiliateBlock|recommended-reading|affiliate-config|amazon\.com|bookshop\.org/i.test(home)) {
  fail("homepage (src/app/page.tsx) must not contain affiliate blocks or links");
}

// 7. Article page: affiliate block must come after the article body, once.
const article = read(join(ROOT, "src/app/articles/[slug]/page.tsx"));
const bodyAt = article.indexOf("<ArticleBody");
const blockAt = article.indexOf("<AffiliateBlock");
if (bodyAt < 0) fail("article page: <ArticleBody not found");
if (blockAt >= 0 && blockAt < bodyAt) fail("article page: <AffiliateBlock appears above the article body");
if ((article.match(/<AffiliateBlock/g) ?? []).length > 1) fail("article page: more than one affiliate block");

// 8. Video/short pages stay affiliate-free.
for (const f of ["src/app/videos/[slug]/page.tsx", "src/app/shorts/[slug]/page.tsx"]) {
  if (/AffiliateBlock/.test(read(join(ROOT, f)))) fail(`${f}: video pages must not carry affiliate blocks`);
}

if (errors.length > 0) {
  console.error(`Affiliate check FAILED (${errors.length}):`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log(
  `Affiliate check passed: ${recommendedReading.length} mapped items, ` +
    `tag=${AMAZON_ASSOCIATE_TAG} on every Amazon link, rel sponsored enforced, ` +
    `disclosure + footer link present, no public email, homepage affiliate-free.`
);
