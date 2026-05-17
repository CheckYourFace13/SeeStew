#!/usr/bin/env node
/**
 * Run the story pipeline locally or from CI.
 * Usage: node scripts/publish.mjs
 * Requires CRON_SECRET in env (or .env.local loaded by your shell).
 */

const base = process.env.SITE_URL || "http://localhost:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("Set CRON_SECRET in your environment.");
  process.exit(1);
}

const url = `${base}/api/cron/publish?secret=${encodeURIComponent(secret)}`;

const res = await fetch(url, { method: "GET" });
const body = await res.json();

console.log(JSON.stringify(body, null, 2));
process.exit(res.ok ? 0 : 1);
