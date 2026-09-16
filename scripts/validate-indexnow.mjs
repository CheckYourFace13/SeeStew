#!/usr/bin/env node
/**
 * Validate IndexNow key file + submit script wiring.
 *
 * Usage:
 *   node scripts/validate-indexnow.mjs
 *   node scripts/validate-indexnow.mjs --live
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const KEY = "39f4a09627794f9d938e051350d8169e";
const HOST = "seestew.com";
const BASE = `https://${HOST}`;
const KEY_LOCATION = `${BASE}/${KEY}.txt`;
const WWW_KEY_LOCATION = `https://www.${HOST}/${KEY}.txt`;
const SITEMAP = `${BASE}/sitemap.xml`;
const STALE = "d3dc290bb6904d4d865801bbc64929ec";

let failed = 0;

function pass(msg) {
  console.log(`PASS: ${msg}`);
}
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed++;
}

const publicPath = join(process.cwd(), "public", `${KEY}.txt`);
if (!existsSync(publicPath)) {
  fail(`missing public/${KEY}.txt`);
} else {
  const body = readFileSync(publicPath, "utf8");
  if (body.trim() !== KEY) {
    fail(`public/${KEY}.txt body mismatch (got ${JSON.stringify(body)})`);
  } else {
    pass(`public/${KEY}.txt body matches key`);
  }
}

const routePath = join(process.cwd(), "src", "app", `${KEY}.txt`, "route.ts");
if (!existsSync(routePath)) {
  fail(`missing src/app/${KEY}.txt/route.ts`);
} else {
  pass(`App Router route src/app/${KEY}.txt/route.ts`);
}

const libPath = join(process.cwd(), "src", "lib", "indexnow.ts");
const libSrc = readFileSync(libPath, "utf8");
if (!libSrc.includes(`"${KEY}"`)) fail(`src/lib/indexnow.ts missing key ${KEY}`);
else pass("src/lib/indexnow.ts key constant");

const submitPath = join(process.cwd(), "scripts", "submit-indexnow.mjs");
const submitSrc = readFileSync(submitPath, "utf8");
if (!submitSrc.includes(`"${KEY}"`)) fail("submit-indexnow.mjs DEFAULT_KEY mismatch");
else pass("submit-indexnow.mjs DEFAULT_KEY");

if (!submitSrc.includes("keyLocation: KEY_LOCATION")) {
  fail("submit-indexnow.mjs does not send keyLocation in POST body");
} else {
  pass("submit-indexnow.mjs POST includes keyLocation");
}

if (!submitSrc.includes(`const HOST = "${HOST}"`)) {
  fail("submit-indexnow.mjs HOST is not apex seestew.com");
} else {
  pass("submit-indexnow.mjs uses apex host");
}

if (!submitSrc.includes("/sitemap.xml")) {
  fail("submit-indexnow.mjs bulk submit missing sitemap.xml");
} else {
  pass(`submit-indexnow.mjs --all includes ${SITEMAP}`);
}

for (const [label, src] of [
  ["submit-indexnow.mjs", submitSrc],
  ["indexnow.ts", libSrc],
]) {
  if (src.includes(STALE)) fail(`${label} still references old key`);
  else pass(`${label} has no old key`);
}

if (existsSync(join(process.cwd(), "public", `${STALE}.txt`))) {
  fail(`old key file still present: public/${STALE}.txt`);
} else {
  pass("old public key file removed");
}

if (existsSync(join(process.cwd(), "src", "app", `${STALE}.txt`))) {
  fail(`old App Router key route still present`);
} else {
  pass("old App Router key route removed");
}

if (process.argv.includes("--live")) {
  for (const url of [KEY_LOCATION, WWW_KEY_LOCATION]) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      const text = await res.text();
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        fail(`${url} HTTP ${res.status}`);
        continue;
      }
      if (text.trim() !== KEY) {
        fail(`${url} body mismatch: ${JSON.stringify(text)}`);
        continue;
      }
      if (!type.includes("text/plain")) {
        console.warn(`WARN: ${url} Content-Type="${type}" (want text/plain)`);
      }
      pass(`${url} → ${res.status}, exact key, Content-Type=${type || "(none)"}`);
    } catch (e) {
      fail(`${url} fetch error: ${e.message}`);
    }
  }
}

if (failed > 0) {
  console.error(`\nIndexNow validation failed (${failed} error(s)).`);
  process.exit(1);
}
console.log("\nIndexNow validation passed.");
