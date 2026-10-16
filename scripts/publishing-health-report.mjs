#!/usr/bin/env node
/**
 * Lightweight publishing health report for Actions logs / $GITHUB_STEP_SUMMARY.
 * Read-only against local git + queue files. Optionally probes GitHub Actions API
 * when GITHUB_TOKEN + GITHUB_REPOSITORY are set (no secrets printed).
 *
 * Usage: node scripts/publishing-health-report.mjs
 */

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { loadQueue, countPending, MIN_PENDING_TOPICS, REFILL_PENDING_THRESHOLD } from "./story-queue.mjs";
import { loadQuickReadQueue, countQrPending, MIN_QR_PENDING } from "./quick-read-queue.mjs";

const ROOT = process.cwd();
const ARTICLES = join(ROOT, "content", "articles");

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function latestByFormat(format) {
  if (!existsSync(ARTICLES)) return null;
  const files = readdirSync(ARTICLES).filter((f) => f.endsWith(".json"));
  let best = null;
  for (const f of files) {
    const a = JSON.parse(readFileSync(join(ARTICLES, f), "utf-8"));
    const isQr = a.format === "quick-read";
    if (format === "quick-read" ? !isQr : isQr) continue;
    const t = a.createdAt || "";
    if (!best || t > best.createdAt) best = { slug: a.slug, title: a.title, createdAt: t };
  }
  return best;
}

function lines(...parts) {
  return parts.filter(Boolean).join("\n");
}

async function fetchWorkflowRuns(workflowFile, perPage = 14) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || "CheckYourFace13/SeeStew";
  if (!token && !process.env.ALLOW_PUBLIC_ACTIONS_API) {
    // Public API works without token for public repos
  }
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "SeeStew-publishing-health",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/runs?per_page=${perPage}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return { error: `HTTP ${res.status}`, runs: [] };
    const data = await res.json();
    return { runs: data.workflow_runs || [] };
  } catch (e) {
    return { error: e.message, runs: [] };
  }
}

function summarizeRuns(runs, days = 7) {
  const cutoff = Date.now() - days * 86400000;
  const recent = runs.filter((r) => new Date(r.created_at).getTime() >= cutoff);
  const success = recent.filter((r) => r.conclusion === "success").length;
  const failure = recent.filter((r) => r.conclusion === "failure").length;
  const cancelled = recent.filter((r) => r.conclusion === "cancelled").length;
  const last = runs[0];
  return { success, failure, cancelled, last, recentCount: recent.length };
}

function nextCronHints() {
  return {
    daily: "Daily full story: cron `0 10 * * *` UTC (= 05:00 America/Chicago CDT)",
    quickRead: "Quick Reads: cron `0 14 * * 2,4,6` UTC Tue/Thu/Sat (= 09:00 America/Chicago CDT)",
  };
}

async function main() {
  const full = latestByFormat("full");
  const qr = latestByFormat("quick-read");
  const sq = loadQueue();
  const qq = loadQuickReadQueue();
  const pendingFull = countPending(sq);
  const pendingQr = countQrPending(qq);
  const sha = sh("git rev-parse --short HEAD");

  const daily = await fetchWorkflowRuns("daily-story.yml");
  const quick = await fetchWorkflowRuns("quick-reads.yml");
  const dailySum = summarizeRuns(daily.runs || []);
  const qrSum = summarizeRuns(quick.runs || []);

  const alerts = [];
  if (pendingFull < REFILL_PENDING_THRESHOLD) {
    alerts.push(`Full-story queue below ${REFILL_PENDING_THRESHOLD} (now ${pendingFull})`);
  } else if (pendingFull < MIN_PENDING_TOPICS) {
    alerts.push(`Full-story queue below reserve ${MIN_PENDING_TOPICS} (now ${pendingFull})`);
  }
  if (pendingQr < MIN_QR_PENDING) {
    alerts.push(`Quick Read queue below ${MIN_QR_PENDING} (now ${pendingQr})`);
  }
  if (dailySum.failure > 0) {
    alerts.push(`Daily workflow failures in last 7d: ${dailySum.failure}`);
  }
  if (qrSum.failure > 0) {
    alerts.push(`Quick Read workflow failures in last 7d: ${qrSum.failure}`);
  }
  if (!full) alerts.push("No full stories found in content/articles");

  // Missed-day heuristic: if last successful daily run older than ~36h and we have failures
  if (dailySum.last?.conclusion === "failure") {
    alerts.push(`Last daily run failed (${dailySum.last.created_at})`);
  }
  if (quick.error && !String(quick.error).includes("404")) {
    /* ignore missing workflow until first push */
  }

  const hints = nextCronHints();
  const report = lines(
    "## SeeStew publishing health",
    "",
    `| Item | Value |`,
    `|---|---|`,
    `| Repo SHA | \`${sha}\` |`,
    `| Last full story | ${full ? `${full.slug} (${full.createdAt})` : "_none_"} |`,
    `| Last Quick Read | ${qr ? `${qr.slug} (${qr.createdAt})` : "_none published_"} |`,
    `| Full-story pending | **${pendingFull}** (target ≥${MIN_PENDING_TOPICS}) |`,
    `| Quick Read pending | **${pendingQr}** (want ≥${MIN_QR_PENDING}) |`,
    `| Daily workflow (7d) | ${dailySum.success} ok / ${dailySum.failure} fail / ${dailySum.cancelled} cancel |`,
    `| QR workflow (7d) | ${qrSum.success} ok / ${qrSum.failure} fail / ${qrSum.cancelled} cancel |`,
    `| Last daily run | ${dailySum.last ? `${dailySum.last.created_at} → ${dailySum.last.conclusion}` : daily.error || "_n/a_"} |`,
    `| Last QR run | ${qrSum.last ? `${qrSum.last.created_at} → ${qrSum.last.conclusion}` : quick.error || "_none yet_"} |`,
    "",
    "### Schedule",
    `- ${hints.daily}`,
    `- ${hints.quickRead}`,
    "",
    alerts.length ? "### Alerts\n" + alerts.map((a) => `- ⚠️ ${a}`).join("\n") : "### Alerts\n- None",
    ""
  );

  console.log(report);

  for (const a of alerts) {
    // Hard errors only for actionable empty-queue / publish-blocking states.
    // Historical 7d failure counts stay warnings so health steps don't look like new outages.
    if (/EMPTY|below 15|Zero pending/i.test(a)) console.error(`::error::${a}`);
    else console.warn(`::warning::${a}`);
  }

  // Exit 0 always for report-only; publishers exit non-zero on hard failures.
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(0);
});
