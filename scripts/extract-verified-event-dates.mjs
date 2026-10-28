#!/usr/bin/env node
/**
 * Candidates only: month+day+year in article body matching eventYear.
 * Never treat createdAt as an event date. Review before adding to ANNIVERSARIES.
 */

import { readdirSync, readFileSync } from "fs";
import { join } from "path";
const known = new Set([
  "boston-massacre-1770",
  "triangle-shirtwaist-fire-1911",
  "great-molasses-flood-1919",
  "eastland-disaster-1915",
  "johnstown-flood-1889",
  "black-tom-explosion-1916",
  "challenger-disaster-1986",
  "kent-state-shootings-1970",
  "stonewall-riots-1969",
  "watergate-break-in-1972",
  "three-mile-island-1979",
  "hurricane-katrina-2005",
  "san-francisco-earthquake-1906",
  "galveston-hurricane-1900",
  "uss-indianapolis-1945",
  "cocoanut-grove-fire-1942",
  "hartford-circus-fire-1944",
  "whiskey-rebellion-1794",
  "tulsa-race-massacre-1921",
]);

const DIR = join(process.cwd(), "content", "articles");
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const existing = known;
const re =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+((?:1[6-9]\d{2}|20[0-2]\d))\b/g;

for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const a = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  const year = a.eventYear;
  if (!year) continue;
  const body = String(a.content || "").split(/^##\s*Sources\b/im)[0].slice(0, 1800);
  const hits = [];
  let m;
  const r = new RegExp(re.source, "gi");
  while ((m = r.exec(body))) {
    const y = Number(m[3]);
    if (y !== year) continue;
    hits.push({ month: MONTHS[m[1].toLowerCase()], day: Number(m[2]), year: y, text: m[0] });
  }
  if (!hits.length) continue;
  const first = hits[0];
  const flag = existing.has(a.slug) ? "HAVE" : "NEW";
  console.log(
    `${flag}\t${a.slug}\t${first.month}/${first.day}/${first.year}\t${first.text}\t${(a.references?.[0]?.url || "").slice(0, 80)}`
  );
}
