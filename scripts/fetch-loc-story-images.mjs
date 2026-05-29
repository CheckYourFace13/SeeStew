#!/usr/bin/env node
/**
 * Download public-domain LOC images into public/stories/<slug>/card.jpg
 * and update content/articles/<slug>.json image fields.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "content", "articles");
const PUBLIC_STORIES = join(process.cwd(), "public", "stories");

const SEARCH_QUERIES = {
  "black-sox-scandal-1919": "Black Sox scandal 1919 Chicago White Sox baseball",
  "teapot-dome-scandal-1920s": "Teapot Dome scandal oil Wyoming 1920s",
  "bonus-army-1932": "Bonus Army Washington 1932 veterans march",
  "black-tom-explosion-1916": "Black Tom explosion Jersey City 1916",
  "battle-of-los-angeles-1942": "Los Angeles searchlights anti-aircraft 1942",
  "goldsboro-nuclear-accident-1961": "B-52 bomber crash North Carolina 1961",
  "great-moon-hoax-1835": "Great Moon Hoax 1835 newspaper",
  "ghost-army-wwii": "inflatable tank decoy World War II",
  "port-chicago-explosion-1944": "Port Chicago explosion 1944 naval",
  "st-francis-dam-disaster-1928": "St Francis Dam collapse California 1928",
  "demon-core-los-alamos": "Los Alamos Manhattan Project laboratory 1940s",
  "uss-indianapolis-1945": "USS Indianapolis cruiser World War II",
  "great-molasses-flood-1919": "Great Molasses Flood Boston 1919",
  "johnstown-flood-1889": "Johnstown flood 1889 Pennsylvania",
  "new-london-school-explosion-1937": "New London school explosion Texas 1937",
  "operation-midnight-climax": "San Francisco 1950s street",
  "radium-girls-1920s": "radium dial painters watch factory 1920s",
  "bleeding-kansas-1856": "Bleeding Kansas violence 1856",
};

function isGoodLocImageUrl(url) {
  if (!url || !url.startsWith("https://")) return false;
  if (url.includes("guides.loc.gov") || url.includes("ld.php")) return false;
  if (url.includes("image-services/iiif") && url.includes("ndnp:")) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "tile.loc.gov" || host.endsWith(".loc.gov");
  } catch {
    return false;
  }
}

async function searchLoc(query) {
  const params = new URLSearchParams({ q: query.slice(0, 120), fo: "json", at: "results", c: "12", sp: "1" });
  const res = await fetch(`https://www.loc.gov/search/?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  for (const item of data.results ?? []) {
    const raw = item.image_url;
    const imageUrl = Array.isArray(raw) ? raw[0] : raw;
    if (isGoodLocImageUrl(imageUrl)) {
      return { imageUrl, pageUrl: item.url, title: item.title };
    }
  }
  return null;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": "SeeStew/1.0 (educational)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`Image too small (${buf.length} bytes)`);
  writeFileSync(destPath, buf);
  return buf.length;
}

function loadArticle(slug) {
  const path = join(CONTENT_DIR, `${slug}.json`);
  return { path, data: JSON.parse(readFileSync(path, "utf-8")) };
}

function saveArticle(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

async function main() {
  const slugs = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

  mkdirSync(PUBLIC_STORIES, { recursive: true });

  const failed = [];

  for (const slug of slugs) {
    const { path, data } = loadArticle(slug);
    const query = SEARCH_QUERIES[slug] || data.title;
    const outDir = join(PUBLIC_STORIES, slug);
    const cardPath = join(outDir, "card.jpg");
    const publicCard = `/stories/${slug}/card.jpg`;

    if (existsSync(cardPath)) {
      console.log(`SKIP ${slug} (already has local card.jpg)`);
      continue;
    }

    console.log(`\n${slug}: searching "${query}"...`);
    let loc = null;

    if (isGoodLocImageUrl(data.image?.card)) {
      loc = {
        imageUrl: data.image.card,
        pageUrl: data.image.sourcePageUrl,
        title: data.image.alt,
      };
      console.log(`  Using existing LOC URL`);
    } else {
      loc = await searchLoc(query);
    }

    if (!loc?.imageUrl) {
      console.log(`  NO IMAGE FOUND`);
      failed.push(slug);
      continue;
    }

    mkdirSync(outDir, { recursive: true });
    try {
      const bytes = await downloadImage(loc.imageUrl, cardPath);
      console.log(`  Saved ${publicCard} (${bytes} bytes)`);

      data.image = {
        card: publicCard,
        hero: publicCard,
        alt: data.image?.alt || loc.title || data.title,
        credit: "Library of Congress",
        sourcePageUrl: loc.pageUrl || data.image?.sourcePageUrl,
      };
      delete data.image.imagePrompt;
      saveArticle(path, data);
    } catch (e) {
      console.log(`  DOWNLOAD FAILED: ${e.message}`);
      failed.push(slug);
    }
  }

  console.log("\n---");
  if (failed.length) {
    console.log(`Failed or missing: ${failed.join(", ")}`);
    process.exit(1);
  }
  console.log("All articles have local card images.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
