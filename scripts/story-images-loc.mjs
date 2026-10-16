/**
 * Shared LOC image search + local card download for full stories and Quick Reads.
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const PUBLIC_STORIES = join(process.cwd(), "public", "stories");
const MIN_IMAGE_BYTES = 15000;

export async function searchLocImage(terms) {
  const query = (Array.isArray(terms) ? terms.join(" ") : terms || "").slice(0, 120);
  try {
    const params = new URLSearchParams({ q: query, fo: "json", at: "results", c: "5", sp: "1" });
    const res = await fetch(`https://www.loc.gov/search/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.results || []) {
      const raw = item.image_url;
      const imageUrl = Array.isArray(raw) ? raw[0] : raw;
      if (imageUrl?.includes("loc.gov")) {
        return { imageUrl, pageUrl: item.url, title: item.title };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function downloadLocalCard(slug, remoteUrl) {
  if (!remoteUrl?.startsWith("https://")) return null;
  const variants = [
    remoteUrl.split("#")[0],
    remoteUrl.replace(/_150px\.jpg/, "r.jpg").split("#")[0],
    remoteUrl.replace(/t\.gif/, "r.jpg").split("#")[0],
  ];
  const seen = new Set();
  for (const url of variants) {
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const res = await fetch(url, { headers: { "User-Agent": "SeeStew/1.0" } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_IMAGE_BYTES) continue;
      const dir = join(PUBLIC_STORIES, slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "card.jpg"), buf);
      return `/stories/${slug}/card.jpg`;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function attachLocImage(queueItem, title, slug) {
  const loc = await searchLocImage(queueItem.imageSearchTerms);
  if (loc?.imageUrl) {
    const localPath = await downloadLocalCard(slug, loc.imageUrl);
    const card = localPath || loc.imageUrl;
    return {
      card,
      hero: card,
      alt: loc.title || title,
      credit: "Library of Congress",
      sourcePageUrl: loc.pageUrl,
    };
  }
  return {
    imagePrompt: `Historic editorial illustration: ${queueItem.title}. ${queueItem.angle || ""}. Period-accurate, muted tones, no text, no logos.`,
    alt: title,
  };
}
