#!/usr/bin/env node
/**
 * Automatic story / Quick Read queue replenishment — independent of publish.
 *
 * Policy (mission):
 * - Target 45–60 pending full stories; 15–20 pending Quick Reads.
 * - Replenish when full < 30 or QR < 10.
 * - Prefer curated seed batches; optional limited LLM discovery afterward.
 * - Validate sources, reject unsourced filler, never modify published articles.
 * - Alert clearly on research/validation failure.
 *
 * Usage:
 *   node scripts/replenish-queues.mjs
 *   node scripts/replenish-queues.mjs --discover
 *   DRY_RUN=1 node scripts/replenish-queues.mjs --discover
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { countCredibleRefs, normalizeUrl } from "./article-validation.mjs";
import {
  loadQueue,
  saveQueue,
  mergeMissingSeedItems,
  countPending,
  QUEUE_PATH,
  FULL_TARGET_MIN,
  FULL_TARGET_MAX,
  FULL_REPLENISH_TRIGGER,
  MAX_DISCOVER_FULL_PER_RUN,
} from "./story-queue.mjs";
import {
  loadQuickReadQueue,
  saveQuickReadQueue,
  mergeMissingQrSeeds,
  countQrPending,
  QR_QUEUE_PATH,
  QR_TARGET_MIN,
  QR_TARGET_MAX,
  QR_REPLENISH_TRIGGER,
  MAX_DISCOVER_QR_PER_RUN,
} from "./quick-read-queue.mjs";
import { ensureEventIndex } from "./editorial/prepublish-gate.mjs";
import { loadEventIndex } from "./editorial/event-index.mjs";
import { candidateFromDraft, findOverlaps, classifyOverlap } from "./editorial/overlap.mjs";

const DRY_RUN =
  process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");
const DISCOVER =
  process.env.SEESTEW_REPLENISH_DISCOVER === "1" ||
  process.argv.includes("--discover");
const FORCE =
  process.env.SEESTEW_REPLENISH_FORCE === "1" || process.argv.includes("--force");

const ARTICLES_DIR = join(process.cwd(), "content", "articles");
const LOG_PATH = join(process.cwd(), "content", "story-queue", "replenish-log.json");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

const CREDIBLE_HINT =
  /\.(gov|mil|edu)(\/|$)|loc\.gov|archives\.gov|smithsonian|si\.edu|nps\.gov|congress\.gov|pbs\.org|npr\.org|nytimes\.com|washingtonpost\.com|britannica\.com|nasa\.gov|usgs\.gov|noaa\.gov|fbi\.gov|history\.navy\.mil|senate\.gov|house\.gov/i;

function articleSlugs() {
  if (!existsSync(ARTICLES_DIR)) return new Set();
  return new Set(
    readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

function loadPublishedTitles() {
  const titles = [];
  if (!existsSync(ARTICLES_DIR)) return titles;
  for (const f of readdirSync(ARTICLES_DIR).filter((x) => x.endsWith(".json"))) {
    try {
      const a = JSON.parse(readFileSync(join(ARTICLES_DIR, f), "utf8"));
      if (a.title) titles.push({ slug: a.slug || f.replace(/\.json$/, ""), title: a.title });
    } catch {
      /* skip */
    }
  }
  return titles;
}

function validateTopicShape(item, { minSources = 4, format = "full" } = {}) {
  const issues = [];
  if (!item.id || !/^[a-z0-9-]+$/.test(item.id)) issues.push("invalid id");
  if (!item.title || item.title.length < 10) issues.push("title too short");
  if (!item.hook || item.hook.length < 20) issues.push("hook too short");
  if (!item.category) issues.push("missing category");
  if (!item.angle || item.angle.length < 20) issues.push("angle too short");
  if (!item.imageSearchTerms?.length) issues.push("missing imageSearchTerms");
  if (item.eventYear == null) issues.push("missing eventYear");
  const sources = item.requiredSources || [];
  if (sources.length < minSources) issues.push(`only ${sources.length} sources (need ${minSources}+)`);
  const credible = countCredibleRefs(sources);
  if (credible < 2) issues.push(`only ${credible} credible sources (need 2+)`);
  const urlSet = new Set();
  for (const s of sources) {
    if (!s.url?.startsWith("https://")) issues.push("non-https source");
    if (!s.title || s.title.length < 4) issues.push("source missing title");
    if (!s.publisher || s.publisher.length < 2) issues.push("source missing publisher");
    const n = normalizeUrl(s.url);
    if (urlSet.has(n)) issues.push(`duplicate URL ${s.url}`);
    urlSet.add(n);
  }
  if (format === "quick-read") {
    if (!item.historicalEra) issues.push("missing historicalEra");
    if (item.parentArticleSlug && !item.editorialAngle && !item.angle) {
      issues.push("companion needs editorialAngle");
    }
  }
  return issues;
}

async function probeSourceUrls(sources, { limit = 6 } = {}) {
  const failures = [];
  const slice = (sources || []).slice(0, limit);
  for (const s of slice) {
    if (!CREDIBLE_HINT.test(s.url || "")) {
      // Still allow if countCredibleRefs already passed patterns; soft-check only.
    }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(s.url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "SeeStew-Replenish/1.0 (topic validation)" },
      });
      clearTimeout(t);
      if (res.status >= 400) failures.push(`${s.url} → HTTP ${res.status}`);
    } catch (e) {
      failures.push(`${s.url} → ${e.message || "fetch failed"}`);
    }
  }
  return failures;
}

function overlapsExisting(item, { queueIds, published, index }) {
  if (queueIds.has(item.id)) return `id already in queue: ${item.id}`;
  if (published.has(item.id)) return `id matches published slug: ${item.id}`;
  const format = item.format === "quick-read" ? "quick-read" : "full";
  const cand = candidateFromDraft({
    slug: item.id,
    title: item.title,
    excerpt: item.hook,
    body: `${item.hook}\n${item.angle}`,
    eventYear: item.eventYear,
    format,
    parentArticleSlug: item.parentArticleSlug || null,
    editorialAngle: item.editorialAngle || item.angle || null,
    canonicalEventId: item.canonicalEventId,
  });
  const entries = index?.entries || index || [];
  const hits = findOverlaps(cand, entries);
  const best = hits[0];
  const cls = classifyOverlap(best, {
    format,
    parentArticleSlug: item.parentArticleSlug || null,
  });
  if (cls.action === "block" || cls.action === "hold_for_review") {
    return `overlap ${cls.action} vs ${cls.conflict?.slug || "?"}: ${cls.reason}`;
  }
  const titleNorm = (item.title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  for (const p of loadPublishedTitles()) {
    const other = (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (titleNorm && other && titleNorm === other) return `title matches published ${p.slug}`;
  }
  return null;
}
async function openRouterJson(prompt) {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY required for discovery");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://seestew.com",
      "X-Title": "SeeStew Queue Replenish",
    },
    body: JSON.stringify({
      model: PRIMARY_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You propose American-history article TOPIC briefs for a sourced history site. Never invent citations, dates, quotations, or URLs. Only suggest topics you can ground in real .gov/.edu/museum/archive sources. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

async function discoverFullTopics({ need, excludeIds, published }) {
  if (need <= 0) return { accepted: [], rejected: [] };
  const cap = Math.min(need, MAX_DISCOVER_FULL_PER_RUN);
  const exclude = [...excludeIds].slice(0, 120).join(", ");
  const prompt = `Propose up to ${cap} DISTINCT, sourceable U.S. history FULL-STORY topics not in this exclude list: ${exclude}.

Each topic MUST include:
- id (kebab-case slug)
- title, hook, category, angle, keywords (array), imageSearchTerms (array)
- eventYear (number), historicalEra (string)
- requiredSources: array of 4–6 objects {title, publisher, url} with REAL https URLs on .gov/.edu/museum/archive/major news sites. Do NOT invent URLs. If you cannot name a real URL, omit that topic.
- canonicalEventId optional

Return {"topics":[...]}`;

  let parsed;
  try {
    parsed = await openRouterJson(prompt);
  } catch (e) {
    console.error(`::error::Full-topic discovery LLM failed: ${e.message}`);
    return { accepted: [], rejected: [{ id: "(discovery)", reasons: [e.message] }] };
  }

  ensureEventIndex();
  const index = loadEventIndex();
  const accepted = [];
  const rejected = [];
  for (const raw of parsed.topics || []) {
    const item = {
      ...raw,
      status: "pending",
      publishedSlug: null,
      publishedAt: null,
    };
    const shape = validateTopicShape(item, { minSources: 4, format: "full" });
    if (shape.length) {
      rejected.push({ id: item.id || "?", reasons: shape });
      continue;
    }
    const overlap = overlapsExisting(item, {
      queueIds: excludeIds,
      published,
      index,
    });
    if (overlap) {
      rejected.push({ id: item.id, reasons: [overlap] });
      continue;
    }
    const probeFails = await probeSourceUrls(item.requiredSources);
    // Allow up to 1 soft failure (homepages sometimes block bots); reject if majority fail
    if (probeFails.length >= Math.ceil((item.requiredSources.length || 1) * 0.6)) {
      rejected.push({
        id: item.id,
        reasons: [`source URL probe failed: ${probeFails.join("; ")}`],
      });
      console.warn(`::warning::Rejected discovered topic ${item.id} — unreliable sources`);
      continue;
    }
    accepted.push(item);
    excludeIds.add(item.id);
    if (accepted.length >= cap) break;
  }
  return { accepted, rejected };
}

async function discoverQrTopics({ need, excludeIds, published }) {
  if (need <= 0) return { accepted: [], rejected: [] };
  const cap = Math.min(need, MAX_DISCOVER_QR_PER_RUN);
  const parents = [...published].filter((s) => !s.startsWith("qr-")).slice(0, 80);
  const prompt = `Propose up to ${cap} Quick Read topics for SeeStew. Prefer companions that expand ONE fascinating detail from an existing parent article slug in: ${parents.join(", ")}.

Each MUST have distinct angle from the parent, parentArticleSlug, editorialAngle, format "quick-read", eventYear, historicalEra, 2–4 real https requiredSources, imageSearchTerms, keywords, id starting with qr-.

Never invent URLs or facts. Return {"topics":[...]}`;

  let parsed;
  try {
    parsed = await openRouterJson(prompt);
  } catch (e) {
    console.error(`::error::QR discovery LLM failed: ${e.message}`);
    return { accepted: [], rejected: [{ id: "(discovery)", reasons: [e.message] }] };
  }

  ensureEventIndex();
  const index = loadEventIndex();
  const accepted = [];
  const rejected = [];
  for (const raw of parsed.topics || []) {
    const item = {
      ...raw,
      format: "quick-read",
      status: "pending",
      relatedArticleSlugs: raw.parentArticleSlug
        ? [raw.parentArticleSlug]
        : raw.relatedArticleSlugs || [],
    };
    const shape = validateTopicShape(item, { minSources: 2, format: "quick-read" });
    if (item.parentArticleSlug && !published.has(item.parentArticleSlug)) {
      shape.push(`parent not published: ${item.parentArticleSlug}`);
    }
    if (shape.length) {
      rejected.push({ id: item.id || "?", reasons: shape });
      continue;
    }
    const overlap = overlapsExisting(item, {
      queueIds: excludeIds,
      published,
      index,
    });
    if (overlap) {
      rejected.push({ id: item.id, reasons: [overlap] });
      continue;
    }
    const probeFails = await probeSourceUrls(item.requiredSources, { limit: 4 });
    if (probeFails.length >= Math.ceil((item.requiredSources.length || 1) * 0.6)) {
      rejected.push({
        id: item.id,
        reasons: [`source URL probe failed: ${probeFails.join("; ")}`],
      });
      continue;
    }
    accepted.push(item);
    excludeIds.add(item.id);
    if (accepted.length >= cap) break;
  }
  return { accepted, rejected };
}

function writeLog(entry) {
  mkdirSync(join(process.cwd(), "content", "story-queue"), { recursive: true });
  let prev = [];
  try {
    const doc = JSON.parse(readFileSync(LOG_PATH, "utf8"));
    prev = doc.runs || [];
  } catch {
    /* new */
  }
  prev.push(entry);
  if (prev.length > 60) prev = prev.slice(-60);
  writeFileSync(LOG_PATH, JSON.stringify({ version: 1, runs: prev }, null, 2) + "\n", "utf8");
}

async function main() {
  console.log("=== SeeStew Queue Replenishment ===\n");
  if (DRY_RUN) console.log("DRY_RUN=1 — will not write queue files.\n");

  const published = articleSlugs();
  const fullQueue = loadQueue();
  const qrQueue = loadQuickReadQueue();

  const seededFull = mergeMissingSeedItems(fullQueue);
  const seededQr = mergeMissingQrSeeds(qrQueue);

  let fullPending = countPending(fullQueue);
  let qrPending = countQrPending(qrQueue);

  console.log(`Curated merge: +${seededFull} full, +${seededQr} Quick Reads`);
  console.log(
    `Pending after merge: full=${fullPending} (trigger <${FULL_REPLENISH_TRIGGER}, target ${FULL_TARGET_MIN}–${FULL_TARGET_MAX}); QR=${qrPending} (trigger <${QR_REPLENISH_TRIGGER}, target ${QR_TARGET_MIN}–${QR_TARGET_MAX})`
  );

  const needFull =
    FORCE || fullPending < FULL_REPLENISH_TRIGGER
      ? Math.max(0, FULL_TARGET_MIN - fullPending)
      : fullPending < FULL_TARGET_MIN
        ? Math.max(0, FULL_TARGET_MIN - fullPending)
        : 0;
  // Always top up toward min when under target after curated merge; trigger forces urgency
  const topUpFull =
    fullPending < FULL_TARGET_MIN ? Math.max(0, FULL_TARGET_MIN - fullPending) : 0;
  const fullNeed = Math.max(needFull, topUpFull);

  const topUpQr = qrPending < QR_TARGET_MIN ? Math.max(0, QR_TARGET_MIN - qrPending) : 0;
  const qrNeed =
    FORCE || qrPending < QR_REPLENISH_TRIGGER
      ? Math.max(topUpQr, QR_TARGET_MIN - qrPending)
      : topUpQr;

  const rejected = [];
  let discoveredFull = [];
  let discoveredQr = [];

  if (DISCOVER && (fullNeed > 0 || qrNeed > 0)) {
    if (!OPENROUTER_API_KEY) {
      console.error(
        "::error::Discovery requested but OPENROUTER_API_KEY is missing — curated merge only; not adding unsourced filler"
      );
    } else {
      if (fullPending < FULL_TARGET_MAX && fullNeed > 0) {
        const exclude = new Set(fullQueue.items.map((i) => i.id));
        const room = Math.min(fullNeed, FULL_TARGET_MAX - fullPending);
        console.log(`\nDiscovering up to ${room} full topics via LLM (cost-capped)...`);
        const result = await discoverFullTopics({
          need: room,
          excludeIds: exclude,
          published,
        });
        discoveredFull = result.accepted;
        rejected.push(...result.rejected);
      }
      if (qrPending < QR_TARGET_MAX && qrNeed > 0) {
        const exclude = new Set((qrQueue.items || []).map((i) => i.id));
        const room = Math.min(qrNeed, QR_TARGET_MAX - qrPending);
        console.log(`\nDiscovering up to ${room} Quick Read topics via LLM (cost-capped)...`);
        const result = await discoverQrTopics({
          need: room,
          excludeIds: exclude,
          published,
        });
        discoveredQr = result.accepted;
        rejected.push(...result.rejected);
      }
    }
  } else if (fullNeed > 0 || qrNeed > 0) {
    console.log(
      "\nDiscovery skipped (pass --discover to enable limited LLM topic research). Curated seeds only."
    );
    if (fullPending < FULL_REPLENISH_TRIGGER) {
      console.warn(
        `::warning::Full-story queue still below trigger (${fullPending} < ${FULL_REPLENISH_TRIGGER}) after curated merge. Add another batch or re-run with --discover.`
      );
    }
    if (qrPending < QR_REPLENISH_TRIGGER) {
      console.warn(
        `::warning::Quick Read queue still below trigger (${qrPending} < ${QR_REPLENISH_TRIGGER}) after curated merge. Add seeds or re-run with --discover.`
      );
    }
  }

  for (const item of discoveredFull) {
    fullQueue.items.push(item);
  }
  for (const item of discoveredQr) {
    qrQueue.items = qrQueue.items || [];
    qrQueue.items.push(item);
  }

  fullPending = countPending(fullQueue);
  qrPending = countQrPending(qrQueue);

  // Cap soft: do not strip — just warn if over max
  if (fullPending > FULL_TARGET_MAX) {
    console.warn(
      `::warning::Full pending ${fullPending} exceeds soft max ${FULL_TARGET_MAX} (not deleting; stop discovering until consumed).`
    );
  }
  if (qrPending > QR_TARGET_MAX) {
    console.warn(
      `::warning::QR pending ${qrPending} exceeds soft max ${QR_TARGET_MAX}.`
    );
  }

  const summary = {
    at: new Date().toISOString(),
    dryRun: DRY_RUN,
    discover: DISCOVER,
    seededFull,
    seededQr,
    discoveredFull: discoveredFull.map((i) => i.id),
    discoveredQr: discoveredQr.map((i) => i.id),
    rejected: rejected.slice(0, 40),
    fullPending,
    qrPending,
  };

  console.log("\n---");
  console.log(
    `Result: full pending=${fullPending}, QR pending=${qrPending}; discovered +${discoveredFull.length} full / +${discoveredQr.length} QR; rejected ${rejected.length}`
  );
  if (rejected.length) {
    console.warn("Rejected candidates (not added):");
    for (const r of rejected.slice(0, 20)) {
      console.warn(`  - ${r.id}: ${(r.reasons || []).join("; ")}`);
    }
    console.warn(
      `::warning::Replenishment rejected ${rejected.length} candidate(s) — see log; no low-quality filler added`
    );
  }

  if (!DRY_RUN) {
    if (seededFull > 0 || discoveredFull.length > 0) saveQueue(fullQueue);
    if (seededQr > 0 || discoveredQr.length > 0) saveQuickReadQueue(qrQueue);
    writeLog(summary);
    console.log(`Updated ${QUEUE_PATH}`);
    console.log(`Updated ${QR_QUEUE_PATH}`);
    console.log(`Logged ${LOG_PATH}`);
  } else {
    console.log("DRY_RUN — queues unchanged.");
  }

  // Fail the job only if we are critically empty after replenish
  if (fullPending === 0) {
    console.error("::error::Full-story queue is empty after replenishment");
    process.exit(1);
  }
  if (qrPending === 0) {
    console.error("::error::Quick Read queue is empty after replenishment");
    process.exit(1);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  console.error(`::error::Queue replenishment fatal: ${e.message}`);
  process.exit(1);
});
