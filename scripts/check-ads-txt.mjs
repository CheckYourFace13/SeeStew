#!/usr/bin/env node
/**
 * Verify ads.txt is present locally and (optionally) on the live site.
 * Usage: node scripts/check-ads-txt.mjs [https://seestew.com]
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const EXPECTED_LINE =
  "google.com, pub-9572509189594279, DIRECT, f08c47fec0942fa0";

const localPath = join(process.cwd(), "public", "ads.txt");
let failed = 0;

if (!existsSync(localPath)) {
  console.error("FAIL: public/ads.txt missing");
  failed++;
} else {
  const body = readFileSync(localPath, "utf-8").trim();
  if (body !== EXPECTED_LINE) {
    console.error(`FAIL: public/ads.txt content mismatch:\n  got: ${body}`);
    failed++;
  } else {
    console.log("PASS: public/ads.txt");
  }
}

const liveUrl = process.argv[2];
if (liveUrl) {
  const url = `${liveUrl.replace(/\/$/, "")}/ads.txt`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = (await res.text()).trim();
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) {
      console.error(`FAIL: ${url} HTTP ${res.status}`);
      failed++;
    } else if (text !== EXPECTED_LINE) {
      console.error(`FAIL: ${url} body mismatch:\n  got: ${text}`);
      failed++;
    } else if (!type.includes("text/plain")) {
      console.warn(`WARN: ${url} Content-Type is "${type}" (expected text/plain)`);
      console.log(`PASS: ${url} (content ok)`);
    } else {
      console.log(`PASS: ${url}`);
    }
  } catch (e) {
    console.error(`FAIL: could not fetch ${url}: ${e.message}`);
    failed++;
  }
}

if (failed > 0) process.exit(1);
console.log("\nads.txt checks passed.");
