#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, and other participating engines).
 *
 * Key file (required by Bing):
 *   public/<INDEXNOW_KEY>.txt  → https://seestew.com/<KEY>.txt
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs --latest
 *   node scripts/submit-indexnow.mjs --all
 *   node scripts/submit-indexnow.mjs https://seestew.com/articles/foo
 */

import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

const HOST = "seestew.com";
const BASE = `https://${HOST}`;
const DEFAULT_KEY = "d3dc290bb6904d4d865801bbc64929ec";
const KEY = process.env.INDEXNOW_KEY || DEFAULT_KEY;
const KEY_LOCATION = `${BASE}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const CONTENT_DIR = join(process.cwd(), "content", "articles");

function articleUrlsByMtime() {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const slug = f.replace(/\.json$/, "");
      const m = statSync(join(CONTENT_DIR, f)).mtimeMs;
      return { url: `${BASE}/articles/${slug}`, m };
    })
    .sort((a, b) => b.m - a.m);
}

function collectUrls(argv) {
  const urls = new Set();

  if (argv.includes("--all")) {
    urls.add(`${BASE}/`);
    urls.add(`${BASE}/articles`);
    urls.add(`${BASE}/sitemap.xml`);
    for (const { url } of articleUrlsByMtime()) urls.add(url);
  }

  if (argv.includes("--latest")) {
    const latest = articleUrlsByMtime()[0];
    urls.add(`${BASE}/`);
    urls.add(`${BASE}/articles`);
    urls.add(`${BASE}/sitemap.xml`);
    if (latest) urls.add(latest.url);
  }

  for (const arg of argv) {
    if (arg.startsWith("http://") || arg.startsWith("https://")) urls.add(arg);
  }

  return [...urls];
}

async function submit(urlList) {
  if (!urlList.length) {
    console.error("No URLs to submit. Use --latest, --all, or pass absolute URLs.");
    process.exit(1);
  }

  const keyPath = join(process.cwd(), "public", `${KEY}.txt`);
  if (!existsSync(keyPath)) {
    console.error(`Missing key file: public/${KEY}.txt`);
    process.exit(1);
  }
  const keyBody = readFileSync(keyPath, "utf8").trim();
  if (keyBody !== KEY) {
    console.error(`Key file contents must equal the key exactly. Got: ${keyBody}`);
    process.exit(1);
  }

  console.log(`IndexNow: submitting ${urlList.length} URL(s) for ${HOST}`);
  for (const u of urlList.slice(0, 10)) console.log(`  - ${u}`);
  if (urlList.length > 10) console.log(`  … +${urlList.length - 10} more`);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  const text = await res.text().catch(() => "");
  // 200/202 = accepted; 422 = invalid URL set; 403 = key validation failed
  if (res.status === 200 || res.status === 202) {
    console.log(`OK: IndexNow accepted (${res.status})`);
    return;
  }

  console.error(`FAIL: IndexNow HTTP ${res.status}${text ? ` — ${text.slice(0, 300)}` : ""}`);
  process.exit(1);
}

const urls = collectUrls(process.argv.slice(2));
await submit(urls);
