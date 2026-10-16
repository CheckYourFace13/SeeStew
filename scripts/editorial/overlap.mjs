/**
 * Deterministic overlap detector — canonical event identity, dates,
 * places, named entities, and text similarity. No LLM required.
 */

import {
  jaccard,
  tokenize,
  shingles,
  stripMarkdown,
  extractPlaces,
  extractNamedHints,
  titleEventKey,
  canonicalEventIdFromSlug,
  yearFromText,
} from "./normalize.mjs";

/** Thresholds (tuned for fail-closed editorial use). */
export const THRESHOLDS = {
  /** Exact / near-exact narrative reuse */
  blockShingle: 0.28,
  blockToken: 0.52,
  /** Same event, different title */
  sameEventYearWindow: 1,
  entityOverlapMin: 0.45,
  placeOverlapMin: 0.5,
  titleTokenOverlap: 0.55,
  /** Ambiguous band — hold for review rather than auto-publish */
  ambiguousShingle: 0.16,
  ambiguousToken: 0.38,
  /** Quick Read copying parent body */
  qrParentCopyShingle: 0.22,
  qrParentCopyToken: 0.45,
};

function setOverlapRatio(a, b) {
  const A = new Set(a || []);
  const B = new Set(b || []);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / Math.min(A.size, B.size);
}

function yearsClose(a, b, window = THRESHOLDS.sameEventYearWindow) {
  if (a == null || b == null) return false;
  return Math.abs(Number(a) - Number(b)) <= window;
}

export function scorePair(candidate, existing) {
  const titleTok = jaccard(tokenize(candidate.title || ""), tokenize(existing.title || ""));
  const tokenSim = jaccard(candidate.tokenSet || [], existing.tokenSet || []);
  const shingleSim = jaccard(candidate.shingleSet || [], existing.shingleSet || []);
  const placeSim = setOverlapRatio(candidate.places, existing.places);
  const entitySim = setOverlapRatio(candidate.namedHints, existing.namedHints);
  const sameCanonical =
    candidate.canonicalEventId &&
    existing.canonicalEventId &&
    candidate.canonicalEventId === existing.canonicalEventId;
  const sameTitleKey =
    candidate.titleEventKey &&
    existing.titleEventKey &&
    candidate.titleEventKey === existing.titleEventKey;
  const yearMatch = yearsClose(candidate.eventYear, existing.eventYear);
  const exactTitle =
    String(candidate.title || "").trim().toLowerCase() ===
    String(existing.title || "").trim().toLowerCase();
  const exactSlug =
    String(candidate.slug || "").trim().toLowerCase() ===
    String(existing.slug || "").trim().toLowerCase();

  let score = 0;
  const reasons = [];

  if (exactSlug) {
    score = 1;
    reasons.push("exact_slug");
  }
  if (exactTitle) {
    score = Math.max(score, 0.98);
    reasons.push("exact_title");
  }
  if (sameCanonical) {
    score = Math.max(score, 0.92);
    reasons.push("same_canonical_event_id");
  }
  if (sameTitleKey) {
    score = Math.max(score, 0.88);
    reasons.push("same_title_event_key");
  }

  score = Math.max(score, shingleSim * 0.55 + tokenSim * 0.25 + titleTok * 0.2);

  if (yearMatch && entitySim >= THRESHOLDS.entityOverlapMin && placeSim >= THRESHOLDS.placeOverlapMin) {
    score = Math.max(score, 0.82);
    reasons.push("year_place_entity_cluster");
  } else if (yearMatch && (entitySim >= 0.6 || titleTok >= THRESHOLDS.titleTokenOverlap)) {
    score = Math.max(score, 0.75);
    reasons.push("year_and_title_or_entities");
  }

  if (shingleSim >= THRESHOLDS.blockShingle) reasons.push(`high_shingle:${shingleSim.toFixed(3)}`);
  if (tokenSim >= THRESHOLDS.blockToken) reasons.push(`high_token:${tokenSim.toFixed(3)}`);
  if (titleTok >= THRESHOLDS.titleTokenOverlap) reasons.push(`title_overlap:${titleTok.toFixed(3)}`);

  return {
    slug: existing.slug,
    title: existing.title,
    format: existing.format,
    source: existing.source,
    score,
    titleTok,
    tokenSim,
    shingleSim,
    placeSim,
    entitySim,
    yearMatch,
    sameCanonical,
    reasons,
  };
}

/**
 * Compare candidate against library entries (excluding self slug).
 * Returns ranked overlaps and a verdict.
 */
export function findOverlaps(candidate, entries, { excludeSlug } = {}) {
  const self = excludeSlug || candidate.slug;
  const scored = [];
  for (const e of entries || []) {
    if (!e?.slug || e.slug === self) continue;
    // Skip queue vs queue of same format only when comparing publish candidate to published+queues
    scored.push(scorePair(candidate, e));
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function classifyOverlap(best, { format = "full", parentArticleSlug = null } = {}) {
  if (!best) {
    return { status: "clear", action: "allow", reason: "no_library_matches" };
  }

  // Quick Read deliberately companioning a parent is allowed if not copying body
  const isParent =
    parentArticleSlug &&
    (best.slug === parentArticleSlug || best.slug === String(parentArticleSlug));

  if (isParent) {
    if (
      best.shingleSim >= THRESHOLDS.qrParentCopyShingle ||
      best.tokenSim >= THRESHOLDS.qrParentCopyToken
    ) {
      return {
        status: "block",
        action: "block",
        reason: "quick_read_copies_parent",
        conflict: best,
      };
    }
    if (best.reasons.includes("exact_title")) {
      return {
        status: "block",
        action: "block",
        reason: "quick_read_same_title_as_parent",
        conflict: best,
        recommend: "Use a distinct companion title and editorialAngle.",
      };
    }
    // Declared parent with distinct angle is allowed — angle uniqueness is
    // enforced separately in auditQuickReadAngle / prepublish gate.
    return {
      status: "parent_ok",
      action: "allow",
      reason: "companion_to_declared_parent",
      conflict: best,
    };
  }

  if (
    best.score >= 0.85 ||
    best.shingleSim >= THRESHOLDS.blockShingle ||
    best.tokenSim >= THRESHOLDS.blockToken ||
    best.reasons.includes("exact_title") ||
    best.reasons.includes("exact_slug") ||
    best.reasons.includes("same_canonical_event_id")
  ) {
    // Full articles: hard block. QR vs full same event without unique angle: block at gate layer.
    if (format === "full" || best.format === "full" || best.source?.startsWith("queue")) {
      return {
        status: "block",
        action: "block",
        reason: "substantial_overlap",
        conflict: best,
        recommend:
          format === "full"
            ? "Choose a truly different story, or publish a Quick Read linked to the existing article."
            : "Pick a distinct detail/angle, or link to the existing story as parent without republishing the same event.",
      };
    }
  }

  // Ambiguous band: need similarity PLUS a shared identity signal
  // (year/title/entities). Shared citation boilerplate alone must not hold
  // distinct events that merely share a calendar year.
  const identityHint =
    best.yearMatch ||
    best.titleTok >= 0.35 ||
    best.entitySim >= 0.3 ||
    best.placeSim >= 0.4 ||
    best.reasons.includes("year_place_entity_cluster") ||
    best.reasons.includes("year_and_title_or_entities");

  if (
    best.score >= 0.7 ||
    (identityHint && best.shingleSim >= THRESHOLDS.ambiguousShingle) ||
    (identityHint && best.tokenSim >= THRESHOLDS.ambiguousToken) ||
    best.reasons.includes("year_place_entity_cluster")
  ) {
    // If the only identity hint is yearMatch and textual overlap is weak, allow
    if (
      best.yearMatch &&
      !best.reasons.includes("year_place_entity_cluster") &&
      !best.reasons.includes("year_and_title_or_entities") &&
      best.titleTok < 0.35 &&
      best.entitySim < 0.3 &&
      best.placeSim < 0.4 &&
      best.shingleSim < THRESHOLDS.blockShingle &&
      best.tokenSim < THRESHOLDS.ambiguousToken &&
      best.score < 0.7
    ) {
      return { status: "clear", action: "allow", reason: "shared_year_only", conflict: best };
    }
    return {
      status: "hold",
      action: "hold_for_review",
      reason: "ambiguous_overlap",
      conflict: best,
      recommend: "Editorial review required before publish.",
    };
  }

  return { status: "clear", action: "allow", reason: "below_thresholds", conflict: best };
}

/** Build a candidate entry from draft fields without writing files. */
export function candidateFromDraft({
  slug,
  title,
  excerpt = "",
  body = "",
  eventYear,
  format = "full",
  parentArticleSlug = null,
  editorialAngle = null,
  canonicalEventId = null,
}) {
  const plain = stripMarkdown(body);
  const blob = `${title} ${excerpt} ${plain.slice(0, 2500)}`;
  const tokens = tokenize(blob);
  const y = eventYear ?? yearFromText(title) ?? yearFromText(body.slice(0, 800));
  return {
    slug,
    title,
    excerpt,
    format,
    source: "candidate",
    eventYear: y ?? null,
    parentArticleSlug,
    editorialAngle,
    canonicalEventId: canonicalEventId || canonicalEventIdFromSlug(slug, y),
    titleEventKey: titleEventKey(title, y),
    places: extractPlaces(blob),
    namedHints: extractNamedHints(title),
    tokenSet: [...new Set(tokens)].slice(0, 400),
    shingleSet: [...new Set(shingles(tokens, 3))].slice(0, 500),
  };
}

export function auditLibrary(entries) {
  const findings = [];
  const published = (entries || []).filter((e) => e.source === "published");
  for (let i = 0; i < published.length; i++) {
    for (let j = i + 1; j < published.length; j++) {
      const s = scorePair(published[i], published[j]);
      if (s.score >= 0.7 || s.shingleSim >= THRESHOLDS.ambiguousShingle) {
        findings.push({
          a: published[i].slug,
          b: published[j].slug,
          aTitle: published[i].title,
          bTitle: published[j].title,
          aFormat: published[i].format,
          bFormat: published[j].format,
          ...s,
        });
      }
    }
  }
  findings.sort((x, y) => y.score - x.score);

  // Queue vs published / queue vs queue
  const queued = (entries || []).filter((e) => String(e.source).startsWith("queue"));
  const queueFindings = [];
  for (const q of queued) {
    const overlaps = findOverlaps(q, entries);
    const best = overlaps[0];
    const verdict = classifyOverlap(best, {
      format: q.format,
      parentArticleSlug: q.parentArticleSlug,
    });
    if (verdict.action !== "allow" || (best && best.score >= 0.65)) {
      queueFindings.push({
        slug: q.slug,
        title: q.title,
        format: q.format,
        source: q.source,
        verdict,
        best,
      });
    }
  }

  return { pairFindings: findings, queueFindings };
}
