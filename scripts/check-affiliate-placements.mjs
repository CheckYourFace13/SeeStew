#!/usr/bin/env node
/**
 * Validate config-driven CJ/Awin placements.
 * Usage: node scripts/check-affiliate-placements.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

let failed = 0;
const fail = (m) => {
  console.error(`FAIL: ${m}`);
  failed++;
};
const pass = (m) => console.log(`PASS: ${m}`);

const configPath = join(ROOT, "src/lib/affiliate-config.ts");
const placementsPath = join(ROOT, "src/data/affiliate-placements.ts");
const config = readFileSync(configPath, "utf-8");
const placementsSrc = readFileSync(placementsPath, "utf-8");

if (!config.includes('CJ_WEBSITE_PID = "101904039"')) {
  fail("CJ_WEBSITE_PID must be SeeStew promotional property 101904039");
} else pass("CJ_WEBSITE_PID is 101904039");

if (!config.includes('AWIN_PUBLISHER_ID = "3112962"')) {
  fail("AWIN_PUBLISHER_ID must remain 3112962");
} else pass("AWIN_PUBLISHER_ID is 3112962");

// Fail only on committed secret values or public env leakage — not docs mentioning the key name.
if (/NEXT_PUBLIC_CJ_/.test(config + placementsSrc)) {
  fail("CJ credentials must never use NEXT_PUBLIC_");
} else pass("no NEXT_PUBLIC_CJ_ leakage");
if (/CJ_PERSONAL_ACCESS_TOKEN\s*=\s*["'][^"']+["']/.test(config + placementsSrc)) {
  fail("CJ_PERSONAL_ACCESS_TOKEN value must not be committed in source");
} else pass("no committed CJ_PERSONAL_ACCESS_TOKEN value");

// Strip line comments before counting active flags (avoids doc-comment false positives).
const codeOnly = placementsSrc
  .split("\n")
  .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
  .join("\n");
const activeBlocks = [...codeOnly.matchAll(/active:\s*true/g)];

if (activeBlocks.length > 3) {
  fail(`more than 3 active:true network placements (${activeBlocks.length})`);
} else pass(`active:true count within cap (${activeBlocks.length}/3)`);

for (const m of codeOnly.matchAll(/\{[\s\S]*?active:\s*true[\s\S]*?\}/g)) {
  const block = m[0];
  if (!/trackingUrl:\s*"https:\/\//.test(block)) {
    fail("active placement missing https trackingUrl");
  }
  if (/trackingUrl:\s*""/.test(block) || /trackingUrl:\s*"https:\/\/example/.test(block)) {
    fail("active placement has empty or example trackingUrl");
  }
}

const envExample = existsSync(join(ROOT, ".env.example"))
  ? readFileSync(join(ROOT, ".env.example"), "utf-8")
  : "";
if (!envExample.includes("CJ_PERSONAL_ACCESS_TOKEN")) {
  fail(".env.example should document CJ_PERSONAL_ACCESS_TOKEN (server-only)");
} else pass(".env.example documents CJ_PERSONAL_ACCESS_TOKEN");

if (!existsSync(join(ROOT, "docs/CJ_SEESTEW_SETUP.md"))) {
  fail("missing docs/CJ_SEESTEW_SETUP.md");
} else pass("docs/CJ_SEESTEW_SETUP.md present");

console.log("-".repeat(60));
console.log(failed ? `${failed} check(s) failed` : "All affiliate-placement checks passed");
process.exit(failed ? 1 : 0);
