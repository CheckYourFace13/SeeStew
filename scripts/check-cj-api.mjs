#!/usr/bin/env node
/**
 * Secure CJ Affiliate connectivity + property check for SeeStew.
 *
 * Reads CJ_PERSONAL_ACCESS_TOKEN from the environment or gitignored .env.local.
 * Never prints the token. Exit 0 only when Link Search accepts website-id 101904039.
 *
 * Usage: node scripts/check-cj-api.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBSITE_ID = "101904039";
const LINK_SEARCH =
  `https://link-search.api.cj.com/v2/link-search?website-id=${WEBSITE_ID}&advertiser-ids=joined&records-per-page=1&page-number=1`;

function loadToken() {
  if (process.env.CJ_PERSONAL_ACCESS_TOKEN?.trim()) {
    return process.env.CJ_PERSONAL_ACCESS_TOKEN.trim();
  }
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return null;
  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("CJ_PERSONAL_ACCESS_TOKEN="));
  if (!line) return null;
  return line.slice("CJ_PERSONAL_ACCESS_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
}

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

async function main() {
  const token = loadToken();
  if (!token || token.length < 12) {
    fail(
      "CJ_PERSONAL_ACCESS_TOKEN missing — set in server env or gitignored .env.local (never NEXT_PUBLIC_ / git)"
    );
  }
  pass("CJ_PERSONAL_ACCESS_TOKEN present (value not shown)");

  let res;
  try {
    res = await fetch(LINK_SEARCH, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/xml",
      },
    });
  } catch (err) {
    fail(`Link Search network error: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (res.status === 401 || res.status === 403) {
    fail(`Link Search auth rejected HTTP ${res.status}`);
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 200).replace(/\s+/g, " ");
    fail(`Link Search HTTP ${res.status}: ${body}`);
  }

  const xml = await res.text();
  if (!xml.includes("<cj-api") && !xml.includes("cj-api")) {
    fail("Link Search response was not CJ XML");
  }
  // website-id accepted when we get a normal links envelope (even if zero joined ads)
  if (!/total-matched=/.test(xml) && !/<links[\s>]/.test(xml)) {
    fail("Link Search XML missing links envelope — website-id may be invalid for this token");
  }

  pass(`CJ Link Search authenticated for website-id ${WEBSITE_ID}`);

  const joinedMatch = xml.match(/total-matched="(\d+)"/);
  if (joinedMatch) {
    pass(`joined advertiser link inventory reachable (total-matched=${joinedMatch[1]})`);
  }

  // Optional Advertiser Lookup — needs publisher company CID (not website PID)
  const cid = process.env.CJ_REQUESTOR_CID?.trim();
  if (cid) {
    const url = `https://advertiser-lookup.api.cj.com/v3/advertiser-lookup?requestor-cid=${encodeURIComponent(cid)}&advertiser-ids=joined&records-per-page=1`;
    const adv = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/xml" },
    });
    if (adv.ok) pass(`Advertiser Lookup OK for requestor-cid (CID not printed)`);
    else console.log(`WARN: Advertiser Lookup HTTP ${adv.status} — check CJ_REQUESTOR_CID`);
  } else {
    console.log(
      "INFO: Advertiser Lookup skipped (set CJ_REQUESTOR_CID = publisher company CID, not website PID)"
    );
  }

  console.log("-".repeat(60));
  console.log("CJ API connectivity check passed (credentials not exposed)");
  process.exit(0);
}

main();
