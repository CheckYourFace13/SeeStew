# Editorial Duplicate & Originality Audit

Generated: 2026-10-16T03:00:55.816Z

## Scope

- Every published full-length article and Quick Read (`content/articles/*.json`)
- Pending full-story queue (`content/story-queue.json`)
- Pending Quick Read queue (`content/quick-read-queue.json`)
- Canonical event ids, event years, places, named entities, title keys, token/shingle similarity

**Policy:** This audit does **not** delete existing articles or change published URLs.
Future candidates that fail the permanent pre-publish gate are blocked or held for review.

## Method

Deterministic overlap detector (no LLM sole authority):

```
{
  "blockShingle": 0.28,
  "blockToken": 0.52,
  "sameEventYearWindow": 1,
  "entityOverlapMin": 0.45,
  "placeOverlapMin": 0.5,
  "titleTokenOverlap": 0.55,
  "ambiguousShingle": 0.16,
  "ambiguousToken": 0.38,
  "qrParentCopyShingle": 0.22,
  "qrParentCopyToken": 0.45
}
```

Reusable index: `content/editorial-event-index.json` (updated incrementally after successful publishes).

## Library snapshot

| Metric | Count |
|--------|------:|
| Published articles | 118 |
| Pending queue topics | 40 |
| Published pair overlaps (score ≥ 0.70 or ambiguous shingle) | 0 |
| High-confidence pairs (score ≥ 0.85 / exact title) | 0 |
| Medium pairs (0.70–0.85) | 0 |
| Ambiguous pairs (< 0.70 but flagged) | 0 |
| Queue topics blocked/held vs library | 0 |
| Published openings with generic template hooks | 1 |

## High-confidence overlaps (do not auto-delete)

_None at block threshold. Library titles appear distinct at exact/canonical level._

## Medium overlaps (editorial awareness)

_None in the 0.70–0.85 band._

## Ambiguous near-matches (watch list)

_None flagged below 0.70 with shingle/entity signals._

## Pending queue vs library / cross-queue

_No pending queue items currently blocked or held by overlap rules._

## Generic opening hooks in published library

Existing articles are **not** rewritten in this pass. New publishes that use these templates are blocked.

- `wilmington-coup-1898`: \bstands as a (?:dark |chilling )?chapter\b

## Permanent gates (going forward)

1. **Complete library duplicate audit** via `scripts/editorial/overlap.mjs` against `editorial-event-index.json`
2. **Full-length rules** — distinct event/angle, sources, no substantial overlap → **BLOCK** + conflict slug
3. **Quick Read rules** — optional `parentArticleSlug`, `editorialAngle`, `canonicalEventId`; no parent-body copy
4. **Factual verification** — citations, credible hosts, event year, no invented dialogue → fail closed
5. **Opening / interestingness** — reject generic template hooks; compare recent openings
6. **Cost** — deterministic first; incremental index; no full-library LLM scan per publish
7. **Workflow** — wired into Daily Story + Quick Reads generators **before** write/commit; held items logged in `content/story-queue/editorial-hold.json`

## Held for review

Candidates that fail or land in the ambiguous band are written to `content/story-queue/editorial-hold.json` and are **not** marked published. They are not retried indefinitely.
