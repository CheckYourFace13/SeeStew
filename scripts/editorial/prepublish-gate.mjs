/**
 * Permanent pre-publish editorial gate.
 * Fail closed on duplicate/overlap, failed fact verification, or generic hooks.
 * Optional LLM semantic review is NOT used here — deterministic only (cost-controlled).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildEventIndex,
  loadEventIndex,
  saveEventIndex,
  upsertPublishedEntry,
  articleToIndexEntry,
  getIndexPath,
} from "./event-index.mjs";
import {
  candidateFromDraft,
  findOverlaps,
  classifyOverlap,
  THRESHOLDS,
} from "./overlap.mjs";
import { auditOpening, collectRecentOpenings } from "./hooks.mjs";
import { auditFacts, auditQuickReadAngle } from "./fact-gates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOLD_PATH = path.resolve(
  __dirname,
  "../../content/story-queue/editorial-hold.json"
);

function resolveHoldPath() {
  return HOLD_PATH;
}

function loadHold() {
  const p = resolveHoldPath();
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return { version: 1, items: [] };
  }
}

function saveHold(doc) {
  const p = resolveHoldPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n", "utf8");
}

export function markHeldForReview(item) {
  const doc = loadHold();
  const slug = item.slug;
  doc.items = (doc.items || []).filter((x) => x.slug !== slug);
  doc.items.push({
    ...item,
    heldAt: new Date().toISOString(),
    status: "editorial_review",
  });
  // Cap history
  if (doc.items.length > 200) doc.items = doc.items.slice(-200);
  saveHold(doc);
  return doc;
}

export function isHeld(slug) {
  const doc = loadHold();
  return (doc.items || []).some(
    (x) => x.slug === slug && x.status === "editorial_review"
  );
}

/**
 * Ensure index exists; rebuild if missing or stale (>7 days) or force.
 */
export function ensureEventIndex({ force = false } = {}) {
  const existing = loadEventIndex();
  const stale =
    !existing ||
    !existing.generatedAt ||
    Date.now() - new Date(existing.generatedAt).getTime() > 7 * 864e5 ||
    !(existing.entries || []).length;
  if (force || stale) {
    const index = buildEventIndex({ includeQueues: true });
    saveEventIndex(index);
    return index;
  }
  return existing;
}

/**
 * Run full pre-publish gate on a draft.
 * @returns {{ ok: boolean, action: 'allow'|'block'|'hold_for_review', report: object }}
 */
export function runPrepublishGate(draft) {
  const format = draft.format === "quick-read" ? "quick-read" : "full";
  const index = ensureEventIndex();
  const candidate = candidateFromDraft({
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt || "",
    body: draft.body || draft.content || "",
    eventYear: draft.eventYear,
    format,
    parentArticleSlug: draft.parentArticleSlug || null,
    editorialAngle: draft.editorialAngle || null,
    canonicalEventId: draft.canonicalEventId || null,
  });

  const report = {
    slug: candidate.slug,
    title: candidate.title,
    format,
    checkedAt: new Date().toISOString(),
    thresholds: THRESHOLDS,
    overlap: null,
    facts: null,
    opening: null,
    qrAngle: null,
    blocks: [],
    holds: [],
  };

  // Never re-try held items indefinitely as "published"
  if (isHeld(candidate.slug) && !draft.forceRetryHold) {
    report.blocks.push({
      code: "already_held",
      message: "Candidate is marked for editorial review — not auto-retried.",
    });
    return { ok: false, action: "hold_for_review", report };
  }

  const overlaps = findOverlaps(candidate, index.entries);
  const parentSlug = candidate.parentArticleSlug || null;
  const best = overlaps[0] || null;
  // For companions, also evaluate the strongest non-parent conflict
  const bestOther =
    overlaps.find((o) => o.slug !== parentSlug) || null;
  const verdict = classifyOverlap(best, {
    format,
    parentArticleSlug: parentSlug,
  });
  let otherVerdict = null;
  if (parentSlug && bestOther && bestOther.slug !== best?.slug) {
    otherVerdict = classifyOverlap(bestOther, {
      format,
      parentArticleSlug: null,
    });
    if (otherVerdict.action === "block") {
      // Non-parent collision still blocks even when parent companion is fine
      Object.assign(verdict, otherVerdict);
    } else if (
      verdict.action === "allow" &&
      otherVerdict.action === "hold_for_review"
    ) {
      Object.assign(verdict, otherVerdict);
    }
  }
  report.overlap = { verdict, top: overlaps.slice(0, 5), otherVerdict };

  if (verdict.action === "block") {
    report.blocks.push({
      code: verdict.reason,
      message: `Overlaps ${verdict.conflict?.slug}: ${(verdict.conflict?.reasons || []).join(", ")}`,
      conflictSlug: verdict.conflict?.slug,
      recommend: verdict.recommend,
    });
  } else if (verdict.action === "hold_for_review") {
    report.holds.push({
      code: verdict.reason,
      message: `Ambiguous overlap with ${verdict.conflict?.slug}`,
      conflictSlug: verdict.conflict?.slug,
      recommend: verdict.recommend,
    });
  }

  // Full article must not substantially overlap another full article
  if (format === "full" && best && best.format === "full" && best.score >= 0.7) {
    if (!report.blocks.some((b) => b.conflictSlug === best.slug)) {
      report.blocks.push({
        code: "full_vs_full_overlap",
        message: `Full article substantially overlaps existing full story ${best.slug}`,
        conflictSlug: best.slug,
        recommend:
          "Choose a different event, or publish a Quick Read companion linked to the existing story.",
      });
    }
  }

  // Queue cross-format same event (full pending + QR pending)
  const queueClash = overlaps.find(
    (o) =>
      String(o.source).startsWith("queue") &&
      o.score >= 0.75 &&
      o.slug !== candidate.parentArticleSlug
  );
  if (queueClash) {
    report.blocks.push({
      code: "queue_duplicate_topic",
      message: `Same topic already pending in queue as ${queueClash.slug}`,
      conflictSlug: queueClash.slug,
    });
  }

  const facts = auditFacts({
    body: draft.body || draft.content || "",
    title: draft.title,
    eventYear: draft.eventYear,
    excerpt: draft.excerpt,
    references: draft.references || [],
  });
  report.facts = facts;
  if (!facts.ok) {
    for (const issue of facts.issues.filter((i) => i.block)) {
      report.blocks.push({
        code: issue.code,
        message: issue.message,
      });
    }
  }

  const recent = collectRecentOpenings(index.entries, {
    limit: 25,
    excludeSlug: candidate.slug,
  });
  const opening = auditOpening(draft.body || draft.content || "", {
    recentOpenings: recent,
  });
  report.opening = opening;
  if (!opening.ok) {
    for (const issue of opening.issues) {
      if (issue.code === "generic_hook" || issue.code === "opening_mirrors_recent") {
        report.blocks.push({ code: issue.code, message: issue.message, ...issue });
      } else if (issue.code === "opening_too_thin" || issue.code === "opening_not_specific") {
        report.holds.push({ code: issue.code, message: issue.message });
      }
    }
  }

  if (format === "quick-read") {
    const parentEntry =
      (index.entries || []).find((e) => e.slug === candidate.parentArticleSlug) ||
      null;
    const qrAngle = auditQuickReadAngle({
      title: candidate.title,
      excerpt: candidate.excerpt,
      body: draft.body || draft.content || "",
      editorialAngle: candidate.editorialAngle,
      parentArticleSlug: candidate.parentArticleSlug,
      parentEntry,
    });
    report.qrAngle = qrAngle;
    for (const issue of qrAngle.issues.filter((i) => i.block)) {
      report.blocks.push({ code: issue.code, message: issue.message });
    }
  }

  let action = "allow";
  if (report.blocks.length) action = "block";
  else if (report.holds.length) action = "hold_for_review";

  const ok = action === "allow";
  if (action === "hold_for_review" || action === "block") {
    markHeldForReview({
      slug: candidate.slug,
      title: candidate.title,
      format,
      action,
      blocks: report.blocks,
      holds: report.holds,
      conflictSlug:
        report.blocks[0]?.conflictSlug || report.holds[0]?.conflictSlug || null,
    });
  }

  return { ok, action, report };
}

/** After successful publish, update the reusable index incrementally. */
export function recordSuccessfulPublication({
  slug,
  title,
  excerpt,
  body,
  eventYear,
  format,
  publishedAt,
  parentArticleSlug,
  editorialAngle,
  canonicalEventId,
}) {
  const entry = articleToIndexEntry(
    {
      slug,
      title,
      excerpt,
      eventYear,
      format,
      publishedAt,
      parentArticleSlug,
      editorialAngle,
      canonicalEventId,
    },
    body,
    "published"
  );
  return upsertPublishedEntry(entry);
}

export { getIndexPath, THRESHOLDS };
