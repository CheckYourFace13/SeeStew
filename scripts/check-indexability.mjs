#!/usr/bin/env node
/**
 * Fail closed if thin anniversary/hub pages would be treated as indexable
 * sitemap material. Does not invent content — enforces indexability policy.
 *
 * Usage: npm run check:indexability
 */

import { readFileSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const ROOT = process.cwd();
let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  console.error(`::error::${msg}`);
  failed++;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

const result = spawnSync(
  "npx",
  ["--yes", "tsx", "scripts/check-indexability-core.mts"],
  { cwd: ROOT, encoding: "utf8", shell: true }
);
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) {
  process.exit(result.status || 1);
}

const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
if (!sitemap.includes("indexableAnniversaryDateSlugs")) {
  fail("sitemap.ts must use indexableAnniversaryDateSlugs");
} else pass("sitemap uses indexableAnniversaryDateSlugs");
if (!sitemap.includes("isIndexableHistoryHub")) {
  fail("sitemap.ts must filter hubs with isIndexableHistoryHub");
} else pass("sitemap filters hubs with isIndexableHistoryHub");
if (sitemap.includes('"/contact"')) {
  fail("sitemap should not include /contact (noindex utility)");
} else pass("sitemap omits /contact");

const datePage = readFileSync(
  join(ROOT, "src/app/on-this-day/[date]/page.tsx"),
  "utf8"
);
if (!datePage.includes("isIndexableAnniversaryDate")) {
  fail("date page must gate robots with isIndexableAnniversaryDate");
} else pass("date page gates indexability");

const notFound = readFileSync(join(ROOT, "src/app/not-found.tsx"), "utf8");
if (!notFound.includes("data-seestew-no-ads")) {
  fail("not-found.tsx must mark data-seestew-no-ads");
} else pass("404 template marks no-ads");

const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
if (layout.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
  fail("root layout must not load AdSense script directly (use AdSenseLoader)");
} else pass("root layout defers AdSense to AdSenseLoader");
if (!layout.includes("AdSenseLoader")) {
  fail("root layout must render AdSenseLoader");
} else pass("root layout renders AdSenseLoader");

if (failed) {
  console.error(`${failed} indexability check(s) failed.`);
  process.exit(1);
}
console.log("Indexability checks passed.");
