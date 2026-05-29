#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const MIN_BYTES = 25000;
const SLUGS = [
  "teapot-dome-scandal-1920s",
  "st-francis-dam-disaster-1928",
  "great-moon-hoax-1835",
  "demon-core-los-alamos",
];

const QUERIES = {
  "teapot-dome-scandal-1920s": "Teapot Dome Wyoming oil field photograph",
  "st-francis-dam-disaster-1928": "St Francis Dam flood California 1928",
  "great-moon-hoax-1835": "Great Moon Hoax lithograph 1835",
  "demon-core-los-alamos": "Los Alamos laboratory scientists 1940s",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function scoreUrl(url) {
  let s = 0;
  if (url.includes("_150px") || url.includes("_thumb")) s -= 50;
  if (url.endsWith(".gif") || url.includes(".gif#")) s -= 30;
  if (url.includes("/service/pnp/")) s += 10;
  if (url.includes(".jpg") || url.includes(".jpeg")) s += 20;
  return s;
}

async function searchLoc(query) {
  const params = new URLSearchParams({ q: query, fo: "json", at: "results", c: "30", sp: "1" });
  const data = await (await fetch(`https://www.loc.gov/search/?${params}`)).json();
  const hits = [];
  for (const item of data.results ?? []) {
    const raw = item.image_url;
    const u = Array.isArray(raw) ? raw[0] : raw;
    if (!u?.includes("tile.loc.gov/storage-services")) continue;
    if (u.includes("guides.loc") || u.includes("ndnp")) continue;
    hits.push({ u, page: item.url, title: item.title, score: scoreUrl(u) });
  }
  return hits.sort((a, b) => b.score - a.score);
}

async function tryDownload(url) {
  const variants = [
    url.split("#")[0],
    url.replace(/_150px\.jpg/, ".jpg").split("#")[0],
    url.replace(/t\.gif/, "r.jpg").split("#")[0],
    url.replace(/\.gif/, ".jpg").split("#")[0],
  ];
  const seen = new Set();
  for (const v of variants) {
    if (seen.has(v)) continue;
    seen.add(v);
    try {
      const res = await fetch(v, { headers: { "User-Agent": "SeeStew/1.0" } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length >= MIN_BYTES) return { buf, url: v };
    } catch {
      /* next */
    }
  }
  return null;
}

async function main() {
  for (const slug of SLUGS) {
    const cardPath = join(root, "public", "stories", slug, "card.jpg");
    const size = statSync(cardPath).size;
    if (size >= MIN_BYTES) {
      console.log(`${slug}: already ${size}b`);
      continue;
    }
    console.log(`\n${slug}: ${size}b — searching...`);
    await sleep(1200);
    const hits = await searchLoc(QUERIES[slug]);
    let saved = false;
    for (const hit of hits) {
      const got = await tryDownload(hit.u);
      if (!got) continue;
      writeFileSync(cardPath, got.buf);
      const art = JSON.parse(readFileSync(join(root, "content/articles", `${slug}.json`), "utf-8"));
      art.image = {
        ...art.image,
        card: `/stories/${slug}/card.jpg`,
        hero: `/stories/${slug}/card.jpg`,
        credit: "Library of Congress",
        sourcePageUrl: hit.page,
      };
      writeFileSync(join(root, "content/articles", `${slug}.json`), JSON.stringify(art, null, 2));
      console.log(`  OK ${got.buf.length}b`);
      saved = true;
      break;
    }
    if (!saved) console.log("  still small — needs manual image");
  }
}

main();
