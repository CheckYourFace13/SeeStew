#!/usr/bin/env node
/**
 * Backfill eventYear + historicalEra on existing articles from verified event dates.
 * Usage: node scripts/backfill-historical-eras.mjs
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const DIR = join(ROOT, "content", "articles");

const ERAS = [
  { slug: "colonial-america", start: 1492, end: 1774 },
  { slug: "revolution-early-republic", start: 1775, end: 1820 },
  { slug: "antebellum-civil-war", start: 1821, end: 1865 },
  { slug: "reconstruction-gilded-age", start: 1866, end: 1900 },
  { slug: "progressive-wwi", start: 1901, end: 1919 },
  { slug: "twenties-depression", start: 1920, end: 1938 },
  { slug: "world-war-ii", start: 1939, end: 1945 },
  { slug: "postwar-cold-war", start: 1946, end: 1991 },
  { slug: "modern-america", start: 1992, end: 2099 },
];

const OVERRIDES = {
  "project-mkultra": 1953,
  "tuskegee-syphilis-study": 1932,
  "iran-contra-affair": 1985,
  "operation-paperclip": 1945,
  "operation-northwoods-1962": 1962,
  "minuteman-missile-accidents": 1980,
  "demon-core-los-alamos": 1945,
  "cutter-polio-vaccine-incident-1955": 1955,
  "flint-water-crisis": 2014,
  "deepwater-horizon-2010": 2010,
  "whiskey-rebellion-1794": 1794,
  "amistad-revolt-1839": 1839,
  "underground-railroad": 1850,
  "trail-of-tears": 1838,
  "pony-express-1860": 1860,
  "lewis-and-clark-expedition": 1804,
  "bonus-army-1932": 1932,
  "sacco-vanzetti-trial": 1921,
  "teapot-dome-scandal-1920s": 1922,
  "radium-girls-1920s": 1922,
  "black-sox-scandal-1919": 1919,
  "osage-murders-1920s": 1921,
  "osage-murders-reign-of-terror": 1921,
  "scottsboro-boys": 1931,
  "move-bombing-1985": 1985,
  "dust-bowl-1930s": 1935,
  "ghost-army-wwii": 1944,
  "greenbrier-bunker": 1959,
  "hanford-radiation-releases": 1945,
  "japanese-american-incarceration-wwii": 1942,
  "libby-montana-asbestos": 1999,
  "lost-colony-roanoke": 1587,
  "manhattan-project": 1942,
  "operation-midnight-climax": 1953,
  "poison-squad-wiley": 1902,
};

function yearFrom(slug, title) {
  if (OVERRIDES[slug] != null) return OVERRIDES[slug];
  const slugYear = slug.match(/(?:^|-)((?:1[6-9]\d{2}|20[0-2]\d))(?:-|$)/);
  if (slugYear) return Number(slugYear[1]);
  const titleYear = `${title} ${slug}`.match(/\b((?:1[6-9]\d{2}|20[0-2]\d))\b/);
  return titleYear ? Number(titleYear[1]) : null;
}

function eraFor(year) {
  return ERAS.find((e) => year >= e.start && year <= e.end)?.slug ?? null;
}

let updated = 0;
let missing = 0;
const byEra = {};

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const path = join(DIR, file);
  const article = JSON.parse(readFileSync(path, "utf-8"));
  const year = yearFrom(article.slug || file.replace(/\.json$/, ""), article.title || "");
  if (year == null) {
    missing++;
    console.warn(`NO_YEAR\t${file}`);
    continue;
  }
  const era = eraFor(year);
  if (!era) {
    missing++;
    console.warn(`NO_ERA\t${file}\tyear=${year}`);
    continue;
  }
  const next = {
    ...article,
    eventYear: year,
    historicalEra: era,
  };
  // Preserve format if set; default omitted = full
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n", "utf-8");
  updated++;
  byEra[era] = (byEra[era] || 0) + 1;
}

console.log(`Updated ${updated} articles; ${missing} without resolvable event year.`);
console.log("By era:");
for (const [slug, n] of Object.entries(byEra).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n}\t${slug}`);
}
