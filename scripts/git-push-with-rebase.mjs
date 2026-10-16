#!/usr/bin/env node
/**
 * Commit staged publishing changes and push with rebase retries
 * (protects against concurrent daily + Quick Read workflows on main).
 *
 * Env:
 *   COMMIT_MESSAGE — required
 *   MAX_RETRIES — default 3
 */

import { execSync } from "child_process";

const msg = process.env.COMMIT_MESSAGE;
const max = Number(process.env.MAX_RETRIES || 3);

if (!msg) {
  console.error("COMMIT_MESSAGE is required");
  process.exit(1);
}

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function hasStaged() {
  try {
    execSync("git diff --cached --quiet");
    return false;
  } catch {
    return true;
  }
}

if (!hasStaged()) {
  console.error("::error::Nothing staged to commit — publisher produced no file updates.");
  process.exit(1);
}

run("git config user.name \"SeeStew Bot\"");
run("git config user.email \"bot@seestew.com\"");

const safeMsg = msg.replace(/"/g, '\\"').slice(0, 200);
run(`git commit -m "${safeMsg}"`);

let attempt = 0;
while (attempt < max) {
  attempt++;
  try {
    run("git pull --rebase origin main");
    run("git push origin HEAD:main");
    console.log("Push succeeded.");
    process.exit(0);
  } catch {
    console.warn(`::warning::Push/rebase attempt ${attempt} failed`);
    try {
      run("git rebase --abort");
    } catch {
      /* no rebase in progress */
    }
    if (attempt >= max) break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000);
  }
}

console.error("::error::Commit/push failed after rebase retries — concurrent branch updates or permission issue.");
process.exit(1);
