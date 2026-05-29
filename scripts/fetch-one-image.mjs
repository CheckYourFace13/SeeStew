#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const slug = process.argv[2] || "teapot-dome-scandal-1920s";
const query = process.argv[3] || "Teapot Dome scandal Albert Fall oil";
const root = process.cwd();

async function main() {
  const params = new URLSearchParams({ q: query, fo: "json", at: "results", c: "25", sp: "1" });
  const data = await (await fetch(`https://www.loc.gov/search/?${params}`)).json();
  for (const item of data.results ?? []) {
    const u = Array.isArray(item.image_url) ? item.image_url[0] : item.image_url;
    if (!u?.includes("tile.loc.gov/storage-services") || u.includes("ndnp")) continue;
    const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
    console.log(buf.length, u.slice(0, 100));
    if (buf.length < 15000) continue;
    const dir = join(root, "public", "stories", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "card.jpg"), buf);
    const art = JSON.parse(readFileSync(join(root, "content/articles", `${slug}.json`), "utf-8"));
    art.image = {
      card: `/stories/${slug}/card.jpg`,
      hero: `/stories/${slug}/card.jpg`,
      alt: "Oil field derricks in Wyoming during the Teapot Dome era, 1920s",
      credit: "Library of Congress",
      sourcePageUrl: item.url,
    };
    writeFileSync(join(root, "content/articles", `${slug}.json`), JSON.stringify(art, null, 2));
    console.log("saved", slug);
    return;
  }
  console.log("none found");
}

main();
