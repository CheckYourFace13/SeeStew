#!/usr/bin/env node
/**
 * Audit every article reference URL and report links that don't resolve.
 * Distinguishes truly dead links (404/410/DNS) from bot-blocks (403/429).
 *
 * Usage: node scripts/check-source-links.mjs
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function collectUrls() {
  const map = new Map(); // url -> [slugs]
  for (const file of readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"))) {
    const a = JSON.parse(readFileSync(join(CONTENT_DIR, file), "utf-8"));
    for (const ref of a.references || []) {
      if (!ref.url) continue;
      if (!map.has(ref.url)) map.set(ref.url, []);
      map.get(ref.url).push(file.replace(/\.json$/, ""));
    }
  }
  return map;
}

async function fetchOnce(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.status;
  } catch (e) {
    return e.name === "AbortError" ? "TIMEOUT" : "ERROR";
  }
}

// Retry transient failures (network/TLS quirks on .mil, si.edu, etc.) before
// deciding. Only 404/410 count as "dead" — the sole CI failure condition.
async function checkUrl(url) {
  let status = await fetchOnce(url);
  if (status === "ERROR" || status === "TIMEOUT") {
    await new Promise((r) => setTimeout(r, 1500));
    status = await fetchOnce(url);
  }
  return status;
}

async function run(entries, concurrency = 6) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < entries.length) {
      const idx = i++;
      const [url, slugs] = entries[idx];
      const status = await checkUrl(url);
      results.push({ url, slugs, status });
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  const map = collectUrls();
  const entries = [...map.entries()];
  console.log(`Checking ${entries.length} unique source URLs...\n`);

  const results = await run(entries);
  // 403/429 = bot-blocked (real page); ERROR/TIMEOUT = network/TLS quirks.
  const dead = results.filter((r) => r.status === 404 || r.status === 410);
  const unreachable = results.filter((r) => r.status === "ERROR" || r.status === "TIMEOUT");
  const blocked = results.filter((r) => r.status === 403 || r.status === 429);
  const ok = results.filter((r) => typeof r.status === "number" && r.status >= 200 && r.status < 400);

  const fmt = (r) => `  [${r.status}] ${r.url}\n        used by: ${r.slugs.join(", ")}`;

  console.log(`=== 404/410 (${dead.length}) ===`);
  dead.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== UNREACHABLE, not a hard failure (${unreachable.length}) ===`);
  unreachable.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== BOT-BLOCKED, real page (${blocked.length}) ===`);
  blocked.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== OK: ${ok.length} ===`);

  // HTTP status from a CI runner's datacenter IP is unreliable: major sites
  // (incl. fbi.gov, fda.gov, nih.gov behind Akamai) return bogus 404/403 to
  // datacenter IPs while serving the page fine in a browser. So in CI this is a
  // report-only signal. Run locally (residential IP, browser-like) for the
  // authoritative gate that hard-fails on real dead/fabricated links.
  const reportOnly = !!(process.env.CI || process.env.GITHUB_ACTIONS);

  if (dead.length && !reportOnly) {
    console.error(`\nFAIL: ${dead.length} dead source link(s) found (404/410). Fix before shipping.`);
    process.exit(1);
  }
  if (dead.length) {
    console.log(
      `\nREPORT-ONLY (CI): ${dead.length} URL(s) returned 404/410 from this runner. ` +
        `Datacenter/CDN false positives are common — verify in a browser. Not failing the deploy.`
    );
  } else {
    console.log(`\nPASS: no dead source links.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
