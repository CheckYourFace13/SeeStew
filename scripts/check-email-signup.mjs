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

const flag = process.env.NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED === "true";
const formUrl = (
  process.env.NEXT_PUBLIC_SENDFABLE_SIGNUP_FORM_URL ||
  process.env.SENDFABLE_SIGNUP_FORM_URL ||
  ""
).trim();
const ready = flag && Boolean(formUrl);

if (flag && !ready) {
  fail(
    "NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED=true but SENDFABLE signup form URL is empty — would be a fake signup"
  );
} else if (!flag) {
  pass("signup flag off (no public form expected)");
} else {
  pass("signup flag on with SendFable hosted form URL");
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

let publicApiKey = false;
walk(join(ROOT, "src"), (p) => {
  const text = readFileSync(p, "utf-8");
  if (/NEXT_PUBLIC_SENDFABLE_API_KEY/.test(text)) {
    publicApiKey = true;
    fail(`NEXT_PUBLIC_ API key pattern in ${p}`);
  }
});
if (!publicApiKey) pass("no NEXT_PUBLIC_SENDFABLE_API_KEY");

const serverOnly = join(ROOT, "src", "lib", "sendfable-server.ts");
if (existsSync(serverOnly)) {
  pass("SendFable API keys isolated in sendfable-server.ts");
} else {
  fail("missing src/lib/sendfable-server.ts for server-only keys");
}

const signupComponent = join(ROOT, "src", "components", "EmailDigestSignup.tsx");
if (!existsSync(signupComponent)) {
  fail("missing EmailDigestSignup component");
} else {
  const c = readFileSync(signupComponent, "utf-8");
  if (!c.includes("emailSignupConfig.isReady")) {
    fail("EmailDigestSignup must gate on emailSignupConfig.isReady");
  } else {
    pass("EmailDigestSignup gated on isReady");
  }
  if (/process\.env\.SENDFABLE_API_KEY/.test(c)) {
    fail("EmailDigestSignup must not read SENDFABLE_API_KEY");
  }
  if (c.includes("sendfable.com")) {
    if (!c.includes("noopener noreferrer") && !c.includes("poweredRel")) {
      fail("Powered by SendFable link missing safe rel");
    } else {
      pass("Powered by SendFable uses safe external rel");
    }
  }
}

const privacy = join(ROOT, "src", "app", "privacy", "page.tsx");
if (existsSync(privacy)) {
  const p = readFileSync(privacy, "utf-8");
  const mentionsSendFable = /sendfable/i.test(p);
  if (!flag && mentionsSendFable) {
    fail("privacy mentions SendFable while signup is disabled");
  } else if (flag && ready && !mentionsSendFable) {
    fail("signup enabled but privacy does not mention SendFable");
  } else if (!flag) {
    pass("privacy does not claim SendFable list while signup disabled");
  } else {
    pass("privacy SendFable mention matches enabled signup");
  }
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
