#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const MIN_BYTES = 15000;

const RETRIES = {
  "demon-core-los-alamos": "Manhattan Project Los Alamos laboratory 1945",
  "goldsboro-nuclear-accident-1961": "B-52 Stratofortress bomber flight 1960s",
  "great-moon-hoax-1835": "Great Moon Hoax lithograph bat 1835",
  "operation-midnight-climax": "San Francisco street 1950s photograph",
  "st-francis-dam-disaster-1928": "flood disaster dam collapse 1928",
  "teapot-dome-scandal-1920s": "Teapot Dome oil wells Wyoming 1923",
  "new-london-school-explosion-1937": "explosion ruins building debris 1930s",
  "port-chicago-explosion-1944": "explosion fire smoke industrial 1940s",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchLoc(query) {
  const params = new URLSearchParams({ q: query.slice(0, 120), fo: "json", at: "results", c: "20", sp: "1" });
  const res = await fetch(`https://www.loc.gov/search/?${params}`, {
    headers: { "User-Agent": "SeeStew/1.0" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const out = [];
  for (const item of data.results ?? []) {
    const raw = item.image_url;
    const u = Array.isArray(raw) ? raw[0] : raw;
    if (!u?.includes("tile.loc.gov/storage-services")) continue;
    if (u.includes("guides.loc") || u.includes("ndnp:") || u.includes("iiif/service:ndnp")) continue;
    out.push({ u, page: item.url, title: item.title });
  }
  return out;
}

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": "SeeStew/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  for (const [slug, query] of Object.entries(RETRIES)) {
    console.log(`\n${slug}: ${query}`);
    await sleep(1500);
    const hits = await searchLoc(query);
    let saved = false;
    for (const hit of hits) {
      try {
        const buf = await download(hit.u);
        if (buf.length < MIN_BYTES) {
          console.log(`  skip ${buf.length}b ${hit.u.slice(0, 80)}...`);
          continue;
        }
        const dir = join(root, "public", "stories", slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "card.jpg"), buf);
        const artPath = join(root, "content", "articles", `${slug}.json`);
        const art = JSON.parse(readFileSync(artPath, "utf-8"));
        art.image = {
          card: `/stories/${slug}/card.jpg`,
          hero: `/stories/${slug}/card.jpg`,
          alt: art.image?.alt || hit.title || art.title,
          credit: "Library of Congress",
          sourcePageUrl: hit.page,
        };
        writeFileSync(artPath, JSON.stringify(art, null, 2));
        console.log(`  OK ${buf.length} bytes`);
        saved = true;
        break;
      } catch (e) {
        console.log(`  fail: ${e.message}`);
      }
    }
    if (!saved) console.log("  NO SUITABLE IMAGE");
  }
}

main();
