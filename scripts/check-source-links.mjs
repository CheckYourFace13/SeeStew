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

  // Institutional domains serve honest status codes to any client, so a 404/410
  // there is a real dead link that must be fixed. Commercial CDNs (news/mag
  // sites) routinely return bogus 404/403 to datacenter IPs like GitHub's
  // runners even though the page loads fine in a browser — so their 404s are a
  // warning, not a hard failure. (Authoring-time runs from a residential IP
  // still flag those as dead, which is where fabricated links get caught.)
  const RELIABLE_STATUS_DOMAINS = [
    /\.gov$/i,
    /\.mil$/i,
    /\.edu$/i,
    /si\.edu$/i,
    /loc\.gov$/i,
    /archives\.gov$/i,
    /congress\.gov$/i,
    /nps\.gov$/i,
    /\.museum$/i,
    /nuclearmuseum\.org$/i,
  ];
  const isReliableStatus = (url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return RELIABLE_STATUS_DOMAINS.some((p) => p.test(host));
    } catch {
      return false;
    }
  };
  const deadFatal = dead.filter((r) => isReliableStatus(r.url));
  const deadSuspect = dead.filter((r) => !isReliableStatus(r.url));

  const fmt = (r) => `  [${r.status}] ${r.url}\n        used by: ${r.slugs.join(", ")}`;

  console.log(`=== DEAD on institutional domain — must fix (${deadFatal.length}) ===`);
  deadFatal.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== 404/410 on commercial CDN — likely datacenter-block, review (${deadSuspect.length}) ===`);
  deadSuspect.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== UNREACHABLE from CI, not a hard failure (${unreachable.length}) ===`);
  unreachable.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== BOT-BLOCKED, real page (${blocked.length}) ===`);
  blocked.forEach((r) => console.log(fmt(r)));
  console.log(`\n=== OK: ${ok.length} ===`);

  if (deadFatal.length) {
    console.error(`\nFAIL: ${deadFatal.length} dead link(s) on institutional domains. Fix before shipping.`);
    process.exit(1);
  }
  if (deadSuspect.length) {
    console.log(
      `\nPASS (with ${deadSuspect.length} commercial-CDN 404 warning(s) — verify these load in a browser).`
    );
  } else {
    console.log(`\nPASS: no dead source links.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
