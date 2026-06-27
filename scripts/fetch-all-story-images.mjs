#!/usr/bin/env node
/**
 * Download LOC archival images for every article missing public/stories/<slug>/card.jpg.
 * Reads imageSearchTerms from content/story-queue.json when available.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, "content", "articles");
const PUBLIC_STORIES = join(ROOT, "public", "stories");
const MIN_BYTES = 15000;

const ALT_TEXT = {
  "bath-school-disaster-1927":
    "Ruins of Bath Consolidated School after the 1927 bombing in Michigan",
  "business-plot-1934":
    "1930s Washington scene evoking the alleged Business Plot against FDR",
  "castle-bravo-fallout-1954":
    "Mushroom cloud from the Castle Bravo hydrogen bomb test at Bikini Atoll, 1954",
  "centralia-mine-fire-1962":
    "Smoke rising from the underground coal mine fire in Centralia, Pennsylvania",
  "cocoanut-grove-fire-1942":
    "Aftermath of the Cocoanut Grove nightclub fire in Boston, 1942",
  "eastland-disaster-1915":
    "SS Eastland capsized in the Chicago River, July 1915",
  "greenbrier-bunker":
    "The Greenbrier resort in West Virginia, site of the secret congressional bunker",
  "hanford-radiation-releases":
    "Hanford Site plutonium production facilities on the Columbia River, 1940s",
  "hartford-circus-fire-1944":
    "Hartford circus big top fire, July 1944",
  "japanese-balloon-bomb-oregon-1945":
    "Japanese balloon bomb recovered in Oregon during World War II, 1945",
  "lake-peigneur-1980":
    "Whirlpool and collapsed drilling rig at Lake Peigneur, Louisiana, 1980",
  "love-canal-1978":
    "Love Canal neighborhood evacuation during the toxic waste crisis, Niagara Falls",
  "ludlow-massacre-1914":
    "Colorado National Guard and strikers at Ludlow tent colony, 1914",
  "minuteman-missile-accidents":
    "U.S. Air Force Minuteman intercontinental ballistic missile silo, Cold War era",
  "move-bombing-1985":
    "Philadelphia row houses destroyed in the 1985 MOVE bombing",
  "operation-northwoods-1962":
    "U.S. military briefing documents from the early 1960s Cold War period",
  "operation-paperclip":
    "German scientists arriving in the United States after World War II, Operation Paperclip era",
  "osage-murders-reign-of-terror":
    "Osage Nation members in Oklahoma during the 1920s oil boom",
  "peshtigo-fire-1871":
    "Aftermath of the Peshtigo Fire in Wisconsin, October 1871",
  "poison-squad-wiley":
    "Harvey W. Wiley and U.S. Department of Agriculture food safety testing, early 1900s",
  "sultana-disaster-1865":
    "Mississippi River steamboat Sultana before its 1865 boiler explosion",
  "titan-ii-damascus-1980":
    "Titan II missile silo near Damascus, Arkansas, 1980 accident site",
  "triangle-shirtwaist-fire-1911":
    "Triangle Shirtwaist Factory fire aftermath, New York City, March 1911",
  "tulsa-race-massacre-1921":
    "Greenwood District of Tulsa after the 1921 race massacre",
  "tuskegee-syphilis-study":
    "Tuskegee Institute medical research facility, Alabama, 1930s",
  "wilmington-coup-1898":
    "Wilmington, North Carolina street scene during the 1898 coup and massacre",
  "wounded-knee-1973":
    "Federal agents and activists at Wounded Knee, South Dakota, 1973",
};

function loadQueueQueries() {
  const queue = JSON.parse(readFileSync(join(ROOT, "content", "story-queue.json"), "utf-8"));
  const map = {};
  for (const item of queue.items ?? []) {
    const slug = item.publishedSlug || item.id;
    if (item.imageSearchTerms?.length) map[slug] = item.imageSearchTerms;
  }
  return map;
}

function isGoodLocImageUrl(url) {
  if (!url?.startsWith("https://")) return false;
  if (url.includes("guides.loc.gov") || url.includes("ld.php")) return false;
  if (url.includes("ndnp")) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "tile.loc.gov" || host.endsWith(".loc.gov");
  } catch {
    return false;
  }
}

function scoreUrl(url) {
  let s = 0;
  if (url.includes("_150px") || url.includes("_thumb")) s -= 50;
  if (url.endsWith(".gif") || url.includes(".gif#")) s -= 20;
  if (url.includes("/service/pnp/")) s += 15;
  if (url.includes(".jpg")) s += 10;
  return s;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchLoc(query) {
  const params = new URLSearchParams({ q: query.slice(0, 120), fo: "json", at: "results", c: "25", sp: "1" });
  const res = await fetch(`https://www.loc.gov/search/?${params}`, {
    headers: { "User-Agent": "SeeStew/1.0" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const hits = [];
  for (const item of data.results ?? []) {
    const raw = item.image_url;
    const u = Array.isArray(raw) ? raw[0] : raw;
    if (!isGoodLocImageUrl(u)) continue;
    hits.push({ u, page: item.url, title: item.title, score: scoreUrl(u) });
  }
  return hits.sort((a, b) => b.score - a.score);
}

async function tryDownload(url) {
  const variants = [
    url.split("#")[0],
    url.replace(/_150px\.jpg/, "r.jpg").split("#")[0],
    url.replace(/_150px\.jpg/, "v.jpg").split("#")[0],
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

async function fetchForSlug(slug, queries) {
  for (const query of queries) {
    await sleep(1200);
    const hits = await searchLoc(query);
    for (const hit of hits) {
      try {
        const got = await tryDownload(hit.u);
        if (got) return { ...got, page: hit.page, title: hit.title };
      } catch {
        /* try next hit */
      }
    }
  }
  return null;
}

async function main() {
  const queueQueries = loadQueueQueries();
  const slugs = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

  const missing = slugs.filter((slug) => {
    const cardPath = join(PUBLIC_STORIES, slug, "card.jpg");
    return !existsSync(cardPath) || statSync(cardPath).size < MIN_BYTES;
  });

  console.log(`Fetching images for ${missing.length} article(s)...\n`);
  const failed = [];

  for (const slug of missing) {
    const artPath = join(CONTENT_DIR, `${slug}.json`);
    const art = JSON.parse(readFileSync(artPath, "utf-8"));
    const queries = [
      ...(queueQueries[slug] ?? []),
      art.title,
      `${art.category} ${art.excerpt?.slice(0, 80) ?? ""}`.trim(),
    ].filter(Boolean);

    console.log(`${slug}:`);
    let result;
    try {
      result = await fetchForSlug(slug, queries);
    } catch (e) {
      console.log(`  ERROR: ${e.message}\n`);
      failed.push(slug);
      continue;
    }
    if (!result) {
      console.log("  NO SUITABLE IMAGE\n");
      failed.push(slug);
      continue;
    }

    const outDir = join(PUBLIC_STORIES, slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "card.jpg"), result.buf);

    art.image = {
      card: `/stories/${slug}/card.jpg`,
      hero: `/stories/${slug}/card.jpg`,
      alt: ALT_TEXT[slug] || art.title,
      credit: "Library of Congress",
      sourcePageUrl: result.page,
    };
    delete art.image.imagePrompt;
    writeFileSync(artPath, JSON.stringify(art, null, 2));
    console.log(`  OK ${result.buf.length} bytes\n`);
  }

  console.log("---");
  if (failed.length) {
    console.log(`Still missing: ${failed.join(", ")}`);
    process.exit(1);
  }
  console.log("All missing articles now have card images.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
