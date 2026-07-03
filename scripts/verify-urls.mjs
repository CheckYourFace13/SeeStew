#!/usr/bin/env node
/**
 * Quickly verify a set of URLs resolve. Prints status per URL.
 * 403/429 = real page that blocks bots (treated as OK).
 * Usage: node scripts/verify-urls.mjs "https://a" "https://b"
 *        node scripts/verify-urls.mjs --file urls.txt
 */

import { readFileSync } from "fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function check(url) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 12000);
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      signal: c.signal,
    });
    clearTimeout(t);
    return res.status;
  } catch (e) {
    return e.name === "AbortError" ? "TIMEOUT" : "ERROR";
  }
}

const args = process.argv.slice(2);
let urls = [];
const fileIdx = args.indexOf("--file");
if (fileIdx !== -1) {
  urls = readFileSync(args[fileIdx + 1], "utf-8").split(/\s+/).filter(Boolean);
} else {
  urls = args.filter(Boolean);
}

const results = await Promise.all(urls.map(async (u) => [u, await check(u)]));
for (const [u, s] of results) {
  const ok = s === 403 || s === 429 || (typeof s === "number" && s >= 200 && s < 400);
  console.log(`${ok ? "OK  " : "BAD "} [${s}] ${u}`);
}
