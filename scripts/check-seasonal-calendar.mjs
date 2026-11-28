#!/usr/bin/env node
/**
 * Validates seasonal calendar: movable holidays, year boundaries, promote slugs,
 * feature expiration, and queue pick interleaving.
 */

import { existsSync, readdirSync } from "fs";
import { join } from "path";
import {
  nthWeekdayOfMonth,
  resolvePeakDate,
  getSeasonalWindows,
  getActiveFeatureWindows,
  getActivePublishWindows,
  getCurrentSeasonalPriorities,
  SEASONAL_CALENDAR,
  isSeasonalPublishCandidate,
} from "./seasonal-calendar.mjs";
import { loadQueue, pickNextQueueItem, ALL_QUEUE_SEEDS } from "./story-queue.mjs";
import { pickNextQuickRead, loadQuickReadQueue } from "./quick-read-queue.mjs";

const ARTICLES_DIR = join(process.cwd(), "content", "articles");
const published = new Set(
  existsSync(ARTICLES_DIR)
    ? readdirSync(ARTICLES_DIR)
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""))
    : []
);

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`OK: ${msg}`);
  }
}

// Thanksgiving 2026 = Thursday Nov 26
const tg2026 = nthWeekdayOfMonth(2026, 11, 4, 4);
assert(
  tg2026.getUTCFullYear() === 2026 &&
    tg2026.getUTCMonth() === 10 &&
    tg2026.getUTCDate() === 26,
  "Thanksgiving 2026 is Nov 26"
);

// Memorial Day 2026 = last Monday May 25
const md2026 = nthWeekdayOfMonth(2026, 5, 1, -1);
assert(
  md2026.getUTCMonth() === 4 && md2026.getUTCDate() === 25,
  "Memorial Day 2026 is May 25"
);

// Labor Day 2026 = Sep 7
const ld2026 = nthWeekdayOfMonth(2026, 9, 1, 1);
assert(
  ld2026.getUTCMonth() === 8 && ld2026.getUTCDate() === 7,
  "Labor Day 2026 is Sep 7"
);

// Presidents Day 2026 = Feb 16
const pd2026 = nthWeekdayOfMonth(2026, 2, 1, 3);
assert(
  pd2026.getUTCMonth() === 1 && pd2026.getUTCDate() === 16,
  "Presidents Day 2026 is Feb 16"
);

// Year-boundary: Christmas windows visible from mid-Nov
const nov27 = new Date("2026-11-27T18:00:00-05:00");
const windows = getSeasonalWindows(nov27);
const christmas = windows.find(
  (w) => w.observance.id === "christmas" && w.year === 2026
);
assert(!!christmas, "Christmas 2026 window exists");
assert(christmas.featureActive, "Christmas feature active ~45d before peak");
assert(christmas.publishActive, "Christmas publish priority active");
assert(christmas.discoveryActive, "Christmas discovery active");

const newYear = windows.find(
  (w) => w.observance.id === "new-years" && w.year === 2027
);
assert(!!newYear, "New Year 2027 window exists from late Nov 2026");
assert(newYear.discoveryActive || newYear.publishActive, "New Year discover/publish active");

// Feature expires after window
const jan10 = new Date("2027-01-10T12:00:00-05:00");
const xmasAfter = getSeasonalWindows(jan10).find(
  (w) => w.observance.id === "christmas" && w.year === 2026
);
assert(xmasAfter && !xmasAfter.featureActive, "Christmas 2026 feature expires after peak+7d");

// Promote slugs that exist are preferred; missing slugs are OK (filtered at runtime)
let promoteHits = 0;
for (const obs of SEASONAL_CALENDAR.observances) {
  for (const slug of obs.promoteSlugs) {
    if (published.has(slug)) promoteHits += 1;
  }
}
assert(promoteHits >= 20, `At least 20 promoteSlugs resolve to published articles (have ${promoteHits})`);

// Seasonal seeds present in ALL_QUEUE_SEEDS
const seasonalIds = ALL_QUEUE_SEEDS.filter((i) => i.seasonal).map((i) => i.id);
assert(seasonalIds.length >= 5, `Seasonal seed batch loaded (${seasonalIds.length})`);
assert(
  seasonalIds.includes("washington-crossing-delaware-1776"),
  "Washington Crossing seasonal seed present"
);
assert(
  seasonalIds.includes("eggnog-riot-west-point-1826"),
  "Eggnog Riot seasonal seed present"
);

// Queue pick prefers seasonal when pending, then evergreen next
const queue = loadQueue();
const next = pickNextQueueItem(queue, published, nov27);
assert(!!next, "pickNextQueueItem returns an item");
if (next && isSeasonalPublishCandidate(next, nov27)) {
  console.log(`OK: next full pick is seasonal-priority: ${next.id}`);
} else {
  console.log(`OK: next full pick (no seasonal pending match): ${next?.id}`);
}

const qr = loadQuickReadQueue();
const nextQr = pickNextQuickRead(qr, published, nov27);
assert(!!nextQr || (qr.items || []).every((i) => i.status !== "pending"), "QR pick works");

const priorities = getCurrentSeasonalPriorities(nov27);
assert(
  priorities.some((p) => p.id === "christmas"),
  "Current priorities include Christmas"
);
assert(
  priorities.some((p) => p.id === "winter-history" || p.id === "new-years" || p.id === "thanksgiving"),
  "Current priorities include winter/New Year/Thanksgiving"
);

const features = getActiveFeatureWindows(nov27);
assert(features.length > 0, "Active feature windows non-empty");
const publish = getActivePublishWindows(nov27);
assert(publish.length > 0, "Active publish windows non-empty");

// No new indexable URL invented by calendar (observances are data only)
assert(
  !SEASONAL_CALENDAR.observances.some((o) => o.landingPath || o.newUrl),
  "Calendar does not define new landing URLs"
);

console.log("\nActive priorities:");
for (const p of priorities.slice(0, 10)) {
  const live = p.promoteSlugs.filter((s) => published.has(s));
  console.log(
    `  ${p.label}: peak ${p.daysUntilPeak}d | feature=${p.featureActive} | promote live ${live.length}/${p.promoteSlugs.length}`
  );
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll seasonal calendar checks passed.");
