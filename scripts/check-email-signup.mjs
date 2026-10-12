#!/usr/bin/env node
/**
 * Guardrails for SendFable / email signup.
 * Usage: node scripts/check-email-signup.mjs
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed++;
}
function pass(msg) {
  console.log(`PASS: ${msg}`);
}

function walk(dir, fn) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      if (["node_modules", ".next"].includes(name.name)) continue;
      walk(p, fn);
    } else if (/\.(tsx?|jsx?|mjs)$/.test(name.name)) fn(p);
  }
}

const emailLib = join(ROOT, "src", "lib", "email-signup.ts");
const embed = join(ROOT, "src", "components", "SendFableEmbed.tsx");
const signup = join(ROOT, "src", "components", "EmailDigestSignup.tsx");
const newsletter = join(ROOT, "src", "app", "newsletter", "page.tsx");

if (!existsSync(emailLib)) fail("missing email-signup.ts");
else {
  const lib = readFileSync(emailLib, "utf-8");
  if (!lib.includes("seestew-newsletter")) fail("missing SendFable form id seestew-newsletter");
  else pass("SendFable form id seestew-newsletter configured");
  if (!lib.includes("sendfable.com/embed/form.js")) fail("missing SendFable embed script URL");
  else pass("SendFable embed script URL present");
}

if (!existsSync(embed)) fail("missing SendFableEmbed.tsx");
else {
  const c = readFileSync(embed, "utf-8");
  if (!c.includes('id="sendfable-embed"')) fail("SendFable Script must use stable id sendfable-embed");
  else pass("SendFable script id is sendfable-embed (single load)");
  if (!c.includes("afterInteractive") && !c.includes("lazyOnload")) {
    fail("SendFable script strategy should be afterInteractive or lazyOnload");
  } else pass("SendFable script strategy is deferred");
  if (!c.includes("data-sendfable-form")) fail("missing data-sendfable-form mount");
  else pass("data-sendfable-form mount present");
}

if (!existsSync(signup)) fail("missing EmailDigestSignup");
else {
  const c = readFileSync(signup, "utf-8");
  if (!c.includes("emailSignupConfig.isReady")) fail("signup must gate on isReady");
  else pass("EmailDigestSignup gated on isReady");
  if (/process\.env\.SENDFABLE_API_KEY/.test(c)) fail("signup must not read API key");
}

if (!existsSync(newsletter)) fail("missing /newsletter page");
else pass("/newsletter page exists");

let publicApiKey = false;
walk(join(ROOT, "src"), (p) => {
  const text = readFileSync(p, "utf-8");
  if (/NEXT_PUBLIC_SENDFABLE_API_KEY/.test(text)) {
    publicApiKey = true;
    fail(`NEXT_PUBLIC_ API key pattern in ${p}`);
  }
});
if (!publicApiKey) pass("no NEXT_PUBLIC_SENDFABLE_API_KEY");

const privacy = join(ROOT, "src", "app", "privacy", "page.tsx");
if (existsSync(privacy)) {
  const p = readFileSync(privacy, "utf-8");
  if (!/sendfable/i.test(p)) fail("privacy must mention SendFable when embed signup is live");
  else pass("privacy mentions SendFable");
}

walk(join(ROOT, "src"), (p) => {
  if (p.includes("check-email-signup")) return;
  const text = readFileSync(p, "utf-8");
  if (/mailto:|info@seestew\.com/i.test(text)) fail(`public email/mailto in ${p}`);
});
walk(join(ROOT, "public"), (p) => {
  const text = readFileSync(p, "utf-8");
  if (/mailto:|info@seestew\.com/i.test(text)) fail(`public email/mailto in ${p}`);
});
pass("mailto / info@ scan complete");

let chrisP = false;
walk(join(ROOT, "src"), (p) => {
  if (/Chris P\./.test(readFileSync(p, "utf-8"))) {
    chrisP = true;
    fail(`"Chris P." still in ${p}`);
  }
});
if (!chrisP) pass('no "Chris P." in src');

console.log("-".repeat(60));
console.log(failed ? `${failed} check(s) failed` : "All email-signup checks passed");
process.exit(failed > 0 ? 1 : 0);
