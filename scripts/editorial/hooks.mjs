/**
 * Opening / interestingness audit — reject generic template hooks
 * and openings that overly mirror recent published openings.
 */

import { hasGenericHook, genericHookHits, openingSentences, tokenize, jaccard } from "./normalize.mjs";

export function auditOpening(body, { recentOpenings = [] } = {}) {
  const opening = openingSentences(body, 2);
  const issues = [];

  if (!opening || opening.length < 40) {
    issues.push({
      code: "opening_too_thin",
      message: "Opening lacks a specific factual hook related to this event.",
    });
  }

  if (hasGenericHook(body)) {
    issues.push({
      code: "generic_hook",
      message: "Opening uses a repetitive template hook instead of concrete historical detail.",
      patterns: genericHookHits(body),
    });
  }

  // Require at least one digit/year or proper concrete marker in opening
  const hasConcrete =
    /\b(1[6-9]\d{2}|20[0-2]\d)\b/.test(opening) ||
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(
      opening
    ) ||
    /\b\d+\b/.test(opening);
  if (!hasConcrete && opening.length > 0) {
    issues.push({
      code: "opening_not_specific",
      message:
        "Opening should include a concrete date, figure, or factual detail unique to this event.",
    });
  }

  const openTokens = tokenize(opening);
  let maxSim = 0;
  let similarTo = null;
  for (const prev of recentOpenings) {
    const sim = jaccard(openTokens, tokenize(prev.text || prev));
    if (sim > maxSim) {
      maxSim = sim;
      similarTo = prev.slug || null;
    }
  }
  if (maxSim >= 0.45) {
    issues.push({
      code: "opening_mirrors_recent",
      message: "Opening structure is excessively similar to a recently published article.",
      similarity: Number(maxSim.toFixed(3)),
      similarTo,
    });
  }

  return {
    ok: issues.length === 0,
    opening,
    issues,
  };
}

export function collectRecentOpenings(entries, { limit = 25, excludeSlug } = {}) {
  return (entries || [])
    .filter((e) => e.source === "published" && e.slug !== excludeSlug && e.opening)
    .slice(-limit)
    .map((e) => ({ slug: e.slug, text: e.opening }));
}
